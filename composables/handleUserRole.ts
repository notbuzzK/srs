import { ref } from 'vue'

let userRole = ref('')

export default function handleUserRole() {
  return { userRole }
}