
import { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import './App.css'
import Panel from './Panel'

type ApiResponse = {
  user?: {
    id: string
    username: string
    created_at: string
  }
  error?: string
  message?: string
}

function LoginPage() {
  const navigate = useNavigate()

  const [page, setPage] = useState<'register' | 'login'>('register')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function request(url: string, body?: Record<string, string>) {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {})
    })

    const data: ApiResponse = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Wystąpił błąd.')
    }

    return data
  }

  async function handleSubmit() {
    setError('')
    setLoading(true)

    try {
      if (page === 'register') {
        await request('/api/register', { username, password })
        setPassword('')
        setPage('login')
      } else {
        const data = await request('/api/login', { username, password })

        if (data.user) {
          setPassword('')
          navigate('/panel')
        } else {
          setError('Nie udało się zalogować.')
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="MainApp">
      <h1>{page === 'register' ? 'Rejestracja' : 'Logowanie'}</h1>

      <input
        type="text"
        placeholder="Nazwa użytkownika"
        value={username}
        onChange={e => setUsername(e.target.value)}
        maxLength={24}
      />

      <input
        type="password"
        placeholder="Hasło"
        value={password}
        onChange={e => setPassword(e.target.value)}
        maxLength={128}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading
          ? 'Proszę czekać...'
          : page === 'register'
            ? 'Zarejestruj się'
            : 'Zaloguj się'}
      </button>

      <p>
        {page === 'register' ? 'Masz już konto?' : 'Nie masz konta?'}
      </p>

      <button
        onClick={() => {
          setError('')
          setPage(page === 'register' ? 'login' : 'register')
        }}
      >
        {page === 'register'
          ? 'Przejdź do logowania'
          : 'Przejdź do rejestracji'}
      </button>

      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/panel" element={<Panel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
