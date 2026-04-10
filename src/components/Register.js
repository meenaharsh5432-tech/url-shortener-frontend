import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import API_URL from '../config'

function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await axios.post(`${API_URL}/auth/register`, { username, email, password })
      setSuccess('Account created. Check your email and verify the link before signing in.')
      setUsername('')
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    }
    setLoading(false)
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google`, {
        credential: credentialResponse.credential
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('username', res.data.user.username)
      localStorage.setItem('isGoogleUser', res.data.user.isGoogleUser ? 'true' : 'false')
      navigate('/dashboard')
    } catch (err) {
      setError('Google sign up failed')
    }
  }

  return (
    <div className="app-shell">
      <div className="app-grid auth-layout">
        <section className="auth-showcase">
          <div className="brand-mark">
            <span className="brand-mark-icon">CI</span>
            <span className="brand-mark-text">
              <span className="brand-name">cuts.ink</span>
              <span className="brand-caption">Create memorable links in minutes</span>
            </span>
          </div>

          <h1>Turn long, messy URLs into clean share-ready moments.</h1>
          <p>
            Build branded short links, add passwords when needed, and keep your
            audience experience smooth from the first click.
          </p>

          <div className="showcase-panel">
            <div className="showcase-stat">
              <strong>Custom</strong>
              <span>Choose aliases that match your campaign, product, or creator name.</span>
            </div>
            <div className="showcase-stat">
              <strong>Protected</strong>
              <span>Gate private resources with password-enabled redirects.</span>
            </div>
            <div className="showcase-stat">
              <strong>Trackable</strong>
              <span>See link performance at a glance with live click stats.</span>
            </div>
            <div className="showcase-stat">
              <strong>Simple</strong>
              <span>Use email or Google sign in to get started right away.</span>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-header">
            <span className="auth-eyebrow">Create account</span>
            <h2>Open your link dashboard</h2>
            <p>Start organizing smarter links with a cleaner and more modern workflow.</p>
          </div>

          {error && <div className="status-banner error">{error}</div>}
          {success && <div className="status-banner success">{success}</div>}

          <div className="oauth-wrap">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign up failed')}
              theme="filled_black"
              shape="pill"
              width="340"
              text="signup_with"
            />
          </div>

          <div className="form-divider">
            <span>Or continue with email</span>
          </div>

          <div className="form-stack">
            <div className="form-field">
              <label className="form-label">Username</label>
              <div className="input-shell">
                <input className="text-input" type="text" placeholder="yourname" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Email</label>
              <div className="input-shell">
                <input className="text-input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Password</label>
              <div className="input-shell">
                <input
                  className="text-input"
                  type="password"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                />
              </div>
            </div>
          </div>

          <button className="primary-button" onClick={handleRegister} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="auth-links">
            <p className="auth-helper-text">
              Already have an account? <Link to="/login" className="inline-link">Sign in</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Register
