
import { useEffect, useState } from 'react'
import './App.css'

type User = {
  id: string
  username: string
  created_at: string
}

type Page = 'register' | 'login' | 'panel'

type RequestMethod = 'GET' | 'POST'

type ApiResponse = {
  user?: User
  error?: string
  message?: string
}

export default function App() {
  const [page, setPage] = useState<Page>('register')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function request(
    url: string,
    method: RequestMethod = 'POST',
    body?: Record<string, string>
  ): Promise<ApiResponse> {
    const response = await fetch(url, {
      method,
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

  function getErrorMessage(err: unknown): string {
    return err instanceof Error ? err.message : 'Wystąpił nieznany błąd.'
  }

  async function checkSession() {
    try {
      const data = await request('/api/me', 'GET')

      if (data.user) {
        setUser(data.user)
        setPage('panel')
      }
    } catch {
      setUser(null)
      setPage('register')
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  async function handleRegister() {
    setError('')
    setLoading(true)

    try {
      await request('/api/register', 'POST', {
        username,
        password
      })

      setPassword('')
      setPage('login')
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin() {
    setError('')
    setLoading(true)

    try {
      const data = await request('/api/login', 'POST', {
        username,
        password
      })

      if (data.user) {
        setUser(data.user)
        setPage('panel')
        setPassword('')
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    setError('')
    setLoading(true)

    try {
      await request('/api/logout')
      setUser(null)
      setPage('login')
      setPassword('')
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (page === 'panel' && user) {
    return (
      <div className="MainApp">
        <h1>Panel użytkownika</h1>
        <h2>Witaj, {user.username}!</h2>
        <p>ID: {user.id}</p>
        <p>
          Data utworzenia: {new Date(user.created_at).toLocaleDateString('pl-PL')}
        </p>

        <button onClick={handleLogout} disabled={loading}>
          {loading ? 'Proszę czekać...' : 'Wyloguj się'}
        </button>

        {error && <p className="error">{error}</p>}
      </div>
    )
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

      <button
        onClick={page === 'register' ? handleRegister : handleLogin}
        disabled={loading}
      >
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
