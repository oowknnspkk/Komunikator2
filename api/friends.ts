import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.cookies?.session
  const secret = process.env.JWT_SECRET

  if (!token || !secret) {
    return res.status(401).json({ error: 'Brak sesji.' })
  }

  try {
    const decoded = jwt.verify(token, secret)

    if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
      return res.status(401).json({ error: 'Nieprawidłowa sesja.' })
    }

    const userId = decoded.sub

    const { data: links, error: linksError } = await supabase
      .from('friends')
      .select('user_id, friend_id')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)

    if (linksError) {
      return res.status(500).json({ error: 'Nie udało się pobrać znajomych.' })
    }

    const friendIds = [
      ...new Set(
        (links ?? [])
          .map(link => link.user_id === userId ? link.friend_id : link.user_id)
          .filter(id => id !== userId)
      ),
    ]

    if (friendIds.length === 0) {
      return res.status(200).json({ friends: [] })
    }

    const { data: friends, error: usersError } = await supabase
      .from('users')
      .select('id, username')
      .in('id', friendIds)
      .order('username')

    if (usersError) {
      return res.status(500).json({ error: 'Nie udało się pobrać znajomych.' })
    }

    return res.status(200).json({ friends })
  } catch {
    return res.status(401).json({ error: 'Sesja wygasła.' })
  }
}