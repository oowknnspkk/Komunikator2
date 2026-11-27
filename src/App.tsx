import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import './App.css'
import Panel from './Panel'
import Settings from './Settings'
import { ThemeProvider } from './ThemeContext'

type ApiResponse = {
  user?: {
    id: string
    username: string
    created_at: string
  }
  error?: string
}

function LoginPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState<'register' | 'login'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const isRegister = page === 'register'
      const response = await fetch(
        isRegister ? '/api/register' : '/api/login',
        {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        },
      )

      const data: ApiResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Wystąpił błąd.')
      }

      setPassword('')

      if (isRegister) {
        setPage('login')
        setError('Konto utworzone. Możesz się teraz zalogować.')
      } else if (data.user) {
        navigate('/panel')
      } else {
        setError('Nie udało się zalogować.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd.')
    } finally {
      setLoading(false)
    }
  }

  const isRegister = page === 'register'

  return (
    <div className="ads">

            <div className="advertisment1">
      <img src="" alt="" />

      </div>

      <div className="advertisment2">
        <img src="" alt="" />
        
      </div>
    </div>
    <main className="auth-page">

      <section className="auth-card">
        <div className="brand-mark" aria-hidden="true">K</div>
        <p className="eyebrow">Komunikator bez nazwy</p>
        <h1>{isRegister ? 'Utwórz konto' : 'Witaj ponownie'}</h1>
        <p className="auth-description">
          {isRegister ? 'Dołącz do rozmowy.' : 'Zaloguj się, aby kontynuować.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Nazwa użytkownika</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="np. cwel_123"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            minLength={3}
            maxLength={24}
            required
          />

          <label htmlFor="password">Hasło</label>
          <input
            id="password"
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            placeholder="Wpisz hasło"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            maxLength={128}
            required
          />

          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? 'Proszę czekać…' : isRegister ? 'Zarejestruj się' : 'Zaloguj się'}
          </button>
        </form>

        {error && <p className="form-message" role="status">{error}</p>}

        <p className="auth-switch">
          {isRegister ? 'Masz już konto?' : 'Nie masz jeszcze konta?'}
          <button
            className="text-button"
            type="button"
            onClick={() => {
              setError('')
              setPage(isRegister ? 'login' : 'register')
            }}
          >
            {isRegister ? 'Zaloguj się' : 'Utwórz konto'}
          </button>
        </p>
      </section>
    </main>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/panel" element={<Panel />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}