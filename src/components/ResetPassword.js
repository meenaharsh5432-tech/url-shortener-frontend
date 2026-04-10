import React, { useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate, Link } from 'react-router-dom'
import API_URL from '../config'

function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!password || !confirm) return setError('All fields are required')
    if (password !== confirm) return setError('Passwords do not match')
    if (password.length < 6) return setError('Password must be at least 6 characters')

    setLoading(true)
    setError('')
    try {
      await axios.post(`${API_URL}/auth/reset-password/${token}`, { password })
      navigate('/login?reset=true')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
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
              <span className="brand-caption">Fresh start, same dashboard</span>
            </span>
          </div>

          <h1>Choose a new password and get back in.</h1>
          <p>
            A stronger password keeps your protected links, analytics, and account
            settings safely under your control.
          </p>

          <div className="showcase-panel">
            <div className="showcase-stat">
              <strong>Private</strong>
              <span>Reset securely and continue using your existing account.</span>
            </div>
            <div className="showcase-stat">
              <strong>Seamless</strong>
              <span>You will be returned to sign in as soon as the reset succeeds.</span>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-header">
            <span className="auth-eyebrow">Reset password</span>
            <h2>Create a new password</h2>
            <p>Use something memorable for you and hard to guess for everyone else.</p>
          </div>

          {error && <div className="status-banner error">{error}</div>}

          <div className="form-stack">
            <div className="form-field">
              <label className="form-label">New password</label>
              <div className="input-shell">
                <input className="text-input" type="password" placeholder="Enter a new password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Confirm password</label>
              <div className="input-shell">
                <input
                  className="text-input"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            </div>
          </div>

          <button className="primary-button" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          <div className="auth-links">
            <Link to="/login" className="text-link">Back to sign in</Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ResetPassword
