import supabase from "~/plugins/supabase"

export function useLogin() {
  const login = async (email: string, password: string) => {
    try {
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in:', error)
    }
  }
  return { login }
}

export const signup = async (data: any) => {
  try {
    const { user, error } = await supabase.auth.signUp({
      email: 'user@example.com',
      password: 'password123',
    });
    if (error) throw error
  } catch (error) {
    console.error('Error signing up:', error)
  }
}