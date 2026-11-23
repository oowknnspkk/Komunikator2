
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

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
    !/^[a-zA-Z0-9_]{3,24}$/.test(username) ||
    password.length < 8 ||
    password.length > 128
  ) {
    return res.status(400).json({ error: 'Nieprawidłowa nazwa lub hasło (hasło: 8–128 znaków).' })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const { error } = await supabase
    .from('users')
    .insert({
      username: username.toLowerCase(),
      password_hash: passwordHash
    })

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ta nazwa użytkownika jest zajęta.' })
    }

    return res.status(500).json({ error: 'Nie udało się utworzyć konta.' })
  }

  return res.status(201).json({ message: 'Konto utworzone.' })
}
