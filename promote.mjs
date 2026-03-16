import { PrismaClient } from '@prisma/client';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
// dotenv removed

const prisma = new PrismaClient();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
};

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
    const email = 'admin@aurah.com';
    console.log('Checking database for', email);
    
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) { 
            console.log('User not found in Prisma.'); 
            process.exit(0); 
        }
        
        console.log('Found user with role:', user.role);
        
        await prisma.user.update({ 
            where: { email }, 
            data: { role: 'admin' } 
        });
        console.log('Prisma role updated to admin');
        
        await db.collection('users').doc(user.id).update({ role: 'admin' });
        console.log('Firestore role updated to admin');
        
        console.log('Success! Account promoted.');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
