import React, { useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

function PasswordProtected() {
  const { code } = useParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`https://api.cuts.ink/verify/${code}`, { password })
      window.location.href = res.data.originalUrl
    } catch (err) {
      setError(err.response?.data?.error || 'Wrong password')
    }
    setLoading(false)
  }

  return (
    <div className="app-shell">
      <div className="app-grid auth-layout">
        <section className="auth-showcase">
          <div className="brand-mark">
            <span className="brand-mark-icon">CI</span>
            <span className="brand-mark-text">
              <span className="brand-name">cuts.ink</span>
              <span className="brand-caption">Private destinations stay private</span>
            </span>
          </div>

          <h1>This link is protected for a reason.</h1>
          <p>
            Enter the access password to continue to the shared destination. The link
            owner added an extra layer of privacy before redirecting you.
          </p>

          <div className="showcase-panel">
            <div className="showcase-stat">
              <strong>Protected</strong>
              <span>Password verification keeps sensitive destinations restricted.</span>
            </div>
            <div className="showcase-stat">
              <strong>Direct</strong>
              <span>Once verified, you will be forwarded immediately to the original URL.</span>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-header">
            <div className="protected-icon">LK</div>
            <span className="auth-eyebrow">Protected link</span>
            <h2>Unlock destination</h2>
            <p>Enter the password shared with you to continue.</p>
          </div>

          {error && <div className="status-banner error">{error}</div>}

          <div className="form-stack">
            <div className="form-field">
              <label className="form-label">Password</label>
              <div className="input-shell">
                <input
                  className="text-input"
                  type="password"
                  placeholder="Enter access password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            </div>
          </div>

          <button className="primary-button" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Verifying...' : 'Access Link'}
          </button>
        </section>
      </div>
    </div>
  )
}

export default PasswordProtected
