import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const isId = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
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

  const friendId = String(
    req.method === 'GET' ? req.query.friendId ?? '' : req.body?.friendId ?? ''
  )

  if (!isId(friendId) || friendId === userId) {
    return res.status(400).json({ error: 'Nieprawidłowy znajomy.' })
  }

  const { data: friendship, error: friendshipError } = await supabase
    .from('friends')
    .select('user_id')
    .or(
      `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`
    )
    .limit(1)
    .maybeSingle()

  if (friendshipError) {
    return res.status(500).json({ error: 'Nie udało się sprawdzić znajomości.' })
  }

  if (!friendship) {
    return res.status(403).json({ error: 'Ta osoba nie jest na liście znajomych.' })
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('messages')
      .select('id, sender_id, recipient_id, content, created_at')
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${friendId}),and(sender_id.eq.${friendId},recipient_id.eq.${userId})`
      )
      .order('created_at', { ascending: true })
      .limit(200)

    if (error) {
      return res.status(500).json({ error: 'Nie udało się pobrać wiadomości.' })
    }

    return res.status(200).json({ messages: data ?? [] })
  }

  const content =
    typeof req.body?.content === 'string' ? req.body.content.trim() : ''

  if (!content || content.length > 4000) {
    return res.status(400).json({ error: 'Wiadomość musi mieć od 1 do 4000 znaków.' })
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: userId,
      recipient_id: friendId,
      content,
    })
    .select('id, sender_id, recipient_id, content, created_at')
    .single()

  if (error) {
    return res.status(500).json({ error: 'Nie udało się wysłać wiadomości.' })
  }

  return res.status(201).json({
    message: data ? { ...data, content } : data,
  })
}