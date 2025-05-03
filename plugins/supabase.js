import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(nuxtApp => {

  const config = useRuntimeConfig(); // dapat dito

  const supabaseUrl = config.public?.supabaseUrl
  const supabaseKey = config.public?.supabaseKey

  const supabase = createClient(supabaseUrl, supabaseKey)

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Please provide Supabase URL and Key in your environment variables')
  }
  
  nuxtApp.provide('supabase', supabase)
});
// kapag sinasabi na bawal mag lagay ng composable sa labas ng lifescyle, pasok mo lang sa loob ng exportdefault function