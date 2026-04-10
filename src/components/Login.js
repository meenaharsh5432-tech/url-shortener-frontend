import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import API_URL from '../config'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setSuccess('Email verified. You can now sign in.')
    } else if (searchParams.get('reset') === 'true') {
      setSuccess('Password reset successfully. You can now sign in.')
    } else if (searchParams.get('error') === 'invalid-or-expired-link') {
      setError('Verification link is invalid or expired. Please register again.')
    } else if (searchParams.get('error')) {
      setError('Something went wrong. Please try again.')
    }
  }, [searchParams])

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('username', res.data.user.username)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
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
      setError('Google sign in failed')
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
              <span className="brand-caption">Smart links with cleaner analytics</span>
            </span>
          </div>

          <h1>Short links that look as sharp as your brand.</h1>
          <p>
            Manage every redirect, protected share, and campaign URL from a single
            polished workspace built for speed.
          </p>

          <div className="showcase-panel">
            <div className="showcase-stat">
              <strong>Fast</strong>
              <span>Create trackable links in seconds and share them anywhere.</span>
            </div>
            <div className="showcase-stat">
              <strong>Secure</strong>
              <span>Keep important destinations behind password-protected access.</span>
            </div>
            <div className="showcase-stat">
              <strong>Readable</strong>
              <span>Custom aliases make every shared link feel intentional.</span>
            </div>
            <div className="showcase-stat">
              <strong>Insightful</strong>
              <span>Track clicks, devices, and traffic patterns in one place.</span>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-header">
            <span className="auth-eyebrow">Welcome back</span>
            <h2>Sign in to your workspace</h2>
            <p>Pick up where you left off and keep your link library moving.</p>
          </div>

          {error && <div className="status-banner error">{error}</div>}
          {success && <div className="status-banner success">{success}</div>}

          <div className="oauth-wrap">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign in failed')}
              theme="filled_black"
              shape="pill"
              width="340"
              text="signin_with"
            />
          </div>

          <div className="form-divider">
            <span>Or continue with email</span>
          </div>

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
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Password</label>
              <div className="input-shell">
                <input
                  className="text-input"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>
          </div>

          <button className="primary-button" onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="auth-links">
            <Link to="/forgot-password" className="text-link">Forgot password?</Link>
            <p className="auth-helper-text">
              New here? <Link to="/register" className="inline-link">Create an account</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Login
