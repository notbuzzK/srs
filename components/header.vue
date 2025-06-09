<script setup lang="ts">
const supabase = useNuxtApp().$supabase;

const facultyInfo = ref<any>({})

const getNameDesignation = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  const {data: getData, error } = await supabase
    .from('users')
    .select('name, designation')
    .eq('user_auth_id', user?.id)
    .single()

  if (error) {
    console.error('Error fetching user info:', error.message)
  } else {
    facultyInfo.value.name = getData.name
    facultyInfo.value.designation = getData.designation
  }
}

onMounted(async()  => {
  await getNameDesignation()
})

</script>
<template>
  <div class="h-full bg-[#FFFFFF]">

    <div class="flex justify-between h-full items-center p-2 px-6">
      <h1 class="font-sans text-[#017C35] font-bold">Faculty Schedule Recommendation System</h1>

      <div class="flex justify-between gap-8 items-center">
        <p class="font-bold text-[#017C35]">{{ facultyInfo.name }}, {{ facultyInfo.designation }}</p>
        <div class="flex justify-between gap-8">
          <!--Notifcation-->
          <Notifications />

          <!--Profile-->
          <Profile />

        </div>
      </div>
    </div>

  </div>
</template>