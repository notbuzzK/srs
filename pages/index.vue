<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import supabase from '../lib/subabaseClient'
import { login } from '~/composables/db.actions'

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
  try {
    login(state.email, state.password)
    router.push('/faculty')
  } catch (error) {
    console.error('Error signing in:', error)
  }
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

