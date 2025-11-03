import { Router } from 'express'
import admin from 'firebase-admin'
const db = admin.firestore()
const router = Router()

router.get('/', async (req, res) => {
  const snap = await db.collection('events').orderBy('createdAt', 'desc').get()
  res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })))
})

router.post('/', async (req, res) => {
  const uid = req.user.uid
  const body = req.body || {}
  const doc = await db.collection('events').add({
    ...body,
    ownerUid: uid,
    createdAt: Date.now()
  })
  const created = await doc.get()
  res.status(201).json({ id: doc.id, ...created.data() })
})

export default router
