<script setup lang="ts">
import { useFacultyStore } from '~/stores/facultyStore'; 
const supabase = useNuxtApp().$supabase;

const { data: { user } } = await supabase.auth.getUser()
const userId = user?.id
const {
  showModal,
  clearEvents,
  onSubmit,
  teachingHours,
  awHours,
  arpHours,
  chHours,
  totalHours,
  acadYear,
  acadSem
} = useSchedule()
const primaryDept = ref<Number>(0)
const rows = ref<any>([])
const facultyId = ref<any>('')
const facultyInfo = ref<any>({})
const isOpen = ref(false)
const facultyAvailability = ref<any>([])

const getSchedulerDepartment = async () => {
  const { data, error } = await supabase
  .from('users')
  .select('pr_department_id')
  .eq('user_auth_id', userId)

  if (error) {
    console.error('Error fetching primary department:', error.message)
  } else {
    primaryDept.value = data[0].pr_department_id
  }
}

const getMembersUnderScheduler = async () => {

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('pr_department_id', primaryDept.value); 

  if (error) {
    console.error('Error fetching members:', error.message);
  } else {
    rows.value = data; // Store the fetched data
  }
}

const getCurrectAcadYear = async () => {
  const { data, error } = await supabase
  .from('users')
  .select('acadYear')
  .eq('user_auth_id', userId)

  if ( error ) {
    console.error('Error fetching current academic year:', error.message)
  } else {
    acadYear.value = data[0].acadYear
  }
}

const getCurrentTerm = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('acadSem')
    .eq('user_auth_id', userId)

  if (error) {
    console.error('Error fetching current term:', error.message)
  } else {
    acadSem.value = data[0].acadSem
  }
}

const getAvailabilityTime = async () => {
  const { data, error } = await supabase
    .from('facultyAvailability')
    .select('*')
    .eq('faculty_id', facultyInfo.value.user_id)

    if (error) {
      console.error('Error fetching faculty availability:', error.message)
    } else {
      facultyAvailability.value = data

    }
}

onMounted(async () => {
  await getCurrectAcadYear()
  await getCurrentTerm()
  await getSchedulerDepartment()
  await getMembersUnderScheduler()
})

const columns = [{
  key: 'name',
  label: 'Name',
  sortable: true,
}, {
  key: 'actions',
  label: '',
  class: 'w-1/12',
}]


const q = ref('')
const page = ref(1)
const pageCount = 7

const filteredRows = computed(() => {
  if (!q.value) return rows.value 
  return rows.value.filter((rows: any) =>
    Object.values(rows).some((value) =>
      String(value).toLowerCase().includes(q.value.toLowerCase())
    )
  )
})

const paginatedRows = computed(() => {
  const start = (page.value - 1) * pageCount
  const end = start + pageCount
  return filteredRows.value.slice(start, end)
})

</script>
<template>
  <div class="h-[93%] w-full bg-[#E8F8EF] grid grid-cols-8 grid-rows-5">

    <div class="col-span-2 row-span-5 bg-white rounded-lg shadow-lg p-4 m-4 mr-2 overflow-y-auto">

     <div class="flex flex-col h-full justify-between ">
        <div class="flex pb-4 items-center  border-b border-gray-200 dark:border-gray-700">
          <UInput v-model="q" placeholder="Filter people..." class="w-full"/>
        </div>
        <div class="overflow-y-auto h-full">
          <UTable :columns="columns" :rows="paginatedRows">

            <template #actions-data="{ row }">
              <UButton 
                icon="i-tabler-pencil"
                class="text-[#017C35] hover:text-[#16B559]"
                variant="ghost"
                @click="[facultyId = row.user_auth_id, facultyInfo = row, getAvailabilityTime()]" />
            </template>

          </UTable>
        </div>
        <div class="flex justify-end">
          <UPagination v-model="page" :page-count="pageCount" :total="filteredRows.length" />
        </div>
      </div>
    </div>

    <div class="col-span-4 row-span-5 bg-white rounded-lg shadow-lg p-4 m-4 ml-2 mr-2 overflow-y-auto">

      <TimeTable :user_auth_id="facultyId" />
       
    </div>

    <div class="col-span-2 row-span-5 bg-white rounded-lg shadow-lg p-4 m-4 ml-2 overflow-y-auto flex flex-col justify-between">

      <div class="">
        <h1 class="text-[#017C35] font-bold text-xl">Summary</h1>
        
        <div class="flex justify-between mb-2">
          <div>
            <p class="font-bold">Academic Year: </p>
            <p class="font-bold">Semester: </p>
          </div>
          <div class="text-right">
            <p>{{ acadYear }}</p>
            <p>{{ acadSem }}</p>
          </div>
        </div>

        <div class="flex justify-between">
          <div>
            <p class="font-bold">Total Hours: </p>
            <p>Teaching Hours: </p>
            <p>AW Hours: </p>
            <p>ARP Hours: </p>
            <p>CH Hours: </p>
          </div>
          
          <div class="text-right">
            <p class="font-bold">{{ totalHours }} hrs</p>
            <p>{{ teachingHours }} hrs</p>
            <p>{{ awHours }} hrs</p>
            <p>{{ arpHours }} hrs</p>
            <p>{{ chHours }} hrs</p>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex flex-col gap-4 row-span-2">

        <h1 class="text-[#017C35] font-bold text-xl">Actions</h1>

        <div class="flex justify-between">
          <UButton variant="solid" @click="showModal = true">Add Event</UButton>
          <UButton class="bg-[#DD3A3A] text-white hover:bg-[#bd3333]" @click="clearEvents">Clear Schedule</UButton>
        </div>
        <UButton variant="solid" class="bg-[#017C35] text-white" @click="">Suggest Schedule (not working yet)</UButton>
        <UButton variant="solid" class="bg-[#017C35] text-white" @click="onSubmit">Upload Schedule</UButton>
      </div>

      <!-- Space for additional content -->
      <div class="">
        <h1 class="text-[#017C35] font-bold text-xl">Faculty Information</h1>

        <div class="flex justify-between pb-4">
          <div>
            <p class="font-bold">Name: </p>
            <p>Designation: </p>
            <p>Email: </p>
          </div>
          
          <div class="text-right">
            <p class="font-bold">{{ facultyInfo.name }}</p>
            <p>{{ facultyInfo.designation }}</p>
            <p>{{ facultyInfo.email }}</p>
          </div>
        </div>

        <p @click="isOpen = true" class="text-[#017C35] font-medium cursor-pointer text-sm text-center">Show Faculty Availability Time</p>

        <UModal v-model="isOpen">
          <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
            <template #header>
              <p class="font-bold">{{ facultyInfo.name }}</p>
            </template>

            <div class="w-full">
              <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" class="px-6 py-3">Day</th>
                    <th scope="col" class="px-6 py-3">Start Time</th>
                    <th scope="col" class="px-6 py-3">End Time</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr v-if="facultyAvailability.length === 0">
                    <td colspan="3" class="text-center py-4">No availability data available</td>
                  </tr>
                  <tr v-else-if="facultyAvailability.length > 0" v-for="(availability, index) in facultyAvailability" :key="index">
                    <td class="px-6 py-3">{{ availability.day }}</td>
                    <td class="px-6 py-3">{{ availability.start_time }}</td>
                    <td class="px-6 py-3">{{ availability.end_time }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </UCard>
        </UModal>

      </div>
    </div>
  </div>
</template>