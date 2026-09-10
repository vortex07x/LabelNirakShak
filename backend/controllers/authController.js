// backend/controllers/authController.js
import { createUser, findUserByEmail, comparePassword, toSafeUser } from '../models/userModel.js'
import { generateToken } from '../utils/generateToken.js'

export async function registerUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' })
    }

    const user = await createUser({ name, email, password, role })
    const token = generateToken(user.id)

    res.status(201).json({
      token,
      user: toSafeUser(user),
    })
  } catch (err) {
    next(err)
  }
}

export async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await comparePassword(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user.id)

    res.status(200).json({
      token,
      user: toSafeUser(user),
    })
  } catch (err) {
    next(err)
  }
}

export async function getCurrentUser(req, res) {
  res.status(200).json({ user: req.user })
}