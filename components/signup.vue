<script setup lang="ts">
const supabase = useNuxtApp().$supabase;
const toast = useToast()

import { useAccountCreationValues } from '~/composables/useAccountCreationValues';

const { 
  userRoles,
  collegeOptions, 
  departmentOptions,
  designationOptions,
  acadServicesOptions,
  facultyItems,
  ranks,
  range,
  getCollegeName,
  getDepartmentName,
  getAcadServicesName,
  getDepartmentsForCollege,
  getDepartmentsForAcadServices
} = useAccountCreationValues()

function getFilteredDepartments(collegeValue: any, acadServicesValue: any) {
  // Prefer filtering by college if selected, otherwise by academic service
  if (collegeValue && collegeValue !== 'None' && collegeValue !== '') {
    return getDepartmentsForCollege(Number(collegeValue));
  }
  if (acadServicesValue && acadServicesValue !== 'None' && acadServicesValue !== '') {
    return getDepartmentsForAcadServices(Number(acadServicesValue));
  }
  return [];
}

const filteredPrimaryDepartments = computed(() =>
  getFilteredDepartments(primaryForm.primaryCollege, primaryForm.pr_acadServices)
);

const filteredSecondaryDepartments = computed(() =>
  getFilteredDepartments(secondaryForm.secondaryCollege, secondaryForm.sd_acadServices)
);

const {
  days,
  eventTypes,
  otherTimeSlots,
  courses,
  onCourseSearch,
  modality,
  getCourses,
  getCourseCode,
} = useSchedule()

/*
  REMOVED::
  {
    key: 'sd_unit',
    label: 'Secondary Unit',
  },
*/
const items = [{
  key: 'account',
  label: 'Basic Information',
  description: ''
}, {
  key: 'pr_unit',
  label: 'Primary Unit',
  description: ''
}, {
  key: 'csv',
  label: 'Add Members using CSV',
  description: ''
}, {
  key: 'borrow',
  label: 'Borrow Members',
}]

const accountForm = reactive({
  name: '',
  email: '',
  password: '',
  item: '',
  userRole: '',
  designation: '',
})
const primaryForm = reactive({ 
  primaryCollege: '',
  pr_acadServices: '', 
  primaryDept: '',
  pr_rank: '',
  pr_rankValue: '', 
})
const secondaryForm = reactive({ 
  secondaryCollege: '', 
  sd_acadServices: '', 
  secondaryDept: '',
  sd_rank: '',
  sd_rankValue: '' , 
})

async function onSubmit() {
  console.log('values: ', accountForm, primaryForm, secondaryForm);

  // Sign up the user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: accountForm.email,
    password: accountForm.password,
  });

  if (signUpError) {
    console.error('Error signing up:', signUpError);
    toast.add({ title: 'Error signing up', color: 'red' })
    return;
  } else {
    console.log('User signed up successfully:', signUpData);
  }
  // Explicitly sign in after sign-up
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: accountForm.email,
    password: accountForm.password,
  });

  if (signInError) {
    console.error('Error signing in:', signInError);
    
    return;
  }
  
  // Use the session's user ID for the next insert
  const user_id = signInData.session?.user?.id;

  // Get the current user's acadYear and acadSem
  const { data: creatorData, error: creatorError } = await supabase
    .from('users')
    .select('acadYear, acadSem')
    .eq('user_auth_id', user?.id)
    .single();

  if (creatorError) {
    console.error('Error fetching creator term info:', creatorError);
    toast.add({ title: 'Error fetching your term info', color: 'red' });
    return;
  }

  const creatorAcadYear = creatorData?.acadYear || '';
  const creatorAcadSem = creatorData?.acadSem || '';

  let { data: insertedUser, error: insertError } = await supabase
    .from('users')
    .insert([
      {
        user_auth_id: user_id,
        name: accountForm.name,
        email: accountForm.email,
        password: accountForm.password,
        role: accountForm.userRole,
        pr_college_id: parseUnitValue(primaryForm.primaryCollege),
        pr_acadServices_id: parseUnitValue(primaryForm.pr_acadServices),
        pr_department_id: parseUnitValue(primaryForm.primaryDept),
        pr_rank: primaryForm.pr_rank === '' || primaryForm.pr_rank === 'None' ? null : primaryForm.pr_rank,
        pr_rankValue: parseUnitValue(primaryForm.pr_rankValue),
        sd_college_id: parseUnitValue(secondaryForm.secondaryCollege),
        sd_acadServices_id: parseUnitValue(secondaryForm.sd_acadServices),
        sd_department_id: parseUnitValue(secondaryForm.secondaryDept),
        sd_rank: secondaryForm.sd_rank === '' || secondaryForm.sd_rank === 'None' ? null : secondaryForm.sd_rank,
        sd_rankValue: parseUnitValue(secondaryForm.sd_rankValue),
        item: accountForm.item,
        designation: accountForm.designation,
        status: 'Active',
        acadYear: creatorAcadYear,   // <-- set from creator
        acadSem: creatorAcadSem,     // <-- set from creator
      },
    ])
    .select();

  if (insertError) {
    console.error('Error inserting user:', insertError);
  } else {
    console.log('User inserted successfully:', insertedUser);
    toast.add({ title: 'Signup Successful!' });
    isOpen.value = false
  }
}
function parseUnitValue(val: any) {
  if (val === '' || val === 'None' || val === null) return null
  if (!isNaN(val)) return Number(val)
  return val
}

const resetValues = () => {
  accountForm.name = ''
  accountForm.email = ''
  accountForm.password = ''
  accountForm.item = ''
  accountForm.userRole = ''

  primaryForm.primaryCollege = ''
  primaryForm.pr_acadServices = ''
  primaryForm.primaryDept = ''
  primaryForm.pr_rank = ''
  primaryForm.pr_rankValue = ''
  
  secondaryForm.secondaryCollege = ''
  secondaryForm.sd_acadServices = ''
  secondaryForm.secondaryDept = ''
  secondaryForm.sd_rank = ''
  secondaryForm.sd_rankValue = ''
}

const isOpen = ref(false);

const viewLevel = ref<1|2|3>(1)
const rows = ref<any[]>([])
const columns = computed(() => [
  { key: 'name',
    label: viewLevel.value === 1
      ? 'Units'
      : viewLevel.value === 2
        ? 'Departments'
        : 'Members',
    sortable: true },
  { key: 'actions', label: '', class: 'w-[200px]' }
])
// 1) Load both colleges and services as top-level units
async function loadUnits() {
  const { data: colData, error: colErr } = await supabase
    .from('colleges')
    .select('college_id, college_name')
  const { data: svcData, error: svcErr } = await supabase
    .from('academicServices')
    .select('acadServices_id, acadServices_name')

  if (colErr || svcErr) {
    console.error('Error loading top-level units', colErr || svcErr)
    return
  }

  // Normalize into {id, name, type}
  const colleges  = (colData  ?? []).map(c => ({
    id:   c.college_id,
    name: c.college_name,
    type: 'college'
  }))
  const services  = (svcData  ?? []).map(s => ({
    id:   s.acadServices_id,
    name: s.acadServices_name,
    type: 'service'
  }))

  rows.value = [...colleges, ...services]
}

// 2) Expand a college / service into its departments, or members if none
async function onExpandUnit(unit: { id: number; type: string }) {
  viewLevel.value = 2

  // fetch depts
  const fk = unit.type === 'college' ? 'college_id' : 'acadServices_id'
  const { data: deptData, error: deptErr } = await supabase
    .from('departments')
    .select('department_id, department_name')
    .eq(fk, unit.id)

  if (deptErr) {
    console.error('Error loading departments:', deptErr.message)
    return
  }

  historyUnit.value = unit // important, do not remove

  if (!deptData || deptData.length === 0) {
    // no departments → go straight to member
    await loadMembers(unit)
  } else {
    // show departments
    rows.value = deptData.map(d => ({
      id:   d.department_id,
      name: d.department_name,
      type: 'department'
    }))
  }
}

// load members for either a college/service (if no depts) or a department
// 3) Load members for a given parent (college, service, or department)
async function loadMembers(
  parent: { id: number; type: string },
  asType: 'department' | null = null
) {
  viewLevel.value = 3

  // If loading members directly from a unit (not a department), clear historyUnit
  if (parent.type !== 'department') {
    historyUnit.value = null
  }

  let query = supabase.from('users').select('user_auth_id, name')

if (parent.type === 'department') {
  // ONLY primary department now
  query = query.eq('pr_department_id', parent.id)
} else if (parent.type === 'college') {
  // ONLY primary college
  query = query.eq('pr_college_id', parent.id)
} else {
  // ONLY primary academic service
  query = query.eq('pr_acadServices_id', parent.id)
}

  const { data: userData, error: userErr } = await query
  if (userErr) {
    console.error('Error loading members:', userErr.message)
    rows.value = []
  } else {
    rows.value = (userData ?? []).map(u => ({
      id:   u.user_auth_id,
      name: u.name,
      type: 'member'
    }))
  }

  historyParent.value = parent
}

// 4) Search
const q = ref('')

const filteredRows = computed(() => {
  if (!q.value) {
    return rows.value
  }

  return rows.value.filter((person: any) => {
    return Object.values(person).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase())
    })
  })
})

// handler for “View Members” in level 2
function onViewMembers(dept: { id: number; type: string }) {
  loadMembers(dept, 'department')
}

// Simple back navigation
const historyUnit   = ref<{ id: number; type: string }| null>(null)
const historyParent = ref<{ id: number; type: string }| null>(null)

function goBack() {
  if (viewLevel.value === 3 && !historyUnit.value) {
    viewLevel.value = 1
    loadUnits()
    console.log('Already at top-level, nothing to go back to')
  }
  else if (viewLevel.value === 3 && historyUnit.value) {
    viewLevel.value = 2
    // restore the department list for that unit
    onExpandUnit(historyUnit.value)
    console.log('Going back to departments for:', historyUnit.value)
  }
  else if (viewLevel.value === 2) {
    viewLevel.value = 1
    loadUnits()
    console.log('Going back to top-level units')
  }
}

onMounted(() => {
  loadUnits()
})

const { data: { user } } = await supabase.auth.getUser()
const borrowerForm = ref(false)
const facultyInfo = ref<any>(null)
const scheduleForm = ref(false)
const schedule = ref({
  scheduleType: '',
  programCode: '',
  course: '',
  room: '',
  modality: '',
  day: [],
  startTime: '',
  endTime: '',
})
const scheduleList = ref<any>([])
const getFacultyInfo = async (id: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_auth_id', id)
    .single()

  if (error) {
    console.error('Error fetching faculty info:', error.message)
  } else {
    facultyInfo.value = data
  }
}

const addEvent = () => {
  // check if schedule type is selected
  if (!schedule.value.scheduleType) {
    toast.add({ title: 'Please select a schedule type', color: 'red' })
    return
  }
  
  const daysArray = Array.isArray(schedule.value.day) ? schedule.value.day : [schedule.value.day];
  const startIndex = otherTimeSlots.indexOf(schedule.value.startTime);
  const rawEndIndex = otherTimeSlots.indexOf(schedule.value.endTime);
  
  // make sure that atleast one day is selected
  if(daysArray.length === 0) {
    alert('Please select at least one day.');
    return;
  }
  if (rawEndIndex <= startIndex) {
    toast.add({ title: 'End time must be later than start time', color: 'red' })
    return;
  }
  
  // conflict check
  for (const day of daysArray) {
    const conflict = scheduleList.value.find((evt: any) =>
      evt.day === day &&
      startIndex < evt.endIndex &&
      rawEndIndex > evt.startIndex
    )
    if (conflict) {
      toast.add({ title: 'This event conflicts with an existing event', color: 'red' })
      return;
    }
  }

  for (const day of daysArray){
    const eventToAdd = {
      id: Date.now(), // unique ID for the event
      scheduleType: schedule.value.scheduleType,
      programCode: schedule.value.programCode,
      course: schedule.value.course,
      room: schedule.value.room,
      modality: schedule.value.modality,
      day: day,
      startTime: schedule.value.startTime,
      endTime: schedule.value.endTime
    }
  scheduleList.value.push(eventToAdd)
  }

  /* const eventToAdd = {
    id: Date.now(), // unique ID for the event
    scheduleType: schedule.value.scheduleType,
    programCode: schedule.value.programCode,
    course: schedule.value.course,
    room: schedule.value.room,
    modality: schedule.value.modality,
    day: schedule.value.day,
    startTime: schedule.value.startTime,
    endTime: schedule.value.endTime,
  } */

  toast.add({ title: 'Schedule added successfully', color: 'green' })
  console.log(scheduleList.value)

  // Close the modal
  scheduleForm.value = false

  // Reset the schedule form
  schedule.value = {
    scheduleType: '',
    programCode: '',
    course: '',
    room: '',
    modality: '',
    day: [],
    startTime: '',
    endTime: '',
  }
}

// for schedule note
const scheduleNote = ref(false)
const note = ref('')
const maxLength = 60
const addNote = () => {
  note.value = note.value.trim()
  toast.add({title: 'Note added successfully', color: 'green'})
}

const resetSchedule = () => {
  scheduleList.value = []
  schedule.value = {
    scheduleType: '',
    programCode: '',
    course: '',
    room: '',
    modality: '',
    day: [],
    startTime: '',
    endTime: '',
  }
}

const onSubmitBorrow = async () => {
  if (!facultyInfo.value) {
    toast.add({ title: 'No faculty info available', color: 'red' })
    return
  }

  const { data, error } = await supabase
    .from('informationApprovals')
    .upsert({
      user_id: facultyInfo.value.user_auth_id,
      pr_college_id: facultyInfo.value.pr_college_id,
      pr_academicServices_id: facultyInfo.value.pr_acadServices_id,
      pr_department_id: facultyInfo.value.pr_department_id,
      borrowing_dean_id: user?.id,
      work_time_schedule: scheduleList.value,
      approval_status: 'Pending',
      request_note: note.value
    })
    .select()

  if (error) {
    console.error('Error submitting borrow request:', error.message)
    toast.add({ title: 'Error submitting borrow request', color: 'red' })
    return
  } else {
    console.log('Borrow request submitted successfully:', data)
    toast.add({ title: 'Borrow request submitted successfully', color: 'green' })
  }

  // Reset the form and close the modal
  borrowerForm.value = false
  resetSchedule()
  facultyInfo.value = null
  scheduleForm.value = false
}

onMounted(async () => {
  await getCourses()
})

// for csv adding
const isClicked = ref(false)
const uploadCSV = () => {
  
}

// TODO: finalize UI

</script>
<template>
  <div class="flex items-center justify-center">
    <UButton @click="[isOpen = true, resetValues()]" variant="ghost" class="text-sm  font-medium  cursor-pointer text-[#017C35]" >Add Members</UButton>
    <UModal v-model="isOpen" :ui="{ width: 'w-full sm:max-w-3xl' }">
      <UTabs :items="items" class="w-full">
        <template #item="{ item }">
          <UCard @submit.prevent="() => onSubmit()">
            <template #header>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                    {{ item.label }}
                  </p>
                  <p v-if="item.key === 'account' || item.key === 'pr_unit'" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    leave blank if no value
                  </p>
                </div>
                <div v-if="item.key === 'borrow'" class="flex dark:border-gray-700">
                  <UInput v-model="q" placeholder="Filter people..." />
                </div>
              </div>
            </template>

            <!-- Basic Information -->
            <div v-if="item.key === 'account'" class="space-y-3">

              <UFormGroup label="Name" name="name" required>
                <UInput v-model="accountForm.name" />
              </UFormGroup>

              <div class="flex flex-row gap-2">
                <div class="w-1/2">
                  <UFormGroup label="Email" name="email" required>
                    <UInput v-model="accountForm.email" />
                  </UFormGroup>
                </div>

                <div class="w-1/2">
                  <UFormGroup label="Password" name="password" required>
                    <UInput v-model="accountForm.password" type="password" />
                  </UFormGroup>
                </div>
              </div>
              
              <UFormGroup label="Faculty Item" name="faculty item" required>
                <USelect
                  v-model="accountForm.item"
                  :options="facultyItems"
                  optionAttribute="name"
                  required
                />
              </UFormGroup>

              <UFormGroup label="User Role" name="current" required>
                <USelect 
                  v-model="accountForm.userRole"
                  :options="userRoles"
                  optionAttribute="name"
                  required
                />
              </UFormGroup>

              <UFormGroup label="Designation" name="designation" required>
                <USelect
                  v-model="accountForm.designation"
                  :options="designationOptions"
                  optionAttribute="name"
                  required 
                />
              </UFormGroup>

            </div>

            <!-- Primary Unit -->
            <div v-else-if="item.key === 'pr_unit'" class="space-y-3">

              <UFormGroup label="Primary College" name="college" required>
                <USelect
                  v-model="primaryForm.primaryCollege"
                  :options="collegeOptions"
                  valueAttribute="value"
                  optionAttribute="name"
                  required
                  label="name"
                />
              </UFormGroup>

              <UFormGroup label="Primary Services" name="acadServices" required>
                <USelect
                  v-model="primaryForm.pr_acadServices"
                  :options="acadServicesOptions"
                  optionAttribute="name"
                  valueAttribute="value"
                  required
                />
              </UFormGroup>
              
              <UFormGroup label="Primary Department" name="primaryDept">
                <USelect
                  v-model="primaryForm.primaryDept"
                  :options="filteredPrimaryDepartments"
                  valueAttribute="value"
                  optionAttribute="name"
                />
              </UFormGroup>

              <div class="flex flex-row gap-2">
                <div class="w-1/2">
                  <UFormGroup label="Rank" name="rank" required>
                    <USelect
                      v-model="primaryForm.pr_rank"
                      :options="ranks"
                      optionAttribute="name"
                      required
                    />
                  </UFormGroup>
                </div>
                <div class="w-1/2">
                  <UFormGroup label="Rank Step" name="rank value" required>
                    <USelect
                      v-model="primaryForm.pr_rankValue"
                      :options="range"
                      optionAttribute="name"
                      required
                    />
                  </UFormGroup>
                </div>
              </div>

            </div>

            <!-- Secondary Unit -->
            <div v-else-if="item.key === 'sd_unit'" class="space-y-3">
              <UFormGroup label="Secondary College" name="college" required>
                <USelect
                  v-model="secondaryForm.secondaryCollege"
                  :options="collegeOptions"
                  valueAttribute="value"
                  optionAttribute="name"
                  required
                  label="name"
                />
              </UFormGroup>

              <UFormGroup label="Secondary Services" name="acadServices" required>
                <USelect
                  v-model="secondaryForm.sd_acadServices"
                  :options="acadServicesOptions"
                  optionAttribute="name"
                  valueAttribute="value"
                  required
                />
              </UFormGroup>

              <UFormGroup label="Secondary Department" name="secondaryDept">
                <USelect
                  v-model="secondaryForm.secondaryDept"
                  :options="filteredSecondaryDepartments"
                  optionAttribute="name"
                  valueAttribute="value"
                />
              </UFormGroup>

              <div class="flex flex-row gap-2">
                <div class="w-1/2">
                  <UFormGroup label="Rank" name="rank" required>
                    <USelect
                      v-model="secondaryForm.sd_rank"
                      :options="ranks"
                      optionAttribute="name"
                      required
                    />
                  </UFormGroup>
                </div>
                <div class="w-1/2">
                  <UFormGroup label="Rank Step" name="rank value" required>
                    <USelect
                      v-model="secondaryForm.sd_rankValue"
                      :options="range"
                      optionAttribute="name"
                      required
                    />
                  </UFormGroup>
                </div>
              </div>

            </div>

            <div v-if="item.key === 'borrow'" class="max-h-[400px] overflow-auto">
             <!--  <p class="text-gray-500 dark:text-gray-400">
                This tab is for borrowing members from other units.
              </p> -->

              <UTable :columns="columns" :rows="filteredRows">
                <!-- Name column -->
                <template #cell-data="{ row }">
                  {{ row.name }}
                </template>

                <!-- Actions column -->
                <template #actions-data="{ row }">
                  <!-- Level 1: show Departments or immediate Members -->
                  <button
                    v-if="viewLevel === 1"
                    @click="onExpandUnit(row)"
                    class="px-2 py-1 bg-green-500 text-white rounded"
                  >
                    Departments
                  </button>

                  <!-- Level 2: show View Members -->
                  <button
                    v-if="viewLevel === 2"
                    @click="onViewMembers(row)"
                    class="px-2 py-1 bg-blue-500 text-white rounded"
                  >
                    View Members
                  </button>

                  <!-- Level 3: show Borrow -->
                  <button
                    type="button"
                    v-if="viewLevel === 3"
                    @click="() => [ getFacultyInfo(row.id), borrowerForm = true, console.log(historyParent), console.log(facultyInfo) ]"
                    class="px-2 py-1 bg-yellow-500 text-white rounded"
                  >
                    Borrow
                  </button>
                </template>
              </UTable>

              <!-- Back button when deeper than level 1 -->
              <UButton type="button" variant="ghost" v-if="viewLevel > 1" @click="goBack" class="mt-4 underline text-black">
                ← Back
              </UButton>
              
              <UModal v-model="borrowerForm" :ui="{ width: 'w-full sm:max-w-4xl', height: 'h-full sm:max-h-4xl' }">
                <UCard>
                  <template #header>
                    <p class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                      Borrow {{ facultyInfo?.name }}?
                    </p>
                  </template>

                  <div class="grid grid-cols-1 grid-rows-3 gap-4">
                    <div class="col-span-1 row-span-1 flex justify-between">
                      <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                          You are borrowing this member from: 
                        </p>
                        <span>{{ historyParent?.name }}</span>
                      </div>
                      <div>
                        <!-- show requested user info -->
                        <div class="col-span-1 row-span-1">
                          <p class="text-sm text-gray-500 dark:text-gray-400">
                            Please confirm the details below:
                          </p>
                          <ul class="list-disc pl-5 space-y-1">
                            <li>Name: {{ facultyInfo?.name }}</li>
                            <li>Designation: {{ facultyInfo?.designation }}</li>
                            <li>Rank: {{ facultyInfo?.pr_rank }}</li>
                            <li>Status: {{ facultyInfo?.status }}</li>
                          </ul>
                        </div>
                      </div>
       
                    </div>

                    <div class="col-span-1 row-span-2">
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        With Schedule:</p>
                        <div class="flex justify-between">
                          <p @click="scheduleForm = true" class="cursor-pointer text-[#017C35]">Add Schedule</p>
                          <p @click="scheduleNote = true" class="cursor-pointer text-[#017C35]">Add/View Note to Schedule</p>
                        </div>
                      <div class="h-full">
                        <table class="w-full">
                          <thead class="bg-gray-300">
                            <tr class="text-sm text-black dark:text-gray-400 flex  py-2 border-b-2">
                              <th class="w-[12.5%] text-center">Schedule Type</th>
                              <th class="w-[12.5%] text-center">Program Code</th>
                              <th class="w-[12.5%] text-center">Course</th>
                              <th class="w-[12.5%] text-center">Room</th>
                              <th class="w-[12.5%] text-center">Modality</th>
                              <th class="w-[12.5%] text-center">Day</th>
                              <th class="w-[12.5%] text-center">Start Time</th>
                              <th class="w-[12.5%] text-center">EndTime</th>
                              <th class="w-[12.5%] text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(event, index) in scheduleList" :key="index" class="flex justify-evenly py-2 border-b">
                              <td class="w-[12.5%] text-center">{{ event.scheduleType }}</td>
                              <td class="w-[12.5%] text-center">{{ event.programCode }}</td>
                              <td class="w-[12.5%] text-center">{{ getCourseCode(event.course) }}</td>
                              <td class="w-[12.5%] text-center">{{ event.room }}</td>
                              <td class="w-[12.5%] text-center">{{ event.modality }}</td>
                              <td class="w-[12.5%] text-center">{{ event.day }}</td>
                              <td class="w-[12.5%] text-center">{{ event.startTime }}</td>
                              <td class="w-[12.5%] text-center">{{ event.endTime }}</td>
                              <td class="w-[12.5%] text-center">
                                <UButton
                                  type="button"
                                  variant="ghost"
                                  class="text-red-500"
                                  @click="scheduleList.splice(index, 1)"
                                >
                                  Remove
                                </UButton>
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <UModal v-model="scheduleNote">
                          <UCard>
                            <template #header>
                              <p class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                                Add Note
                              </p>
                              <p class="text-sm text-gray-500 dark:text-gray-400">Limit: 60 characters including spaces</p>
                            </template>
                            <div class="flex flex-col gap-4">
                              <UInput
                                size="md"
                                :maxlength="60"
                                autoresize
                                :maxrows="3"
                                v-model="note"
                                placeholder="Add note here..."
                                class="w-full"
                              >
                                <template #trailing>
                                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ note.length}}/60</span>
                                </template>
                              </UInput>
                            </div>
                            
                            <template #footer>
                              <div class="flex justify-end gap-2">
                                <UButton variant="ghost" @click="scheduleNote = false, note = ''" class="">Close</UButton>
                                <UButton @click="addNote"class="">Save</UButton>
                              </div>
                            </template>
                          </UCard>
                        </UModal>

                        <UModal v-model="scheduleForm" :ui="{ width: 'w-full sm:max-w-2xl', height: 'h-full sm:max-h-4xl' }">
                          <UCard>
                            <template #header>
                              <p class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                                Add Schedule
                              </p>
                            </template>


                            <div class="flex flex-col gap-4">
                              <!-- Event Type (no name) -->
                              <div>
                                <label class="block mb-1 font-semibold">Schedule Type</label>
                                <USelect
                                  v-model="schedule.scheduleType"
                                  :options="eventTypes"
                                  placeholder="Select Type"
                                  class="w-full"
                                />
                              </div>

                              <div v-if="schedule.scheduleType === 'Teaching'">

                                <!-- Course -->
                                <div class="flex gap-4">
                                  <div class="w-1/2">
                                  <label class="block mb-1 font-semibold">Program Code</label>
                                  <UInput v-model="schedule.programCode" placeholder="TBA" class="w-full" />
                                </div>
                                <div class="w-1/2">
                                  <label class="block mb-1 font-semibold">Course</label>
                                  <UInputMenu
                                  v-model="schedule.course"
                                  :options="courses"
                                  optionAttribute="name"
                                  valueAttribute="value"
                                  placeholder="Start typing course…"
                                  :filterable="true"
                                  :onFilter="onCourseSearch" 
                                  class="w-full"
                                  />
                                </div>
                              </div>
                              
                              <!-- Room & Modality-->
                              <div class="flex gap-4">
                                <div class="w-1/2">
                                  <label class="block mb-1 font-semibold">Room</label>
                                  <UInput v-model="schedule.room" placeholder="TBA" class="w-full" />
                                </div>
                                <div class="w-1/2">
                                  <label class="block mb-1 font-semibold">Modality</label>
                                  <USelect v-model="schedule.modality" :options="modality" class="w-full" />
                                </div>
                              </div>
                              
                            </div>
                              <!-- Day -->
                              <div>
                                <label class="block mb-1 font-semibold">Day</label>
                                <USelectMenu
                                multiple
                                v-model="schedule.day"
                                :options="days"
                                placeholder="Select Day"
                                class="w-full"
                                />
                              </div>
                              
                              <div class="flex gap-4">
                                <!-- Start Time -->
                                <div class="w-1/2">
                                  <label class="block mb-1 font-semibold">Start Time</label>
                                  <USelect
                                  v-model="schedule.startTime"
                                  :options="otherTimeSlots"
                                  placeholder="Select Start Time"
                                  class="w-full"
                                  />
                                </div>
                                <!-- End Time -->
                                <div class="w-1/2">
                                  <label class="block mb-1 font-semibold">End Time</label>
                                  <USelect
                                    v-model="schedule.endTime"
                                    :options="otherTimeSlots"
                                    placeholder="Select End Time"
                                    class="w-full"
                                    />
                                </div>
                              </div>
                            </div>

                            <template #footer>
                              <UButton type="button" class="mr-2 bg-[#B20000]" @click="[scheduleForm = false, resetSchedule()]">
                                Cancel
                              </UButton>
                              <UButton type="button" color="primary" @click="[scheduleForm = false, addEvent()]">
                                Add Schedule
                              </UButton>
                            </template>
                          </UCard>
                        </UModal>
                      </div>
                    </div>

                    <!-- <div class="col-span-2 row-span-1">
                      <p class="text-sm text-gray-500 dark:text-gray-400">
                        Please confirm the details below:
                      </p>
                      <ul class="list-disc pl-5 space-y-1">
                        <li>Name: {{ facultyInfo?.name }}</li>
                        <li>Email: {{ facultyInfo?.email }}</li>
                        <li>Designation: {{ facultyInfo?.designation }}</li>
                        <li>Rank: {{ facultyInfo?.pr_rank }}</li>
                        <li>Status: {{ facultyInfo?.status }}</li>
                      </ul>
                    </div> -->

                  </div>

                  <template #footer>
                    <UButton type="button" class="mr-2 bg-[#B20000]" @click="[borrowerForm = false]">
                      Cancel
                    </UButton>
                    <UButton type="button" color="primary" @click="[borrowerForm = false, onSubmitBorrow()]">
                      Confirm Borrow
                    </UButton>
                  </template>
                </UCard>
              </UModal>
            
            </div>

            <div v-if="item.key === 'csv'">
              <UInput type="file" size="sm" icon="i-heroicons-folder" />
              <UButton @click="uploadCSV" color="primary">Upload</UButton>
            </div>

            <template #footer>
              <div class="flex justify-end">
                <div>
                  <UButton type="button" class="mr-2 bg-[#B20000]" @click="[resetValues(), isOpen = false]">
                  Cancel
                  </UButton>
                  <UButton v-if="item.key === 'pr_unit'" type="submit" color="primary">
                    Sign up Faculty
                  </UButton>
                </div>
              </div>
            </template>

          </UCard>
        </template>
      </UTabs>
    </UModal>
  </div>
</template>
