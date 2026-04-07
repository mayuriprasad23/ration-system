import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const BASE = "http://localhost:5000/api/dashboard";

/* ========================================
   ADMIN DASHBOARD – Full Featured
   ======================================== */
export function AdminDashboard({ onLogout }) {
  const [page, setPage] = useState('dashboard');
  const [data, setData] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [shops, setShops] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddShop, setShowAddShop] = useState(false);
  const [showUpdateStock, setShowUpdateStock] = useState(false);
  const [newShop, setNewShop] = useState({ name: '', location: '' });
  const [stockUpdate, setStockUpdate] = useState({ shop_id: '', rice: '', wheat: '' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const loadDashboard = useCallback(() => {
    fetch(`${BASE}/admin`).then(r => r.json()).then(setData).catch(() => {});
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  useEffect(() => {
    if (page === 'beneficiaries') fetch(`${BASE}/admin/beneficiaries`).then(r => r.json()).then(setBeneficiaries);
    if (page === 'shops') fetch(`${BASE}/admin/shops`).then(r => r.json()).then(setShops);
    if (page === 'stock') fetch(`${BASE}/admin/stock`).then(r => r.json()).then(setStockList);
    if (page === 'reports') fetch(`${BASE}/admin/reports`).then(r => r.json()).then(setReports);
  }, [page]);

  const handleAddShop = async () => {
    if (!newShop.name) return alert('Enter shop name');
    const res = await fetch(`${BASE}/admin/shops`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newShop) });
    if (res.ok) { alert('Shop added!'); setShowAddShop(false); setNewShop({ name: '', location: '' }); loadDashboard(); if (page === 'shops') fetch(`${BASE}/admin/shops`).then(r => r.json()).then(setShops); }
  };

  const handleUpdateStock = async () => {
    if (!stockUpdate.shop_id) return alert('Enter shop ID');
    const res = await fetch(`${BASE}/admin/stock`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(stockUpdate) });
    if (res.ok) { alert('Stock updated!'); setShowUpdateStock(false); setStockUpdate({ shop_id: '', rice: '', wheat: '' }); loadDashboard(); if (page === 'stock') fetch(`${BASE}/admin/stock`).then(r => r.json()).then(setStockList); }
  };

  if (!data) return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Loading Dashboard...</p>
    </div>
  );

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'beneficiaries', label: 'Beneficiaries', icon: '👥' },
    { id: 'shops', label: 'Ration Shops', icon: '🏪' },
    { id: 'stock', label: 'Stock', icon: '📦' },
    { id: 'reports', label: 'Reports', icon: '📋' },
  ];

  const filtered = (data.recentDistributions || []).filter(d =>
    !searchTerm ||
    (d.beneficiaryName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.aadhaar || '').includes(searchTerm)
  );

  const stockChartData = [
    { name: 'Rice', value: data.totalRice || 0 },
    { name: 'Wheat', value: data.totalWheat || 0 },
  ];
  const COLORS = ['#10b981', '#f59e0b'];

  return (
    <div className="admin-layout">
      {/* ---- TOP HEADER BAR ---- */}
      <div className="top-header">
        <div className="top-header-left">
          <div className="home-icon" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>☰</div>
          <span className="header-title">Smart Ration Distribution System</span>
          <span className="header-badge">Admin Panel</span>
        </div>
        <div className="top-header-right">
          <div className="header-search-bar">
            <span>🔍</span>
            <input placeholder="Quick search..." />
          </div>
          <div className="notification-bell">🔔<span className="notif-dot"></span></div>
          <div className="admin-info">
            <div className="admin-avatar">A</div>
            <div className="admin-name-block">
              <span className="admin-name">Administrator</span>
              <span className="admin-role">Super Admin</span>
            </div>
          </div>
          <button className="logout-top-btn" onClick={onLogout}>⏻ Logout</button>
        </div>
      </div>

      {/* ---- SIDEBAR ---- */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-profile">
          <div className="avatar">
            <span>👤</span>
          </div>
          {!sidebarCollapsed && (
            <>
              <p className="welcome-text">Welcome Admin</p>
              <span className="email-text">admin@rationportal.gov.in</span>
            </>
          )}
        </div>
        <div className="sidebar-nav">
          {navItems.map(item => (
            <div key={item.id} className={`sidebar-nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)} title={item.label}>
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
            </div>
          ))}
        </div>
        <div className="sidebar-logout">
          <button onClick={onLogout}>
            <span>⏻</span>
            {!sidebarCollapsed && ' Logout'}
          </button>
        </div>
      </div>

      {/* ---- MAIN CONTENT ---- */}
      <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>

        {/* ===== DASHBOARD PAGE ===== */}
        {page === 'dashboard' && (
          <div className="dashboard-content">
            <div className="welcome-section">
              <h2>Welcome to the Smart Ration Distribution System</h2>
              <p>Manage beneficiaries, ration shops, and stock efficiently and transparently.</p>
            </div>

            {/* Stat Cards - 4 cards matching the image requirements */}
            <div className="stat-cards four-col">
              <div className="stat-card green animate-in" style={{animationDelay: '0ms'}}>
                <div className="stat-card-glow"></div>
                <div className="stat-header"><div className="stat-icon">👥</div> Total Users</div>
                <div className="stat-number">{data.beneficiaryCount}</div>
                <div className="stat-sub">Registered beneficiaries</div>
                <button className="stat-btn" onClick={() => setPage('beneficiaries')}>View All &nbsp;→</button>
              </div>
              <div className="stat-card orange animate-in" style={{animationDelay: '80ms'}}>
                <div className="stat-card-glow"></div>
                <div className="stat-header"><div className="stat-icon">🏪</div> Ration Shops</div>
                <div className="stat-number">{data.shopCount}</div>
                <div className="stat-sub">Active ration shops</div>
                <button className="stat-btn" onClick={() => setShowAddShop(true)}>Add Shop &nbsp;+</button>
              </div>
              <div className="stat-card purple animate-in" style={{animationDelay: '160ms'}}>
                <div className="stat-card-glow"></div>
                <div className="stat-header"><div className="stat-icon">📦</div> Total Stock</div>
                <div className="stat-number">{data.totalStock}<span className="stat-unit">kg</span></div>
                <div className="stat-detail">
                  <span className="detail-chip rice">🌾 Rice: {data.totalRice || 0} kg</span>
                  <span className="detail-chip wheat">🌾 Wheat: {data.totalWheat || 0} kg</span>
                </div>
                <button className="stat-btn" onClick={() => setShowUpdateStock(true)}>Update &nbsp;+</button>
              </div>
              <div className="stat-card blue animate-in" style={{animationDelay: '240ms'}}>
                <div className="stat-card-glow"></div>
                <div className="stat-header"><div className="stat-icon">📋</div> Transactions</div>
                <div className="stat-number">{data.totalTransactions}</div>
                <div className="stat-sub">Total distributions</div>
                <button className="stat-btn" onClick={() => setPage('reports')}>View All &nbsp;→</button>
              </div>
            </div>

            {/* Content Grid: Table + Summary */}
            <div className="content-grid">
              {/* Recent Distributions */}
              <div className="card animate-in" style={{animationDelay: '320ms'}}>
                <div className="card-header">
                  <h3>📋 Recent Transactions</h3>
                  <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input placeholder="Search by name or Aadhaar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Beneficiary Name</th>
                      <th>Aadhaar No.</th>
                      <th>Shop</th>
                      <th>Rice (kg)</th>
                      <th>Wheat (kg)</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length > 0 ? filtered.map((tx, i) => (
                      <tr key={i} className="table-row-animate" style={{animationDelay: `${i * 40}ms`}}>
                        <td><span className="id-badge">#{tx.id}</span></td>
                        <td className="name-cell">{tx.beneficiaryName || '—'}</td>
                        <td><code className="aadhaar-code">{tx.aadhaar || '—'}</code></td>
                        <td>{tx.shopName || '—'}</td>
                        <td>{tx.rice} kg</td>
                        <td>{tx.wheat} kg</td>
                        <td>{new Date(tx.date).toLocaleDateString('en-IN')}</td>
                        <td><span className="status-badge delivered">✓ Delivered</span></td>
                      </tr>
                    )) : (
                      <tr><td colSpan="8" className="empty-state">No distributions yet</td></tr>
                    )}
                  </tbody>
                </table>
                <div className="view-all-link">
                  <span onClick={() => setPage('reports')}>View All Transactions →</span>
                </div>
              </div>

              {/* Right Summary */}
              <div className="summary-stack">
                <div className="summary-card animate-in" style={{animationDelay: '400ms'}}>
                  <div className="s-icon stock-icon">📦</div>
                  <div className="s-text">
                    <h4>Total Stock</h4>
                    <p>{data.totalStock} <span>kg</span></p>
                  </div>
                </div>
                <div className="summary-card animate-in" style={{animationDelay: '460ms'}}>
                  <div className="s-icon dist-icon">🚚</div>
                  <div className="s-text">
                    <h4>Distributed Stock</h4>
                    <p>{data.distributedStock} <span>kg</span></p>
                  </div>
                </div>
                <div className="summary-card animate-in" style={{animationDelay: '520ms'}}>
                  <div className="s-icon alert-icon">⚠️</div>
                  <div className="s-text">
                    <h4>Low Stock Alerts</h4>
                    <p>{data.lowStockAlerts}</p>
                  </div>
                </div>
                {/* Stock Breakdown Mini Chart */}
                <div className="card mini-chart-card animate-in" style={{animationDelay: '580ms'}}>
                  <h3>Stock Breakdown</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={stockChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={40} paddingAngle={4} stroke="none">
                        {stockChartData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" height={30} iconType="circle" formatter={(value) => <span style={{color:'#555', fontSize:'12px'}}>{value}</span>} />
                      <Tooltip formatter={(val) => `${val} kg`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== BENEFICIARIES PAGE ===== */}
        {page === 'beneficiaries' && (
          <div className="sub-page">
            <div className="page-top">
              <div>
                <h2>All Beneficiaries</h2>
                <p className="page-desc">Manage and view all registered users in the system</p>
              </div>
              <div className="page-stats-inline">
                <span className="inline-stat">👥 Total: <strong>{beneficiaries.length}</strong></span>
              </div>
            </div>
            <div className="card">
              <table className="data-table">
                <thead>
                  <tr><th>ID</th><th>Name</th><th>Aadhaar</th><th>Ration Card</th><th>Category</th><th>Family</th><th>Mobile</th><th>City</th><th>Verified</th></tr>
                </thead>
                <tbody>
                  {beneficiaries.map((u, i) => (
                    <tr key={i} className="table-row-animate" style={{animationDelay: `${i * 30}ms`}}>
                      <td><span className="id-badge">#{u.id}</span></td>
                      <td className="name-cell">{u.name}</td>
                      <td><code className="aadhaar-code">{u.aadhaar}</code></td>
                      <td>{u.ration_card_number}</td>
                      <td><span className={`category-badge ${u.ration_category?.toLowerCase()}`}>{u.ration_category}</span></td>
                      <td>{u.family_members}</td>
                      <td>{u.mobile_number}</td>
                      <td>{u.city}</td>
                      <td>{u.is_verified ? <span className="verified-badge">✅ Yes</span> : <span className="unverified-badge">❌ No</span>}</td>
                    </tr>
                  ))}
                  {beneficiaries.length === 0 && <tr><td colSpan="9" className="empty-state">No beneficiaries found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== SHOPS PAGE ===== */}
        {page === 'shops' && (
          <div className="sub-page">
            <div className="page-top">
              <div>
                <h2>Ration Shops</h2>
                <p className="page-desc">Manage ration distribution centers</p>
              </div>
              <button className="action-btn" onClick={() => setShowAddShop(true)}>+ Add Shop</button>
            </div>
            <div className="card">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Name</th><th>Location</th><th>Rice (kg)</th><th>Wheat (kg)</th><th>Total (kg)</th></tr></thead>
                <tbody>
                  {shops.map((s, i) => (
                    <tr key={i} className="table-row-animate" style={{animationDelay: `${i * 30}ms`}}>
                      <td><span className="id-badge">#{s.id}</span></td>
                      <td className="name-cell">{s.name}</td>
                      <td>📍 {s.location}</td>
                      <td>{s.rice ?? 0}</td>
                      <td>{s.wheat ?? 0}</td>
                      <td><strong>{(s.rice ?? 0) + (s.wheat ?? 0)}</strong></td>
                    </tr>
                  ))}
                  {shops.length === 0 && <tr><td colSpan="6" className="empty-state">No shops found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== STOCK PAGE ===== */}
        {page === 'stock' && (
          <div className="sub-page">
            <div className="page-top">
              <div>
                <h2>Stock Management</h2>
                <p className="page-desc">Monitor and update inventory across all shops</p>
              </div>
              <button className="action-btn" onClick={() => setShowUpdateStock(true)}>+ Update Stock</button>
            </div>
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3>📊 Stock Overview</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stockList.map(s => ({ name: s.shopName || `Shop ${s.shop_id}`, Rice: s.rice, Wheat: s.wheat }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" fontSize={12} tick={{fill: '#666'}} />
                  <YAxis fontSize={12} tick={{fill: '#666'}} />
                  <Tooltip contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="Rice" fill="#10b981" radius={[6,6,0,0]} />
                  <Bar dataKey="Wheat" fill="#f59e0b" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <table className="data-table">
                <thead><tr><th>Shop ID</th><th>Shop Name</th><th>Location</th><th>Rice (kg)</th><th>Wheat (kg)</th><th>Total</th></tr></thead>
                <tbody>
                  {stockList.map((s, i) => (
                    <tr key={i} className="table-row-animate">
                      <td><span className="id-badge">#{s.shop_id}</span></td>
                      <td className="name-cell">{s.shopName || '—'}</td>
                      <td>📍 {s.location || '—'}</td>
                      <td>{s.rice}</td>
                      <td>{s.wheat}</td>
                      <td><strong>{s.rice + s.wheat}</strong></td>
                    </tr>
                  ))}
                  {stockList.length === 0 && <tr><td colSpan="6" className="empty-state">No stock data</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== REPORTS PAGE ===== */}
        {page === 'reports' && (
          <div className="sub-page">
            <div className="page-top">
              <div>
                <h2>Transaction Reports</h2>
                <p className="page-desc">Complete history of all ration distributions</p>
              </div>
              <div className="page-stats-inline">
                <span className="inline-stat">📋 Total: <strong>{reports.length}</strong></span>
              </div>
            </div>
            <div className="card">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Beneficiary</th><th>Aadhaar</th><th>Shop</th><th>Rice</th><th>Wheat</th><th>Date</th></tr></thead>
                <tbody>
                  {reports.map((tx, i) => (
                    <tr key={i} className="table-row-animate" style={{animationDelay: `${i * 30}ms`}}>
                      <td><span className="id-badge">#{tx.id}</span></td>
                      <td className="name-cell">{tx.beneficiaryName || '—'}</td>
                      <td><code className="aadhaar-code">{tx.aadhaar || '—'}</code></td>
                      <td>{tx.shopName || '—'}</td>
                      <td>{tx.rice} kg</td>
                      <td>{tx.wheat} kg</td>
                      <td>{new Date(tx.date).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                  {reports.length === 0 && <tr><td colSpan="7" className="empty-state">No transactions</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ---- ADD SHOP MODAL ---- */}
      {showAddShop && (
        <div className="modal-overlay" onClick={() => setShowAddShop(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🏪 Add New Ration Shop</h3>
              <button className="modal-close" onClick={() => setShowAddShop(false)}>✕</button>
            </div>
            <input className="modal-input" placeholder="Shop Name" value={newShop.name} onChange={e => setNewShop({ ...newShop, name: e.target.value })} />
            <input className="modal-input" placeholder="Location" value={newShop.location} onChange={e => setNewShop({ ...newShop, location: e.target.value })} />
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowAddShop(false)}>Cancel</button>
              <button className="modal-btn primary" onClick={handleAddShop}>Add Shop</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- UPDATE STOCK MODAL ---- */}
      {showUpdateStock && (
        <div className="modal-overlay" onClick={() => setShowUpdateStock(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📦 Update Stock</h3>
              <button className="modal-close" onClick={() => setShowUpdateStock(false)}>✕</button>
            </div>
            <input className="modal-input" placeholder="Shop ID" type="number" value={stockUpdate.shop_id} onChange={e => setStockUpdate({ ...stockUpdate, shop_id: e.target.value })} />
            <input className="modal-input" placeholder="Rice (kg)" type="number" value={stockUpdate.rice} onChange={e => setStockUpdate({ ...stockUpdate, rice: e.target.value })} />
            <input className="modal-input" placeholder="Wheat (kg)" type="number" value={stockUpdate.wheat} onChange={e => setStockUpdate({ ...stockUpdate, wheat: e.target.value })} />
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowUpdateStock(false)}>Cancel</button>
              <button className="modal-btn primary" onClick={handleUpdateStock}>Update Stock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================
   SHOPKEEPER DASHBOARD – Full Featured
   ======================================== */
export function ShopkeeperDashboard({ onLogout, shopId = 1 }) {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState('aadhaar');
  const [userResult, setUserResult] = useState(null);
  const [distribute, setDistribute] = useState({ rice: 0, wheat: 0 });
  const [activeTab, setActiveTab] = useState('overview');

  const loadData = useCallback(() => {
    fetch(`${BASE}/shopkeeper/${shopId}`).then(r => r.json()).then(setData);
  }, [shopId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSearch = async () => {
    if (!search.trim()) return alert('Please enter a search term');
    const res = await fetch(`${BASE}/shopkeeper/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [searchType]: search })
    });
    if (res.ok) setUserResult(await res.json());
    else { alert('User not found'); setUserResult(null); }
  };

  const handleDistribute = async () => {
    if (!distribute.rice && !distribute.wheat) return alert('Enter rice or wheat quantity');
    const res = await fetch(`${BASE}/shopkeeper/distribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userResult.id, shop_id: shopId, rice: distribute.rice, wheat: distribute.wheat })
    });
    if (res.ok) { alert(await res.text()); loadData(); setUserResult(null); setSearch(''); setDistribute({ rice: 0, wheat: 0 }); }
    else alert('Error distributing ration');
  };

  if (!data) return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Loading Dashboard...</p>
    </div>
  );

  const todayRice = data.dailyTransactions.reduce((s, t) => s + (t.rice || 0), 0);
  const todayWheat = data.dailyTransactions.reduce((s, t) => s + (t.wheat || 0), 0);

  return (
    <div className="shopkeeper-layout">
      {/* Top Bar */}
      <div className="sk-topbar">
        <div className="sk-topbar-left">
          <span className="sk-logo">🏪</span>
          <span className="sk-title">Shopkeeper Portal</span>
        </div>
        <div className="sk-topbar-right">
          <div className="admin-info">
            <div className="admin-avatar sk-avatar">S</div>
            <span className="admin-name">Shopkeeper</span>
          </div>
          <button className="logout-top-btn" onClick={onLogout}>⏻ Logout</button>
        </div>
      </div>

      <div className="sk-body">
        {/* Tab Navigation */}
        <div className="sk-tabs">
          <button className={`sk-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Overview</button>
          <button className={`sk-tab ${activeTab === 'distribute' ? 'active' : ''}`} onClick={() => setActiveTab('distribute')}>🚚 Distribute Ration</button>
          <button className={`sk-tab ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>📋 Daily Transactions</button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="sk-overview animate-in">
            <div className="stat-cards three-col">
              <div className="stat-card green animate-in" style={{animationDelay: '0ms'}}>
                <div className="stat-card-glow"></div>
                <div className="stat-header"><div className="stat-icon">🌾</div> Rice Stock</div>
                <div className="stat-number">{data.currentStock.rice}<span className="stat-unit">kg</span></div>
                <div className="stat-sub">Currently available</div>
                <div className="stock-bar-wrap"><div className="stock-bar rice" style={{width: `${Math.min((data.currentStock.rice / 1000) * 100, 100)}%`}}></div></div>
              </div>
              <div className="stat-card orange animate-in" style={{animationDelay: '80ms'}}>
                <div className="stat-card-glow"></div>
                <div className="stat-header"><div className="stat-icon">🌾</div> Wheat Stock</div>
                <div className="stat-number">{data.currentStock.wheat}<span className="stat-unit">kg</span></div>
                <div className="stat-sub">Currently available</div>
                <div className="stock-bar-wrap"><div className="stock-bar wheat" style={{width: `${Math.min((data.currentStock.wheat / 1000) * 100, 100)}%`}}></div></div>
              </div>
              <div className="stat-card blue animate-in" style={{animationDelay: '160ms'}}>
                <div className="stat-card-glow"></div>
                <div className="stat-header"><div className="stat-icon">📋</div> Today's Transactions</div>
                <div className="stat-number">{data.dailyTransactions.length}</div>
                <div className="stat-sub">Distributions today</div>
                <div className="stat-detail">
                  <span className="detail-chip rice">Rice: {todayRice} kg</span>
                  <span className="detail-chip wheat">Wheat: {todayWheat} kg</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-grid">
              <div className="quick-action-card" onClick={() => setActiveTab('distribute')}>
                <span className="qa-icon">🚚</span>
                <span className="qa-label">Distribute Ration</span>
                <span className="qa-desc">Search user & distribute</span>
              </div>
              <div className="quick-action-card" onClick={() => setActiveTab('transactions')}>
                <span className="qa-icon">📋</span>
                <span className="qa-label">View Transactions</span>
                <span className="qa-desc">Today's distribution log</span>
              </div>
            </div>
          </div>
        )}

        {/* Distribute Tab */}
        {activeTab === 'distribute' && (
          <div className="sk-distribute animate-in">
            <div className="card">
              <h3>🔍 Search User by Aadhaar or Ration Card</h3>
              <div className="search-controls">
                <div className="search-type-toggle">
                  <button className={`toggle-btn ${searchType === 'aadhaar' ? 'active' : ''}`} onClick={() => setSearchType('aadhaar')}>Aadhaar</button>
                  <button className={`toggle-btn ${searchType === 'ration_card' ? 'active' : ''}`} onClick={() => setSearchType('ration_card')}>Ration Card</button>
                </div>
                <div className="search-input-group">
                  <input className="modal-input search-main-input" placeholder={searchType === 'aadhaar' ? 'Enter 12-digit Aadhaar number...' : 'Enter ration card number...'} value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                  <button className="action-btn search-btn" onClick={handleSearch}>🔍 Search</button>
                </div>
              </div>

              {userResult && (
                <div className="user-result-card animate-in">
                  <div className="user-result-header">
                    <div className="user-result-avatar">{userResult.name?.charAt(0)?.toUpperCase()}</div>
                    <div>
                      <h4>{userResult.name}</h4>
                      <p>Aadhaar: {userResult.aadhaar} • Ration Card: {userResult.ration_card_number}</p>
                    </div>
                    <span className={`category-badge ${userResult.ration_category?.toLowerCase()}`}>{userResult.ration_category}</span>
                  </div>
                  <div className="user-result-details">
                    <div className="detail-item"><span className="detail-label">Family Members</span><span className="detail-value">{userResult.family_members}</span></div>
                  </div>
                  <div className="distribute-form">
                    <h4>📦 Distribute Ration (Assisted Mode)</h4>
                    <div className="distribute-inputs">
                      <div className="distribute-field">
                        <label>Rice (kg)</label>
                        <input type="number" className="modal-input" placeholder="0" value={distribute.rice} onChange={e => setDistribute({ ...distribute, rice: Number(e.target.value) })} />
                      </div>
                      <div className="distribute-field">
                        <label>Wheat (kg)</label>
                        <input type="number" className="modal-input" placeholder="0" value={distribute.wheat} onChange={e => setDistribute({ ...distribute, wheat: Number(e.target.value) })} />
                      </div>
                      <button className="action-btn distribute-btn" onClick={handleDistribute}>🚚 Distribute Now</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Daily Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="sk-transactions animate-in">
            <div className="card">
              <div className="card-header">
                <h3>📋 Daily Transactions — {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                <span className="inline-stat">Total: <strong>{data.dailyTransactions.length}</strong></span>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>User</th><th>Rice (kg)</th><th>Wheat (kg)</th><th>Total (kg)</th><th>Time</th></tr>
                </thead>
                <tbody>
                  {data.dailyTransactions.map((tx, i) => (
                    <tr key={i} className="table-row-animate" style={{animationDelay: `${i * 40}ms`}}>
                      <td className="name-cell">{tx.userName || `User #${tx.user_id}`}</td>
                      <td>{tx.rice} kg</td>
                      <td>{tx.wheat} kg</td>
                      <td><strong>{tx.rice + tx.wheat} kg</strong></td>
                      <td>{new Date(tx.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                  {data.dailyTransactions.length === 0 && <tr><td colSpan="5" className="empty-state">No transactions today</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================================
   USER DASHBOARD – Full Featured
   ======================================== */
export function UserDashboard({ user, onLogout }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (user?.id) fetch(`${BASE}/user/${user.id}`).then(r => r.json()).then(setData);
  }, [user]);

  if (!data) return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Loading your dashboard...</p>
    </div>
  );

  const chartData = [
    { name: 'Rice', amount: data.entitlement.rice || 0, fill: '#10b981' },
    { name: 'Wheat', amount: data.entitlement.wheat || 0, fill: '#f59e0b' },
  ];

  const totalReceived = data.transactionHistory.reduce((acc, tx) => ({
    rice: acc.rice + (tx.rice || 0),
    wheat: acc.wheat + (tx.wheat || 0)
  }), { rice: 0, wheat: 0 });

  const riceRemaining = Math.max(0, (data.entitlement.rice || 0) - totalReceived.rice);
  const wheatRemaining = Math.max(0, (data.entitlement.wheat || 0) - totalReceived.wheat);

  return (
    <div className="user-layout">
      {/* Top Bar */}
      <div className="user-topbar">
        <div className="sk-topbar-left">
          <span className="sk-logo">🏪</span>
          <span className="sk-title">Ration Portal</span>
        </div>
        <div className="sk-topbar-right">
          <div className="admin-info">
            <div className="admin-avatar user-avatar">{data.user.name?.charAt(0)?.toUpperCase()}</div>
            <span className="admin-name">{data.user.name}</span>
          </div>
          <button className="logout-top-btn" onClick={onLogout}>⏻ Logout</button>
        </div>
      </div>

      <div className="user-body">
        {/* Welcome */}
        <div className="user-welcome animate-in">
          <div className="user-welcome-text">
            <h2>Hello, {data.user.name} 👋</h2>
            <p>Welcome to the Smart Ration Distribution System</p>
          </div>
        </div>

        <div className="user-grid">
          {/* Personal Details Card */}
          <div className="card user-details-card animate-in" style={{animationDelay: '80ms'}}>
            <h3>👤 Personal Details</h3>
            <div className="user-detail-list">
              <div className="user-detail-row">
                <span className="ud-label">Full Name</span>
                <span className="ud-value">{data.user.name}</span>
              </div>
              <div className="user-detail-row">
                <span className="ud-label">Aadhaar Number</span>
                <span className="ud-value"><code className="aadhaar-code">{data.user.aadhaar}</code></span>
              </div>
              <div className="user-detail-row">
                <span className="ud-label">Ration Card</span>
                <span className="ud-value">{data.user.ration_card_number}</span>
              </div>
              <div className="user-detail-row">
                <span className="ud-label">Category</span>
                <span className="ud-value"><span className={`category-badge ${data.user.category?.toLowerCase()}`}>{data.user.category}</span></span>
              </div>
              <div className="user-detail-row">
                <span className="ud-label">Family Members</span>
                <span className="ud-value">{data.user.family_members} members</span>
              </div>
            </div>
          </div>

          {/* Entitlement Card */}
          <div className="card user-entitlement-card animate-in" style={{animationDelay: '160ms'}}>
            <h3>🌾 Ration Entitlement (Monthly)</h3>
            <div className="entitlement-grid">
              <div className="entitlement-item rice-ent">
                <div className="ent-icon">🌾</div>
                <div className="ent-info">
                  <span className="ent-label">Rice</span>
                  <span className="ent-value">{data.entitlement.rice} kg</span>
                  <span className="ent-remaining">Remaining: {riceRemaining} kg</span>
                </div>
                <div className="ent-progress-wrap"><div className="ent-progress rice-progress" style={{width: `${data.entitlement.rice > 0 ? Math.min(((data.entitlement.rice - riceRemaining) / data.entitlement.rice) * 100, 100) : 0}%`}}></div></div>
              </div>
              <div className="entitlement-item wheat-ent">
                <div className="ent-icon">🌾</div>
                <div className="ent-info">
                  <span className="ent-label">Wheat</span>
                  <span className="ent-value">{data.entitlement.wheat} kg</span>
                  <span className="ent-remaining">Remaining: {wheatRemaining} kg</span>
                </div>
                <div className="ent-progress-wrap"><div className="ent-progress wheat-progress" style={{width: `${data.entitlement.wheat > 0 ? Math.min(((data.entitlement.wheat - wheatRemaining) / data.entitlement.wheat) * 100, 100) : 0}%`}}></div></div>
              </div>
            </div>
            <div className="entitlement-chart">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart layout="vertical" data={chartData} margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" fontSize={12} tick={{fill: '#666'}} />
                  <YAxis type="category" dataKey="name" width={50} fontSize={12} tick={{fill: '#666'}} />
                  <Tooltip contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}} formatter={(val) => `${val} kg`} />
                  <Bar dataKey="amount" radius={[0, 8, 8, 0]} barSize={24}>
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="card animate-in" style={{animationDelay: '240ms'}}>
          <div className="card-header">
            <h3>📋 Transaction History</h3>
            <span className="inline-stat">Total: <strong>{data.transactionHistory.length}</strong></span>
          </div>
          <table className="data-table">
            <thead><tr><th>Date</th><th>Shop</th><th>Rice (kg)</th><th>Wheat (kg)</th><th>Total (kg)</th></tr></thead>
            <tbody>
              {data.transactionHistory.map((tx, i) => (
                <tr key={i} className="table-row-animate" style={{animationDelay: `${i * 40}ms`}}>
                  <td>{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td>{tx.shopName || `Shop #${tx.shop_id}`}</td>
                  <td>{tx.rice} kg</td>
                  <td>{tx.wheat} kg</td>
                  <td><strong>{tx.rice + tx.wheat} kg</strong></td>
                </tr>
              ))}
              {data.transactionHistory.length === 0 && <tr><td colSpan="5" className="empty-state">No transactions yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
