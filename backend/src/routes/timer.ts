import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, duration } = req.body

    if (!taskId || !duration) {
      res.status(400).json({ error: 'taskId and duration are required' })
      return
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId, userId: req.user!.userId }
    })

    if (!task) {
      res.status(404).json({ error: 'Task not found' })
      return
    }

    // check if user beat their goal
    const beatGoal = task.timeGoal
      ? duration <= task.timeGoal
      : null

    const entry = await prisma.timerEntry.create({
      data: {
        taskId,
        userId: req.user!.userId,
        duration,
        beatGoal,
      },
      include: { task: true }
    })

    res.status(201).json(entry)
  } catch (error) {
    console.error('Save timer error:', error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// ── GET /timer — get all sessions for user ────────────────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const entries = await prisma.timerEntry.findMany({
      where: { userId: req.user!.userId },
      include: { task: { select: { title: true, timeGoal: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    res.json(entries)
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// ── GET /timer/stats — aggregated stats ──────────────────────────
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const entries = await prisma.timerEntry.findMany({
      where: { userId: req.user!.userId },
      include: { task: { select: { title: true, timeGoal: true } } },
    })

    if (entries.length === 0) {
      res.json({ total: 0, avgDuration: 0, fastest: 0, goalsBeaten: 0 })
      return
    }

    const total       = entries.length
    const avgDuration = Math.floor(entries.reduce((s, e) => s + e.duration, 0) / total)
    const fastest     = Math.min(...entries.map(e => e.duration))
    const goalsBeaten = entries.filter(e => e.beatGoal === true).length

    res.json({ total, avgDuration, fastest, goalsBeaten })
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' })
  }
})

export default router