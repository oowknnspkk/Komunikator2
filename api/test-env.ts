import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    supabaseUrl: Boolean(process.env.SUPABASE_URL),
    supabaseKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    jwtSecret: Boolean(process.env.JWT_SECRET)
  })
}
