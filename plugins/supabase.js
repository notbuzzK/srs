import { createClient } from '@supabase/supabase-js'

// Use environment variables for sensitive information
const supabaseUrl = "https://mzuejdtdshubljufzmcf.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dWVqZHRkc2h1YmxqdWZ6bWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4OTMxNzYsImV4cCI6MjA1MzQ2OTE3Nn0.zNGn9QyJXRTvoAqSBlQcgRDhoJME3dnvoxTpnFBCBvo"

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Please provide Supabase URL and Key in your environment variables')
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.provide('supabase', supabase)
});