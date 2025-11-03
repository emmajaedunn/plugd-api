import { Router } from 'express'
import admin from 'firebase-admin'
const db = admin.firestore()
const router = Router()

router.get('/:uid', async (req, res) => {
  const doc = await db.collection('users').doc(req.params.uid).get()
  if (!doc.exists) return res.status(404).json({ error: 'Not found' })
  res.json({ id: doc.id, ...doc.data() })
})

router.post('/:uid/follow', async (req, res) => {
  const me = req.user.uid
  const target = req.params.uid
  if (me === target) return res.status(400).json({ error: 'Cannot follow yourself' })
  const batch = db.batch()
  const f1 = db.collection('follows').doc(`${me}->${target}`)
  batch.set(f1, { follower: me, following: target, ts: Date.now() })
  batch.commit().then(() => res.status(204).end())
  .catch(e => res.status(500).json({ error: e.message }))
})

export default router
