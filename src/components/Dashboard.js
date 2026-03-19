import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import API_URL from '../config'

const BACKEND_URL = 'https://api.cuts.ink'

function Dashboard() {
  const [urls, setUrls] = useState([])
  const [originalUrl, setOriginalUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [qrCode, setQrCode] = useState(null)
  const [password, setPassword] = useState('')
  const [toast, setToast] = useState('')
  const [showChangePw, setShowChangePw] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const toastTimer = useRef(null)
  const navigate = useNavigate()

  const [isGoogleUser, setIsGoogleUser] = useState(false)
  const token = localStorage.getItem('token')
  const username = localStorage.getItem('username')
  const headers = { Authorization: `Bearer ${token}` }

  const chartData = urls.map((url) => ({
    name: url.shortCode,
    clicks: url.clicks
  }))

  useEffect(() => {
    fetchUrls()
    axios.get(`${API_URL}/auth/me`, { headers }).then(res => {
      setIsGoogleUser(res.data.isGoogleUser)
    }).catch(() => {})
  }, [])

  const fetchUrls = async () => {
    try {
      const res = await axios.get(`${API_URL}/myurls`, { headers })
      setUrls(res.data)
    } catch (err) {
      console.log('Error fetching URLs')
    }
  }

  const handleShorten = async () => {
    if (!originalUrl) return
    setLoading(true)
    setError('')
    try {
      await axios.post(`${API_URL}/shorten`,
        { originalUrl, customAlias, password },
        { headers }
      )
      setOriginalUrl('')
      setCustomAlias('')
      setPassword('')
      fetchUrls()
      showToast('Link shortened!')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, { headers })
      fetchUrls()
      showToast('Link deleted')
    } catch (err) {
      console.log('Error deleting URL')
    }
  }

  const handleCopy = (shortCode) => {
    navigator.clipboard.writeText(`${BACKEND_URL}/${shortCode}`)
    showToast('Copied to clipboard!')
  }

  const handleQR = (shortCode) => {
    setQrCode(qrCode === shortCode ? null : shortCode)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login')
  }

  const handleChangePassword = async () => {
    if (!isGoogleUser && !currentPw) return setPwError('Current password is required')
    if (!newPw || !confirmPw) return setPwError('All fields are required')
    if (newPw !== confirmPw) return setPwError('New passwords do not match')
    if (newPw.length < 6) return setPwError('Password must be at least 6 characters')
    setPwLoading(true)
    setPwError('')
    try {
      await axios.post(`${API_URL}/auth/change-password`, { currentPassword: currentPw, newPassword: newPw }, { headers })
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
      setShowChangePw(false)
      setIsGoogleUser(false)
      showToast(isGoogleUser ? 'Password set!' : 'Password changed!')
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to change password')
    }
    setPwLoading(false)
  }

  const showToast = (msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2400)
  }

  const getDaysLeft = (expiresAt) => {
    const diff = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
    if (diff <= 0) return { text: 'Expired', color: '#ef4444' }
    if (diff <= 3) return { text: `${diff}d left`, color: '#f59e0b' }
    return { text: `${diff}d left`, color: '#10b981' }
  }

  return (
    <div style={styles.container}>
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      {/* Toast */}
      <div className={`toast${toast ? ' show' : ''}`}>✓ {toast}</div>

      {/* Navbar */}
      <nav className="navbar">
        <div style={styles.navLogo}>
          <span style={styles.navLogoIcon}>✂️</span>
          <span style={styles.navLogoText}>cuts.ink</span>
        </div>
        <div style={styles.navRight}>
          <div className="nav-username" style={styles.userBadge}>👤 {username}</div>
          <button className="logout-btn" style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Main */}
      <div style={styles.main}>

        {/* Stats Row */}
        <div className="stats-grid">
          <div className="stat-card-item" style={styles.statCard}>
            <span className="stat-number-item" style={styles.statNumber}>{urls.length}</span>
            <span className="stat-label-item" style={styles.statLabel}>Total Links</span>
          </div>
          <div className="stat-card-item" style={styles.statCard}>
            <span className="stat-number-item" style={styles.statNumber}>{urls.reduce((a, b) => a + b.clicks, 0)}</span>
            <span className="stat-label-item" style={styles.statLabel}>Total Clicks</span>
          </div>
          <div className="stat-card-item" style={styles.statCard}>
            <span className="stat-number-item" style={styles.statNumber}>{urls.filter(u => u.password).length}</span>
            <span className="stat-label-item" style={styles.statLabel}>Protected</span>
          </div>
        </div>

        {/* Shorten Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Shorten a URL</h2>
          {error && <div style={styles.errorBox}>⚠️ {error}</div>}
          <div className="input-grid">
            <input
              className="input-full"
              style={styles.input}
              type="text"
              placeholder="Paste your long URL here…"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleShorten()}
            />
            <input
              style={styles.input}
              type="text"
              placeholder="Custom alias (optional)"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
            />
            <input
              style={styles.input}
              type="password"
              placeholder="Password protect (optional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            className="btn-primary"
            style={{ ...styles.shortenBtn, opacity: loading ? 0.65 : 1 }}
            onClick={handleShorten}
            disabled={loading}
          >
            {loading ? 'Shortening…' : '✂️ Shorten URL'}
          </button>
        </div>

        {/* Chart */}
        {urls.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Click Analytics</h2>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#2d2d3d" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis stroke="#2d2d3d" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a28',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                  itemStyle={{ color: '#a78bfa' }}
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <Bar dataKey="clicks" fill="url(#barGradient)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* URLs List */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>My Links <span style={styles.countBadge}>{urls.length}</span></h2>
          {urls.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIconWrap}>✂️</div>
              <p style={styles.emptyText}>No links yet. Shorten your first URL above!</p>
            </div>
          ) : (
            urls.map((url) => {
              const expiry = getDaysLeft(url.expiresAt)
              return (
                <div key={url._id} className="url-card-item url-card-layout">
                  <div style={styles.urlMain}>
                    <div style={styles.urlTopRow}>
                      <a
                        href={`${BACKEND_URL}/${url.shortCode}`}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.shortUrl}
                      >
                        {BACKEND_URL}/{url.shortCode}
                      </a>
                      <div style={styles.badges}>
                        {url.password && (
                          <span style={styles.badge}>🔒 Protected</span>
                        )}
                        <span style={{ ...styles.badge, color: expiry.color, borderColor: expiry.color + '55' }}>
                          {expiry.text}
                        </span>
                      </div>
                    </div>
                    <p style={styles.originalUrl}>{url.originalUrl}</p>
                    <div style={styles.statsRow2}>
                      <span style={styles.statChip}>🖥️ {url.deviceStats?.desktop || 0}</span>
                      <span style={styles.statChip}>📱 {url.deviceStats?.mobile || 0}</span>
                      {url.geoStats && Object.keys(url.geoStats).length > 0 && (
                        <span style={styles.statChip}>
                          🌍 {Object.entries(url.geoStats).map(([c, n]) => `${c} ${n}`).join(', ')}
                        </span>
                      )}
                    </div>
                    {qrCode === url.shortCode && (
                      <div style={styles.qrBox}>
                        <QRCodeSVG
                          value={`${BACKEND_URL}/${url.shortCode}`}
                          size={110}
                          bgColor="transparent"
                          fgColor="#ffffff"
                        />
                      </div>
                    )}
                  </div>
                  <div className="url-right">
                    <div style={styles.clickBadge}>
                      <span style={styles.clickNum}>{url.clicks}</span>
                      <span style={styles.clickLbl}>clicks</span>
                    </div>
                    <div style={styles.btnGroup}>
                      <button className="icon-btn" style={styles.iconBtn} onClick={() => handleCopy(url.shortCode)} title="Copy link">📋</button>
                      <button className="icon-btn" style={styles.iconBtn} onClick={() => handleQR(url.shortCode)} title="QR Code">📱</button>
                      <button className="icon-btn" style={{ ...styles.iconBtn, ...styles.deleteBtn }} onClick={() => handleDelete(url._id)} title="Delete">🗑️</button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Change / Set Password */}
        <div style={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={styles.cardTitle}>{isGoogleUser ? 'Set Password' : 'Change Password'}</h2>
            <button
              style={styles.toggleBtn}
              onClick={() => { setShowChangePw(!showChangePw); setPwError('') }}
            >
              {showChangePw ? 'Cancel' : isGoogleUser ? 'Set' : 'Change'}
            </button>
          </div>
          {isGoogleUser && !showChangePw && (
            <p style={{ color: '#6b7280', fontSize: '13px', margin: '8px 0 0 0' }}>
              Your account uses Google Sign In. You can set a password to also log in with email.
            </p>
          )}
          {showChangePw && (
            <div style={{ marginTop: '16px' }}>
              {pwError && <div style={styles.errorBox}>⚠️ {pwError}</div>}
              {!isGoogleUser && (
                <input style={{ ...styles.input, marginBottom: '10px' }} type="password" placeholder="Current password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
              )}
              <input style={{ ...styles.input, marginBottom: '10px' }} type="password" placeholder="New password" value={newPw} onChange={e => setNewPw(e.target.value)} />
              <input style={{ ...styles.input, marginBottom: '14px' }} type="password" placeholder="Confirm new password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
              <button
                className="btn-primary"
                style={{ ...styles.shortenBtn, opacity: pwLoading ? 0.65 : 1 }}
                onClick={handleChangePassword}
                disabled={pwLoading}
              >
                {pwLoading ? 'Saving…' : isGoogleUser ? 'Set Password' : 'Update Password'}
              </button>
            </div>
          )}
        </div>

      </div>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          © {new Date().getFullYear()} cuts.ink — Made by <span style={styles.footerName}>Harsh</span>
        </p>
      </footer>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0f',
    position: 'relative',
    overflow: 'hidden'
  },
  bgOrb1: {
    position: 'fixed',
    width: '600px', height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%)',
    top: '-200px', left: '-200px',
    pointerEvents: 'none', zIndex: 0
  },
  bgOrb2: {
    position: 'fixed',
    width: '500px', height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)',
    bottom: '-200px', right: '-200px',
    pointerEvents: 'none', zIndex: 0
  },
  navLogo: { display: 'flex', alignItems: 'center', gap: '10px' },
  navLogoIcon: { fontSize: '19px' },
  navLogoText: { color: '#fff', fontSize: '17px', fontWeight: '700', letterSpacing: '-0.5px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  userBadge: {
    color: '#9ca3af', fontSize: '13px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '5px 12px', borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.07)'
  },
  logoutBtn: {
    padding: '7px 15px',
    backgroundColor: 'transparent',
    color: '#9ca3af',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '500'
  },
  main: {
    maxWidth: '860px', margin: '0 auto',
    padding: '24px 16px 0 16px', position: 'relative', zIndex: 1
  },
  statCard: {
    backgroundColor: '#13131a',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '14px', padding: '20px 16px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '4px'
  },
  statNumber: {
    color: '#fff', fontSize: '26px',
    fontWeight: '700', letterSpacing: '-0.5px'
  },
  statLabel: {
    color: '#6b7280', fontSize: '11px',
    textTransform: 'uppercase', letterSpacing: '0.6px',
    fontWeight: '500'
  },
  card: {
    backgroundColor: '#13131a',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px', padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 2px 20px rgba(0,0,0,0.25)'
  },
  cardTitle: {
    color: '#e5e7eb', fontSize: '15px', fontWeight: '600',
    margin: '0 0 18px 0', letterSpacing: '-0.2px',
    display: 'flex', alignItems: 'center', gap: '8px'
  },
  countBadge: {
    fontSize: '12px', fontWeight: '600',
    color: '#8b5cf6',
    backgroundColor: 'rgba(139,92,246,0.12)',
    padding: '2px 8px', borderRadius: '20px',
    border: '1px solid rgba(139,92,246,0.2)'
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.28)',
    borderRadius: '10px', padding: '11px 14px',
    color: '#f87171', fontSize: '13px', marginBottom: '14px'
  },
  input: {
    padding: '11px 13px',
    backgroundColor: '#1a1a28',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px', color: '#ffffff',
    fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', width: '100%',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  },
  shortenBtn: {
    width: '100%', padding: '12px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 18px rgba(99,102,241,0.32)',
    letterSpacing: '0.2px'
  },
  emptyState: {
    textAlign: 'center', padding: '40px 20px'
  },
  emptyIconWrap: {
    fontSize: '36px', marginBottom: '12px'
  },
  emptyText: {
    color: '#4b5563', fontSize: '14px', fontWeight: '400'
  },
  urlMain: { flex: 1, minWidth: 0 },
  urlTopRow: {
    display: 'flex', alignItems: 'center',
    gap: '10px', flexWrap: 'wrap', marginBottom: '4px'
  },
  shortUrl: {
    color: '#818cf8', fontWeight: '600',
    fontSize: '13px', textDecoration: 'none',
    wordBreak: 'break-all'
  },
  badges: { display: 'flex', gap: '5px', flexWrap: 'wrap' },
  badge: {
    fontSize: '11px', padding: '2px 8px',
    borderRadius: '20px', border: '1px solid rgba(255,255,255,0.12)',
    color: '#9ca3af', fontWeight: '500'
  },
  originalUrl: {
    color: '#374151', fontSize: '12px',
    margin: '4px 0 8px 0', wordBreak: 'break-all'
  },
  statsRow2: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  statChip: {
    fontSize: '11px', color: '#6b7280',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: '3px 8px', borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.05)',
    fontWeight: '500'
  },
  qrBox: {
    marginTop: '12px', padding: '14px',
    backgroundColor: '#1a1a28',
    borderRadius: '12px', display: 'inline-block',
    border: '1px solid rgba(255,255,255,0.06)'
  },
  clickBadge: {
    textAlign: 'center', minWidth: '46px'
  },
  clickNum: {
    display: 'block', fontSize: '22px',
    fontWeight: '700', color: '#a78bfa',
    letterSpacing: '-0.5px'
  },
  clickLbl: { fontSize: '10px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' },
  btnGroup: { display: 'flex', gap: '5px' },
  iconBtn: {
    padding: '7px 9px', backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px'
  },
  deleteBtn: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderColor: 'rgba(239,68,68,0.18)'
  },
  toggleBtn: {
    padding: '6px 14px', backgroundColor: 'transparent',
    color: '#818cf8', border: '1px solid rgba(129,140,248,0.3)',
    borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500'
  },
  footer: {
    textAlign: 'center',
    padding: '24px 16px',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    marginTop: '8px',
    position: 'relative',
    zIndex: 1
  },
  footerText: {
    color: '#374151', fontSize: '12px', margin: 0, fontWeight: '400'
  },
  footerName: {
    color: '#8b5cf6', fontWeight: '600'
  }
}

export default Dashboard
