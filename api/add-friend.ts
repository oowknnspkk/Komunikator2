import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.cookies?.session
  const secret = process.env.JWT_SECRET

  if (!token || !secret) {
    return res.status(401).json({ error: 'Brak sesji.' })
  }

  let userId: string

  try {
    const decoded = jwt.verify(token, secret)

    if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
      return res.status(401).json({ error: 'Nieprawidłowa sesja.' })
    }

    userId = decoded.sub
  } catch {
    return res.status(401).json({ error: 'Sesja wygasła.' })
  }

  const friendId = req.body?.friendId

  if (
    typeof friendId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(friendId)
  ) {
    return res.status(400).json({ error: 'Nieprawidłowe ID użytkownika.' })
  }

  if (friendId === userId) {
    return res.status(400).json({ error: 'Nie możesz dodać samego siebie.' })
  }

  const { data: friend, error: findError } = await supabase
    .from('users')
    .select('id')
    .eq('id', friendId)
    .maybeSingle()

  if (findError) {
    return res.status(500).json({ error: 'Błąd wyszukiwania użytkownika.' })
  }

  if (!friend) {
    return res.status(404).json({ error: 'Nie znaleziono użytkownika.' })
  }

  const { error } = await supabase.from('friends').insert({
    user_id: userId,
    friend_id: friendId,
  })

  if (error) {
    return res.status(400).json({ error: 'Nie udało się dodać znajomego.' })
  }

  return res.status(201).json({ message: 'Dodano znajomego.' })
}
