import { useEffect, useMemo, useState } from 'react'
import { Minus, Plus, RotateCw, Maximize2 } from 'lucide-react'
import ScanPackagePreview from './ScanPackagePreview.jsx'

export default function UploadedImagePanel({ file }) {
  const [zoom, setZoom] = useState(1)
  const [spin, setSpin] = useState(0)
  const imageUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="mb-3 text-xs font-medium text-[var(--color-text-dim)]">
        {file ? `Uploaded Image: ${file.name}` : 'Uploaded Image'}
      </p>

      <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-lg border border-[var(--color-border)] bg-[#0a1120]">
        <div
          className="transition-transform duration-200"
          style={{ transform: `scale(${zoom}) rotate(${spin}deg)` }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={file.name} className="max-h-72 max-w-full object-contain" />
          ) : (
            <ScanPackagePreview className="h-72 w-auto" />
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-dim)] hover:bg-white/5"
          aria-label="Zoom out"
        >
          <Minus size={15} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.min(1.8, +(z + 0.15).toFixed(2)))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-dim)] hover:bg-white/5"
          aria-label="Zoom in"
        >
          <Plus size={15} />
        </button>
        <button
          onClick={() => setSpin((s) => s + 90)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-dim)] hover:bg-white/5"
          aria-label="Rotate"
        >
          <RotateCw size={15} />
        </button>
        <button
          onClick={() => { setZoom(1); setSpin(0) }}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-dim)] hover:bg-white/5"
          aria-label="Reset view"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  )
}