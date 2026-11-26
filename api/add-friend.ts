import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.cookies?.session

    if (!token) {
      return res.status(401).json({ error: 'Brak sesji.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const friendId = String(req.body?.friendId || '')

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(friendId)) {
      return res.status(400).json({ error: 'Nieprawidłowe ID użytkownika.' })
    }

    if (friendId === decoded.sub) {
      return res.status(400).json({ error: 'Nie możesz dodać samego siebie.' })
    }

    const { data: friend, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('id', friendId)
      .maybeSingle()

    if (findError || !friend) {
      return res.status(404).json({ error: 'Użytkownik nie istnieje.' })
    }

    const { error } = await supabase
      .from('friends')
      .insert({
        user_id: decoded.sub,
        friend_id: friendId
      })

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Ten użytkownik jest już na liście znajomych.' })
      }

      return res.status(500).json({ error: 'Nie udało się dodać znajomego.' })
    }

    return res.status(201).json({ message: 'Dodano znajomego.' })

  } catch {
    return res.status(401).json({ error: 'Sesja wygasła.' })
  }
}
