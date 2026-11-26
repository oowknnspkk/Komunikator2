
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.cookies?.session

    if (!token) {
      return res.status(401).json({ error: 'Brak sesji.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const username = String(req.query.username || '').trim().toLowerCase()

    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
      return res.status(400).json({ error: 'Nieprawidłowa nazwa użytkownika.' })
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username')
      .eq('username', username)
      .maybeSingle()

    if (error) {
      return res.status(500).json({ error: 'Błąd wyszukiwania.' })
    }

    if (!user) {
      return res.status(404).json({ error: 'Nie znaleziono użytkownika.' })
    }

    if (user.id === decoded.sub) {
      return res.status(400).json({ error: 'Nie możesz dodać samego siebie.' })
    }

    return res.status(200).json({ user })
  } catch {
    return res.status(401).json({ error: 'Sesja wygasła.' })
  }
}
