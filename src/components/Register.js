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
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async () => {
    setLoading(true)
    setError('')
    try {
      await axios.post(`${API_URL}/auth/register`, { username, email, password })
      navigate('/login')
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
      navigate('/dashboard')
    } catch (err) {
      setError('Google sign in failed')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>✂️</div>
          <span style={styles.logoText}>cuts.ink</span>
        </div>

        <h1 style={styles.title}>Create account</h1>
        <p style={styles.subtitle}>Start shortening your links for free</p>

        {error && (
          <div style={styles.errorBox}>
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Google Sign Up */}
        <div style={styles.googleWrapper}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign up failed')}
            theme="filled_black"
            shape="rectangular"
            width="340"
            text="signup_with"
          />
        </div>

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or continue with email</span>
          <div style={styles.dividerLine} />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            placeholder="yourname"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
          />
        </div>

        <button
          style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? '⏳ Creating account...' : 'Create Account →'}
        </button>

        <p style={styles.footerText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Georgia', serif"
  },
  bgOrb1: {
    position: 'absolute',
    width: '500px', height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
    top: '-100px', right: '-100px',
    pointerEvents: 'none'
  },
  bgOrb2: {
    position: 'absolute',
    width: '400px', height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
    bottom: '-100px', left: '-100px',
    pointerEvents: 'none'
  },
  card: {
    backgroundColor: '#13131a',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    position: 'relative',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
  },
  logoRow: {
    display: 'flex', alignItems: 'center',
    gap: '10px', marginBottom: '32px'
  },
  logoIcon: { fontSize: '24px' },
  logoText: {
    fontSize: '20px', fontWeight: 'bold',
    color: '#fff', letterSpacing: '-0.5px'
  },
  title: {
    color: '#ffffff', fontSize: '28px',
    fontWeight: 'bold', margin: '0 0 8px 0',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    color: '#6b7280', fontSize: '15px',
    margin: '0 0 24px 0'
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px', padding: '12px 16px',
    color: '#f87171', fontSize: '14px',
    marginBottom: '20px'
  },
  googleWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  divider: {
    display: 'flex', alignItems: 'center',
    gap: '12px', marginBottom: '20px'
  },
  dividerLine: {
    flex: 1, height: '1px',
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  dividerText: {
    color: '#6b7280', fontSize: '12px',
    whiteSpace: 'nowrap'
  },
  inputGroup: { marginBottom: '20px' },
  label: {
    display: 'block', color: '#9ca3af',
    fontSize: '13px', fontWeight: '500',
    marginBottom: '8px', letterSpacing: '0.5px',
    textTransform: 'uppercase'
  },
  input: {
    width: '100%', padding: '14px 16px',
    backgroundColor: '#1e1e2e',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px', color: '#ffffff',
    fontSize: '15px', outline: 'none',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white', border: 'none',
    borderRadius: '10px', fontSize: '16px',
    fontWeight: '600', cursor: 'pointer',
    marginTop: '8px', letterSpacing: '0.3px',
    boxShadow: '0 4px 20px rgba(99,102,241,0.4)'
  },
  footerText: {
    textAlign: 'center', color: '#6b7280',
    fontSize: '14px', marginTop: '24px'
  },
  link: {
    color: '#818cf8', textDecoration: 'none',
    fontWeight: '500'
  }
}

export default Register