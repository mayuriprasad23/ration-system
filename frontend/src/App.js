import { useState } from "react";
import { registerUser, loginUser, resetPassword } from "./api";
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
    city: ""
  });

  const [mode, setMode] = useState("auth"); // 'auth', 'register', 'forgot'
  const [currentUser, setCurrentUser] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    // Basic validation
    if (!form.name || !form.aadhaar || !form.ration_card_number || !form.password || !form.family_members || !form.mobile_number || !form.city) {
      return alert("All fields are required.");
    }
    if (form.aadhaar.length !== 12 || !/^\d+$/.test(form.aadhaar)) {
      return alert("Aadhaar must be exactly 12 digits.");
    }
    if (form.password.length < 6) {
      return alert("Password must be at least 6 characters.");
    }
    
    const res = await registerUser(form);
    alert(res);
    if(res.includes("Successfully")) setMode("auth");
  };

  const handleLogin = async () => {
    if (!form.aadhaar || !form.password) return alert("Please enter Aadhaar and password");
    
    const res = await loginUser({
      aadhaar: form.aadhaar,
      password: form.password
    });
    if (res.token && res.user) {
      setCurrentUser(res.user);
    } else {
      alert(res.message || res);
    }
  };

  const handleResetPassword = async () => {
    if (form.password.length < 6) {
      return alert("Password must be at least 6 characters.");
    }
    
    const res = await resetPassword({
      aadhaar: form.aadhaar,
      newPassword: form.password
    });
    alert(res);
    if(res.includes("successfully")) setMode("auth");
  };

  if (currentUser) {
    return (
      <div style={{ width: '100vw', minHeight: '100vh', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" style={{ padding: '8px 20px' }} onClick={() => setCurrentUser(null)}>Logout</button>
        </div>
        {currentUser.role === 'admin' && <AdminDashboard />}
        {currentUser.role === 'shopkeeper' && <ShopkeeperDashboard />}
        {currentUser.role === 'user' && <UserDashboard user={currentUser} />}
      </div>
    );
  }

  return (
    <div className="container">
      <div className="glass-card" style={mode === 'register' ? { minWidth: '500px' } : {}}>
        <h1>Ration System</h1>

        {mode === "auth" && (
          <>
            <h3 style={{ marginBottom: '20px', fontWeight: '500' }}>Login</h3>
            <input 
              name="aadhaar" 
              className="input-field" 
              placeholder="Aadhaar ID" 
              onChange={handleChange} 
            />
            <input 
              name="password" 
              type="password" 
              className="input-field" 
              placeholder="Password" 
              onChange={handleChange} 
            />

            <div className="button-group">
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleLogin}>
                Login
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
              <p style={{ fontSize: '14px', cursor: 'pointer', color: '#38bdf8' }} onClick={() => setMode("register")}>
                Create an account
              </p>
              <p style={{ fontSize: '14px', cursor: 'pointer', color: '#38bdf8' }} onClick={() => setMode("forgot")}>
                Forgot Password?
              </p>
            </div>
          </>
        )}

        {mode === "register" && (
          <>
            <h3 style={{ marginBottom: '20px', fontWeight: '500' }}>Register</h3>
            
            <input name="name" className="input-field" placeholder="Full Name" onChange={handleChange} />
            <input name="aadhaar" className="input-field" placeholder="Aadhaar Number (12 digits)" onChange={handleChange} maxLength="12" />
            <input name="ration_card_number" className="input-field" placeholder="Ration Card Number" onChange={handleChange} />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <select name="ration_category" className="input-field" onChange={handleChange}>
                <option value="AAY">AAY (Antyodaya Anna Yojana)</option>
                <option value="PHH">PHH (Priority Household)</option>
              </select>
              <input name="family_members" type="number" className="input-field" placeholder="Family Size" onChange={handleChange} style={{ width: '130px' }} />
            </div>

            <input name="mobile_number" className="input-field" placeholder="Mobile Number" onChange={handleChange} />
            <input name="city" className="input-field" placeholder="City" onChange={handleChange} />
            
            <input name="password" type="password" className="input-field" placeholder="Password (min 6 chars)" onChange={handleChange} />

            <div className="button-group">
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleRegister}>
                Register
              </button>
            </div>
            
            <p style={{ marginTop: '15px', fontSize: '14px', cursor: 'pointer', color: '#818cf8', textAlign: 'center' }} onClick={() => setMode("auth")}>
              Back to Login
            </p>
          </>
        )}

        {mode === "forgot" && (
          <>
            <h3 style={{ marginBottom: '20px', fontWeight: '500' }}>Reset Password</h3>
            <input 
              name="aadhaar" 
              className="input-field" 
              placeholder="Aadhaar ID" 
              onChange={handleChange} 
            />
            <input 
              name="password" 
              type="password" 
              className="input-field" 
              placeholder="New Password" 
              onChange={handleChange} 
            />

            <div className="button-group">
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleResetPassword}>
                Update Password
              </button>
            </div>
            
            <p style={{ marginTop: '15px', fontSize: '14px', cursor: 'pointer', color: '#818cf8', textAlign: 'center' }} onClick={() => setMode("auth")}>
              Back to Login
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default App;