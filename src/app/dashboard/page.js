'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
    const { user, loading, logout, refreshUser } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');

    // Profile edit state
    const [editMode, setEditMode] = useState(false);
    const [profileForm, setProfileForm] = useState({ name: '', phone: '', address: '' });
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileMsg, setProfileMsg] = useState('');

    useEffect(() => {
        if (!loading) {
            if (!user) { router.push('/login'); return; }
            if (user.role === 'admin') { router.push('/admin'); return; }
            fetchOrders();
        }
    }, [user, loading]);

    // Sync form when user data loads
    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
            });
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`/api/orders/user?userId=${user?.id}`);
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch { 
            setOrders([]);
        } finally { 
            setLoadingOrders(false); 
        }
    };

    const handleLogout = () => { logout(); router.push('/'); };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        setProfileMsg('');
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, ...profileForm }),
            });
            if (!res.ok) throw new Error('Save failed');
            await refreshUser();
            setProfileMsg('Profile updated successfully!');
            setEditMode(false);
        } catch {
            setProfileMsg('Failed to save. Please try again.');
        } finally {
            setSavingProfile(false);
        }
    };

    const statusColors = {
        pending: '#92610A', processing: '#1D4ED8',
        shipped: '#6D28D9', delivered: '#15803D', cancelled: '#B91C1C',
    };
    const statusBg = {
        pending: 'rgba(202,138,4,0.1)', processing: 'rgba(59,130,246,0.1)',
        shipped: 'rgba(124,58,237,0.1)', delivered: 'rgba(22,163,74,0.1)', cancelled: 'rgba(220,38,38,0.1)',
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--black)' }}>
                <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', letterSpacing: '0.3em' }}>Loading...</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <>
            <div className="dashboard">
                {/* Header */}
                <div className="dash-header">
                    <div className="dash-header-bg" />
                    <div className="container">
                        <div className="dash-header-inner">
                            <div className="dash-welcome">
                                <div className="dash-avatar">{user.name.charAt(0).toUpperCase()}</div>
                                <div>
                                    <div className="dash-greet">Welcome back,</div>
                                    <h1 className="dash-name">{user.name}</h1>
                                    <p className="dash-email">{user.email}</p>
                                </div>
                            </div>
                            <div className="dash-actions">
                                <Link href="/products" className="btn-outline" style={{ padding: '10px 20px', fontSize: '0.65rem' }}>
                                    🛒 Shop Now
                                </Link>
                                <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
                            </div>
                        </div>

                        {/* Stats bar */}
                        <div className="dash-stats">
                            <div className="dash-stat">
                                <div className="dash-stat-num">{orders.length}</div>
                                <div className="dash-stat-label">Total Orders</div>
                            </div>
                            <div className="dash-stat-div" />
                            <div className="dash-stat">
                                <div className="dash-stat-num">{orders.filter(o => o.status === 'delivered').length}</div>
                                <div className="dash-stat-label">Delivered</div>
                            </div>
                            <div className="dash-stat-div" />
                            <div className="dash-stat">
                                <div className="dash-stat-num">{orders.filter(o => o.status === 'pending' || o.status === 'processing').length}</div>
                                <div className="dash-stat-label">In Progress</div>
                            </div>
                            <div className="dash-stat-div" />
                            <div className="dash-stat">
                                <div className="dash-stat-num">
                                    ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                                </div>
                                <div className="dash-stat-label">Total Spent</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="container dash-content">
                    {/* Tabs */}
                    <div className="dash-tabs">
                        {[
                            { id: 'orders', label: '📦 My Orders' },
                            { id: 'profile', label: '👤 Profile' },
                        ].map((t) => (
                            <button
                                key={t.id}
                                className={`dash-tab ${activeTab === t.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(t.id)}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div>
                            {loadingOrders ? (
                                <div className="loading-orders">Loading your orders...</div>
                            ) : orders.length === 0 ? (
                                <div className="empty-orders">
                                    <div className="empty-icon">🛒</div>
                                    <h3>No orders yet</h3>
                                    <p>Browse our collection and place your first order!</p>
                                    <Link href="/products" className="btn-gold" style={{ marginTop: '20px', display: 'inline-flex' }}>
                                        Start Shopping
                                    </Link>
                                </div>
                            ) : (
                                <div className="orders-list">
                                    {orders.map((order) => (
                                        <div key={order.id} className="order-card">
                                            <div className="order-card-header">
                                                <div>
                                                    <div className="order-id">Order #{order.id}</div>
                                                    <div className="order-date">
                                                        {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </div>
                                                </div>
                                                <div className="order-card-right">
                                                    <div
                                                        className="order-status-badge"
                                                        style={{ color: statusColors[order.status], background: statusBg[order.status] }}
                                                    >
                                                        {order.status}
                                                    </div>
                                                    <div className="order-total">${order.total.toFixed(2)}</div>
                                                </div>
                                            </div>
                                            <div className="order-items">
                                                {order.items.map((item) => (
                                                    <div key={item.id} className="order-item-row">
                                                        <img
                                                            src={item.product.image}
                                                            alt={item.product.name}
                                                            className="order-item-img"
                                                            onError={(e) => { e.target.src = `https://placehold.co/60x60/E5D9B8/8B3C1E?text=${item.product.name.charAt(0)}`; }}
                                                        />
                                                        <div className="order-item-info">
                                                            <div className="order-item-name">{item.product.name}</div>
                                                            <div className="order-item-meta">x{item.quantity} · ${item.price.toFixed(2)} each</div>
                                                        </div>
                                                        <div className="order-item-subtotal">${(item.price * item.quantity).toFixed(2)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="order-card-footer">
                                                <span className="order-shipping">
                                                    📍 {order.address}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="profile-section">
                            <div className="profile-card">
                                <div className="profile-avatar-lg">{user.name.charAt(0).toUpperCase()}</div>
                                <h2 className="profile-name">{user.name}</h2>
                                <p className="profile-email">{user.email}</p>
                                <div className="profile-badge">
                                    <span>✦ Customer Account</span>
                                </div>

                                {/* Profile Info / Edit Form */}
                                {editMode ? (
                                    <form className="profile-edit-form" onSubmit={handleProfileSave}>
                                        <div className="profile-form-group">
                                            <label className="profile-form-label">Full Name</label>
                                            <input
                                                className="profile-form-input"
                                                type="text"
                                                value={profileForm.name}
                                                onChange={(e) => setProfileForm(f => ({ ...f, name: e.target.value }))}
                                                placeholder="Your full name"
                                                required
                                            />
                                        </div>
                                        <div className="profile-form-group">
                                            <label className="profile-form-label">Phone Number</label>
                                            <input
                                                className="profile-form-input"
                                                type="tel"
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                                                placeholder="+1 234 567 8901"
                                            />
                                        </div>
                                        <div className="profile-form-group">
                                            <label className="profile-form-label">Default Delivery Address</label>
                                            <textarea
                                                className="profile-form-textarea"
                                                value={profileForm.address}
                                                onChange={(e) => setProfileForm(f => ({ ...f, address: e.target.value }))}
                                                placeholder="Your delivery address"
                                                rows={3}
                                            />
                                        </div>
                                        {profileMsg && (
                                            <p className={profileMsg.includes('success') ? 'profile-msg-ok' : 'profile-msg-err'}>
                                                {profileMsg}
                                            </p>
                                        )}
                                        <div className="profile-form-actions">
                                            <button type="submit" className="btn-gold" style={{ flex: 1, justifyContent: 'center' }} disabled={savingProfile}>
                                                {savingProfile ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button type="button" className="btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setEditMode(false); setProfileMsg(''); }}>
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="profile-info-rows">
                                            <div className="profile-info-row">
                                                <span className="info-label">Member Since</span>
                                                <span className="info-val">{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                            </div>
                                            <div className="profile-info-row">
                                                <span className="info-label">Account Type</span>
                                                <span className="info-val" style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>Customer</span>
                                            </div>
                                            <div className="profile-info-row">
                                                <span className="info-label">Phone</span>
                                                <span className="info-val">{user.phone || <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Not set</span>}</span>
                                            </div>
                                            <div className="profile-info-row">
                                                <span className="info-label">Default Address</span>
                                                <span className="info-val" style={{ maxWidth: '220px', textAlign: 'right' }}>{user.address || <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Not set</span>}</span>
                                            </div>
                                            <div className="profile-info-row">
                                                <span className="info-label">Total Orders</span>
                                                <span className="info-val">{orders.length}</span>
                                            </div>
                                        </div>
                                        {profileMsg && (
                                            <p className="profile-msg-ok" style={{ marginTop: '16px' }}>{profileMsg}</p>
                                        )}
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                            <button className="btn-gold" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setEditMode(true)}>
                                                ✏️ Edit Profile
                                            </button>
                                            <button className="btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={handleLogout}>
                                                Sign Out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
