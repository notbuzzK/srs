import { ref } from 'vue'

const userId = ref('')
const userRole = ref('')
const user_auth_id = ref('')
const designation = ref('')

export function getUserInfo() {
  return { userId, userRole, user_auth_id, designation } 
}