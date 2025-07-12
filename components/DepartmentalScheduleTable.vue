<script setup lang="ts">
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
  acadSem,
  getHourColor,
  semesterType,
  isTeamTeaching,
  facultyRows,
  fetchSchedules,
  getOverloadHour
} = useSchedule()

const {
  getCollegeName,
  getDepartmentName,
  getAcadServicesName,
} = useAccountCreationValues()


const facultyId = ref<any>('')
const facultyInfo = ref<any>({})
const isOpen = ref(false)
const facultyAvailability = ref<any>([])
const loading = ref(false)
const scheduleModal = ref(false)

// Fetch the full userRow so we know all FK columns
const userRow = ref<any>(null)
async function loadUserRow() {
  if (!userId) return
  const { data, error } = await supabase
    .from('users')
    .select(`
      pr_college_id,
      sd_college_id,
      pr_department_id,
      sd_department_id,
      pr_acadServices_id,
      sd_acadServices_id
    `)
    .eq('user_auth_id', userId)
    .single()
  if (error) console.error('Error loading user row:', error.message)
  else userRow.value = data
}

// Derive the single unit from that row
const { unit } = useUserUnit(userRow)

// Load child department IDs under this unit
const deptIds = ref<number[]>([])
async function loadChildDeptIds() {
  if (!unit.value) {
    deptIds.value = []
    return
  }
  if (unit.value.type === 'department') {
    deptIds.value = [unit.value.id]
    return
  }
  // if college or service, fetch its departments
  // — CHANGED: service now uses pr_acadServices_id & sd_acadServices_id
  const fkFilter = unit.value.type === 'college'
    ? `college_id.eq.${unit.value.id}`
    : `pr_acadServices_id.eq.${unit.value.id},sd_acadServices_id.eq.${unit.value.id}`

  const { data, error } = await supabase
    .from('departments')
    .select('department_id')
    .or(fkFilter)
  if (error) {
    console.error('Error loading departments:', error.message)
    deptIds.value = []
  } else {
    deptIds.value = data!.map(d => d.department_id)
  }
}

// Use that to fetch *all* members under the scheduler’s unit
async function loadMembersUnderScheduler() {
  loading.value = true
  let query = supabase.from('users').select('*')

  if (deptIds.value.length) {
    const list = deptIds.value.join(',')
    query = query.or(
      `pr_department_id.in.(${list}),sd_department_id.in.(${list})`
    )
  } else if (unit.value) {
    // no sub-departments: filter by primary OR secondary of each unit type
    if (unit.value.type === 'department') {
      query = query.or(
        `pr_department_id.eq.${unit.value.id},sd_department_id.eq.${unit.value.id}`
      )
    }
    else if (unit.value.type === 'college') {
      query = query.or(
        `pr_college_id.eq.${unit.value.id},sd_college_id.eq.${unit.value.id}`
      )
    }
    else { // service
      // — CHANGED: now include both primary & secondary acadServices
      query = query.or(
        `pr_acadServices_id.eq.${unit.value.id},sd_acadServices_id.eq.${unit.value.id}`
      )
    }
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching members:', error.message)
    facultyRows.value = []
  } else {
    facultyRows.value = data || []
  }
  loading.value = false
}

onMounted(async () => {
  await getCurrectAcadYear()
  await getCurrentTerm()
  await getCurrentSemesterType()
  await loadUserRow()
  await loadChildDeptIds()
  await loadMembersUnderScheduler()
  if (!acadYear.value || !acadSem.value) {
    alert('Add academic year, term and semester type first before adding any schedule')
  }
})

// re-run when unit or deps change
watch(unit, async () => {
  await loadChildDeptIds()
  await loadMembersUnderScheduler()
})

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

const getCurrentSemesterType = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('semester_type')
    .eq('user_auth_id', userId)

  if (error) {
    console.log('Error fetching current semester type:', error.message)
  } else {
    semesterType.value = data[0].semester_type
  }
}

const getAvailabilityTime = async () => {
  const { data, error } = await supabase
    .from('facultyAvailability')
    .select('*')
    .eq('faculty_id', facultyInfo.value.user_auth_id)

    if (error) {
      console.error('Error fetching faculty availability:', error.message)
    } else {
      facultyAvailability.value = data

    }
}

const getFacultyUnit = () => {
  return {
    name: facultyInfo.value.name,
    email: facultyInfo.value.email,
    designation: facultyInfo.value.designation,
    pr_rank: `${facultyInfo.value.pr_rank} ${facultyInfo.value.pr_rankValue}`,
    sd_rank: `${facultyInfo.value.sd_rank} ${facultyInfo.value.sd_rankValue}`,
    item: facultyInfo.value.item,
    status: facultyInfo.value.status,
    pr_college_id: getCollegeName(facultyInfo.value.pr_college_id),
    pr_department_id: getDepartmentName(facultyInfo.value.pr_department_id),
    pr_acadServices_id: getAcadServicesName(facultyInfo.value.pr_acadServices_id),
    sd_college_id: getCollegeName(facultyInfo.value.sd_college_id),
    sd_department_id: getDepartmentName(facultyInfo.value.sd_department_id),
    sd_acadServices_id: getAcadServicesName(facultyInfo.value.sd_acadServices_id),
  }
}

const suggestedSchedule = ref(false)

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
  if (!q.value) return facultyRows.value 
  return facultyRows.value.filter((rows: any) =>
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
  <div class="h-[93%] w-full bg-[#E8F8EF] grid grid-cols-9 grid-rows-5">

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
                @click="async () => [facultyId = row.user_auth_id, facultyInfo = row, getAvailabilityTime(), scheduleModal = true, console.log(facultyInfo), suggestedSchedule = false, facultyInfo = await getFacultyUnit()]" />
            </template>

          </UTable>
        </div>
        <div class="flex justify-end">
          <UPagination v-model="page" :page-count="pageCount" :total="filteredRows.length" />
        </div>
      </div>



      <UModal v-model="scheduleModal" :ui="{ width: 'w-full sm:max-w-5xl', height: 'h-[600px]', }">
        <div class="flex flex-col h-full p-4 justify-evenly">
          <!-- Modal Header -->
          <div class="">
            <h1 class="text-[#017C35] font-bold text-xl">Faculty Schedule</h1>
            <p class="text-[#017C35] font-medium text-sm"></p>
          </div>

          <!-- Modal Body -->
          <div class="h-full my-2">
            <div class="grid grid-cols-6 grid-rows-4 gap-4 h-full">

              <div class="col-span-2 row-span-4 p-4 rounded-lg shadow-inner">
                <h1 class="text-[#017C35] font-bold text-md">Faculty Info</h1>
                <div class="flex flex-col justify-between h-full">
                  <div class="flex justify-between">
                    <div>
                      <p>Name: </p>
                      <p>Email: </p>
                      <p>Designation: </p>

                      <p>Item: </p>
                      <p>Status: </p>
                      <p></p>
                    </div>
                    <div class="text-right">
                      <p>{{ facultyInfo.name }}</p>
                      <p>{{ facultyInfo.email }}</p>
                      <p>{{ facultyInfo.designation }}</p>

                      <p>{{ facultyInfo.item }}</p>
                      <p>{{ facultyInfo.status }}</p>
                    </div>
                  </div>
                  <div>
                    <p class="font-medium text-[#017C35]">Primary Unit:</p>
                    <div class="flex justify-between">
                      <div>
                        <p>College: </p>
                        <p>Department: </p>
                        <p>Acad Services: </p>
                        <p>Rank: </p>
                      </div>
                      <div class="text-right">
                        <p>{{ facultyInfo.pr_college_id }}</p>
                        <p>{{ facultyInfo.pr_department_id }}</p>
                        <p>{{ facultyInfo.pr_acadServices_id }}</p>
                        <p>{{ facultyInfo.pr_rank}}</p>
                      </div>
                    </div>
                  </div>
                  <div  >
                    <p class="font-medium text-[#017C35]">Secondary Unit:</p>
                    <div class="flex justify-between">
                      <div>
                        <p>College: </p>
                        <p>Department: </p>
                        <p>Acad Services: </p>
                        <p>Rank: </p>
                      </div>
                      <div class="text-right">
                        <p>{{ facultyInfo.sd_college_id }}</p>
                        <p>{{ facultyInfo.sd_department_id }}</p>
                        <p>{{ facultyInfo.sd_acadServices_id }}</p>
                        <p>{{ facultyInfo.sd_rank}}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h1 class="text-[#017C35] font-bold text-md">Availability Time</h1>
                    <p @click="isOpen = true" class="text-[#017C35] font-medium cursor-pointer text-sm text-center">Show Faculty Availability Time</p>
                  </div>
                </div>
            
              </div>

              <div class="col-span-4 row-span-4 p-4 rounded-lg shadow-inner ">
                <div v-if="!suggestedSchedule" class="h-full">
                  <h1 class="text-[#017C35] font-bold text-md">Select Workload</h1>
                  <p class="text-[#017C35] font-medium text-sm text-center align-middle cursor-pointer" @click="suggestedSchedule = true">Suggest Schedule (not working yet)</p>
                </div>
                <div v-else class="h-full">
                  <h1 class="text-[#017C35] font-bold text-md">Suggested Schedule</h1>
                  <p class="text-[#017C35] font-medium text-sm text-center align-middle ">Smart suggestion not working yet</p>
                </div>
              </div>

<!-- 
              <div class="col-span-2 row-span-1 p-4 rounded-lg shadow-inner">

              </div> -->
            </div>
          </div>

        <UModal v-model="isOpen">
          <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }" >
            <template #header>
              <div class="flex items-center justify-between">
                <p class="font-bold">{{ facultyInfo.name }}</p>
              </div>
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

          <!-- Modal Footer -->
          <div class="flex justify-between">
            <UButton variant="solid" class="bg-[#DD3A3A] text-white" @click="[scheduleModal = false, suggestedSchedule = false]">Close</UButton>
            <UButton variant="solid" class="bg-[#017C35] text-white" @click="scheduleModal = false">Apply</UButton>
          </div>
        </div>
      </UModal>
    </div>

    <div class="col-span-5 row-span-5 bg-white rounded-lg shadow-lg p-4 m-4 ml-2 mr-2 overflow-y-auto">

      <TimeTable :user_auth_id="facultyId" />
       
    </div>

    <div class="col-span-2 row-span-5 bg-white rounded-lg shadow-lg p-4 m-4 ml-2 overflow-y-auto flex flex-col justify-between">

      <div class="">
        <h1 class="text-[#017C35] font-bold text-xl">Summary</h1>
        <!-- <p class="text-sm text-gray-500">hours/week</p> -->
        
        <div class="flex justify-between mb-4">
          <div>
            <p class="font-bold">Academic Year: </p>
            <p class="font-bold">Semester Type: </p>
            <p class="font-bold">Semester: </p>
          </div>
          <div class="text-right">
            <p>{{ acadYear }}</p>
            <p>{{ semesterType }}</p>
            <p>{{ acadSem }}</p>
          </div>
        </div>

        <div class="flex justify-between mb-4">
          <div>
            <div class="text-sm">
              <p>ATF/ASF Load: </p>
              <p>Consulations:</p>
              <p>ARP:</p>
              <p>AW:</p>
            </div>
          </div>
          
          <div class="text-right">
            <div class="text-sm">
              <p :class="getHourColor(teachingHours, facultyInfo.designation, 'Teaching', facultyInfo.item, semesterType)">{{ teachingHours }} hrs</p>
              <p>{{ awHours }} hrs</p>
              <p :class="getHourColor(arpHours, facultyInfo.designation, 'ARP', facultyInfo.item, semesterType)">{{ arpHours }} hrs</p>
              <p :class="getHourColor(chHours, facultyInfo.designation, 'CH', facultyInfo.item, semesterType)">{{ chHours }} hrs</p>
            </div>
          </div>
        </div>
        
        <div class="flex justify-between">
          <div>
            <p class="font-bold">Residency</p>
            <p class="font-bold">Overload</p>
          </div>
          
          <div class="text-right">
            <p :class="getHourColor(totalHours, facultyInfo.designation, 'Total Hours', facultyInfo.item, semesterType)">{{ totalHours }} hrs</p>
            <p>{{ getOverloadHour(totalHours, facultyInfo.designation, 'Total Hours', facultyInfo.item, semesterType) }} hrs</p>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex flex-col gap-4 row-span-2">

        <h1 class="text-[#017C35] font-bold text-xl">Actions</h1>

        <div class="flex justify-between">
          <UButton variant="solid" @click="[showModal = true, isTeamTeaching = false]">Add Event</UButton>
          <UButton class="bg-[#DD3A3A] text-white hover:bg-[#bd3333]" @click="clearEvents">Clear Schedule</UButton>
        </div>
        <UButton variant="solid" class="bg-[#017C35] text-white" @click="">Suggest Schedule (not working yet)</UButton>
        <UButton variant="solid" class="bg-[#017C35] text-white" @click="onSubmit">Upload Schedule to database</UButton>
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
          <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }" >
            <template #header>
              <div class="flex items-center justify-between">
                <p class="font-bold">{{ facultyInfo.name }}</p>
              </div>
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