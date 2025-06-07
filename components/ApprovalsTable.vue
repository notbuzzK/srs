<script setup lang="ts">
const supabase = useNuxtApp().$supabase;
import { useNuxtApp } from '#app'
const toast = useToast()

const { 
  getCollegeName, 
  getDepartmentName,
  getAcadServicesName
} = useAccountCreationValues()

const {
  courses,
  getCourses,
  getCourseCode,
} = useSchedule()

const columns = [{
  key: 'name',
  label: 'Dean Name',
  sortable: true,
  class: 'w-[45%]' 
}, { 
  key: 'unit',
  label: 'Unit',
  sortable: true,
  class: 'w-[45%]'
}, { 
  key: 'actions',
  label: '',
  class: 'w-[10%]' }
]

// Columns for the “Borrowed on” table (schedule lines)
const approvalColumns = [{
  key: 'scheduleType',
  label: "Schedule Type",
  sortable: true,
}, {
  key: 'programCode',
  label: "Program Code",
  sortable: true,
}, {
  key: 'course_code',
  label: "Course",
  sortable: true,
}, {
  key: 'room',
  label: "Room",
  sortable: true,
}, {
  key: 'modality',
  label: "Modality",
  sortable: true,
}, {
  key: 'day',
  label: "Day",
  sortable: true,
}, {
  key: 'startTime',
  label: "Start Time",
  sortable: true,
}, {
  key: 'endTime',
  label: "End Time",
  sortable: true,
}]

const borrowerList = ref<any[]>([])    // list of { name, unit, approval_id } for each dean
const approvalList = ref<any[]>([])    // raw approvals matching primary unit
const approvalRows = ref<any[]>([])    // will hold the flat work_time_schedule entries
const selectedApproval = ref<any>(null) // *** CHANGED: store full approval record
const requestedMemberInfo = ref<any>(null) // *** CHANGED: store member's name & unit
const loading = ref(false)
const isToggled = ref(false)

const q = ref('')
const page = ref(1)
const pageCount = 7

// TODO: find out how to decrease row height
// TODO: make row count responsive

const filteredRows = computed(() => {
  if (!q.value) return borrowerList.value 
  return borrowerList.value.filter((dean: any) =>
    Object.values(dean).some((value) =>
      String(value).toLowerCase().includes(q.value.toLowerCase())
    )
  )
})

const paginatedRows = computed(() => {
  const start = (page.value - 1) * pageCount
  const end = start + pageCount
  return filteredRows.value.slice(start, end)
})

const { data: { user } } = await supabase.auth.getUser()

const userid = user?.id
const userRow = ref<any>(null)

const deanInfo = ref<any>(null)
const getBorrowerInfo = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('pr_college_id, pr_acadServices_id, pr_department_id, acadYear, acadSem')
    .eq('user_auth_id', selectedApproval.value.borrowing_dean_id)

  if (error) {
    console.log('Error fetching user row: ', error.message)
  } else {
    deanInfo.value = data[0]
  }
}


const getPrimaryUnit = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('pr_college_id, pr_department_id, pr_acadServices_id')
    .eq('user_auth_id', userid)

  if (error) {
    console.log('Error fetching user row: ', error.message)
  } else {
    userRow.value = data[0]
  }
}

// Fetch all approvals that match this user’s primary unit
const getAllApprovals = async () => {
  const conditions: string[] = [];

  // Add conditions for each pr_ column if they are not null
  if (userRow.value.pr_college_id != null) {
    conditions.push(`pr_college_id.eq.${userRow.value.pr_college_id}`);
  }
  if (userRow.value.pr_acadServices_id != null) {
    conditions.push(`pr_academicServices_id.eq.${userRow.value.pr_acadServices_id}`);
  }
  if (userRow.value.pr_department_id != null) {
    conditions.push(`pr_department_id.eq.${userRow.value.pr_department_id}`);
  }

  // Create the query
  let query = supabase.from('informationApprovals').select('*');

  // Apply conditions if any exist
  if (conditions.length > 0) {
    query = query.or(conditions.join(','));
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching approvals:', error);
  } else {
    approvalList.value = data || [];
  }
}

// Build the “borrowerList” from approvalList (one row per distinct borrowing_dean_id)
// *** CHANGED: removed early return so all deans accumulate
const getBorrowerList = async () => {
  borrowerList.value = []   // clear before building
  for (const element of approvalList.value) { 
    const borrowing_dean_id = element.borrowing_dean_id
    // Initialize a fresh object for this iteration
    const deanInfo = { approval_id: element.id } as any

    const { data, error } = await supabase
      .from('users')
      .select('pr_college_id, pr_department_id, pr_acadServices_id, name')
      .eq('user_auth_id', borrowing_dean_id)
      .single()

    if (error) {
      console.log('Error fetching user row: ', error.message)
      continue
    }

    deanInfo.name = data.name
    // Determine the unit name
    if (data.pr_department_id != null) {
      deanInfo.unit = getDepartmentName(data.pr_department_id)
    } else if (data.pr_college_id != null) {
      deanInfo.unit = getCollegeName(data.pr_college_id)
    } else {
      deanInfo.unit = getAcadServicesName(data.pr_acadServices_id)
    }
    // Store the approval_id so we can load schedule when Eye is clicked
    deanInfo.approval_id = element.id

    // Avoid duplicates: only push if not already in borrowerList
    if (!borrowerList.value.some((d: any) => d.approval_id === deanInfo.approval_id)) {
      borrowerList.value.push(deanInfo)
    }
  }
}

// When you click the “Eye” icon, load that approval’s schedule entries
// and also fetch the requested member’s name & primary unit for the Details panel
const loadApprovals = async (approval_id: number) => {
  // Find the matching approval record
  const approval = approvalList.value.find((a: any) => a.id === approval_id)
  if (!approval) {
    approvalRows.value = []
    selectedApproval.value = null
    requestedMemberInfo.value = null
    return
  }

  // *** CHANGED: Set approvalRows to the JSONB array directly ***
  approvalRows.value =  approval.work_time_schedule || []

  // Fetch course codes for each item in approvalRows
  approvalRows.value = await Promise.all(
    approvalRows.value.map(async (row) => {
      const { data, error } = await supabase
        .from('courses')
        .select('course_code')
        .eq('course_id', row.course)
        .single()

      console.log('data: ', data, 'error: ', error)
      return {
        ...row,
        course_code: error ? null : data?.course_code ?? null
      }
    })
  )

  // Store the full approval so we can show status/note in Details
  selectedApproval.value = approval

  // *** CHANGED: Fetch the requested member’s info ***
  const { data: memberData, error: memberErr } = await supabase
    .from('users')
    .select('name, pr_college_id, pr_department_id, pr_acadServices_id')
    .eq('user_auth_id', approval.user_id)
    .single()

  if (memberErr || !memberData) {
    requestedMemberInfo.value = { name: 'Unknown', unit: 'Unknown' }
  } else {
    const info: any = { name: memberData.name }
    if (memberData.pr_department_id != null) {
      info.unit = getDepartmentName(memberData.pr_department_id)
    } else if (memberData.pr_college_id != null) {
      info.unit = getCollegeName(memberData.pr_college_id)
    } else {
      info.unit = getAcadServicesName(memberData.pr_acadServices_id)
    }
    requestedMemberInfo.value = info

    await getBorrowerInfo()
  }
}

onMounted(async () => {
  await getPrimaryUnit()
  await getAllApprovals()
  await getBorrowerList()
  await getCourses()
})

const onApproved = async () => {
  // loops over approvalRows and inserts each entry into facultySchedules table along with user info from selectedApproval
  for (const entry of approvalRows.value) {
    const { data, error } = await supabase
      .from('facultySchedules')
      .upsert({
        faculty_id: selectedApproval.value.user_id,
        course_id: entry.course,
        programCode: entry.course_code,
        day: entry.day,
        schedule_type: entry.scheduleType,
        start_time: entry.startTime,
        end_time: entry.endTime,
        room: entry.room,
        modality: entry.modality,
        acadYear: deanInfo.value.acadYear,
        acadSem: deanInfo.value.acadSem
      })
      .select()

    if (error) {
      console.error('Error inserting schedule entry:', error)
      return
    } else {
      console.log('Schedule entry inserted successfully:', data)
    }
  }

  const { data: approvalData, error: approvalErr } = await supabase
    .from('informationApprovals')
    .update({
      approval_note: selectedApproval.value.approval_note,
      approval_status: 'Approved'
    })
    .eq('id', selectedApproval.value.id)
    .select()

  if (approvalErr) {
    console.error('Error updating approval:', approvalErr)
    return
  } 

  // sets borrowed user's secondary unit to the dean's primary unit
  const { data, error } = await supabase
    .from('users')
    .update({
      sd_college_id: deanInfo.value.pr_college_id,
      sd_department_id: deanInfo.value.pr_department_id,
      sd_acadServices_id: deanInfo.value.pr_acadServices_id
    })
    .eq('user_auth_id', selectedApproval.value.user_id)
    .select()

  if (error) {
    console.error('Error updating user:', error)
    return
  }

  toast.add({ title: 'Faculty borrow request approved!', color: 'green' })
  await getAllApprovals()
}

const onRejected = async () => {
  const { data: approvalData, error: approvalErr } = await supabase
    .from('informationApprovals')
    .update({
      approval_note: selectedApproval.value.approval_note,
      status: 'Rejected'
    })
    .eq('id', selectedApproval.value.id)
    .select()

  if (approvalErr) {
    console.error('Error updating approval:', approvalErr)
    return
  }
}

// TODO: figure out why this doesnt work

</script>
<template>
  <div class="h-[7%]">
    <div class="items-center align-center h-full w-full ">

      <!-- custom tabs component -->
      <div @click="[isToggled = !isToggled, console.log(isToggled)]" class="flex justify-between cursor-pointer ml-4 pt-4 mr-4">

        <div v-if="isToggled" class="bg-white rounded-md p-1 flex w-full">
          <p class="text-[#017C35] font-bold bg-[#ebebeb] w-1/2 rounded-sm text-center">Schedule Approval</p>
          <p class="w-1/2 text-center">Information Approval</p>
        </div>
        
        <div v-if="!isToggled" class="bg-white rounded-md p-1 flex w-full">
          <p class="w-1/2 text-center">Schedule Approval</p>
          <p class="text-[#017C35] font-bold bg-[#ebebeb] w-1/2 rounded-sm text-center">Information Approval</p>
        </div>

      </div>
    </div>
  </div>
  <div class="h-[93%]">

    <!-- Schedule Approval-->
    <div v-if="isToggled" class="grid grid-cols-6 h-full gap-4">
      <div class="col-span-2 bg-white rounded-[12px] ml-4 mt-4 mb-4 p-4">
        <h1>h1llo</h1>
      </div>
      <div class="col-span-4 bg-white rounded-[12px] mr-4 mt-4 mb-4 p-4">
        <h1>h1llo</h1>
      </div>
    </div>

    <!-- Information Approval-->
    <div v-if="!isToggled" class="grid grid-cols-7 h-full gap-4">

      <!-- LEFT: Requestor -->
      <div class="col-span-2 bg-white rounded-[12px] ml-4 mt-4 mb-4 p-4">
        <div>
          <p class="text-[#017C35] font-bold">Requestor</p>
        </div>
        <UTable :rows="paginatedRows" :columns="columns">
          <template #actions-data="{ row }">
            <UIcon name="i-ic-baseline-remove-red-eye" class="w-6 h-6 cursor-pointer text-[#017C35]"  @click="loadApprovals(row.approval_id)"  />
          </template>
        </UTable>
      </div>

      <!-- MIDDLE: Work Time Schedule List -->
      <div class="col-span-3 bg-white rounded-[12px] mr-2 mt-4 mb-4 p-4">
        <div class="flex flex-col h-full">

          <div class="">
            <p class="text-[#017C35] font-bold">Borrowed on</p>
          </div>
          
          <div class=" h-full">
            <UTable :rows="approvalRows" :columns="approvalColumns">
              <template #actions-data="{ row }" >

                <UButton 
                  icon="i-gridicons-cross" 
                  variant="ghost" 
                  class="text-[#DD3A3A]" 
                  @click="console.log('Reject entry id=', row.id)" 
                />
                <UButton 
                  icon="i-ic-round-check" 
                  variant="ghost" 
                  class="text-[#017C35]" 
                  @click="console.log('Approve entry id=', row.id)" 
                />
                
              </template>
            </UTable>
          </div>
          
          <div class=" flex justify-end">
             <UButton
              class="bg-[#017C35] text-white font-bold rounded-lg"
              variant="ghost"
              size="sm"
              @click="console.log('Approve All for parent ID=', selectedApproval?.id)"
            >
              Approve All
            </UButton>
          </div>
        </div>
      </div>

      <!-- RIGHT: Details -->
      <div class="col-span-2 bg-white rounded-[12px] mr-4 mt-4 mb-4 p-4 flex flex-col justify-between">
        <p class="text-[#017C35] font-bold">Details</p>

        <div>
          <p class="text-[#017C35] font-bold">Requestor: </p>
          <div class="flex justify-between">
            <div>
              <p>Dean Name:</p>
              <p>From Unit:</p>
            </div>
            <div v-if="selectedApproval" class="text-right">
              <p>{{ borrowerList.find(d => d.approval_id === selectedApproval?.id)?.name || '' }}</p>
              <p>{{ borrowerList.find(d => d.approval_id === selectedApproval?.id)?.unit || '' }}</p>
            </div>
          </div>
        </div>

        <div>
          <p class="text-[#017C35] font-bold">Requested: </p>
          <div class="flex justify-between">
            <div>
              <p>Member Name:</p>
              <p>From Unit:</p>
            </div>
            <div v-if="selectedApproval" class="text-right">
              <p>{{ requestedMemberInfo?.name || '' }}</p>
              <p>{{ requestedMemberInfo?.unit || '' }}</p>
            </div>
          </div>
        </div>

        <div class="flex justify-between">
          <p class="text-[#017C35]">Approval Status</p>
          <p v-if="selectedApproval">{{ selectedApproval?.approval_status || '' }}</p>
        </div>

        <div>
          <p class="text-[#017C35] font-bold">Add Approval Note</p>
          <div v-if="selectedApproval">
            <UTextarea color="primary" variant="outline" v-model="selectedApproval.approval_note" />
          </div>
        </div>

        <div>
          <UButton 
            class="text-[#DD3A3A] border border-[#DD3A3A] rounded-lg" 
            size="sm" 
            variant="ghost" 
            @click="onRejected"
          >
            Reject
          </UButton>
          <UButton 
            class="text-white font-bold rounded-lg" 
            size="sm" 
            @click="onApproved"
          >
            Approve
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>