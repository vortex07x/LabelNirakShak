// backend/middleware/uploadMiddleware.js
import multer from 'multer'

const storage = multer.memoryStorage() // keep in memory for now; swap to disk/cloud storage later

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPEG, PNG, or WEBP images are allowed'), false)
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB max
})