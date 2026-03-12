import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');

        const where = {};
        if (category && category !== 'All') where.category = category;
        if (featured === 'true') where.featured = true;

        const products = await prisma.product.findMany({
            where,
            orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error('GET /api/products error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, category, description, price, unit, stock, image, featured } = body;

        if (!name || !category || !description || !price || !unit) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                name,
                category,
                description,
                price: parseFloat(price),
                unit,
                stock: parseInt(stock) || 100,
                image: image || '/products/placeholder.jpg',
                featured: featured === true || featured === 'true',
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('POST /api/products error:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
