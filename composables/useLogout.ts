const router = useRouter()
const toast = useToast()

export const useLogout = () => {
  console.log("Logging out")
  toast.add({ title: 'Hello world!' })
  router.push('/')
}