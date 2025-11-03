import express from 'express'
import cors from 'cors'
import admin from 'firebase-admin'
import eventsRoutes from './routes/events.js'
import profileRoutes from './routes/profile.js'

/** Firebase Admin init via env vars (no file path needed) */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  })
}

const app = express()
app.use(cors())
app.use(express.json())

/** Auth middleware: verifies Firebase ID token */
async function auth(req, res, next) {
  try {
    const hdr = req.headers.authorization || ''
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Missing token' })
    req.user = await admin.auth().verifyIdToken(token)
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

/** Mount routes (protect what needs auth) */
app.get('/health', (_, res) => res.json({ ok: true }))
app.use('/api/events', auth, eventsRoutes)
app.use('/api/profile', auth, profileRoutes)

const port = process.env.PORT || 3000
app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on ${port}`)
})
