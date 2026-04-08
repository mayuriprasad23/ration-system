import { useState, useEffect } from "react";
import { registerUser, loginUser, resetPassword, registerAdmin, registerShopkeeper, loginShopkeeper, getAvailableShops } from "./api";
import { AdminDashboard, ShopkeeperDashboard, UserDashboard } from "./Dashboards";

function App() {
  const [form, setForm] = useState({
    name: "",
    aadhaar: "",
    ration_card_number: "",
    password: "",
    ration_category: "AAY",
    family_members: "",
    mobile_number: "",
    city: "",
    shop_id: ""
  });

  // modes: 'auth', 'register', 'forgot', 'admin-register', 'shopkeeper-login', 'shopkeeper-register'
  const [mode, setMode] = useState("auth");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableShops, setAvailableShops] = useState([]);

  // Load available shops when entering shopkeeper register mode
  useEffect(() => {
    if (mode === 'shopkeeper-register') {
      getAvailableShops().then(setAvailableShops);
    }
  }, [mode]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (!form.name || !form.aadhaar || !form.ration_card_number || !form.password || !form.family_members || !form.mobile_number || !form.city) {
      return alert("All fields are required.");
    }
    if (form.aadhaar.length !== 12 || !/^\d+$/.test(form.aadhaar)) {
      return alert("Aadhaar must be exactly 12 digits.");
    }
    if (form.password.length < 6) {
      return alert("Password must be at least 6 characters.");
    }
    setLoading(true);
    const res = await registerUser(form);
    setLoading(false);
    alert(res);
    if (res.includes("Successfully")) setMode("auth");
  };

  const handleAdminRegister = async () => {
    if (!form.name || !form.aadhaar || !form.password) {
      return alert("All fields are required.");
    }
    if (form.aadhaar.length !== 12 || !/^\d+$/.test(form.aadhaar)) {
      return alert("Aadhaar must be exactly 12 digits.");
    }
    if (form.password.length < 6) {
      return alert("Password must be at least 6 characters.");
    }
    setLoading(true);
    const res = await registerAdmin({ name: form.name, aadhaar: form.aadhaar, password: form.password });

    if (res.includes("Successfully")) {
      const loginRes = await loginUser({ aadhaar: form.aadhaar, password: form.password });
      setLoading(false);
      if (loginRes.token && loginRes.user) {
        setCurrentUser(loginRes.user);
      } else {
        alert("Registration successful! Please login with your credentials.");
        setMode("auth");
      }
    } else {
      setLoading(false);
      alert(res);
    }
  };

  const handleLogin = async () => {
    if (!form.aadhaar || !form.password) return alert("Please enter Aadhaar and password");
    setLoading(true);
    const res = await loginUser({ aadhaar: form.aadhaar, password: form.password });
    setLoading(false);
    if (res.token && res.user) {
      setCurrentUser(res.user);
    } else {
      alert(res.message || "Login failed");
    }
  };

  const handleShopkeeperLogin = async () => {
    if (!form.aadhaar || !form.password) return alert("Please enter Aadhaar and password");
    setLoading(true);
    const res = await loginShopkeeper({ aadhaar: form.aadhaar, password: form.password });
    setLoading(false);
    if (res.token && res.user) {
      setCurrentUser(res.user);
    } else {
      alert(res.message || "Login failed. Make sure you are registered as a shopkeeper.");
    }
  };

  const handleAssistedLogin = async () => {
    if (!form.aadhaar || !form.password) return alert("Please enter Aadhaar and password");
    setLoading(true);
    const res = await loginShopkeeper({ aadhaar: form.aadhaar, password: form.password });
    setLoading(false);
    if (res.token && res.user) {
      setCurrentUser({ ...res.user, isAssistedMode: true });
    } else {
      alert(res.message || "Login failed.");
    }
  };

  const handleShopkeeperRegister = async () => {
    if (!form.name || !form.aadhaar || !form.password) {
      return alert("All fields are required.");
    }
    if (form.aadhaar.length !== 12 || !/^\d+$/.test(form.aadhaar)) {
      return alert("Aadhaar must be exactly 12 digits.");
    }
    if (form.password.length < 6) {
      return alert("Password must be at least 6 characters.");
    }
    setLoading(true);
    const res = await registerShopkeeper({
      name: form.name,
      aadhaar: form.aadhaar,
      password: form.password,
      shop_id: form.shop_id || null
    });

    if (res.includes("Successfully")) {
      const loginRes = await loginShopkeeper({ aadhaar: form.aadhaar, password: form.password });
      setLoading(false);
      if (loginRes.token && loginRes.user) {
        setCurrentUser(loginRes.user);
      } else {
        alert("Registration successful! Please login with your credentials.");
        setMode("shopkeeper-login");
      }
    } else {
      setLoading(false);
      alert(res);
    }
  };

  const handleResetPassword = async () => {
    if (form.password.length < 6) return alert("Password must be at least 6 characters.");
    setLoading(true);
    const res = await resetPassword({ aadhaar: form.aadhaar, newPassword: form.password });
    setLoading(false);
    alert(res);
    if (res.includes("successfully")) setMode("auth");
  };

  const handleLogout = () => setCurrentUser(null);

  // ---- RENDER DASHBOARDS ----
  if (currentUser) {
    if (currentUser.role === 'admin') return <AdminDashboard onLogout={handleLogout} />;
    if (currentUser.role === 'shopkeeper') return <ShopkeeperDashboard user={currentUser} onLogout={handleLogout} shopId={currentUser.shop_id || 1} isAssistedMode={currentUser.isAssistedMode} />;
    if (currentUser.role === 'user') return <UserDashboard user={currentUser} onLogout={handleLogout} />;
  }

  // ---- RENDER LOGIN / REGISTER PAGE ----
  return (
    <div className="login-page">
      {/* Floating background shapes */}
      <div className="bg-shapes">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      <div className="glass-card" style={mode === 'register' || mode === 'shopkeeper-register' ? { minWidth: '520px' } : {}}>
        <div className="brand-logo">🏪</div>
        <h1>Ration System</h1>
        <p className="brand-subtitle">Smart Ration Distribution Portal</p>

        {/* ===== LOGIN ===== */}
        {mode === "auth" && (
          <>
            <h3 className="form-title">Login to your account</h3>

            <div className="input-group">
              <span className="input-icon">🆔</span>
              <input name="aadhaar" className="input-field" placeholder="Aadhaar ID" onChange={handleChange} />
            </div>
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input name="password" type="password" className="input-field" placeholder="Password" onChange={handleChange} />
            </div>

            <div className="button-group">
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleLogin} disabled={loading}>
                {loading ? <span className="btn-spinner"></span> : 'Login'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '18px' }}>
              <p className="link-text" onClick={() => setMode("register")}>
                👤 User Register
              </p>
              <p className="link-text" onClick={() => setMode("forgot")}>
                🔑 Forgot Password?
              </p>
            </div>

            <div className="divider">
              <span>Shopkeeper Access</span>
            </div>
            <button
              className="btn btn-shopkeeper"
              style={{ width: '100%', fontSize: '13px', padding: '12px', marginBottom: '10px' }}
              onClick={() => setMode("shopkeeper-login")}
            >
              🏪 Shopkeeper Login
            </button>

            <button
              className="btn btn-shopkeeper-primary"
              style={{ width: '100%', fontSize: '13px', padding: '12px', marginBottom: '10px', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)' }}
              onClick={() => setMode("assisted-login")}
            >
              🤝 Assisted Mode 
            </button>

            <div className="divider">
              <span>Admin Access</span>
            </div>
            <button
              className="btn btn-admin-highlight"
              style={{ width: '100%', fontSize: '13px', padding: '12px' }}
              onClick={() => setMode("admin-register")}
            >
              🛡️ Register as Admin
            </button>
          </>
        )}

        {/* ===== SHOPKEEPER LOGIN ===== */}
        {mode === "shopkeeper-login" && (
          <>
            <h3 className="form-title">🏪 Shopkeeper Login</h3>
            <p className="form-hint">Enter your credentials to access the Shopkeeper Dashboard</p>

            <div className="input-group">
              <span className="input-icon">🆔</span>
              <input name="aadhaar" className="input-field" placeholder="Aadhaar ID" onChange={handleChange} />
            </div>
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input name="password" type="password" className="input-field" placeholder="Password" onChange={handleChange} />
            </div>

            <div className="button-group">
              <button className="btn btn-shopkeeper-primary" style={{ width: '100%' }} onClick={handleShopkeeperLogin} disabled={loading}>
                {loading ? <span className="btn-spinner"></span> : '🏪 Login as Shopkeeper'}
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <p className="link-text" onClick={() => setMode("shopkeeper-register")} style={{ color: '#10b981' }}>
                📝 New Shopkeeper? Register Here
              </p>
            </div>

            <p className="back-link" onClick={() => setMode("auth")}>
              ← Back to Main Login
            </p>
          </>
        )}

        {/* ===== ASSISTED LOGIN ===== */}
        {mode === "assisted-login" && (
          <>
            <h3 className="form-title">🤝 Assisted Mode (Kiosk)</h3>
            <p className="form-hint">Shopkeepers: Log in to operate the system on behalf of the beneficiaries.</p>

            <div className="input-group">
              <span className="input-icon">🆔</span>
              <input name="aadhaar" className="input-field" placeholder="Shopkeeper Aadhaar ID" onChange={handleChange} />
            </div>
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input name="password" type="password" className="input-field" placeholder="Password" onChange={handleChange} />
            </div>

            <div className="button-group">
              <button className="btn btn-shopkeeper-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)' }} onClick={handleAssistedLogin} disabled={loading}>
                {loading ? <span className="btn-spinner"></span> : '🤝 Enter Assisted Mode'}
              </button>
            </div>

            <p className="back-link" onClick={() => setMode("auth")}>
              ← Back to Main Login
            </p>
          </>
        )}

        {/* ===== SHOPKEEPER REGISTER ===== */}
        {mode === "shopkeeper-register" && (
          <>
            <h3 className="form-title">🏪 Shopkeeper Registration</h3>
            <p className="form-hint">Register as a shopkeeper and get assigned to a ration shop</p>

            <div className="input-group">
              <span className="input-icon">👤</span>
              <input name="name" className="input-field" placeholder="Full Name" onChange={handleChange} />
            </div>
            <div className="input-group">
              <span className="input-icon">🆔</span>
              <input name="aadhaar" className="input-field" placeholder="Aadhaar Number (12 digits)" onChange={handleChange} maxLength="12" />
            </div>
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input name="password" type="password" className="input-field" placeholder="Password (min 6 chars)" onChange={handleChange} />
            </div>

            <div className="input-group">
              <span className="input-icon">🏪</span>
              <select name="shop_id" className="input-field" onChange={handleChange} style={{ paddingLeft: '40px' }}>
                <option value="">Select a Shop (Optional)</option>
                {availableShops.map(shop => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name} — {shop.location || 'No location'}
                  </option>
                ))}
              </select>
            </div>

            <div className="button-group">
              <button className="btn btn-shopkeeper-primary" style={{ width: '100%' }} onClick={handleShopkeeperRegister} disabled={loading}>
                {loading ? <span className="btn-spinner"></span> : '🏪 Register & Enter Dashboard'}
              </button>
            </div>

            <p className="back-link" onClick={() => setMode("shopkeeper-login")}>
              ← Back to Shopkeeper Login
            </p>
          </>
        )}

        {/* ===== USER REGISTER ===== */}
        {mode === "register" && (
          <>
            <h3 className="form-title">User Registration</h3>

            <div className="input-group">
              <span className="input-icon">👤</span>
              <input name="name" className="input-field" placeholder="Full Name" onChange={handleChange} />
            </div>
            <div className="input-group">
              <span className="input-icon">🆔</span>
              <input name="aadhaar" className="input-field" placeholder="Aadhaar Number (12 digits)" onChange={handleChange} maxLength="12" />
            </div>
            <div className="input-group">
              <span className="input-icon">🪪</span>
              <input name="ration_card_number" className="input-field" placeholder="Ration Card Number" onChange={handleChange} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <select name="ration_category" className="input-field" onChange={handleChange}>
                <option value="AAY">AAY (Antyodaya Anna Yojana)</option>
                <option value="PHH">PHH (Priority Household)</option>
              </select>
              <input name="family_members" type="number" className="input-field" placeholder="Family Size" onChange={handleChange} style={{ width: '130px' }} />
            </div>

            <div className="input-group">
              <span className="input-icon">📱</span>
              <input name="mobile_number" className="input-field" placeholder="Mobile Number" onChange={handleChange} />
            </div>
            <div className="input-group">
              <span className="input-icon">🏙️</span>
              <input name="city" className="input-field" placeholder="City" onChange={handleChange} />
            </div>
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input name="password" type="password" className="input-field" placeholder="Password (min 6 chars)" onChange={handleChange} />
            </div>

            <div className="button-group">
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleRegister} disabled={loading}>
                {loading ? <span className="btn-spinner"></span> : 'Register'}
              </button>
            </div>

            <p className="back-link" onClick={() => setMode("auth")}>
              ← Back to Login
            </p>
          </>
        )}

        {/* ===== ADMIN REGISTER ===== */}
        {mode === "admin-register" && (
          <>
            <h3 className="form-title">🛡️ Admin Registration</h3>
            <p className="form-hint">After registration, you'll be taken directly to the Admin Dashboard.</p>

            <div className="input-group">
              <span className="input-icon">👤</span>
              <input name="name" className="input-field" placeholder="Admin Full Name" onChange={handleChange} />
            </div>
            <div className="input-group">
              <span className="input-icon">🆔</span>
              <input name="aadhaar" className="input-field" placeholder="Aadhaar Number (12 digits)" onChange={handleChange} maxLength="12" />
            </div>
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input name="password" type="password" className="input-field" placeholder="Password (min 6 chars)" onChange={handleChange} />
            </div>

            <div className="button-group">
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAdminRegister} disabled={loading}>
                {loading ? <span className="btn-spinner"></span> : '🛡️ Register & Enter Dashboard'}
              </button>
            </div>

            <p className="back-link" onClick={() => setMode("auth")}>
              ← Back to Login
            </p>
          </>
        )}

        {/* ===== FORGOT PASSWORD ===== */}
        {mode === "forgot" && (
          <>
            <h3 className="form-title">Reset Password</h3>

            <div className="input-group">
              <span className="input-icon">🆔</span>
              <input name="aadhaar" className="input-field" placeholder="Aadhaar ID" onChange={handleChange} />
            </div>
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input name="password" type="password" className="input-field" placeholder="New Password" onChange={handleChange} />
            </div>

            <div className="button-group">
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleResetPassword} disabled={loading}>
                {loading ? <span className="btn-spinner"></span> : 'Update Password'}
              </button>
            </div>

            <p className="back-link" onClick={() => setMode("auth")}>
              ← Back to Login
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default App;