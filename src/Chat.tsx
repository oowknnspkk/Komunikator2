import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

type Friend = {
  id: string
  username: string
}

type Message = {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
}

export default function Chat() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendId, setFriendId] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadFriends() {
      try {
        const response = await fetch('/api/friends', {
          credentials: 'same-origin',
        })
        const data = await response.json()

        if (!response.ok) throw new Error(data.error || 'Nie udało się pobrać znajomych.')

        const list: Friend[] = data.friends ?? []
        setFriends(list)

        if (list.length) setFriendId(list[0].id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Błąd pobierania znajomych.')
      }
    }

    void loadFriends()
  }, [])

  useEffect(() => {
    if (!friendId) {
      setMessages([])
      return
    }

    let active = true

    async function loadMessages() {
      try {
        const response = await fetch(
          `/api/messages?friendId=${encodeURIComponent(friendId)}`,
          { credentials: 'same-origin' },
        )
        const data = await response.json()

        if (!response.ok) throw new Error(data.error || 'Nie udało się pobrać wiadomości.')

        if (active) {
          setMessages(data.messages ?? [])
          setError('')
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Błąd pobierania wiadomości.')
        }
      }
    }

    void loadMessages()
    const timer = window.setInterval(() => void loadMessages(), 2000)

    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [friendId])

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!friendId || !content.trim()) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId, content }),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Nie udało się wysłać wiadomości.')

      setMessages(current => [...current, data.message])
      setContent('')
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd wysyłania wiadomości.')
    }
  }

  const selectedFriend = friends.find(friend => friend.id === friendId)

  return (
    <section className="messenger">
      <aside className="messenger-friends">
        <h2>Znajomi</h2>
        {friends.length === 0 && <p>Nie masz jeszcze znajomych.</p>}
        {friends.map(friend => (
          <button
            className={friend.id === friendId ? 'friend-button selected' : 'friend-button'}
            key={friend.id}
            type="button"
            onClick={() => setFriendId(friend.id)}
          >
            {friend.username}
          </button>
        ))}
      </aside>

      <div className="conversation">
        <h2>{selectedFriend?.username ?? 'Wybierz znajomego'}</h2>

        <div className="message-list" aria-live="polite">
          {messages.map(message => (
            <div
              className={message.sender_id === friendId ? 'message' : 'message own-message'}
              key={message.id}
            >
              <p>{message.content}</p>
              <time>{new Date(message.created_at).toLocaleTimeString('pl-PL', {
                hour: '2-digit',
                minute: '2-digit',
              })}</time>
            </div>
          ))}
        </div>

        {error && <p className="form-message" role="alert">{error}</p>}

        <form className="message-form" onSubmit={sendMessage}>
          <input
            value={content}
            onChange={event => setContent(event.target.value)}
            placeholder={friendId ? 'Napisz wiadomość…' : 'Najpierw dodaj znajomego'}
            maxLength={4000}
            disabled={!friendId}
          />
          <button className="button button-primary" disabled={!friendId || !content.trim()}>
            Wyślij
          </button>
        </form>
      </div>
    </section>
  )
}