import { createClient } from '@supabase/supabase-js'

// Mengambil variabel lingkungan yang sudah didefinisikan di file .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

// Inisialisasi client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)