'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234';

export default function AdminPage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    // Determine auth: either proper admin login OR legacy PIN
    const isAdminUser = user && user.role === 'admin';
    const [pinAuthed, setPinAuthed] = useState(false);
    const authed = isAdminUser || pinAuthed;

    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [activeTab, setActiveTab] = useState('orders');

    // Product form
    const [productForm, setProductForm] = useState({
        name: '', category: 'Spices', description: '', price: '', unit: '100g', stock: '100', image: '', featured: false,
    });
    const [productSuccess, setProductSuccess] = useState('');
    const [productError, setProductError] = useState('');
    const [saving, setSaving] = useState(false);

    // Orders
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        if (pin === ADMIN_PIN) { setPinAuthed(true); }
        else { setPinError('Incorrect PIN.'); }
    };

    useEffect(() => {
        if (authed && activeTab === 'orders') loadOrders();
    }, [authed, activeTab]);

    const loadOrders = async () => {
        setLoadingOrders(true);
        try {
            const r = await fetch('/api/orders');
            setOrders(await r.json());
        } catch { } finally { setLoadingOrders(false); }
    };

    const handleProductChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProductForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setProductError('');
        try {
            const r = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productForm),
            });
            if (!r.ok) throw new Error();
            setProductSuccess('Product uploaded successfully!');
            setProductForm({ name: '', category: 'Spices', description: '', price: '', unit: '100g', stock: '100', image: '', featured: false });
            setTimeout(() => setProductSuccess(''), 3000);
        } catch {
            setProductError('Failed to upload product. Please try again.');
        } finally { setSaving(false); }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            loadOrders();
        } catch { }
    };

    const statusColors = {
        pending: 'badge-pending', processing: 'badge-processing',
        shipped: 'badge-shipped', delivered: 'badge-delivered', cancelled: 'badge-cancelled',
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--black)' }}>
            <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', letterSpacing: '0.3em' }}>Loading...</div>
        </div>
    );

    if (!authed) {
        return (
            <div className="login-page">
                <div className="login-card">
                    <div className="login-logo">AURAH</div>
                    <div className="login-subtitle">Admin Portal</div>
                    <div className="gold-divider" />
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label">Admin PIN</label>
                            <input
                                className="form-input"
                                type="password"
                                placeholder="Enter 4-digit PIN"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                maxLength={4}
                                required
                            />
                        </div>
                        {pinError && <p style={{ color: '#F87171', fontSize: '0.8rem', marginBottom: '16px' }}>{pinError}</p>}
                        <button type="submit" className="btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                            Enter Dashboard
                        </button>
                    </form>
                    <p style={{ marginTop: '16px', fontSize: '0.72rem', color: 'var(--muted)', textAlign: 'center' }}>
                        Secured Access
                    </p>
                </div>
                <style>{`
          .login-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%), var(--black);
          }
          .login-card {
            width: 100%;
            max-width: 420px;
            background: #FAF4E8;
            border: 1px solid rgba(192,82,42,0.25);
            border-radius: 4px;
            padding: 48px;
            text-align: center;
            animation: fadeInUp 0.5s ease;
            box-shadow: 0 8px 40px rgba(44, 26, 14, 0.10);
          }
          .login-logo {
            font-family: var(--font-display);
            font-size: 2rem;
            font-weight: 900;
            letter-spacing: 0.4em;
            background: linear-gradient(135deg, var(--gold-dark), var(--gold), var(--gold-shimmer));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 4px;
          }
          .login-subtitle {
            font-family: var(--font-display);
            font-size: 0.6rem;
            letter-spacing: 0.4em;
            color: var(--muted);
            text-transform: uppercase;
            margin-bottom: 20px;
          }
        `}</style>
            </div>
        );
    }

    return (
        <>
            <div className="admin-page">
                <div className="admin-header">
                    <div className="admin-header-bg" />
                    <div className="container admin-header-inner">
                        <div>
                            <h1 className="admin-title">Admin <span className="gold-text">Dashboard</span></h1>
                            <p className="admin-sub">
                                {isAdminUser ? `Logged in as ${user.name}` : 'Manage products & orders'}
                            </p>
                        </div>
                        <button className="btn-outline" onClick={() => { if (isAdminUser) { logout(); router.push('/'); } else { setPinAuthed(false); } }}>
                            Sign Out
                        </button>
                    </div>
                </div>

                <div className="container admin-content">
                    {/* Tabs */}
                    <div className="admin-tabs">
                        {[
                            { id: 'orders', label: 'Orders', icon: '📦' },
                            { id: 'upload', label: 'Upload Product', icon: '✦' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span>{tab.icon}</span> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div className="orders-section">
                            <div className="orders-toolbar">
                                <h2 className="tab-title">All Orders <span className="order-count">({orders.length})</span></h2>
                                <button className="btn-outline" style={{ padding: '10px 20px', fontSize: '0.65rem' }} onClick={loadOrders}>
                                    Refresh
                                </button>
                            </div>
                            {loadingOrders ? (
                                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gold)' }}>Loading orders...</div>
                            ) : orders.length === 0 ? (
                                <div className="empty-state">
                                    <div style={{ fontSize: '3rem', color: 'rgba(201,168,76,0.2)', marginBottom: '16px' }}>📭</div>
                                    <p>No orders yet. Orders will appear here once customers place them.</p>
                                </div>
                            ) : (
                                <div className="orders-table-wrap">
                                    <table className="orders-table">
                                        <thead>
                                            <tr>
                                                <th>Order #</th>
                                                <th>Customer</th>
                                                <th>Items</th>
                                                <th>Total</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                                <th>Update</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order) => (
                                                <tr key={order.id}>
                                                    <td className="order-id">#{order.id}</td>
                                                    <td>
                                                        <div className="customer-name">{order.customerName}</div>
                                                        <div className="customer-email">{order.email}</div>
                                                    </td>
                                                    <td>
                                                        {order.items.map((i) => (
                                                            <div key={i.id} className="order-item-line">
                                                                {i.product.name} × {i.quantity}
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td className="order-total">${order.total.toFixed(2)}</td>
                                                    <td className="order-date">
                                                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${statusColors[order.status] || 'badge-gold'}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <select
                                                            className="status-select"
                                                            value={order.status}
                                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                        >
                                                            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                                                                <option key={s} value={s}>{s}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Upload Product Tab */}
                    {activeTab === 'upload' && (
                        <div className="upload-section">
                            <h2 className="tab-title">Upload New Product</h2>
                            {productSuccess && (
                                <div className="success-banner">✦ {productSuccess}</div>
                            )}
                            {productError && <div className="error-banner">⚠ {productError}</div>}
                            <form className="upload-form" onSubmit={handleProductSubmit}>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Product Name *</label>
                                        <input className="form-input" name="name" value={productForm.name} onChange={handleProductChange} required placeholder="e.g. Organic Cardamom" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Category *</label>
                                        <select className="form-select" name="category" value={productForm.category} onChange={handleProductChange}>
                                            <option>Spices</option>
                                            <option>Nuts</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description *</label>
                                    <textarea className="form-textarea" name="description" value={productForm.description} onChange={handleProductChange} required placeholder="Describe the product..." />
                                </div>
                                <div className="form-grid-3">
                                    <div className="form-group">
                                        <label className="form-label">Price (USD) *</label>
                                        <input className="form-input" type="number" name="price" value={productForm.price} onChange={handleProductChange} required min="0.01" step="0.01" placeholder="9.99" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Unit *</label>
                                        <input className="form-input" name="unit" value={productForm.unit} onChange={handleProductChange} required placeholder="100g, 250g, 1kg..." />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Stock</label>
                                        <input className="form-input" type="number" name="stock" value={productForm.stock} onChange={handleProductChange} min="0" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Image URL</label>
                                    <input className="form-input" name="image" value={productForm.image} onChange={handleProductChange} placeholder="https://... or /products/myimage.jpg" />
                                </div>
                                <div className="form-group featured-toggle">
                                    <label className="toggle-label">
                                        <input type="checkbox" name="featured" checked={productForm.featured} onChange={handleProductChange} className="toggle-checkbox" />
                                        <div className="toggle-track">
                                            <div className="toggle-thumb" />
                                        </div>
                                        <span>Mark as Featured Product</span>
                                    </label>
                                </div>
                                <button type="submit" className="btn-gold" style={{ minWidth: '200px' }} disabled={saving}>
                                    {saving ? 'Uploading...' : '✦ Upload Product'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .admin-page { min-height: 100vh; padding-bottom: 80px; }
        .admin-header {
          padding: 120px 0 40px;
          position: relative;
          border-bottom: 1px solid rgba(192, 82, 42, 0.12);
        }
        .admin-header-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 100%, rgba(192,82,42,0.07) 0%, transparent 70%);
        }
        .admin-header-inner {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          position: relative;
        }
        .admin-title { font-size: clamp(1.8rem, 3vw, 2.8rem); }
        .admin-sub { color: var(--muted); font-size: 0.85rem; margin-top: 8px; }
        .admin-content { padding-top: 48px; }
        .admin-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 40px;
          border-bottom: 1px solid rgba(192, 82, 42, 0.12);
        }
        .admin-tab {
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          padding: 16px 28px;
          font-family: var(--font-display);
          font-size: 0.72rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: -1px;
        }
        .admin-tab:hover { color: var(--gold); }
        .admin-tab.active { color: var(--gold-dark); border-bottom-color: var(--gold); }
        .tab-title {
          font-family: var(--font-display);
          font-size: 1.2rem;
          color: var(--white);
          margin-bottom: 28px;
        }
        .order-count { color: var(--gold); font-size: 0.9rem; }
        .orders-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
        .orders-table-wrap { overflow-x: auto; border-radius: 4px; border: 1px solid rgba(192,82,42,0.12); }
        .orders-table { width: 100%; border-collapse: collapse; }
        .orders-table th {
          background: var(--dark-2);
          padding: 14px 16px;
          font-family: var(--font-display);
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold-dark);
          text-align: left;
          white-space: nowrap;
        }
        .orders-table td {
          padding: 14px 16px;
          border-top: 1px solid rgba(192,82,42,0.07);
          font-size: 0.83rem;
          color: var(--white);
          vertical-align: top;
        }
        .orders-table tr:hover td { background: rgba(192,82,42,0.03); }
        .order-id { font-family: var(--font-display); color: var(--gold); font-weight: 700; }
        .customer-name { font-weight: 600; margin-bottom: 4px; }
        .customer-email { font-size: 0.75rem; color: var(--muted); }
        .order-item-line { font-size: 0.78rem; color: var(--muted); margin-bottom: 2px; white-space: nowrap; }
        .order-total { font-family: var(--font-display); font-weight: 700; color: var(--gold); white-space: nowrap; }
        .order-date { font-size: 0.78rem; color: var(--muted); white-space: nowrap; }
        .status-select {
          background: var(--dark-2);
          border: 1px solid rgba(192,82,42,0.2);
          color: var(--white);
          padding: 6px 10px;
          font-size: 0.75rem;
          border-radius: 2px;
          cursor: pointer;
          outline: none;
          transition: border-color 0.3s;
        }
        .status-select:focus { border-color: var(--gold); }
        .empty-state { text-align: center; padding: 80px; color: var(--muted); font-size: 0.9rem; }
        .upload-section { max-width: 700px; }
        .upload-form { background: #FAF4E8; border: 1px solid rgba(192,82,42,0.12); border-radius: 4px; padding: 40px; box-shadow: 0 2px 12px rgba(44, 26, 14, 0.05); }
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
        .success-banner {
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.3);
          color: #4ADE80;
          padding: 14px 20px;
          border-radius: 2px;
          font-size: 0.88rem;
          margin-bottom: 24px;
          animation: fadeInUp 0.3s ease;
        }
        .error-banner {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.3);
          color: #F87171;
          padding: 14px 20px;
          border-radius: 2px;
          font-size: 0.88rem;
          margin-bottom: 24px;
        }
        .featured-toggle { margin-bottom: 28px; }
        .toggle-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          font-size: 0.88rem;
          color: var(--white);
        }
        .toggle-checkbox { display: none; }
        .toggle-track {
          width: 44px;
          height: 24px;
          background: var(--dark-4);
          border: 1px solid rgba(201,168,76,0.2);
          border-radius: 12px;
          position: relative;
          transition: background 0.3s;
          flex-shrink: 0;
        }
        .toggle-checkbox:checked + .toggle-track {
          background: var(--gold);
        }
        .toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s;
        }
        .toggle-checkbox:checked + .toggle-track .toggle-thumb {
          transform: translateX(20px);
        }
        @media (max-width: 640px) {
          .form-grid-2, .form-grid-3 { grid-template-columns: 1fr; }
          .upload-form { padding: 24px; }
          .admin-header-inner { flex-direction: column; align-items: flex-start; gap: 20px; }
        }
      `}</style>
        </>
    );
}
