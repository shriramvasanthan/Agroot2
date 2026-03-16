const { PrismaClient } = require('@prisma/client');
const { adminDb } = require('./src/lib/firebaseAdmin.js');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@aurah.com';
    console.log(`Checking user: ${email}`);

    try {
        // Find in Prisma
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log('User not found in Prisma database.');
            process.exit(1);
        }

        console.log(`Found user ID: ${user.id}`);

        // Update in Prisma
        await prisma.user.update({
            where: { email },
            data: { role: 'admin' },
        });
        console.log('Prisma role updated to "admin".');

        // Update in Firestore
        await adminDb.collection('users').doc(user.id).update({
            role: 'admin',
        });
        console.log('Firestore role updated to "admin".');

        console.log('Role promotion successful!');
    } catch (e) {
        console.error('Error promoting user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
