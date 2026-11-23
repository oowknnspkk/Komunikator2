
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Panel.css';

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
        <div className="MainPanel">
           
            <h2 styles={{ color: '#333' }}>Witaj, {user.username}!</h2>
            <p styles={{ color: '#666' }}>ID: {user.id}</p>
            <p styles={{ color: '#999' }}>
                Data utworzenia: {new Date(user.created_at).toLocaleDateString('pl-PL')}
            </p>

            <button onClick={handleLogout}>
                Wyloguj się
            </button>

            <div className="Panel-container">

                <aside className="Panel-lewy">
                    <h3>Znajomi</h3>

                    <ul>
                        <li><button>Example</button></li>
                        <li><button>Example</button></li>
                        <li><button>Example</button></li>
                    </ul>
                </aside>

                <main className="MainPanel">

                    <header className="Panel-header">
                        <div>
                            <h1>Panel użytkownika</h1>
                            <p>Witaj, {user.username}!</p>
                        </div>

                        <button onClick={handleLogout}>
                            Wyloguj się
                        </button>
                    </header>

                    <section className="Chat-area">
                        <div className="Messages">
                            {/* Tutaj będą wiadomości */}
                        </div>

                        <div className="Message-input">
                            <input placeholder="Wpisz wiadomość..." />
                            <button>Wyślij</button>
                        </div>
                    </section>

                </main>

            </div>
        </div>


    )
}
