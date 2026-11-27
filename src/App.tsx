
import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import Reklama from './assets/F3MEGC.gif'
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
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const isRegister = page === 'register'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (loading) return

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch(
        isRegister ? '/api/register' : '/api/login',
        {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        },
      )

      const data: ApiResponse = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Wystąpił błąd.')
      }

      if (isRegister) {
        setPassword('')
        setPage('login')
        setSuccess('Konto utworzone. Możesz się teraz zalogować.')
        return
      }

      if (!data.user) {
        throw new Error('Nie udało się zalogować.')
      }

      setPassword('')
      navigate('/panel')
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Wystąpił nieznany błąd.',
      )
    } finally {
      setLoading(false)
    }
  }

  function switchPage() {
    setError('')
    setSuccess('')
    setPassword('')
    setPage(isRegister ? 'login' : 'register')
  }

  return (
    <main className="auth-page">
      <div className="ads">
        <div className="advertisement1">
          <img src={Reklama} alt="Reklama" />
        </div>

        <div className="advertisement2">
          
        </div>
      </div>

      <section className="auth-card">
        <div className="brand-mark" aria-hidden="true">
          K
        </div>

        <p className="eyebrow">Komunikator bez nazwy</p>

        <h1>
          {isRegister ? 'Utwórz konto' : 'Witaj ponownie'}
        </h1>

        <p className="auth-description">
          {isRegister
            ? 'Dołącz do rozmowy.'
            : 'Zaloguj się, aby kontynuować.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="username">
            Nazwa użytkownika
          </label>

          <input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="np. user_123"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            minLength={3}
            maxLength={24}
            required
            disabled={loading}
          />

          <label htmlFor="password">
            Hasło
          </label>

          <input
            id="password"
            type="password"
            autoComplete={
              isRegister ? 'new-password' : 'current-password'
            }
            placeholder="Wpisz hasło"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={isRegister ? 8 : undefined}
            maxLength={128}
            required
            disabled={loading}
          />

          <button
            className="button button-primary"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Proszę czekać…'
              : isRegister
                ? 'Zarejestruj się'
                : 'Zaloguj się'}
          </button>
        </form>

        {error && (
          <p className="form-message" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="success-message" role="status">
            {success}
          </p>
        )}

        <p className="auth-switch">
          {isRegister
            ? 'Masz już konto?'
            : 'Nie masz jeszcze konta?'}

          <button
            className="text-button"
            type="button"
            onClick={switchPage}
            disabled={loading}
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
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
