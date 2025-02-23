// plugins/supabase.js
import { createClient } from "@supabase/supabase-js";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const supabaseUrl = config.public.SUPABASE_URL;
  const supabaseKey = config.public.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Please provide Supabase URL and Supabase Key');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  return {
    provide: {
      supabase,
    },
  };
});
