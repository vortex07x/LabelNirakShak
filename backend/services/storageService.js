// backend/services/storageService.js
import { supabase } from '../config/supabaseClient.js'
import { randomUUID } from 'crypto'

const BUCKET = 'package-images'

export async function uploadPackageImage(fileBuffer, originalname, mimetype) {
  const ext = originalname.split('.').pop()
  const path = `${randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, fileBuffer, { contentType: mimetype, upsert: false })

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`)
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return publicUrlData.publicUrl
}