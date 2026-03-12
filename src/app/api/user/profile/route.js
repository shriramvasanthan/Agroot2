import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

// GET /api/user/profile?uid=<firebaseUID>
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid');

        if (!uid) {
            return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
        }

        const doc = await adminDb.collection('users').doc(uid).get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const data = doc.data();
        return NextResponse.json({ user: { id: uid, uid, ...data } });
    } catch (error) {
        console.error('[Profile GET error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/user/profile
// Body: { uid, name, phone, address }
export async function PUT(request) {
    try {
        const { uid, name, phone, address } = await request.json();

        if (!uid) {
            return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        updateData.updatedAt = new Date().toISOString();

        await adminDb.collection('users').doc(uid).update(updateData);

        // Return the updated doc
        const doc = await adminDb.collection('users').doc(uid).get();
        const data = doc.data();
        return NextResponse.json({ user: { id: uid, uid, ...data } });
    } catch (error) {
        console.error('[Profile PUT error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
