import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 8 // must match backend Multer limit in uploadMiddleware.js
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export default function UploadPanel() {
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function validateFile(file) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please upload a JPG, PNG, or WEBP image.'
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File is too large. Max size is ${MAX_SIZE_MB}MB.`
    }
    return null
  }

  function handleFiles(files) {
    if (!files || !files[0]) return
    const file = files[0]
    setError('')

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      setFileName(null)
      setPreviewUrl(null)
      return
    }

    setFileName(file.name)
    setPreviewUrl(URL.createObjectURL(file))

    if (!user) {
      // Not logged in — send to login first, but remember the file's not preserved
      // across a full redirect, so just prompt clearly instead of silently losing it.
      setError('Please log in to run a scan. Redirecting…')
      setTimeout(() => navigate('/login'), 1200)
      return
    }

    navigate('/scan', { state: { file } })
  }

  return (
    <section className="mx-auto max-w-4xl px-6 -mt-4 pb-16">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
          dragging ? 'border-[var(--color-accent-light)] bg-[var(--color-accent)]/10' : 'border-[var(--color-border-strong)] bg-[var(--color-surface)]/60'
        }`}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`Preview of ${fileName}`}
            className="h-36 w-36 rounded-xl border border-[var(--color-border-strong)] object-contain"
          />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-accent)]/12 text-[var(--color-accent-light)]">
            <UploadCloud size={26} strokeWidth={1.75} />
          </span>
        )}
        <p className="mt-4 font-display text-base font-bold">
          {fileName ? `Selected: ${fileName}` : 'Drag & Drop Product Image Here'}
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-faint)]">JPG, PNG, WEBP up to {MAX_SIZE_MB}MB</p>

        {error && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[var(--color-bad)]">
            <AlertCircle size={13} /> {error}
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-5 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-light)] transition-colors"
        >
          Choose File
        </button>
      </div>
    </section>
  )
}