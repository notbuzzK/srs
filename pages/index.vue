<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
const supabase = useNuxtApp().$supabase;

const router = useRouter()

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
  let { data, error } = await supabase.auth.signInWithPassword({
  email: event.data.email,
  password: event.data.password
  })

  if (error) {
    console.error('Error logging in:', error);
  } else {
    console.log('login successful', data);
  }
}
async function getUsers() {
  let { data, error } = await supabase
  .from('users')
  .select('*') 
  .ilike('name', 'sup dude');
// TODO: make this dynamic

  if (error) {
    console.error('Error fetching user:', error);
  } else {
    console.log('User data:', data);
  }
}

async function testUploadCourse() {
  // Replace these values with the actual data you want to insert
  const newCourse = {
    course_code: 'CS101',
    course_title: 'Introduction to Computer Science',
    units: 3,
    hours: 40,
    section: 'A'
  };

  // Upload the new course to the public.courses table
  const { data, error } = await supabase
    .from('courses')
    .insert([newCourse]);

  if (error) {
    console.error('Error uploading course:', error);
  } else {
    console.log('Course uploaded successfully:', data);
  }
}

async function signUp (){

}

</script>

<template>
    <div class="flex justify-center items-center h-screen bg-[#E8F8EF]">
    <div class="bg-white p-8 rounded-lg shadow-lg w-[25%] flex flex-col justify-center items-center">
      <div class="bg-[#017C35] w-16 h-16 rounded-full flex justify-center items-center">
        <UIcon name="solar:user-outline" class="w-8 h-8 text-white" />
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

