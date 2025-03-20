<script setup lang="ts">
const supabase = useNuxtApp().$supabase;
const router = useRouter()
const toast = useToast()

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
        <h1 class="border-b">Name example</h1>
        <h1 class="border-b">Update Info</h1>
        <h1 class="border-b">Update Password</h1>
        <UButton @click="logout">Logout</UButton>

        </div>
    </template>
  </UPopover>
</template>