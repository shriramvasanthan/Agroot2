require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const products = [
    {
        name: 'Green Cardamom',
        category: 'Spices',
        description: 'Premium quality green cardamom pods sourced from the lush hills of Kerala. Known for its intense aroma and complex flavor profile — perfect for biryanis, chai, and desserts.',
        price: 8.99,
        unit: '100g',
        stock: 200,
        image: '/products/cardamom.jpg',
        featured: true,
    },
    {
        name: 'Black Pepper',
        category: 'Spices',
        description: 'Bold, pungent black pepper freshly sun-dried and packed. The "King of Spices" — essential in every kitchen. Rich in piperine for bold heat and depth.',
        price: 5.49,
        unit: '200g',
        stock: 300,
        image: '/products/black-pepper.jpg',
        featured: true,
    },
    {
        name: 'Fenugreek Seeds',
        category: 'Spices',
        description: 'Earthy and slightly bitter fenugreek seeds. A staple in Indian cooking and Ayurvedic medicine. Perfect for curries, pickles, and herbal tea.',
        price: 3.99,
        unit: '250g',
        stock: 250,
        image: '/products/fenugreek.jpg',
        featured: true,
    },
    {
        name: 'Premium Cashews',
        category: 'Nuts',
        description: 'Whole W320-grade cashews, lightly roasted to perfection. Rich, buttery, and naturally sweet. Ideal for snacking, cooking, or gifting.',
        price: 12.99,
        unit: '250g',
        stock: 150,
        image: '/products/cashews.jpg',
        featured: true,
    },
    {
        name: 'Cinnamon Sticks',
        category: 'Spices',
        description: 'True Ceylon cinnamon sticks with a delicate sweet warmth. Superb for mulled wine, biryanis, and baked goods. Aromatic and health-boosting.',
        price: 4.99,
        unit: '100g',
        stock: 180,
        image: '/products/cinnamon.jpg',
        featured: false,
    },
    {
        name: 'Turmeric Powder',
        category: 'Spices',
        description: 'Vibrant golden turmeric powder with high curcumin content. Anti-inflammatory, antioxidant-rich, and essential to South Asian cuisine.',
        price: 3.49,
        unit: '200g',
        stock: 400,
        image: '/products/turmeric.jpg',
        featured: false,
    },
    {
        name: 'Whole Cloves',
        category: 'Spices',
        description: 'Hand-picked dried clove buds from the Maluku Islands. Intensely aromatic, warm, and slightly sweet — a powerhouse in both cooking and medicine.',
        price: 6.99,
        unit: '100g',
        stock: 120,
        image: '/products/cloves.jpg',
        featured: false,
    },
    {
        name: 'Raw Almonds',
        category: 'Nuts',
        description: 'California-sourced raw almonds loaded with healthy fats, protein, and Vitamin E. Crisp, nutritious, and incredibly versatile.',
        price: 9.99,
        unit: '300g',
        stock: 200,
        image: '/products/almonds.jpg',
        featured: false,
    },
    {
        name: 'Star Anise',
        category: 'Spices',
        description: 'Whole star anise with a powerful licorice-like flavor. Used in biryani, pho, five-spice blends, and herbal remedies. Visually stunning too.',
        price: 5.99,
        unit: '100g',
        stock: 90,
        image: '/products/star-anise.jpg',
        featured: false,
    },
    {
        name: 'Fennel Seeds',
        category: 'Spices',
        description: 'Sweet, mildly anise-flavored fennel seeds. Used as a mouth freshener after meals, in bread, sausages, and spice blends. Cooling and digestive.',
        price: 2.99,
        unit: '200g',
        stock: 300,
        image: '/products/fennel.jpg',
        featured: false,
    },
];

async function main() {
    console.log('🌿 Seeding Aurah Spices database...');

    for (const product of products) {
        await prisma.product.upsert({
            where: { id: products.indexOf(product) + 1 },
            update: {},
            create: product,
        });
    }

    console.log(`✅ Seeded ${products.length} products successfully!`);
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
