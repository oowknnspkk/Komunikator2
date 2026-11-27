import { useEffect, useState, useRef } from 'react'
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
  const [friendUsername, setFriendUsername] = useState('')
  const [error, setError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [addingFriend, setAddingFriend] = useState(false)
  const endOfMessagesRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!friendId || !content.trim() || isSending) return

    setIsSending(true)

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId, content }),
      })
      const data: { message?: Message; error?: string } = await response
        .json()
        .catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.error || `Serwer zwrócił błąd (${response.status}). Sprawdź konfigurację API.`,
        )
      }

      if (!data.message) {
        throw new Error('Serwer nie zwrócił wysłanej wiadomości.')
      }

      setMessages(current => [...current, data.message!])
      setContent('')
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd wysyłania wiadomości.')
    } finally {
      setIsSending(false)
    }
  }

  async function addFriend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const username = friendUsername.trim()
    if (!username || addingFriend) return

    setAddingFriend(true)

    try {
      const searchResponse = await fetch(
        `/api/search-user?username=${encodeURIComponent(username)}`,
        { credentials: 'same-origin' },
      )
      const searchData = await searchResponse.json()

      if (!searchResponse.ok) {
        throw new Error(searchData.error || 'Nie udało się znaleźć użytkownika.')
      }

      const friend: Friend = searchData.user

      const addResponse = await fetch('/api/add-friend', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: friend.id }),
      })
      const addData = await addResponse.json()

      if (!addResponse.ok) {
        throw new Error(addData.error || 'Nie udało się dodać znajomego.')
      }

      setFriends(current =>
        current.some(item => item.id === friend.id)
          ? current
          : [...current, friend].sort((a, b) => a.username.localeCompare(b.username)),
      )
      setFriendId(friend.id)
      setFriendUsername('')
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd dodawania znajomego.')
    } finally {
      setAddingFriend(false)
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
          <div ref={endOfMessagesRef} />
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
          <button className="button button-primary" disabled={!friendId || !content.trim() || isSending}>
            {isSending ? 'Wysyłanie...' : 'Wyślij'}
          </button>
        </form>

        <form className="add-friend-form" onSubmit={addFriend}>
          <input
            value={friendUsername}
            onChange={event => setFriendUsername(event.target.value)}
            placeholder="Dodaj znajomego po nazwie użytkownika"
            maxLength={100}
          />
          <button className="button button-secondary" disabled={addingFriend}>
            {addingFriend ? 'Dodawanie...' : 'Dodaj znajomego'}
          </button>
        </form>
      </div>
    </section>
  )
}