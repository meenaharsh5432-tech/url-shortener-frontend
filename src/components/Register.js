import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

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
      await axios.post('http://localhost:5000/auth/register', {
        username,
        email,
        password
      })
      console.log('Registration successful!')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    }
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>🔗 URL Shortener</h2>
        <h3 style={styles.subtitle}>Create Account</h3>

        {error && <p style={styles.error}>{error}</p>}

        <input
          style={styles.input}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          style={styles.button}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p style={styles.link}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
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
  subtitle: { textAlign: 'center', color: '#333', margin: 0 },
  input: {
    padding: '12px', borderRadius: '6px',
    border: '1px solid #ddd', fontSize: '14px'
  },
  button: {
    padding: '12px', backgroundColor: '#4f46e5',
    color: 'white', border: 'none', borderRadius: '6px',
    fontSize: '16px', cursor: 'pointer'
  },
  error: { color: 'red', textAlign: 'center', margin: 0 },
  link: { textAlign: 'center', margin: 0 }
}

export default Register