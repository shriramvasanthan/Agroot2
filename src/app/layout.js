import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CursorGlow from '@/components/CursorGlow';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
    title: 'AURAH — Premium Spices & Nuts',
    description: 'Discover the finest hand-picked spices and nuts from around the world. Cardamom, Black Pepper, Fenugreek, Cashews and more.',
    keywords: 'spices, nuts, cardamom, black pepper, fenugreek, cashews, premium, organic',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <CartProvider>
                        <CursorGlow />
                        <Navbar />
                        <main>{children}</main>
                        <Footer />
                    </CartProvider>
                </AuthProvider>
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}
