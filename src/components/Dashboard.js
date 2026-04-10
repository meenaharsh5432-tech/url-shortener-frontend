import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  const [isGoogleUser, setIsGoogleUser] = useState(false)
  const toastTimer = useRef(null)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const username = localStorage.getItem('username')

  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0)
  const protectedCount = urls.filter((url) => url.password).length
  const chartData = urls.map((url) => ({
    name: url.shortCode,
    clicks: url.clicks
  }))

  const fetchUrls = useCallback(async (authToken = token) => {
    try {
      const res = await axios.get(`${API_URL}/myurls`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      setUrls(res.data)
    } catch (err) {
      console.log('Error fetching URLs')
    }
  }, [token])

  useEffect(() => {
    const loadDashboard = async () => {
      await fetchUrls(token)
      axios.get(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => {
        setIsGoogleUser(res.data.isGoogleUser)
      }).catch(() => {})
    }

    loadDashboard()

    return () => clearTimeout(toastTimer.current)
  }, [fetchUrls, token])

  const handleShorten = async () => {
    if (!originalUrl) return
    setLoading(true)
    setError('')
    try {
      await axios.post(
        `${API_URL}/shorten`,
        { originalUrl, customAlias, password },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setOriginalUrl('')
      setCustomAlias('')
      setPassword('')
      fetchUrls()
      showToast('Link shortened successfully')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchUrls()
      showToast('Link deleted')
    } catch (err) {
      console.log('Error deleting URL')
    }
  }

  const handleCopy = (shortCode) => {
    navigator.clipboard.writeText(`${BACKEND_URL}/${shortCode}`)
    showToast('Copied to clipboard')
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
      await axios.post(
        `${API_URL}/auth/change-password`,
        { currentPassword: currentPw, newPassword: newPw },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
      setShowChangePw(false)
      setIsGoogleUser(false)
      showToast(isGoogleUser ? 'Password set successfully' : 'Password updated')
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to change password')
    }
    setPwLoading(false)
  }

  const showToast = (message) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2400)
  }

  const getDaysLeft = (expiresAt) => {
    const diff = Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
    if (diff <= 0) return { text: 'Expired', className: 'danger' }
    if (diff <= 3) return { text: `${diff}d left`, className: 'warning' }
    return { text: `${diff}d left`, className: 'success' }
  }

  const topPerformer = urls.reduce((best, url) => {
    if (!best || url.clicks > best.clicks) return url
    return best
  }, null)

  return (
    <div className="app-shell dashboard-layout">
      <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>

      <div className="dashboard-shell">
        <nav className="dashboard-nav">
          <div className="dashboard-nav-group">
            <div className="brand-mark">
              <span className="brand-mark-icon">CI</span>
              <span className="brand-mark-text">
                <span className="brand-name">cuts.ink</span>
                <span className="brand-caption">Modern link management</span>
              </span>
            </div>
            <div className="brand-lockup">
              <strong>Dashboard</strong>
              <span className="nav-subtitle">Create, track, and secure every short link.</span>
            </div>
          </div>

          <div className="nav-actions">
            <div className="user-pill">@{username}</div>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        <section className="dashboard-hero">
          <div className="hero-panel">
            <div className="hero-kicker">Link Command Center</div>
            <h1>Build cleaner links with a dashboard that finally feels premium.</h1>
            <p>
              Shorten URLs, add protection, surface your best performers, and keep
              every shared link organized in one visually polished workspace.
            </p>
            <div className="hero-tips">
              <span className="hero-tip">Custom aliases for memorable shares</span>
              <span className="hero-tip">Password-protected redirects for private assets</span>
              <span className="hero-tip">Quick analytics for every campaign</span>
            </div>
          </div>

          <div className="hero-panel hero-sidecard">
            <div>
              <h3>Performance snapshot</h3>
              <p>A quick pulse on your library so you can spot momentum instantly.</p>
            </div>
            <div className="mini-stat-row">
              <div className="mini-stat">
                <strong>{urls.length}</strong>
                <span>links in your workspace</span>
              </div>
              <div className="mini-stat">
                <strong>{totalClicks}</strong>
                <span>total recorded clicks</span>
              </div>
            </div>
            <div className="mini-stat">
              <strong>{topPerformer ? topPerformer.shortCode : 'None yet'}</strong>
              <span>{topPerformer ? `top performer with ${topPerformer.clicks} clicks` : 'Create a link to see your best performer here.'}</span>
            </div>
          </div>
        </section>

        <section className="metrics-grid">
          <article className="metric-card">
            <div className="metric-meta">
              <div className="metric-icon">LK</div>
              <span className="metric-trend">Live</span>
            </div>
            <strong>{urls.length}</strong>
            <span>Total links created</span>
          </article>

          <article className="metric-card">
            <div className="metric-meta">
              <div className="metric-icon">CL</div>
              <span className="metric-trend">Active</span>
            </div>
            <strong>{totalClicks}</strong>
            <span>All-time clicks tracked</span>
          </article>

          <article className="metric-card">
            <div className="metric-meta">
              <div className="metric-icon">PR</div>
              <span className="metric-trend">Secure</span>
            </div>
            <strong>{protectedCount}</strong>
            <span>Password-protected links</span>
          </article>
        </section>

        <section className="dashboard-content-grid">
          <div className="dashboard-stack">
            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <h2>Create a new short link</h2>
                  <p>Paste a destination, add an alias if you want, and publish it in one click.</p>
                </div>
                <span className="card-badge">Fast publish</span>
              </div>

              {error && <div className="status-banner error">{error}</div>}

              <div className="dashboard-form-grid">
                <div className="form-field span-2">
                  <label className="form-label">Destination URL</label>
                  <div className="input-shell">
                    <input
                      className="text-input"
                      type="text"
                      placeholder="https://example.com/your-long-url"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Custom alias</label>
                  <div className="input-shell">
                    <input
                      className="text-input"
                      type="text"
                      placeholder="launch-day"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Password protection</label>
                  <div className="input-shell">
                    <input
                      className="text-input"
                      type="password"
                      placeholder="Optional access password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button className="primary-button" onClick={handleShorten} disabled={loading}>
                {loading ? 'Shortening...' : 'Create Short Link'}
              </button>
            </article>

            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <div>
                  <h2>Your link library</h2>
                  <p>Review every shortened URL, copy it instantly, or open a QR code for quick sharing.</p>
                </div>
                <span className="card-badge">{urls.length} items</span>
              </div>

              {urls.length === 0 ? (
                <div className="empty-state">
                  <strong>Your library is still empty.</strong>
                  <p>Create your first short link above and it will appear here with click insights and actions.</p>
                </div>
              ) : (
                <div className="link-list">
                  {urls.map((url) => {
                    const expiry = getDaysLeft(url.expiresAt)
                    return (
                      <article key={url._id} className="link-card">
                        <div className="link-card-top">
                          <div className="link-card-main">
                            <div className="link-topline">
                              <a href={`${BACKEND_URL}/${url.shortCode}`} target="_blank" rel="noreferrer" className="short-link">
                                {BACKEND_URL}/{url.shortCode}
                              </a>
                              <div className="chip-row">
                                {url.password && <span className="chip">Protected</span>}
                                <span className={`chip ${expiry.className}`}>{expiry.text}</span>
                              </div>
                            </div>
                            <p className="link-original">{url.originalUrl}</p>
                          </div>

                          <div className="link-metrics">
                            <div className="click-pill">
                              <strong>{url.clicks}</strong>
                              <span>clicks</span>
                            </div>
                            <div className="link-actions">
                              <button className="icon-button" onClick={() => handleCopy(url.shortCode)} title="Copy link">CP</button>
                              <button className="icon-button" onClick={() => handleQR(url.shortCode)} title="Show QR">QR</button>
                              <button className="icon-button delete" onClick={() => handleDelete(url._id)} title="Delete link">DL</button>
                            </div>
                          </div>
                        </div>

                        <div className="detail-row">
                          <span className="detail-pill">Desktop {url.deviceStats?.desktop || 0}</span>
                          <span className="detail-pill">Mobile {url.deviceStats?.mobile || 0}</span>
                          {url.geoStats && Object.keys(url.geoStats).length > 0 && (
                            <span className="detail-pill">
                              Regions {Object.entries(url.geoStats).map(([country, count]) => `${country} ${count}`).join(', ')}
                            </span>
                          )}
                        </div>

                        {qrCode === url.shortCode && (
                          <div className="qr-shell">
                            <QRCodeSVG
                              value={`${BACKEND_URL}/${url.shortCode}`}
                              size={120}
                              bgColor="transparent"
                              fgColor="#ffffff"
                            />
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              )}
            </article>
          </div>

          <div className="dashboard-stack">
            {urls.length > 0 && (
              <article className="dashboard-card">
                <div className="dashboard-card-header">
                  <div>
                    <h2>Click analytics</h2>
                    <p>See which short codes are driving the most engagement right now.</p>
                  </div>
                  <span className="card-badge">Visualized</span>
                </div>

                <div className="analytics-shell">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ff9465" />
                          <stop offset="100%" stopColor="#ff5f6d" />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="rgba(226, 232, 240, 0.28)" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                      <YAxis stroke="rgba(226, 232, 240, 0.28)" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{
                          backgroundColor: 'rgba(9, 17, 31, 0.96)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '14px',
                          color: '#fff'
                        }}
                      />
                      <Bar dataKey="clicks" fill="url(#barGradient)" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>
            )}

            <article className="dashboard-card">
              <div className="settings-header">
                <div>
                  <h2>{isGoogleUser ? 'Set a password' : 'Password settings'}</h2>
                  <p>
                    {isGoogleUser
                      ? 'Your account currently uses Google sign in. Add a password for email login too.'
                      : 'Update your password any time to keep your account secure.'}
                  </p>
                </div>
                <button
                  className={`secondary-button${showChangePw ? ' active' : ''}`}
                  onClick={() => {
                    setShowChangePw(!showChangePw)
                    setPwError('')
                  }}
                >
                  {showChangePw ? 'Close' : isGoogleUser ? 'Set password' : 'Change password'}
                </button>
              </div>

              {showChangePw && (
                <div className="password-fields">
                  {pwError && <div className="status-banner error">{pwError}</div>}

                  {!isGoogleUser && (
                    <div className="form-field">
                      <label className="form-label">Current password</label>
                      <div className="input-shell">
                        <input className="text-input" type="password" placeholder="Current password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
                      </div>
                    </div>
                  )}

                  <div className="form-field">
                    <label className="form-label">New password</label>
                    <div className="input-shell">
                      <input className="text-input" type="password" placeholder="New password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Confirm password</label>
                    <div className="input-shell">
                      <input className="text-input" type="password" placeholder="Confirm new password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
                    </div>
                  </div>

                  <button className="primary-button" onClick={handleChangePassword} disabled={pwLoading}>
                    {pwLoading ? 'Saving...' : isGoogleUser ? 'Set Password' : 'Update Password'}
                  </button>
                </div>
              )}
            </article>
          </div>
        </section>
      </div>

      <footer className="dashboard-footer">
        <p>
          {new Date().getFullYear()} cuts.ink by <strong>Harsh</strong>
        </p>
      </footer>
    </div>
  )
}

export default Dashboard
