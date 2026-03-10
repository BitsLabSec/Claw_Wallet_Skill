import React, { useState, useEffect } from 'react';
import { Shield, Send, CreditCard, Settings, LogOut, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import './index.css';

function App() {
  const [session, setSession] = useState({ url: window.location.origin, token: '', connected: false });
  const [sandboxState, setSandboxState] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('wallet');
  const [toast, setToast] = useState<{ msg: string, type: string } | null>(null);

  const showToast = (msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${session.url}/api/v1/wallet/status`, {
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSandboxState(data);
        setSession({ ...session, connected: true });
        showToast('Connected to Local Sandbox', 'success');
      } else {
        showToast(`Connection failed: HTTP ${res.status}`, 'error');
      }
    } catch (err) {
      showToast('Sandbox unreachable. Check URL and CORS.', 'error');
    }
  };

  const fetchStatus = async () => {
    if (!session.connected) return;
    try {
      const res = await fetch(`${session.url}/api/v1/wallet/status`, {
        headers: { 'Authorization': `Bearer ${session.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSandboxState(data);
      } else if (res.status === 401) {
        setSession({ ...session, connected: false });
        showToast('Session expired or invalid token', 'error');
      }
    } catch {
      showToast('Lost connection to Sandbox', 'error');
    }
  };

  useEffect(() => {
    if (session.connected) {
      const interval = setInterval(fetchStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [session.connected]);

  if (!session.connected) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="card animate-in" style={{ width: '400px' }}>
          <div className="card-header" style={{ justifyContent: 'center', flexDirection: 'column', gap: '10px' }}>
            <h1 className="page-title" style={{ fontSize: '1.5rem', margin: 0 }}>CLAY Web Wallet</h1>
            <p className="page-subtitle">Connect to your Local Agent Sandbox</p>
          </div>
          <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sandbox URL</label>
              <input
                type="text"
                value={session.url}
                onChange={e => setSession({ ...session, url: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Agent Token</label>
              <input
                type="password"
                value={session.token}
                onChange={e => setSession({ ...session, token: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
              Connect to Wallet
            </button>
          </form>
        </div>
        {toast && (
          <div className={`toast show`} style={{ borderColor: toast.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>
            {toast.type === 'success' ? <CheckCircle size={20} color="var(--success)" /> : <AlertCircle size={20} color="var(--danger)" />}
            {toast.msg}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-title">CLAY Wallet</div>

        <div className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
          <CreditCard size={20} /> My Assets
        </div>
        <div className={`nav-item ${activeTab === 'send' ? 'active' : ''}`} onClick={() => setActiveTab('send')}>
          <Send size={20} /> Send / Transfer
        </div>
        <div className={`nav-item ${activeTab === 'policy' ? 'active' : ''}`} onClick={() => setActiveTab('policy')}>
          <Shield size={20} /> Security Policy
        </div>
        <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <Settings size={20} /> Settings
        </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
          <div className="nav-item" style={{ color: 'var(--danger)' }} onClick={() => setSession({ ...session, connected: false })}>
            <LogOut size={20} /> Disconnect
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '0.8rem', padding: '0 16px', marginTop: '10px' }}>
            <div className="dot" style={{ background: 'currentColor' }}></div> Sandbox Connected
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === 'wallet' && <WalletView state={sandboxState} />}
        {activeTab === 'send' && <SendView session={session} state={sandboxState} showToast={showToast} />}
        {activeTab === 'policy' && <PolicyView state={sandboxState} />}
        {activeTab === 'settings' && <SettingsView />}
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast show" style={{ borderColor: toast.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>
          {toast.type === 'success' ? <CheckCircle size={20} color="var(--success)" /> : <AlertCircle size={20} color="var(--danger)" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// Subcomponents

function WalletView({ state }: any) {
  const evmAddr = state?.addresses?.ethereum || state?.addresses?.evm || 'Loading...';
  const copyToClip = (txt: string) => navigator.clipboard.writeText(txt);

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <h1 className="page-title">My Assets</h1>
        <p className="page-subtitle">View your balances and addresses</p>
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(0,255,204,0.1), rgba(138,43,226,0.1))', border: '1px solid rgba(0,255,204,0.3)' }}>
        <h2 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>Total Balance</h2>
        <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'monospace' }}>$0.00 <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>USD</span></div>
        <p style={{ color: 'var(--warning)', marginTop: '10px', fontSize: '0.85rem' }}>
          * Balance fetching requires external RPC connection (WIP). Displaying placeholder data.
        </p>
      </div>

      <div className="grid">
        <div className="card">
          <div className="card-header"><h3 className="card-title">EVM Address</h3></div>
          <div className="data-value" style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => copyToClip(evmAddr)}>
            {evmAddr}
          </div>
          <div style={{ marginTop: '15px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Click to copy. Used on Ethereum, Base, Optimism, Arbitrum, etc.</div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Solana Address</h3></div>
          <div className="data-value" style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => copyToClip(state?.addresses?.solana || '')}>
            {state?.addresses?.solana || 'Not generated'}
          </div>
          <div style={{ marginTop: '15px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Click to copy. Native Solana chain address.</div>
        </div>
      </div>
    </div>
  );
}

function SendView({ session, showToast }: any) {
  const [txData, setTxData] = useState({ to: '', amount: '', hexData: '0x' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState('');

  const sendTx = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult('');
    try {
      // Very basic payload mapping for simulator
      const payload = {
        chain: "ethereum",
        sign_mode: "transaction",
        uid: "UID-WEB",
        to: txData.to,
        amount_wei: txData.amount || "0",
        data: txData.hexData,
        tx_payload_hex: "0x02c0" + Date.now().toString(16), // Mock fake raw payload header to trigger decode block
        enc_share1: { cipher: "", iv: "", salt: "" } // Handled via auto-fetch or local mode
      };

      const res = await fetch(`${session.url}/api/v1/tx/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      if (res.ok) {
        showToast('Transaction Signature Granted!', 'success');
        let parsed = text;
        try { parsed = JSON.stringify(JSON.parse(text), null, 2) } catch (e) { }
        setResult(`SUCCESS:\n${parsed}`);
      } else {
        showToast('Transaction Rejected by Policy', 'error');
        setResult(`REJECTED [${res.status}]:\n${text}`);
      }
    } catch (err) {
      showToast('Error communicating with Sandbox', 'error');
      setResult('Network Error');
    }
    setSubmitting(false);
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <h1 className="page-title">Send Crypto</h1>
        <p className="page-subtitle">Draft and execute a signing request through your local agent</p>
      </div>

      <div className="card">
        <form onSubmit={sendTx} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Recipient Address (To)</label>
            <input
              type="text"
              className="input-field"
              placeholder="0x..."
              value={txData.to}
              onChange={e => setTxData({ ...txData, to: e.target.value })}
              required
            />
          </div>
          <div className="grid">
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Amount (Wei)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. 1000000000000000000"
                value={txData.amount}
                onChange={e => setTxData({ ...txData, amount: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Data (Hex)</label>
              <input
                type="text"
                className="input-field"
                placeholder="0x..."
                value={txData.hexData}
                onChange={e => setTxData({ ...txData, hexData: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <RefreshCw className="spin" size={18} /> : <Send size={18} />} Sign Transaction
          </button>
        </form>
      </div>

      {result && (
        <div className="card" style={{ borderColor: result.includes('SUCCESS') ? 'var(--success)' : 'var(--danger)' }}>
          <div className="card-header"><h3 className="card-title">Sandbox Signature Output</h3></div>
          <div className="pre-code" style={{ color: result.includes('SUCCESS') ? 'var(--success)' : 'var(--danger)' }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
}

function PolicyView({ state }: any) {
  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <h1 className="page-title">Security & Policy</h1>
        <p className="page-subtitle">View your Sandbox spending limits and whitelist rules</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Loaded Policy Config</h2>
          <span className={`badge ${state?.policy ? 'success' : 'warning'}`}>{state?.policy ? 'Enforced' : 'No Policy'}</span>
        </div>
        <div className="pre-code">
          {state?.policy ? JSON.stringify(state.policy, null, 2) : 'No explicit policy rules found. Default sandbox behavior applies.'}
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '15px' }}>Connections</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Network connection configuration details (RPC endpoints) will be developed in the next release map.</p>
      </div>
    </div>
  );
}

export default App;
