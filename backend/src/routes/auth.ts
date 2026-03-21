// backend/src/routes/auth.ts

import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'

import { prisma } from '../lib/prisma'
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} from '../lib/jwt'

const router = Router() 

router.post('/register', async (req: Request, res: Response) => {
    try{
        const { email, password } = req.body 

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' })
            return
        }

        if (password.length < 6 ) {
            res.status(400).json({ error: 'Password must be at least 6 characters' })
            return
        }

        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            res.status(400).json({ error: 'Email already registered' })
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: { email, password: hashedPassword }
        })

        const accessToken = generateAccessToken({ userId: user.id })
        const refreshToken = generateRefreshToken({ userId: user.id })

        res.status(201).json({
            message: 'Account created successfully',
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email }
        })
    } catch (error) {
        console.log('Register error:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/login', async (req: Request, res: Response) => {
    try{
        const { email, password } = req.body

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' })
            return
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' })
            return
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid credentials' })
            return
        }

        const accessToken = generateAccessToken({ userId: user.id })
        const refreshToken = generateRefreshToken({ userId: user.id })

        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: { id: user.id , email: user.email }
        })
    } catch (error) {
        console.error('Login error: ', error)
        res.status(500).json({ error: 'Internal server error '})
    }
})

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token required' })
      return
    }

    const payload = verifyRefreshToken(refreshToken)

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) {
      res.status(401).json({ error: 'User not found' })
      return
    }

    const newAccessToken = generateAccessToken({ userId: user.id })

    res.json({ accessToken: newAccessToken })
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired refresh token' })
  }
})

router.post('/logout', (_req: Request, res: Response) => {
    res.json({ message: 'Logged out successfully' })
})

export default router