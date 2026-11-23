
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, created_at')
      .eq('id', decoded.sub)
      .maybeSingle()

    if (error || !user) {
      return res.status(401).json({ error: 'Użytkownik nie istnieje.' })
    }

    return res.status(200).json({ user })
  } catch {
    return res.status(401).json({ error: 'Sesja wygasła.' })
  }
}
