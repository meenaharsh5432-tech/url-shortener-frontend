import React, { useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import API_URL from '../config'

function PasswordProtected() {
  const { code } = useParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API_URL}/auth/login/verify/${code}`, {
        password
      })
      // Redirect to original URL
      window.location.href = res.data.originalUrl
    } catch (err) {
      setError(err.response?.data?.error || 'Wrong password!')
    }
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>🔒 Password Protected</h2>
        <p style={styles.subtitle}>This link requires a password to access</p>

        {error && <p style={styles.error}>{error}</p>}

        <input
          style={styles.input}
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button
          style={styles.button}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Access Link'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex', justifyContent: 'center',
    alignItems: 'center', height: '100vh',
    backgroundColor: '#f0f2f5'
  },
  box: {
    backgroundColor: 'white', padding: '40px',
    borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '360px', display: 'flex',
    flexDirection: 'column', gap: '15px'
  },
  title: { textAlign: 'center', color: '#4f46e5', margin: 0 },
  subtitle: { textAlign: 'center', color: '#666', margin: 0, fontSize: '14px' },
  input: {
    padding: '12px', borderRadius: '6px',
    border: '1px solid #ddd', fontSize: '14px'
  },
  button: {
    padding: '12px', backgroundColor: '#4f46e5',
    color: 'white', border: 'none', borderRadius: '6px',
    fontSize: '16px', cursor: 'pointer'
  },
  error: { color: 'red', textAlign: 'center', margin: 0 }
}

export default PasswordProtected