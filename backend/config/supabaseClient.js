// backend/config/supabaseClient.js
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config() // same load-order safeguard as db.js

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)