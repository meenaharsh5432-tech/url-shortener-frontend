import React, { useState, useEffect } from 'react'
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
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const username = localStorage.getItem('username')
  const headers = { Authorization: `Bearer ${token}` }

  const chartData = urls.map((url) => ({
    name: url.shortCode,
    clicks: url.clicks
  }))

  useEffect(() => { fetchUrls() }, [])

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
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, { headers })
      fetchUrls()
    } catch (err) {
      console.log('Error deleting URL')
    }
  }

  const handleCopy = (shortCode) => {
    navigator.clipboard.writeText(`${BACKEND_URL}/${shortCode}`)
    alert('✅ Copied to clipboard!')
  }

  const handleQR = (shortCode) => {
    setQrCode(qrCode === shortCode ? null : shortCode)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login')
  }

  const getDaysLeft = (expiresAt) => {
    const diff = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
    if (diff <= 0) return { text: 'Expired', color: '#ef4444' }
    if (diff <= 3) return { text: `${diff}d left`, color: '#f59e0b' }
    return { text: `${diff}d left`, color: '#10b981' }
  }

  return (
    <div style={styles.container}>
      {/* Background */}
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
          <span style={styles.navLogoIcon}>✂️</span>
          <span style={styles.navLogoText}>cuts.ink</span>
        </div>
        <div style={styles.navRight}>
          <div style={styles.userBadge}>👤 {username}</div>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Main */}
      <div style={styles.main}>

        {/* Stats Row */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{urls.length}</span>
            <span style={styles.statLabel}>Total Links</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{urls.reduce((a, b) => a + b.clicks, 0)}</span>
            <span style={styles.statLabel}>Total Clicks</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{urls.filter(u => u.password).length}</span>
            <span style={styles.statLabel}>Protected</span>
          </div>
        </div>

        {/* Shorten Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>✂️ Shorten a URL</h2>
          {error && <div style={styles.errorBox}>⚠️ {error}</div>}
          <div style={styles.inputGrid}>
            <input
              style={{ ...styles.input, gridColumn: '1 / -1' }}
              type="text"
              placeholder="Paste your long URL here..."
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
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
              placeholder="Password (optional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            style={{ ...styles.shortenBtn, opacity: loading ? 0.7 : 1 }}
            onClick={handleShorten}
            disabled={loading}
          >
            {loading ? '⏳ Shortening...' : '✂️ Shorten URL'}
          </button>
        </div>

        {/* Chart */}
        {urls.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📊 Click Analytics</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1e2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  labelStyle={{ color: '#9ca3af' }}
  itemStyle={{ color: '#8b5cf6' }}
  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="clicks" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* URLs List */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🔗 My Links ({urls.length})</h2>
          {urls.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>✂️</div>
              <p style={styles.emptyText}>No links yet. Shorten your first URL above!</p>
            </div>
          ) : (
            urls.map((url) => {
              const expiry = getDaysLeft(url.expiresAt)
              return (
                <div key={url._id} style={styles.urlCard}>
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
                        <span style={{ ...styles.badge, color: expiry.color, borderColor: expiry.color }}>
                          {expiry.text}
                        </span>
                      </div>
                    </div>
                    <p style={styles.originalUrl}>{url.originalUrl}</p>
                    <div style={styles.statsRow2}>
                      <span style={styles.statChip}>🖥️ {url.deviceStats?.desktop || 0}</span>
                      <span style={styles.statChip}>📱 {url.deviceStats?.mobile || 0}</span>
                      <span style={styles.statChip}>
                        🌍 {url.geoStats && Object.keys(url.geoStats).length > 0
                          ? Object.entries(url.geoStats).map(([c, n]) => `${c}:${n}`).join(' ')
                          : 'No data'}
                      </span>
                    </div>
                    {qrCode === url.shortCode && (
                      <div style={styles.qrBox}>
                        <QRCodeSVG
                          value={`${BACKEND_URL}/${url.shortCode}`}
                          size={120}
                          bgColor="transparent"
                          fgColor="#ffffff"
                        />
                      </div>
                    )}
                  </div>
                  <div style={styles.urlRight}>
                    <div style={styles.clickBadge}>
                      <span style={styles.clickNum}>{url.clicks}</span>
                      <span style={styles.clickLbl}>clicks</span>
                    </div>
                    <div style={styles.btnGroup}>
                      <button style={styles.iconBtn} onClick={() => handleCopy(url.shortCode)} title="Copy">📋</button>
                      <button style={styles.iconBtn} onClick={() => handleQR(url.shortCode)} title="QR Code">📱</button>
                      <button style={{ ...styles.iconBtn, ...styles.deleteBtn }} onClick={() => handleDelete(url._id)} title="Delete">🗑️</button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0f',
    fontFamily: "'Georgia', serif",
    position: 'relative',
    overflow: 'hidden'
  },
  bgOrb1: {
    position: 'fixed',
    width: '600px', height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
    top: '-200px', left: '-200px',
    pointerEvents: 'none', zIndex: 0
  },
  bgOrb2: {
    position: 'fixed',
    width: '500px', height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)',
    bottom: '-200px', right: '-200px',
    pointerEvents: 'none', zIndex: 0
  },
  navbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: 'rgba(19,19,26,0.9)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    position: 'sticky', top: 0, zIndex: 100
  },
  navLogo: { display: 'flex', alignItems: 'center', gap: '10px' },
  navLogoIcon: { fontSize: '20px' },
  navLogoText: { color: '#fff', fontSize: '18px', fontWeight: 'bold', letterSpacing: '-0.5px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  userBadge: {
    color: '#9ca3af', fontSize: '14px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '6px 12px', borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.08)'
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#9ca3af',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', transition: 'all 0.2s'
  },
  main: {
    maxWidth: '860px', margin: '0 auto',
    padding: '24px 16px', position: 'relative', zIndex: 1
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px', marginBottom: '20px'
  },
  statCard: {
    backgroundColor: '#13131a',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '14px', padding: '20px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
  },
  statNumber: { color: '#fff', fontSize: '28px', fontWeight: 'bold' },
  statLabel: { color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  card: {
    backgroundColor: '#13131a',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px', padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
  },
  cardTitle: {
    color: '#fff', fontSize: '16px', fontWeight: '600',
    margin: '0 0 20px 0', letterSpacing: '-0.3px'
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px', padding: '12px 16px',
    color: '#f87171', fontSize: '14px', marginBottom: '16px'
  },
  inputGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '10px', marginBottom: '14px'
  },
  input: {
    padding: '12px 14px',
    backgroundColor: '#1e1e2e',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px', color: '#ffffff',
    fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', width: '100%'
  },
  shortenBtn: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '15px', fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(99,102,241,0.35)'
  },
  emptyState: {
    textAlign: 'center', padding: '40px 20px'
  },
  emptyIcon: { fontSize: '40px', marginBottom: '12px' },
  emptyText: { color: '#6b7280', fontSize: '15px' },
  urlCard: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: '16px',
    padding: '16px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  urlMain: { flex: 1, minWidth: 0 },
  urlTopRow: {
    display: 'flex', alignItems: 'center',
    gap: '10px', flexWrap: 'wrap', marginBottom: '4px'
  },
  shortUrl: {
    color: '#818cf8', fontWeight: '600',
    fontSize: '14px', textDecoration: 'none',
    wordBreak: 'break-all'
  },
  badges: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  badge: {
    fontSize: '11px', padding: '2px 8px',
    borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)',
    color: '#9ca3af'
  },
  originalUrl: {
    color: '#4b5563', fontSize: '12px',
    margin: '4px 0 8px 0', wordBreak: 'break-all'
  },
  statsRow2: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  statChip: {
    fontSize: '11px', color: '#6b7280',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: '3px 8px', borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.06)'
  },
  qrBox: {
    marginTop: '12px', padding: '16px',
    backgroundColor: '#1e1e2e',
    borderRadius: '10px', display: 'inline-block'
  },
  urlRight: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '12px', flexShrink: 0
  },
  clickBadge: {
    textAlign: 'center', minWidth: '50px'
  },
  clickNum: {
    display: 'block', fontSize: '24px',
    fontWeight: 'bold', color: '#8b5cf6'
  },
  clickLbl: { fontSize: '11px', color: '#6b7280' },
  btnGroup: { display: 'flex', gap: '6px' },
  iconBtn: {
    padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', transition: 'all 0.2s'
  },
  deleteBtn: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.2)'
  }
}

export default Dashboard