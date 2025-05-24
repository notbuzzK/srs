<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
const supabase = useNuxtApp().$supabase;
import { useNameStore } from '~/stores/nameStore'
import { useDesignationStore } from '~/stores/designationStore'
const router = useRouter()
const toast = useToast()
let { 
  userId,
  userRole,
  designation
 } = getUserInfo()

const schema = z.object({
  email: z.string(),
  password: z.string()
})

type Schema = z.output<typeof schema>

const state = reactive({
  email: "",
  password: "",
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  let { data, error: signInError } = await supabase.auth.signInWithPassword({
    email: event.data.email,
    password: event.data.password
  });

  if (signInError) {
    console.error('Error logging in:', signInError);
    toast.add({ title: 'Login Failed!', color: 'red' });
    return;
  }
  toast.add({ title: 'Login Successful!' });

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('No user found.');
    return;
  }
  
  userId.value = user.id;
  
  await handleRoute();
}

async function handleRoute(){
  await getUserNameRoleDesignation();

  switch(userRole.value){
    case 'Faculty': router.push('/faculty/dashboard'); break;
    case 'Scheduler': router.push('/scheduler/dashboard'); break;
    case 'CEEA': router.push('/CEEA/dashboard'); break;
    case 'College Admin': router.push('/collegeAdmin/dashboard'); break;
    case 'System Admin': router.push('/systemAdmin/manageMembers'); break;
    case 'Higher Ups': router.push('/higherUps/dashboard'); break;
  }
}


async function getUserNameRoleDesignation(){
  let { data: users, error } = await supabase
    .from('users')
    .select('name, role, designation')
    .eq('user_auth_id', userId.value)
    
    if (error) {
      console.error('Error fetching user role:', error.message)
    } else if (users && users.length > 0) {
      userRole.value = users[0].role
      useNameStore().name = users[0].name
      useDesignationStore().designation = users[0].designation
      console.log('User role:', userRole.value)
      console.log('User name:', useNameStore().name)
      console.log('User designation:', useDesignationStore().designation)
      console.log(users[0])
    } else {
      console.error('No user found with the given user_auth_id')
    }
}
</script>

<template>
    <div class="flex justify-center items-center h-screen bg-[#E8F8EF]">
    <div class="bg-white p-8 rounded-lg shadow-lg w-[25%] flex flex-col justify-center items-center">
      <div class="bg-[#017C35] w-16 h-16 rounded-full flex justify-center items-center">
        <UIcon name="i-material-symbols-light-person" class="w-10 h-10 text-white" />
      </div>
      <div class="mt-4 w-[80%]">
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormGroup label="Email" name="email" class="!text-[#017C35]">
            <UInput v-model="state.email" />
          </UFormGroup>

          <UFormGroup label="Password" name="password">
            <UInput v-model="state.password" type="password" />
            <p class="text-xs text-[#16B559]">Contact Admin for login help</p>
          </UFormGroup>

          <div class="flex justify-end">
            <UButton type="submit" class="bg-[#017C35] text-white">login</UButton>
          </div>
        </UForm>
      </div>
    </div>
  </div>
</template>

