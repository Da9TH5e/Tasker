// backend/src/index.ts

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import taskRoutes from './routes/tasks'
import timerRoutes from './routes/timer'

dotenv.config()

const app = express()

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://tasker-eight-wine.vercel.app',
  ],
  credentials: true,
}))

app.use(express.json())
app.use('/auth', authRoutes)
app.use('/tasks', taskRoutes)
app.use('/timer', timerRoutes)

app.get('/', (_req, res) => {
  res.json({ message: 'Task Management API is running!' })
})

export default app