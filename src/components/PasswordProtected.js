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
      const res = await axios.post(`https://url-shortener-backend-9agq.onrender.com/verify/${code}`, {
        password
      })
      window.location.href = res.data.originalUrl
    } catch (err) {
      setError(err.response?.data?.error || 'Wrong password!')
    }
    setLoading(false)
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

        <div style={styles.lockIcon}>🔒</div>
        <h1 style={styles.title}>Protected Link</h1>
        <p style={styles.subtitle}>Enter the password to access this link</p>

        {error && (
          <div style={styles.errorBox}>
            <span>⚠️ {error}</span>
          </div>
        )}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <button
          style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '⏳ Verifying...' : 'Access Link →'}
        </button>
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
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
    top: '-100px',
    left: '-100px',
    pointerEvents: 'none'
  },
  bgOrb2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
    bottom: '-100px',
    right: '-100px',
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
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    textAlign: 'center'
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '32px'
  },
  logoIcon: { fontSize: '24px' },
  logoText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: '-0.5px'
  },
  lockIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  title: {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '15px',
    margin: '0 0 32px 0'
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#f87171',
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'left'
  },
  inputGroup: { marginBottom: '20px', textAlign: 'left' },
  label: {
    display: 'block',
    color: '#9ca3af',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '8px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: '#1e1e2e',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    letterSpacing: '0.3px',
    boxShadow: '0 4px 20px rgba(99,102,241,0.4)'
  }
}

export default PasswordProtected