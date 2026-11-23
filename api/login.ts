
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username, password } = req.body || {}

  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    username.length > 24 ||
    password.length > 128
  ) {
    return res.status(400).json({ error: 'Nieprawidłowe dane.' })
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, password_hash')
    .eq('username', username.toLowerCase())
    .maybeSingle()

  if (error || !user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Nieprawidłowa nazwa użytkownika lub hasło.' })
  }

  const token = jwt.sign(
    { sub: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.setHeader(
    'Set-Cookie',
    `session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
  )

  return res.status(200).json({
    message: 'Zalogowano.',
    user: {
      id: user.id,
      username: user.username
    }
  })
}
