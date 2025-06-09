<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
const supabase = useNuxtApp().$supabase;
import DepartmentalFacultyTable from '@/components/DepartmentalFacultyTable.vue'
import { useUserUnit } from '~/composables/useUserUnit';
const name = useNameStore()
const designation = useDesignationStore()

// hold the current user's auth ID
const userAuthId = ref<string | null>(null)
// hold the full user row
const userRow = ref<any>(null)

// fetch the authenticated user
async function fetchAuthUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting auth user:', error.message)
    return
  }
  userAuthId.value = data.user?.id || null
}

// fetch the users table row for the authenticated user
async function fetchUserRow() {
  if (!userAuthId.value) return
  const { data, error } = await supabase
    .from('users')
    .select('pr_department_id, sd_department_id, pr_acadServices_id, sd_acadServices_id, pr_college_id, sd_college_id')
    .eq('user_auth_id', userAuthId.value)
    .single()
  if (error) {
    console.error('Error fetching user row:', error.message)
  } else {
    userRow.value = data
  }
}

// determine which unit to pass using composable
// pass the ref directly so it reacts when userRow.value changes
const { unit } = useUserUnit(userRow)

onMounted(async () => {
  await fetchAuthUser()
  await fetchUserRow()
})
</script>

<template>
  <div class="flex max-h-screen">
    <!-- Sidebar -->
    <Sidebar :userRole="'Higher Ups'" />

    <div class="w-full gap-4">
      <!-- Header -->
      <div class="h-[7%]">

        <Header />

      </div>

      <!-- Main Content -->
      <div class="h-[93%] w-full bg-green-50 grid grid-cols-8 grid-rows-5">
        <div class="col-span-8 row-span-5 bg-white m-4 rounded-lg">
          <!-- Only render once we know the unit -->
          <DepartmentalFacultyTable
            v-if="unit"
            :unitType="unit.type"
            :unitId="unit.id"
          />
          <p v-else class="p-4 text-gray-500">No organizational unit assigned.</p>
        </div>
      </div>
    </div>
  </div>
</template>
