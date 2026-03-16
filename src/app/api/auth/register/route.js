import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST /api/auth/register
// Called AFTER Firebase Auth user is created on the client.
// Saves the user profile to BOTH Firestore and Prisma (SQL).
export async function POST(request) {
    try {
        const { uid, name, email } = await request.json();

        if (!uid || !name || !email) {
            return NextResponse.json({ error: 'uid, name and email are required' }, { status: 400 });
        }

        const userRole = email.toLowerCase() === 'admin@aurah.com' ? 'admin' : 'customer';

        const userDoc = {
            uid,
            name,
            email,
            role: userRole,
            phone: null,
            address: null,
            createdAt: new Date().toISOString(),
        };

        // 1. Sync to Firestore
        await adminDb.collection('users').doc(uid).set(userDoc);

        // 2. Sync to Prisma (SQLite)
        // Check if a user with this email already exists but with a different ID (Migration case)
        const existingUserByEmail = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUserByEmail && existingUserByEmail.id !== uid) {
            // Migrate the existing user record to the new Firebase UID
            // Note: We use a transaction or simply update if your DB allows PK updates.
            // In SQLite/Prisma, we can't easily update the @id. 
            // Better to delete and recreate or update if possible.
            // Let's try to update first, if it fails we'll handle it.
            try {
                await prisma.user.update({
                    where: { email },
                    data: { id: uid, name, role: userRole }
                });
            } catch (e) {
                console.error('Migration failed, falling back to delete/create:', e.message);
                await prisma.user.delete({ where: { email } });
                await prisma.user.create({
                    data: { id: uid, name, email, role: userRole }
                });
            }
        } else {
            // Normal upsert
            await prisma.user.upsert({
                where: { id: uid },
                update: {
                    name,
                    email,
                },
                create: {
                    id: uid,
                    name,
                    email,
                    role: userRole,
                },
            });
        }

        return NextResponse.json({ user: { id: uid, ...userDoc } }, { status: 201 });
    } catch (error) {
        console.error('Register API error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
