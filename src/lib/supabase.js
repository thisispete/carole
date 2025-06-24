import { createClient } from '@supabase/supabase-js'



// These will come from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug: Log environment variable status
console.log('🔧 Supabase Config Check:')
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing VITE_SUPABASE_URL')
console.log('Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing VITE_SUPABASE_ANON_KEY')

// Only create client if we have valid credentials
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null



// Test connection function (simplified for RLS disabled)
export async function testConnection() {
  if (!supabase) {
    console.error('❌ Supabase client not initialized - check environment variables')
    return { success: false, error: 'Missing environment variables' }
  }

  try {
    // Simple connection test - just check if we can reach Supabase
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Supabase connection error:', error)
      return { success: false, error: error.message }
    }
    
    // Check if user is authenticated (optional info since RLS is disabled)
    console.log('🔐 Auth session:', data.session ? 'Logged in' : 'Not logged in (but RLS disabled)')
    if (data.session) {
      console.log('👤 User ID:', data.session.user.id)
    }
    
    console.log('✅ Supabase connected successfully!')
    return { success: true, data: 'Connection verified' }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('❌ Supabase connection failed:', err)
    return { success: false, error: errorMessage }
  }
} 