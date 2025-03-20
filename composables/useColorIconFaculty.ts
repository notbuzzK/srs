import { ref } from "vue";

const selectedIcon = ref('')

export default function useColorIconFaculty() {
  return { selectedIcon }
}