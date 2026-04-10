import React, { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import API_URL from '../config'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email) return setError('Email is required')
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email })
      setSuccess(res.data.message)
      setEmail('')
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
              <span className="brand-caption">Account recovery made simple</span>
            </span>
          </div>

          <h1>Recover access without the usual friction.</h1>
          <p>
            Enter your email and we will send a secure reset link so you can get back
            to your dashboard quickly.
          </p>

          <div className="showcase-panel">
            <div className="showcase-stat">
              <strong>Safe</strong>
              <span>Password resets are delivered only to your verified inbox.</span>
            </div>
            <div className="showcase-stat">
              <strong>Quick</strong>
              <span>Reset your credentials and return to managing links in minutes.</span>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-header">
            <span className="auth-eyebrow">Forgot password</span>
            <h2>Send a reset link</h2>
            <p>We will email you instructions to securely create a new password.</p>
          </div>

          {error && <div className="status-banner error">{error}</div>}
          {success && <div className="status-banner success">{success}</div>}

          <div className="form-stack">
            <div className="form-field">
              <label className="form-label">Email</label>
              <div className="input-shell">
                <input
                  className="text-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            </div>
          </div>

          <button className="primary-button" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <div className="auth-links">
            <Link to="/login" className="text-link">Back to sign in</Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ForgotPassword
