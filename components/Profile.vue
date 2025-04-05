<script setup lang="ts">
const supabase = useNuxtApp().$supabase;
const router = useRouter()
const toast = useToast()
import { getUserInfo } from '~/composables/getUserInfo';

const { userId } = getUserInfo()

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

const getName = async () => {
  let { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_auth_id', userId.value)

  if (error) {
    console.error('Error fetching users:', error.message)
  } else {
    console.log('users: ', users)
    // set the form values
    name.value = users[0].name
  }
}

onMounted(async () => {
  getName()
})

</script>
<template>
  <UPopover :popper="{ arrow: true, placement: 'bottom-start' }">
    <UIcon 
        name="i-ic-round-account-circle" 
        @click="" 
        class="w-8 h-8 text-center  text-[#017C35]" 
    />

    <template #panel>
        <div class="p-4">
        <h1 class="border-b">{{name}}</h1>
        <editUser :user_auth_id="userId" />
        
        <UButton
          variant="ghost"
          @click="logout"
          class="w-full font-medium cursor-pointer text-[#017C35] border-b"
        >
          Logout
        </UButton>

        </div>
    </template>
  </UPopover>
</template>