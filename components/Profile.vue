<script setup lang="ts">
const supabase = useNuxtApp().$supabase;
const router = useRouter()
const toast = useToast()

const { data: { user } } = await supabase.auth.getUser()
const userId = user?.id

const name = ref('')

async function logout (){  
  let { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error logging out:', error.message)
  } else {
    console.log('logout successful')
    toast.add({ title: 'Logout Successful!' })
    router.push('/')
  }
}

onMounted(async () => {
  const storedName = localStorage.getItem('username')
  if (!storedName) {
    await getName()
  } else {
    name.value = storedName
  }
})

async function getName() {

  let { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_auth_id', userId)

  console.log('users: ', data)
  name.value = data?.[0].name
  localStorage.setItem('username', name.value)

  if (error) {
    console.log('Error fetching name: ', error)
  } 

}

</script>
<template>
  <UPopover :popper="{ arrow: true, placement: 'bottom-start' }">
    <UIcon 
        name="i-ic-outline-account-circle" 
        @click="" 
        class="w-7 h-8 text-[#017C35]" 
    />

    <template #panel>
        <div class="p-4">
        <!-- <h1 class="border-b p-1 pl-3">{{name}}</h1> -->
        <div class="border-b">
          <editUser :user_auth_id="userId" :usedIn="'profile'"/>
        </div>
        
        <UButton
          variant="ghost"
          @click="logout"
          class="w-full font-medium cursor-pointer text-[#dd3a3a] hover:bg-[#aa2c2c21] border-b"
        >
          Logout
        </UButton>

        </div>
    </template>
  </UPopover>
</template>