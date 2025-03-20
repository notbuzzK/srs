import { ref } from 'vue'

const userId = ref('')

export default function getUserId() {
  return { userId } 
}