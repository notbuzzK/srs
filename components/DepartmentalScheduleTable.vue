<script setup lang="ts">
const supabase = useNuxtApp().$supabase;

const { data: { user } } = await supabase.auth.getUser()
const userId = user?.id
const toast = useToast()
const {
  showModal,
  clearEvents,
  onSubmit,
  totalHours,
  acadYear,
  acadSem,
  getHourColor,
  semesterType,
  isTeamTeaching,
  facultyRows,
  fetchSchedules,
  getOverloadHour,
  fetchOverloadCriteria,
  teachingRegular,
  teachingOverload,
  chRegular,
  chOverload,
  awRegular,
  awOverload,
  arpRegular,
  arpOverload,
  totalRegular,
  totalOverload,
  currentDesignation,
  currentTerm,
  currentItem,
  awTotal,
  awThreshold,
  teachingTotal,
  teachingThreshold,
  chTotal,
  chThreshold,
  arpTotal,
  arpThreshold,
  overloadHours,
  days,
  otherTimeSlots,
  timeToMinutes
} = useSchedule()

const {
  getCollegeName,
  getDepartmentName,
  getAcadServicesName,
} = useAccountCreationValues()


const facultyId = ref<any>('')
const facultyInfo = ref<any>({})
const isOpen = ref(false)
const isOpen2 = ref(false)
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
  clearEvents()
  await getCurrectAcadYear()
  await getCurrentTerm()
  await getCurrentSemesterType()
  await loadUserRow()
  await loadChildDeptIds()
  await loadMembersUnderScheduler()
  await fetchOverloadCriteria()
/*   if (!acadYear.value || !acadSem.value) {
    alert('Add academic year, term and semester type first before adding any schedule')
  } */
//  console.log('Faculty Rows: ', facultyRows.value)
})

// re-run when unit or deps change
watch(unit, async () => {
  await loadChildDeptIds()
  await loadMembersUnderScheduler()
})

// re-run when selected user changes
watch(facultyId, async () => {
  await fetchOverloadCriteria()
  console.log('teachingTotal', teachingTotal.value, 'teachingThreshold', teachingThreshold.value, 'teachingRegular', teachingRegular.value, 'teachingOverload', teachingOverload.value)
  console.log('awRegular', awRegular.value, 'awOverload', awOverload.value, 'awTotal', awTotal.value, 'awThreshold', awThreshold.value)
  console.log('chTotal ', chTotal.value, 'chThreshold ', chThreshold.value, 'chRegular ', chRegular.value, 'chOverload ', chOverload.value)
  console.log('arpTotal ', arpTotal.value, 'arpThreshold ', arpThreshold.value, 'arpRegular ', arpRegular.value, 'arpOverload ', arpOverload.value)
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


// for adding of availability time
const newTimeSlot = ref({
  availability_id: '',
  day: '',
  start: '',
  end: ''
})
// Array to store all added time slots
const timeSlotsAdded = ref<any[]>([])
const isAvailability = ref(false)

// Add new time slot to the array and reset the form
const onAddTimeSlot = async () => {
  console.log('Adding time slot:', newTimeSlot.value);

  if (newTimeSlot.value.day && newTimeSlot.value.start && newTimeSlot.value.end) {
    const { data, error } = await supabase
      .from('facultyAvailability')
      .insert([{
        faculty_id: facultyId.value,
        day: newTimeSlot.value.day,
        start_time: newTimeSlot.value.start,
        end_time: newTimeSlot.value.end
      }])
      .select();
    if (error) {
      console.error('Error adding time slot:', error);
    } else {
      console.log('Inserted data:', data);

      // Check if data was returned
      if (data.length > 0 && data[0].availability_id) {
        facultyAvailability.value.push({
          availability_id: data[0].availability_id,
          day: newTimeSlot.value.day,
          start: newTimeSlot.value.start,
          end: newTimeSlot.value.end,
        });

        console.log('Updated timeSlotsAdded:', facultyAvailability.value);
        toast.add({ title: 'Time slot added successfully!' });
      } else {
        console.error('Error: availability_id missing from response');
      }
      getAvailabilityTime()
    }

    isAvailability.value = false;
    isOpen.value = false
    isOpen2.value = false
  } else {
    console.warn('Invalid time slot input');
  }
}


// Remove a time slot from the array by index
const removeTimeSlot = async (index: number) => {
  const timeSlot = facultyAvailability.value[index]; // Get the object
  console.log('Attempting to delete:', timeSlot);

  if (!timeSlot || !timeSlot.availability_id) {
    console.error('Error: No availability_id found for deletion');
    return;
  }

  const timeSlotId = timeSlot.availability_id; // Get the correct ID
  console.log('Deleting time slot with id:', timeSlotId);

  const { data, error } = await supabase
    .from('facultyAvailability')
    .delete()
    .eq('availability_id', timeSlotId)
    .select();

    if (error) {
      console.error('Delete error:', error);
      toast.add({ title: 'Error deleting time slot!', color: 'red' });
    } else {
      console.log('Delete response:', data);
      facultyAvailability.value.splice(index, 1); // Remove from local state
      toast.add({ title: 'Time slot deleted successfully!' });
    }
}

// For confirmation 
const isConfirmation = ref(false)
const soonToNameArray = ref<any[]>([])
const soonToNameArray2 = ref<any[]>([])
const user_auth_id = ref('')
const workloadObject = ref({
  units: 0,
  teaching: 0,
  ch: 0,
  arp: 0,
  aw: 0,
  res: 0,
})

const resetObject = () => {
  workloadObject.value = {
    units: 0,
    teaching: 0,
    ch: 0,
    arp: 0,
    aw: 0,
    res: 0,
  }
}
const submitForChecking = async () => {
  // for each row in faculty rows array, grab each row's user auth id
  // for each faculty user auth id, get all their schedules in table
  // store all schedules in an array
  // loop through array and do computations to get:
  // total units, total hours, total overload hours, total ch hours
  // total arp hours, total aw hours, total rh hours
  // once computation is done, store all total values into workload table
  // each faculty user auth id will have a workload table entry
  // after all workload table entries are created, redirect to workload page
  
  resetObject()

  for (const row of facultyRows.value) {
    user_auth_id.value = row.user_auth_id
    
    const { data: facultySchedule, error: scheduleError} = await supabase
      .from('facultySchedules')
      .select('*')
      .eq('faculty_id', user_auth_id.value)
    
    if (scheduleError) {
      console.log('Schedule retreival error: ', scheduleError)
      return
    }

    soonToNameArray.value = facultySchedule
    soonToNameArray.value.forEach(e => {
      if (e.schedule_type === 'Teaching') {
        workloadObject.value.teaching += 60 * (timeToMinutes(e.start_time) - timeToMinutes(e.end_time))
      }
      if (e.schedule_type === 'CH') {
        workloadObject.value.ch += 60 * (timeToMinutes(e.start_time) - timeToMinutes(e.end_time))
      }
      if (e.schedule_type === 'AW') {
        workloadObject.value.aw += 60 * (timeToMinutes(e.start_time) - timeToMinutes(e.end_time))
      }
      if (e.schedule_type === 'ARP') {
        workloadObject.value.arp += 60 * (timeToMinutes(e.start_time) - timeToMinutes(e.end_time))
      }

      
    })

    // Calculate total hours
    workloadObject.value.res = workloadObject.value.teaching + workloadObject.value.ch + workloadObject.value.aw + workloadObject.value.arp
    
  }
}
</script>
<template>
  <div class="h-[93%] w-full bg-[#E8F8EF] grid grid-cols-9 grid-rows-5">

    <!-- Left: Faculty List -->
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
                @click="async () => [facultyId = row.user_auth_id, facultyInfo = row, getAvailabilityTime(), scheduleModal = true, console.log(facultyInfo), suggestedSchedule = false, facultyInfo = await getFacultyUnit(), currentDesignation = row.designation, currentTerm = row.semester_type, currentItem = row.item]" />
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
                        <p>Services: </p>
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
                        <p>Services: </p>
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
                <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
              </div>
            </template>

            <div class="w-full">
              <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" class="px-6 py-3">Day</th>
                    <th scope="col" class="px-6 py-3">Start Time</th>
                    <th scope="col" class="px-6 py-3">End Time</th>
                    <th scope="col" class="px-6 py-3">Action</th>
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
                    <td class="text-center">
                      <UIcon
                        name="i-charm-cross"
                        @click="removeTimeSlot(index)"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              <UModal v-model="isAvailability">
                <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                  <template #header>
                    <div class="flex items-center justify-between">
                      <h1>Availability Time</h1>
                      <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isAvailability = false" />
                    </div>
                  </template>

                  <div>
                    <label>Day</label>
                    <USelect
                      v-model="newTimeSlot.day"
                      :options="days"
                      placeholder="Select a day"
                      class="w-full"
                    />
                  </div>

                  <div>
                    <label>Start Time</label>
                    <USelect
                      v-model="newTimeSlot.start"
                      :options="otherTimeSlots"
                      placeholder="Select start time"
                      class="w-full"
                    />
                  </div>

                  <div>
                    <label>End Time</label>
                    <USelect
                      v-model="newTimeSlot.end"
                      :options="otherTimeSlots"
                      placeholder="Select end time"
                      class="w-full"
                    />
                  </div>

                  <template #footer>
                    <UButton @click="onAddTimeSlot">Add Time</UButton>
                  </template>
                </UCard>
              </UModal>

                <div class="flex justify-center pt-4">
                  <UIcon
                    name="i-material-symbols-add-circle-rounded"
                    @click="isAvailability = true"
                    class="w-8 h-8 text-center text-[#16B559]"
                  />
                </div>
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

    <!-- Middle: Time Table -->
    <div class="col-span-5 row-span-5 bg-white rounded-lg shadow-lg p-4 m-4 ml-2 mr-2 overflow-y-auto">

      <TimeTable :user_auth_id="facultyId" />
       
    </div>

    <!-- Right: Summary -->
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
              <p :class="getHourColor(teachingRegular, facultyInfo.designation, 'Teaching', facultyInfo.item, semesterType)">{{ teachingRegular }} hrs</p>
              <p :class="getHourColor(chRegular, facultyInfo.designation, 'CH', facultyInfo.item, semesterType, teachingTotal)">{{ chRegular }} hrs</p>
              <p :class="getHourColor(arpRegular, facultyInfo.designation, 'ARP', facultyInfo.item, semesterType)">{{ arpRegular }} hrs</p>
              <p :class="getHourColor(awRegular, facultyInfo.designation, 'AW', facultyInfo.item, semesterType)">{{ awRegular }} hrs</p>
            </div>
          </div>
        </div>
        
        <div class="flex justify-between">
          <div>
            <p class="font-bold">Residency</p>
            <p class="font-bold">Overload</p>
          </div>
          
          <div class="text-right">
            <p :class="getHourColor(totalRegular, facultyInfo.designation, 'Total Hours', facultyInfo.item, semesterType)">
              {{ totalRegular }} hrs
            </p>
            <p>
              {{ overloadHours }} hrs
            </p>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="flex flex-col gap-4 row-span-2">

        <h1 class="text-[#017C35] font-bold text-xl">Actions</h1>

        <div class="flex justify-between">
          <UButton variant="solid" @click="[showModal = true, isTeamTeaching = false]">Add Event</UButton>
          <UButton variant="solid" class="bg-[#017C35] text-white text-center" @click="">Suggest Schedule</UButton>
        </div>
        <UButton variant="solid" class="bg-[#017C35] text-white text-center align-middle w-full" @click="onSubmit">Upload Schedule to database</UButton>
        <UButton variant="solid" class="bg-[#017C35] text-white w-full" @click="isConfirmation = true"><p class="text-center">Submit for Checking</p></UButton>
      </div>

      <!-- Confirmation Modal -->
      <UModal v-model="isConfirmation">
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }" >
          <template #header>
            <div class="flex justify-between">
              <h1 class="text-[#017C35] font-bold text-xl">Submit for Checking?</h1>
              <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isConfirmation = false" />
            </div>
          </template>
          <div>
            <p>Are you sure you want to submit the schedule of this unit for checking?</p>
          </div>
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton label="Cancel" variant="ghost" @click="isConfirmation = false" class="text-[#dd3a3a]"/>
              <UButton label="Confirm" variant="solid" @click="submitForChecking"/>
            </div>
          </template>
        </UCard>
      </UModal>

      <!-- Space for additional content -->
      <div class="">
        <h1 class="text-[#017C35] font-bold text-xl">Faculty Information</h1>

        <div class="flex justify-between pb-4">
          <div>
            <p class="font-bold">Name: </p>
            <div class="text-sm">
              <p>Designation: </p>
              <p>Email: </p>
            </div>
          </div>
          
          <div class="text-right">
            <p class="font-bold">{{ facultyInfo.name }}</p>
            <div class="text-sm">
              <p>{{ facultyInfo.designation }}</p>
              <p>{{ facultyInfo.email }}</p>
            </div>
          </div>
        </div>

        <p @click="isOpen2 = true" class="text-[#017C35] font-medium cursor-pointer text-sm text-center">Show Faculty Availability Time</p>

        <UModal v-model="isOpen2">
          <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }" >
            <template #header>
              <div class="flex items-center justify-between">
                <p class="font-bold">{{ facultyInfo.name }}</p>
                <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen2 = false" />
              </div>
            </template>

            <div class="w-full">
              <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" class="px-6 py-3">Day</th>
                    <th scope="col" class="px-6 py-3">Start Time</th>
                    <th scope="col" class="px-6 py-3">End Time</th>
                    <th scope="col" class="px-6 py-3">Action</th>
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
                    <td class="text-center">
                      <UIcon
                        name="i-charm-cross"
                        @click="removeTimeSlot(index)"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              <UModal v-model="isAvailability">
                <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                  <template #header>
                    <div class="flex items-center justify-between">
                      <h1>Availability Time</h1>
                      <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isAvailability = false" />
                    </div>
                  </template>

                  <div>
                    <label>Day</label>
                    <USelect
                      v-model="newTimeSlot.day"
                      :options="days"
                      placeholder="Select a day"
                      class="w-full"
                    />
                  </div>

                  <div>
                    <label>Start Time</label>
                    <USelect
                      v-model="newTimeSlot.start"
                      :options="otherTimeSlots"
                      placeholder="Select start time"
                      class="w-full"
                    />
                  </div>

                  <div>
                    <label>End Time</label>
                    <USelect
                      v-model="newTimeSlot.end"
                      :options="otherTimeSlots"
                      placeholder="Select end time"
                      class="w-full"
                    />
                  </div>

                  <template #footer>
                    <UButton @click="onAddTimeSlot">Add Time</UButton>
                  </template>
                </UCard>
              </UModal>

                <div class="flex justify-center pt-4">
                  <UIcon
                    name="i-material-symbols-add-circle-rounded"
                    @click="isAvailability = true"
                    class="w-8 h-8 text-center text-[#16B559]"
                  />
                </div>
              </div>
            </UCard>
          </UModal>
      </div>
    </div>
  </div>
</template>