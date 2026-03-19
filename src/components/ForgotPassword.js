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
    <div style={styles.container}>
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      <div className="auth-card" style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>✂️</div>
          <span style={styles.logoText}>cuts.ink</span>
        </div>

        <h1 style={styles.title}>Forgot password</h1>
        <p style={styles.subtitle}>Enter your email and we'll send you a reset link</p>

        {error && <div style={styles.errorBox}><span>⚠️ {error}</span></div>}
        {success && <div style={styles.successBox}><span>{success}</span></div>}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <button
          className="btn-primary"
          style={{ ...styles.button, opacity: loading ? 0.65 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Sending…' : 'Send Reset Link →'}
        </button>

        <p style={styles.footerText}>
          <Link to="/login" style={styles.link}>Back to Sign In</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh', backgroundColor: '#0a0a0f',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px', position: 'relative', overflow: 'hidden',
  },
  bgOrb1: {
    position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
    top: '-120px', right: '-120px', pointerEvents: 'none'
  },
  bgOrb2: {
    position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168,85,247,0.13) 0%, transparent 70%)',
    bottom: '-100px', left: '-100px', pointerEvents: 'none'
  },
  card: { backgroundColor: '#13131a' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' },
  logoIcon: { fontSize: '22px' },
  logoText: { fontSize: '19px', fontWeight: '700', color: '#fff', letterSpacing: '-0.5px' },
  title: { color: '#ffffff', fontSize: '26px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '-0.5px' },
  subtitle: { color: '#6b7280', fontSize: '14px', margin: '0 0 24px 0', fontWeight: '400' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.28)',
    borderRadius: '10px', padding: '11px 14px', color: '#f87171', fontSize: '13px', marginBottom: '18px'
  },
  successBox: {
    backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.28)',
    borderRadius: '10px', padding: '11px 14px', color: '#4ade80', fontSize: '13px', marginBottom: '18px'
  },
  inputGroup: { marginBottom: '18px' },
  label: {
    display: 'block', color: '#9ca3af', fontSize: '12px', fontWeight: '600',
    marginBottom: '7px', letterSpacing: '0.6px', textTransform: 'uppercase'
  },
  input: {
    width: '100%', padding: '13px 15px', backgroundColor: '#1a1a28',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
    color: '#ffffff', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s'
  },
  button: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '15px', fontWeight: '600', cursor: 'pointer',
    marginTop: '6px', letterSpacing: '0.2px',
    boxShadow: '0 4px 20px rgba(99,102,241,0.38)'
  },
  footerText: { textAlign: 'center', color: '#6b7280', fontSize: '14px', marginTop: '22px' },
  link: { color: '#818cf8', textDecoration: 'none', fontWeight: '600' }
}

export default ForgotPassword
