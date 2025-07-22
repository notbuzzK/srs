<script setup lang="ts">
const supabase = useNuxtApp().$supabase;
const signup = ref({
  email: '',
  password: ''
})

const onSubmit = async () => {
  const { data, error } = await supabase.auth.signUp({
    email: signup.value.email,
    password: signup.value.password
  })
  console.log(data, error)
}
</script>
<template>
  <div class="flex max-h-screen">


    <div>

    </div>

    <!-- Main Content -->
    <div>
      <UInput v-model="signup.email" />
      <UInput v-model="signup.password" />
      <UButton type="submit" @click="onSubmit">Submit</UButton>
    </div>

  </div>
</template>