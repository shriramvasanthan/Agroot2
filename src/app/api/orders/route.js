import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();
        const { customerName, email, phone, address, items, userId } = body;

        if (!customerName || !email || !phone || !address || !items?.length) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Calculate total
        let total = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
            });

            if (!product) {
                return NextResponse.json(
                    { error: `Product ${item.productId} not found` },
                    { status: 404 }
                );
            }

            const lineTotal = product.price * item.quantity;
            total += lineTotal;

            orderItemsData.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price,
            });
        }

        // [ON-THE-FLY SYNC] If userId is provided, ensure user exists in Prisma
        // This is our last-line-of-defense against P2003 errors (Ghost Users)
        if (userId) {
            const existingByEmail = await prisma.user.findUnique({ where: { email } });

            if (existingByEmail && existingByEmail.id !== userId) {
                // Migration case: same email, different ID
                try {
                    await prisma.user.update({
                        where: { email },
                        data: { id: userId, phone, address }
                    });
                } catch (e) {
                    console.error('Migration in Orders API failed, falling back:', e.message);
                    await prisma.user.delete({ where: { email } });
                    await prisma.user.create({
                        data: {
                            id: userId,
                            name: customerName,
                            email: email,
                            role: 'customer',
                            phone: phone,
                            address: address
                        }
                    });
                }
            } else {
                await prisma.user.upsert({
                    where: { id: userId },
                    update: {
                        phone: phone || undefined,
                        address: address || undefined,
                    },
                    create: {
                        id: userId,
                        name: customerName,
                        email: email,
                        role: 'customer',
                        phone: phone,
                        address: address,
                    },
                });
            }
        }

        const order = await prisma.order.create({
            data: {
                customerName,
                email,
                phone,
                address,
                total,
                status: 'pending',
                ...(userId ? { userId: userId } : {}),
                items: {
                    create: orderItemsData,
                },
            },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('POST /api/orders error:', error);
        return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
