import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import API_URL from '../config'


function Dashboard() {
  const [urls, setUrls] = useState([])
  const [originalUrl, setOriginalUrl] = useState('')
  const [customAlias, setCustomAlias]=useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [qrCode, setQrCode] = useState(null)
  const [password,setPassword]=useState('')

  const token = localStorage.getItem('token')
  const username = localStorage.getItem('username')

  const headers = { Authorization: `Bearer ${token}` }

  const chartData = urls.map((url) => ({
  name: url.shortCode,
  clicks: url.clicks
}))

  // Load all URLs on page load
  useEffect(() => {
    fetchUrls()
  }, [])

  const fetchUrls = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/login`, { headers })
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
      const res = await axios.post(`${API_URL}/auth/login`,
        { originalUrl,customAlias,password },
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

  const handleDelete=async (id)=>{
    try {
      await axios.delete(`${API_URL}/auth/login/${id}`,{headers})
      fetchUrls()

    }catch(err){
      console.log('Error Deleting URL')
    }
  }
  const handleCopy = (shortCode) => {
  navigator.clipboard.writeText(`${API_URL}/auth/login/${shortCode}`)
  alert('Copied to clipboard!')
}
const handleQR = (shortCode) => {
  if (qrCode === shortCode) {
    setQrCode(null)  // hide if already showing
  } else {
    setQrCode(shortCode)  // show for this URL
  }
}
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login')
  }

  const getDaysLeft = (expiresAt) => {
  const now = new Date()
  const expiry = new Date(expiresAt)
  const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
  if (diff <= 0) return '❌ Expired'
  if (diff <= 3) return `⚠️ ${diff} days left`
  return `✅ ${diff} days left`
}
  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.navTitle}>🔗 URL Shortener</h2>
        <div style={styles.navRight}>
          <span style={styles.welcome}>👋 {username}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>

        {/* Shorten URL Box */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Shorten a URL</h3>
          {error && <p style={styles.error}>{error}</p>}
          <div style={styles.inputRow}>
            <input
              style={styles.input}
              type="text"
              placeholder="Paste your long URL here..."
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
            />
            <input
    style={styles.aliasInput}
    type="text"
    placeholder="Custom alias (optional)"
    value={customAlias}
    onChange={(e) => setCustomAlias(e.target.value)}
  />
  <input
  style={styles.aliasInput}
  type="password"
  placeholder="Password (optional)"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
            <button
              style={styles.button}
              onClick={handleShorten}
              disabled={loading}
            >
              {loading ? 'Shortening...' : 'Shorten'}
            </button>
          </div>
        </div>
{/* Analytics Chart */}
{urls.length > 0 && (
  <div style={styles.card}>
    <h3 style={styles.cardTitle}>📊 Click Analytics</h3>
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="clicks" fill="#4f46e5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
)}
        {/* URLs List */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>My URLs ({urls.length})</h3>
          {urls.length === 0 ? (
            <p style={styles.empty}>No URLs yet. Shorten your first URL above!</p>
          ) : (
            urls.map((url) => (
              <div key={url._id} style={styles.urlCard}>
    <div style={styles.urlInfo}>
      <a
        href={`${API_URL}/auth/login/${url.shortCode}`}
        target="_blank"
        rel="noreferrer"
        style={styles.shortUrl}
      >
        ${API_URL}/auth/login/{url.shortCode}
      </a>
      <p style={styles.originalUrl}>{url.originalUrl}</p>
      <p style={styles.expiry}>{getDaysLeft(url.expiresAt)}</p>
      {url.password && (
  <p style={styles.deviceStats}>🔒 Password protected</p>
)}
      <p style={styles.deviceStats}>
        🖥️ {url.deviceStats?.desktop || 0} desktop · 
  📱 {url.deviceStats?.mobile || 0} mobile
      </p>
      <p style={styles.deviceStats}>
  🌍 {url.geoStats && Object.keys(url.geoStats).length > 0 
    ? Object.entries(url.geoStats)
        .map(([country, count]) => `${country}: ${count}`)
        .join(' · ')
    : 'No geo data yet'
  }
</p>
      {qrCode === url.shortCode && (
  <div style={{ marginTop: '10px' }}>
    <QRCodeSVG
      value={`${API_URL}/auth/login/${url.shortCode}`}
      size={120}
    />
  </div>
)}
    </div>
    <div style={styles.clicks}>
      <span style={styles.clickCount}>{url.clicks}</span>
      <span style={styles.clickLabel}>clicks</span>
    </div>
    <div style={styles.btnGroup}>
  <button style={styles.copyBtn} onClick={() => handleCopy(url.shortCode)}>📋</button>
  <button style={styles.copyBtn} onClick={() => handleQR(url.shortCode)}>📱</button>
  <button style={styles.deleteBtn} onClick={() => handleDelete(url._id)}>🗑️</button>
</div>
    
  </div>
            ))
          )}
          
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f2f5' },
  navbar: {
    backgroundColor: '#4f46e5', padding: '15px 20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  navTitle: { color: 'white', margin: 0, fontSize: 'clamp(16px, 4vw, 22px)' },
  navRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  welcome: { color: 'white', fontSize: 'clamp(11px, 3vw, 14px)' },
  logoutBtn: {
    padding: '6px 12px', backgroundColor: 'white',
    color: '#4f46e5', border: 'none', borderRadius: '6px', 
    cursor: 'pointer', fontSize: 'clamp(11px, 3vw, 14px)'
  },
  main: { maxWidth: '800px', margin: '20px auto', padding: '0 15px' },
  card: {
    backgroundColor: 'white', borderRadius: '10px',
    padding: '20px', marginBottom: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  cardTitle: { margin: '0 0 15px 0', color: '#333', fontSize: 'clamp(14px, 4vw, 18px)' },
  inputRow: { 
    display: 'flex', gap: '8px', 
    flexWrap: 'wrap'
  },
  input: {
    flex: '1 1 200px', padding: '10px', borderRadius: '6px',
    border: '1px solid #ddd', fontSize: '14px',
    minWidth: '0'
  },
  aliasInput: {
    flex: '1 1 130px', padding: '10px', borderRadius: '6px',
    border: '1px solid #ddd', fontSize: '14px',
    minWidth: '0'
  },
  button: {
    padding: '10px 20px', backgroundColor: '#4f46e5',
    color: 'white', border: 'none', borderRadius: '6px',
    fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap',
    flex: '1 1 100px'
  },
  btnGroup: {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  flexShrink: 0
},
  error: { color: 'red', margin: '0 0 10px 0', fontSize: '13px' },
  empty: { color: '#999', textAlign: 'center', padding: '20px' },
  urlCard: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', padding: '12px 0',
    borderBottom: '1px solid #f0f0f0',
    flexWrap: 'wrap', gap: '8px'
  },
  urlInfo: { flex: '1 1 200px', minWidth: '0' },
  shortUrl: { 
    color: '#4f46e5', fontWeight: 'bold', 
    fontSize: 'clamp(12px, 3vw, 14px)',
    wordBreak: 'break-all'
  },
  originalUrl: { 
    color: '#999', fontSize: '12px', margin: '4px 0 0 0',
    wordBreak: 'break-all'
  },
  expiry: { fontSize: '11px', margin: '3px 0 0 0', color: '#888' },
  deviceStats: { fontSize: '11px', margin: '3px 0 0 0', color: '#888' },
  clicks: { textAlign: 'center', minWidth: '50px' },
  clickCount: { display: 'block', fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 'bold', color: '#4f46e5' },
  clickLabel: { fontSize: '12px', color: '#999' },
  copyBtn: {
    padding: '8px 10px', backgroundColor: '#4f46e5',
    color: 'white', border: 'none', borderRadius: '6px',
    cursor: 'pointer', fontSize: '14px'
  },
  deleteBtn: {
    padding: '8px 10px', backgroundColor: '#ff4444',
    color: 'white', border: 'none', borderRadius: '6px',
    cursor: 'pointer', fontSize: '14px'
  }
}

export default Dashboard