// backend/src/routes/tasks.ts

import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

router.use(authenticate)

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query['page'] as string) || 1
    const limit = parseInt(req.query['limit'] as string) || 10
    const skip = (page - 1) * limit

    const status = req.query['status'] as string | undefined
    const search = req.query['search'] as string | undefined

    const where = {
      userId: req.user!.userId,
      ...(status && { status }),
      ...(search && { title: { contains: search } }),
    }

    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ])

    res.json({
      tasks,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Get tasks error:', error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, status, timeGoal } = req.body
    // timeGoal is in seconds — e.g. 3600 = 1 hour, 7200 = 2 hours

    if (!title || title.trim() === '') {
      res.status(400).json({ error: 'Title is required' })
      return
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status: status || 'pending',
        timeGoal: timeGoal ? parseInt(timeGoal) : null, // ← added
        userId: req.user!.userId,
      }
    })

    res.status(201).json(task)
  } catch (error) {
    console.error('Create task error:', error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const task = await prisma.task.findUnique({
      where: {
        id: req.params['id'] as string,
        userId: req.user!.userId,
      }
    })

    if (!task) {
      res.status(404).json({ error: 'Task not found' })
      return
    }

    res.json(task)
  } catch (error) {
    console.error('Get task error:', error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.task.findUnique({
      where: {
        id: req.params['id'] as string,
        userId: req.user!.userId,
      }
    })

    if (!existing) {
      res.status(404).json({ error: 'Task not found' })
      return
    }

    const { title, description, status, timeGoal } = req.body
    // timeGoal can be updated or cleared (set to null)

    const validStatuses = ['pending', 'in_progress', 'done']
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Status must be pending, in_progress, or done' })
      return
    }

    const task = await prisma.task.update({
      where: { id: req.params['id'] as string },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status && { status }),
        ...(timeGoal !== undefined && {
          timeGoal: timeGoal ? parseInt(timeGoal) : null  // ← added
        }),
      }
    })

    res.json(task)
  } catch (error) {
    console.error('Update task error:', error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.task.findUnique({
      where: {
        id: req.params['id'] as string,
        userId: req.user!.userId,
      }
    })

    if (!existing) {
      res.status(404).json({ error: 'Task not found' })
      return
    }

    await prisma.task.delete({
      where: { id: req.params['id'] as string }
    })

    res.status(204).send()
  } catch (error) {
    console.error('Delete task error:', error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

router.patch('/:id/toggle', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.task.findUnique({
      where: {
        id: req.params['id'] as string,
        userId: req.user!.userId,
      }
    })

    if (!existing) {
      res.status(404).json({ error: 'Task not found' })
      return
    }

    const newStatus = existing.status === 'done' ? 'pending' : 'done'

    const task = await prisma.task.update({
      where: { id: req.params['id'] as string },
      data: { status: newStatus }
    })

    res.json(task)
  } catch (error) {
    console.error('Toggle task error:', error)
    res.status(500).json({ error: 'Something went wrong' })
  }
})

export default router