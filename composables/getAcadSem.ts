import { ref } from 'vue'

const acadYear = ref('')
const acadSem = ref('')

export default function getAcadSem() {
  return { acadYear, acadSem }
}