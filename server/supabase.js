const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true })
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true })

const { createClient } = require('@supabase/supabase-js')

const url = process.env.SUPABASE_URL
const anonKey = process.env.SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_KEY

const memory = {}

const storage = {
  getItem: function (key) {
    if (memory[key]) {
      return memory[key]
    }
    return null
  },
  setItem: function (key, value) {
    memory[key] = value
  },
  removeItem: function (key) {
    delete memory[key]
  }
}

const supabase = createClient(url, anonKey, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    detectSessionInUrl: false,
    autoRefreshToken: false,
    storageKey: 'wc-auth',
    storage: storage
  }
})

const supabaseAuth = createClient(url, anonKey, {
  auth: {
    persistSession: false,
    detectSessionInUrl: false,
    autoRefreshToken: false
  }
})

const supabaseAdmin = createClient(url, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

module.exports = {
  supabase: supabase,
  supabaseAuth: supabaseAuth,
  supabaseAdmin: supabaseAdmin,
  memory: memory
}
