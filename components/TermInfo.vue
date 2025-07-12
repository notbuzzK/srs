<script setup lang="ts">
const supabase = useNuxtApp().$supabase;
const toast = useToast()

// get the current user's auth-ID
const { data: { user } } = await supabase.auth.getUser()
const userAuthId = user?.id!

const semesters = [
  { label: 'First Semester', value: 'First'},
  { label: 'Second Semester', value: 'Second'},
  { label: 'Third Semseter', value: 'Third'},
  { label: 'Midyear', value: 'Midyear'},
]

const semesterType = [
  { label: 'Semestral', value: 'Semestral'},
  { label: 'Trimestral', value: 'Trimestral'},
  { label: 'Midyear', value: 'Midyear'},
]

// fetch the full userRow so we know their pr_/sd_/acadServices_ids
const userRow = ref<any>(null)
async function loadUserRow() {
  const { data, error } = await supabase
    .from('users')
    .select('pr_department_id, sd_department_id, pr_college_id, sd_college_id, pr_acadServices_id, sd_acadServices_id')
    .eq('user_auth_id', userAuthId)
    .single()
  if (error) console.error(error)
  else userRow.value = data
}
await loadUserRow()

// derive the unit (type + id) from the 5 possible columns
const { unit } = useUserUnit(userRow)
console.log('unit in TermInfo.vue:', unit.value)

// reactive acadInfo
const acadInfo = ref({ academicYear: '', term: '', semesterType: '' })

// helper: get all dept-IDs under a unit (for college/service)
async function getChildDeptIds(): Promise<number[]> {
  if (!unit.value) return []
  if (unit.value.type === 'department') {
    return [unit.value.id]
  }
  // if college or service, load its departments
  const fkCol = unit.value.type === 'college' ? 'college_id' : 'acadServices_id'
  const { data, error } = await supabase
    .from('departments')
    .select('department_id')
    .eq(fkCol, unit.value.id)
  if (error) {
    console.error('Error loading child departments', error)
    return []
  }
  return data!.map(d => d.department_id)
}

// load existing year/term
async function loadCurrent() {
  const { data, error } = await supabase
    .from('users')
    .select('acadYear, acadSem, semester_type')
    .eq('user_auth_id', userAuthId)
    .single()
  if (!error && data) {
    acadInfo.value.academicYear = data.acadYear
    acadInfo.value.term = data.acadSem
    acadInfo.value.semesterType = data.semester_type
  }
}
onMounted(loadCurrent)


// ───────────────────────────────────────────────────────────────────────────
// NEW: archiveSchedules()
// Moves every row from `facultySchedules` → `historicalSchedules`
// ───────────────────────────────────────────────────────────────────────────
async function archiveSchedules() {
 /*  // 1) fetch all rows from facultySchedules
  const { data: schedData, error: fetchErr } = await supabase
    .from('facultySchedules')
    .select('*')
  if (fetchErr) {
    console.error('Error fetching facultySchedules:', fetchErr.message)
    toast.add({ title: 'Failed to archive schedules', color: 'red' })
    return false
  }
  if (!schedData || schedData.length === 0) {
    // nothing to move
    return true
  }

  // 2) insert those rows into historicalSchedules
  const { error: insertErr } = await supabase
    .from('historicalSchedules')
    .insert(schedData)
  if (insertErr) {
    console.error('Error inserting into historicalSchedules:', insertErr.message)
    toast.add({ title: 'Failed to archive schedules', color: 'red' })
    return false
  }

  // 3) delete only those same rows from facultySchedules (by id)
  const idsToDelete = schedData.map((row: any) => row.schedule_id)
  console.log('idsToDelete:', idsToDelete)
  const { error: deleteErr } = await supabase
    .from('facultySchedules')
    .delete()
    .in('schedule_id', idsToDelete)
  if (deleteErr) {
    console.error('Error deleting from facultySchedules:', deleteErr.message)
    toast.add({ title: 'Failed to clear old schedules', color: 'red' })
    return false
  } */

  return true
}


const onSubmit = async () => {
  // 0) archive all schedules first
  const ok = await archiveSchedules()
  if (!ok) {
    return
  }

  // 1) validation
  if (!acadInfo.value.academicYear || !acadInfo.value.term) {
    toast.add({ title: 'Please fill in all fields', color: 'red' })
    return
  }
  acadInfo.value.academicYear = acadInfo.value.academicYear.replace(/\s/g, '')

  // 2) get the list of dept-IDs under this unit
  const deptIds = await getChildDeptIds()

  // 3) build update query for users
  let query = supabase
    .from('users')
    .update({
      acadYear: acadInfo.value.academicYear,
      acadSem: acadInfo.value.term,
      semester_type: acadInfo.value.semesterType
    })

  if (unit.value?.type === 'department') {
    // only primary dept
    query = query.eq('pr_department_id', unit.value.id)
  }
  else if (unit.value?.type === 'college') {
    if (deptIds.length) {
      // only primary dept among child depts
      query = query.in('pr_department_id', deptIds)
    } else {
      query = query.eq('pr_college_id', unit.value.id)
    }
  }
  else if (unit.value?.type === 'service') {
    if (deptIds.length) {
      query = query.in('pr_department_id', deptIds)
    } else {
      query = query.eq('pr_acadServices_id', unit.value.id)
    }
  } else {
    toast.add({ title: 'No organizational unit found', color: 'red' })
    return
  }

  // 4) execute update
  const { data, error } = await query.select()
  if (error) {
    console.error(error)
    toast.add({ title: 'Error updating users', color: 'red' })
  } else {
    toast.add({ title: 'Users updated successfully', color: 'green' })
    console.log('Updated users:', data)
    await loadCurrent()
  }
}

const isOpen = ref(false)
</script>
<template>
  <div class="flex flex-col justify-between gap-4">
    <div class="justify-center items-center text-center">
      <div class="flex flex-row justify-between gap-4">
        <h1>Enter Academic Year</h1>
        <UInput v-model="acadInfo.academicYear" class="mt-1 w-[50%]" placeholder="2024-2025"/>
      </div>
      <div class="flex flex-row justify-between gap-4">
        <h1>Select Term</h1>
        <USelect v-model="acadInfo.term" class="mt-1 w-[50%]" :options="semesters"/>
      </div>
      <div class="flex flex-row justify-between gap-4">
        <h1>Select Semester Type</h1>
        <USelect v-model="acadInfo.semesterType" class="mt-1 w-[50%]" :options="semesterType"/>
      </div>
    </div>
    <div>
      <UButton class=" text-white w-full" label="Submit" @click="isOpen = true" variant="solid" />
      <UModal v-model="isOpen" prevent-close>
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h1 class="text-lg font-semibold">Action Confirmation</h1>
              <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="[isOpen = false]" />
            </div>
          </template>

          <div>
            <p class="text-justify">Are you sure you want to override the Academic Year and Semester? Doing so sets removes all existing schedule for this term and moves it to Historical Schedules.</p>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton label="Cancel" variant="ghost" @click="[isOpen = false]" class="text-[#dd3a3a]"/>
              <UButton label="Confirm" variant="solid" @click="[onSubmit(), isOpen = false]" />
            </div>
          </template>
        </UCard>  
      </UModal>
    </div>
  </div>
  
</template>