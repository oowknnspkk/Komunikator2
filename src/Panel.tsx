
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type User = {
  id: string
  username: string
  created_at: string
}

export default function Panel() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/me', {
          method: 'GET',
          credentials: 'same-origin'
        })

        if (!response.ok) {
          navigate('/', { replace: true })
          return
        }

        const data = await response.json()

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

    checkSession()
  }, [navigate])

  async function handleLogout() {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin'
      })

      if (!response.ok) {
        throw new Error('Nie udało się wylogować.')
      }

      navigate('/', { replace: true })
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return <div className="MainApp">Ładowanie panelu...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="MainApp">
      <h1>Panel użytkownika</h1>
      <h2>Witaj, {user.username}!</h2>
      <p>ID: {user.id}</p>
      <p>
        Data utworzenia: {new Date(user.created_at).toLocaleDateString('pl-PL')}
      </p>

      <button onClick={handleLogout}>
        Wyloguj się
      </button>
    </div>
  )
}
