import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

const BASE_URL = "http://localhost:5000/api";

export function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/dashboard/admin`)
      .then(res => res.json())
      .then(res => setData(res));
  }, []);

  if (!data) return <div style={{ color: 'white', padding: "40px" }}>Loading Dashboard...</div>;

  const stockData = [
    { name: 'Rice', amount: data.totalRice },
    { name: 'Wheat', amount: data.totalWheat }
  ];

  return (
    <div style={{ padding: '30px', color: '#fff', width: '100%', maxWidth: '1000px', margin: 'auto' }}>
      <h2>Admin Dashboard</h2>
      <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
        <div className="glass-card" style={{ flex: 1, padding: '20px' }}>
          <h3>Total Users</h3><p style={{ fontSize: '30px' }}>{data.userCount}</p>
        </div>
        <div className="glass-card" style={{ flex: 1, padding: '20px' }}>
          <h3>Total Shops</h3><p style={{ fontSize: '30px' }}>{data.shopCount}</p>
        </div>
        <div className="glass-card" style={{ flex: 1, padding: '20px' }}>
          <h3>Total Transactions</h3><p style={{ fontSize: '30px' }}>{data.totalTransactions}</p>
        </div>
      </div>

      <div className="glass-card" style={{ margin: '20px 0', padding: '30px' }}>
        <h3 style={{ marginBottom: '20px' }}>Total Stock Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none' }} />
            <Legend />
            <Bar dataKey="amount" fill="#38bdf8" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="glass-card" style={{ padding: '20px', textAlign: 'left' }}>
         <h3 style={{ marginBottom: '20px' }}>Recent Transactions</h3>
         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
           <thead>
             <tr><th style={{ textAlign: 'left' }}>User</th><th style={{ textAlign: 'left' }}>Shop</th><th style={{ textAlign: 'left' }}>Rice</th><th style={{ textAlign: 'left' }}>Wheat</th><th style={{ textAlign: 'left' }}>Date</th></tr>
           </thead>
           <tbody>
             {data.recentTransactions.map((tx, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #444' }}>
                  <td style={{ padding: '10px 0' }}>{tx.userName || tx.user_id}</td>
                  <td>{tx.shopName || tx.shop_id}</td>
                  <td>{tx.rice} kg</td>
                  <td>{tx.wheat} kg</td>
                  <td>{new Date(tx.date).toLocaleDateString()}</td>
                </tr>
             ))}
             {data.recentTransactions.length === 0 && <tr><td colSpan="5">No transactions yet</td></tr>}
           </tbody>
         </table>
      </div>
    </div>
  );
}

export function ShopkeeperDashboard({ shopId = 1 }) {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [userResult, setUserResult] = useState(null);
  const [distribute, setDistribute] = useState({ rice: 0, wheat: 0 });

  const loadData = () => {
    fetch(`${BASE_URL}/dashboard/shopkeeper/${shopId}`)
      .then(res => res.json())
      .then(res => setData(res));
  };

  useEffect(() => { loadData(); }, [shopId]);

  const handleSearch = async () => {
    const res = await fetch(`${BASE_URL}/dashboard/shopkeeper/search`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ aadhaar: search })
    });
    if (res.ok) setUserResult(await res.json());
    else { alert("User not found"); setUserResult(null); }
  };

  const handleDistribute = async () => {
    const res = await fetch(`${BASE_URL}/dashboard/shopkeeper/distribute`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userResult.id, shop_id: shopId, rice: distribute.rice, wheat: distribute.wheat })
    });
    if (res.ok) { alert(await res.text()); loadData(); setUserResult(null); }
    else alert("Error distributing ration");
  };

  if (!data) return <div style={{ color: 'white', padding: "40px" }}>Loading...</div>;

  return (
    <div style={{ padding: '30px', color: '#fff', width: '100%', maxWidth: '1000px', margin: 'auto' }}>
      <h2>Shopkeeper Dashboard</h2>
      
      <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
        <div className="glass-card" style={{ flex: 1, padding: '20px' }}>
          <h3>Rice Stock</h3><p style={{ fontSize: '30px' }}>{data.currentStock.rice} kg</p>
        </div>
        <div className="glass-card" style={{ flex: 1, padding: '20px' }}>
          <h3>Wheat Stock</h3><p style={{ fontSize: '30px' }}>{data.currentStock.wheat} kg</p>
        </div>
        <div className="glass-card" style={{ flex: 1, padding: '20px' }}>
          <h3>Daily Transactions</h3><p style={{ fontSize: '30px' }}>{data.dailyTransactions.length}</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '30px', textAlign: 'left', marginBottom: '20px' }}>
         <h3 style={{ marginBottom: '20px' }}>Distribute Ration (Search User)</h3>
         <div style={{ display: 'flex', gap: '10px' }}>
           <input className="input-field" placeholder="Search by Aadhaar" onChange={(e) => setSearch(e.target.value)} />
           <button className="btn btn-secondary" style={{ height: '48px' }} onClick={handleSearch}>Search</button>
         </div>

         {userResult && (
           <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
             <p><strong>Name:</strong> {userResult.name}</p>
             <p><strong>Ration Card:</strong> {userResult.ration_card_number} ({userResult.ration_category})</p>
             <p><strong>Family Members:</strong> {userResult.family_members}</p>
             <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
               <input type="number" className="input-field" placeholder="Rice (kg)" onChange={(e) => setDistribute({...distribute, rice: e.target.value})} />
               <input type="number" className="input-field" placeholder="Wheat (kg)" onChange={(e) => setDistribute({...distribute, wheat: e.target.value})} />
               <button className="btn btn-primary" style={{ height: '48px' }} onClick={handleDistribute}>Confirm Distribution</button>
             </div>
           </div>
         )}
      </div>
    </div>
  );
}

export function UserDashboard({ user }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetch(`${BASE_URL}/dashboard/user/${user.id}`)
        .then(res => res.json())
        .then(res => setData(res));
    }
  }, [user]);

  if (!data) return <div style={{ color: 'white', padding: "40px" }}>Loading Your Dashboard...</div>;

  const chartData = [
    { name: 'Rice (kg)', amount: data.entitlement.rice || 0 },
    { name: 'Wheat (kg)', amount: data.entitlement.wheat || 0 }
  ];

  return (
    <div style={{ padding: '30px', color: '#fff', width: '100%', maxWidth: '1000px', margin: 'auto' }}>
      <h2>Hello, {data.user.name}</h2>
      
      <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
         <div className="glass-card" style={{ flex: 1, padding: '20px', textAlign: 'left' }}>
           <h3>Personal Details</h3>
           <p style={{ marginTop: '10px' }}><strong>Aadhaar:</strong> {data.user.aadhaar}</p>
           <p><strong>Ration Card:</strong> {data.user.ration_card_number} ({data.user.category})</p>
           <p><strong>Family Members:</strong> {data.user.family_members}</p>
         </div>
         <div className="glass-card" style={{ flex: 2, padding: '20px' }}>
           <h3 style={{ marginBottom: '15px' }}>Monthly Ration Entitlement</h3>
           <ResponsiveContainer width="100%" height={150}>
            <BarChart layout="vertical" data={chartData} margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis type="number" stroke="#ccc" />
              <YAxis type="category" dataKey="name" stroke="#ccc" width={80} />
              <Tooltip contentStyle={{ backgroundColor: '#222', border: 'none' }} />
              <Bar dataKey="amount" fill="#818cf8" radius={[0, 5, 5, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
         </div>
      </div>

      <div className="glass-card" style={{ padding: '20px', textAlign: 'left' }}>
         <h3 style={{ marginBottom: '20px' }}>Your Transaction History</h3>
         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
           <thead>
             <tr><th style={{ textAlign: 'left' }}>Date</th><th style={{ textAlign: 'left' }}>Shop</th><th style={{ textAlign: 'left' }}>Rice Taken</th><th style={{ textAlign: 'left' }}>Wheat Taken</th></tr>
           </thead>
           <tbody>
             {data.transactionHistory.map((tx, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #444' }}>
                  <td style={{ padding: '10px 0' }}>{new Date(tx.date).toLocaleDateString()}</td>
                  <td>{tx.shopName || tx.shop_id}</td>
                  <td>{tx.rice} kg</td>
                  <td>{tx.wheat} kg</td>
                </tr>
             ))}
             {data.transactionHistory.length === 0 && <tr><td colSpan="4">No transactions yet</td></tr>}
           </tbody>
         </table>
      </div>
    </div>
  );
}
