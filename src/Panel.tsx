import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Panel.css'

type User = {
  id: string
  username: string
  created_at: string
}

export default function Panel() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [logoutError, setLogoutError] = useState('')

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/me', {
          credentials: 'same-origin',
        })

        if (!response.ok) {
          navigate('/', { replace: true })
          return
        }

        const data: { user?: User } = await response.json()

        if (data.user) {
          setUser(data.user)
        } else {
          navigate('/', { replace: true })
        }
      } catch {
        navigate('/', { replace: true })
      } finally {
        setLoading(false)
      }
    }

    void checkSession()
  }, [navigate])

  async function handleLogout() {
    setLogoutError('')

    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin',
      })

      if (!response.ok) {
        throw new Error('Nie udało się wylogować.')
      }

      navigate('/', { replace: true })
    } catch {
      setLogoutError('Wylogowanie się nie powiodło. Spróbuj ponownie.')
    }
  }

  if (loading) {
    return <main className="panel-loading">Ładowanie panelu…</main>
  }

  if (!user) return null

  return (
    <main className="panel-page">
      <div className="panel-shell">
        <aside className="panel-sidebar">
          <Link className="app-brand" to="/panel">
            <span className="brand-mark brand-mark-small">K</span>
            <span>Komunikator</span>
          </Link>

          <div className="sidebar-section">
            <p className="sidebar-label">KONTO</p>
            <div className="user-card">
              <div className="user-avatar">{user.username.slice(0, 1).toUpperCase()}</div>
              <div className="user-details">
                <strong>{user.username}</strong>
                <span>Aktywne konto</span>
              </div>
            </div>
          </div>

          <div className="sidebar-section friends-section">
            <div className="section-heading">
              <p className="sidebar-label">ZNAJOMI</p>
              <button
                className="icon-button"
                type="button"
                aria-label="Dodawanie znajomych nie jest jeszcze dostępne"
                title="Ta funkcja nie jest jeszcze dostępna"
                disabled
              >
                +
              </button>
            </div>
            <p className="empty-state">Lista znajomych będzie dostępna tutaj.</p>
          </div>

          <Link className="sidebar-settings" to="/settings">Ustawienia</Link>
        </aside>

        <section className="chat-panel">
          <header className="chat-header">
            <div>
              <p className="eyebrow">TWOJE KONTO</p>
              <h1>Witaj, {user.username}</h1>
            </div>
            <button className="button button-secondary" type="button" onClick={handleLogout}>
              Wyloguj się
            </button>
          </header>

          <div className="chat-empty">
            <div className="chat-empty-icon" aria-hidden="true">✦</div>
            <h2>Twoje rozmowy</h2>
            <p>Gdy funkcja czatu będzie gotowa, rozmowy pojawią się w tym miejscu.</p>
          </div>

          {logoutError && <p className="form-message panel-error" role="alert">{logoutError}</p>}

          <footer className="account-footer">
            <span>ID: {user.id}</span>
            <span>
              Konto utworzono:{' '}
              {new Date(user.created_at).toLocaleDateString('pl-PL')}
            </span>
          </footer>
        </section>
      </div>
    </main>
  )
}