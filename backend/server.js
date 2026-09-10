// backend/server.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'
import authRoutes from './routes/authRoutes.js'
import inspectionRoutes from './routes/inspectionRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import ruleRoutes from './routes/ruleRoutes.js'
import productRoutes from './routes/productRoutes.js'

dotenv.config()
connectDB()

const app = express()

app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'PackCheck API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/inspections', inspectionRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/rules', ruleRoutes)
app.use('/api/products', productRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))