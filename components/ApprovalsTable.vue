<script setup lang="ts">
const supabase = useNuxtApp().$supabase;
import { useNuxtApp } from '#app'
import { LazyUTable } from '#components';
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
const approvalId = ref(0)

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
    console.log('approvalList: ', approvalList.value)
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
  console.log('Received approval id: ', approval_id)
  // Find the matching approval record
  const approval = approvalList.value.find((a: any) => a.id === approval_id) || sentRequestsList.value.find((a: any) => a.id === approval_id)
  if (!approval) {
    approvalRows.value = []
    selectedApproval.value = null
    requestedMemberInfo.value = null
    console.log('No matching approval found')
    return
  }

  // *** CHANGED: Set approvalRows to the JSONB array directly ***
  approvalRows.value =  approval.work_time_schedule || []
  

  // Fetch course codes for each item in approvalRows
  approvalRows.value = await Promise.all(
    approvalRows.value.map(async (row) => {
      if (!row.course) return row
      else {
        const { data, error } = await supabase
          .from('courses')
          .select('course_code')
          .eq('course_id', row.course)
          .single()
  
        // console.log('row.course: ',row.course)
        // console.log('data: ', data, 'error: ', error)
        return {
          ...row,
          course_code: data?.course_code
        }
      }
    })
  )

  // Store the full approval so we can show status/note in Details
  selectedApproval.value = approval

  // *** CHANGED: Fetch the requested member’s info ***
  if (!isReceived.value) {
    // For sent requests, fetch the recipient dean info
    const { data: deanData, error: deanErr } = await supabase
      .from('users')
      .select('name, pr_college_id, pr_department_id, pr_acadServices_id')
      .eq('user_auth_id', approval.borrowing_dean_id)
      .single()
    if (!deanErr && deanData) {
      selectedApproval.value.dean_name = deanData.name
      if (deanData.pr_department_id != null) {
        selectedApproval.value.dean_unit = getDepartmentName(deanData.pr_department_id)
      } else if (deanData.pr_college_id != null) {
        selectedApproval.value.dean_unit = getCollegeName(deanData.pr_college_id)
      } else {
        selectedApproval.value.dean_unit = getAcadServicesName(deanData.pr_acadServices_id)
      }
    } else {
      selectedApproval.value.dean_name = 'Unknown'
      selectedApproval.value.dean_unit = 'Unknown'
    }
  }
  // Fetch requested member info for both received and sent requests
  const { data: memberData, error: memberErr } = await supabase
    .from('users')
    .select('name, pr_college_id, pr_department_id, pr_acadServices_id')
    .eq('user_auth_id', approval.user_id)
    .single()

  if (!memberErr && memberData) {
    requestedMemberInfo.value = {
      name: memberData.name,
      unit:
        memberData.pr_department_id != null
          ? getDepartmentName(memberData.pr_department_id)
          : memberData.pr_college_id != null
          ? getCollegeName(memberData.pr_college_id)
          : getAcadServicesName(memberData.pr_acadServices_id)
    }
  } else {
    requestedMemberInfo.value = { name: 'Unknown', unit: 'Unknown' }
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
  await getBorrowerInfo();
  console.log('dean info', deanInfo.value)

  //check if approval is already approved
  if (selectedApproval.value.approval_status === 'Approved') {
    toast.add({ title: 'Approval already approved', color: 'red' })
    return
  }
  for (const entry of approvalRows.value) {
    console.log('entry: ', entry)
    // Check for existing schedule
    const { data: existing, error: checkError } = await supabase
      .from('facultySchedules')
      .select('schedule_id')
      .eq('faculty_id', selectedApproval.value.user_id)
      .eq('day', entry.day)
      .eq('start_time', entry.startTime)
      .eq('end_time', entry.endTime)
      .eq('schedule_type', entry.scheduleType)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for existing schedule:', checkError);
      continue;
    }
    if (existing) {
      console.log('Duplicate schedule found, skipping insert:', existing);
      
      continue; // Skip duplicate
    }

    const payload = {
      faculty_id: selectedApproval.value.user_id,
      course_id: entry.course || null,
      programCode: entry.course_code,
      day: entry.day,
      schedule_type: entry.scheduleType,
      start_time: entry.startTime,
      end_time: entry.endTime,
      room: entry.room,
      modality: entry.modality,
      acadYear: deanInfo.value.acadYear,
      acadSem: deanInfo.value.acadSem
    }
    // console.log('payload: ', payload)
    // Insert if not duplicate
    const { data, error } = await supabase
      .from('facultySchedules')
      .insert(payload)
      .select();

    if (error) {
      console.error('Error inserting schedule entry:', error);
      return;
    } else {
      console.log('Schedule entry inserted successfully:', data);
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
  } else {
    toast.add({ title: 'Faculty borrow request approved!', color: 'green' })
    await loadApprovals(approvalId.value)
    await getBorrowerList()
  }
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

const resetForm = () => {
  selectedApproval.value = {}
  approvalRows.value = []
  requestedMemberInfo.value = {}
  borrowerList.value = []
}

const deleteRequest = async (id: number) => {
  const { error } = await supabase
    .from('informationApprovals')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting request:', error)
    return
  } else {
    toast.add({ title: 'Request deleted successfully: ', color: 'green' })
    console.log('request with id: ', id, ' deleted successfully')
    await getAllApprovals()
  }
}

// sent requests
const isReceived = ref(true)
const sentRequestsList = ref<any>([])
const isDisabledRequeset = ref(true)
const isDisabledNote = ref(false)
const sentColumns = [{
  key: 'request_id',
  label: 'No.',
  sortable: true,
},  {
  key: 'approval_status',
  label: 'Status',
  sortable: true,
}, {
  key: 'actions',
  label: '',
}]
watch(isReceived, async () => {
  if (!isReceived.value) {
    await getSentRequests()
    isDisabledRequeset.value = false
    isDisabledNote.value = true
  } else {
    await getAllApprovals()
    await getBorrowerList()
    isDisabledRequeset.value = true
    isDisabledNote.value = false
  }
})

const getSentRequests = async ()=> {
  const { data, error } = await supabase
    .from('informationApprovals')
    .select('*')
    .eq('borrowing_dean_id', userid)

  if (error) {
    console.error('Error fetching sent requests:', error)
    return
  } else {
    sentRequestsList.value = data
    sentRequestsList.value = sentRequestsList.value.map((request: any, i: number) => {
      request.created_at = request.created_at.slice(0,10)
      return {
        ...request,
        request_id: i+1
      }
    })
    /* for (const request of sentRequestsList.value) {
      request.created_at = request.created_at.slice(0,10)
      request.id = i
      i++
    }  */
    console.log('sentRequests: ', sentRequestsList.value)
  }
}

// TODO: figure out why this doesnt work -- june 6

</script>
<template>
  <div class="h-[7%]">
    <div class="items-center align-center h-full w-full ">

      <!-- custom tabs component -->
      <div @click="[isToggled = !isToggled, approvalList = []]" class="flex justify-between cursor-pointer ml-4 pt-4 mr-4">

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
      <!-- 
        <div>
          <p class="text-[#017C35] font-bold">Requestor</p>
        </div> 
      -->
          <div @click="[isReceived = !isReceived, resetForm()]" class="flex justify-between cursor-pointer">

          <div v-if="isReceived" class="bg-white rounded-md p-1 flex w-full">
            <p class="text-[#017C35] font-bold bg-[#ebebeb] w-1/2 rounded-md text-center">Received Requests</p>
            <p class="w-1/2 text-center">Sent Requests</p>
          </div>
          
          <div v-if="!isReceived" class="bg-white rounded-md p-1 flex w-full">
            <p class="w-1/2 text-center">Received Requests</p>
            <p class="text-[#017C35] font-bold bg-[#ebebeb] w-1/2 rounded-md text-center">Sent Requests</p>
          </div>

        </div>

        <!-- received requests -->
        <div v-if="isReceived">
          <UTable :rows="paginatedRows" :columns="columns">
            <template #actions-data="{ row }">
              <UIcon name="i-ic-baseline-remove-red-eye" class="w-6 h-6 cursor-pointer text-[#017C35] mr-2" alt="view"  @click="[loadApprovals(row.approval_id), approvalId = row.approval_id]"  />
              <UIcon name="i-material-symbols-delete-outline-rounded" class="w-6 h-6 cursor-pointer text-[#dd3a3a]"  @click="[console.log('deleting approval id: ', row.approval_id), deleteRequest(row.approval_id)]"  />
            </template>
          </UTable>
        </div>

        <!-- sent requests -->
        <div v-if="!isReceived">
          <UTable :rows="sentRequestsList" :columns="sentColumns">
            <template #actions-data="{ row }">
              <UIcon name="i-ic-baseline-remove-red-eye" class="w-6 h-6 cursor-pointer text-[#017C35] mr-2" alt="view"  @click="[loadApprovals(row.id), console.log(row)]"  />
              <UIcon name="i-material-symbols-delete-outline-rounded" class="w-6 h-6 cursor-pointer text-[#dd3a3a]"  @click="[console.log('deleting approval id: ', row.id)]"  />
            </template>
          </UTable>
        </div>
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
             <!-- <UButton
              class="bg-[#017C35] text-white font-bold rounded-lg"
              variant="ghost"
              size="sm"
              @click="console.log('Approve All for parent ID=', selectedApproval?.id)"
            >
              Approve All
            </UButton> -->
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
              <p>
                <!-- Show dean name for received requests, else for sent requests show recipient dean info -->
                <span v-if="isReceived">
                  {{ borrowerList.find(d => d.approval_id === selectedApproval?.id)?.name || '' }}
                </span>
                <span v-else>
                  {{ selectedApproval?.dean_name || '' }}
                </span>
              </p>
              <p>
                <span v-if="isReceived">
                  {{ borrowerList.find(d => d.approval_id === selectedApproval?.id)?.unit || '' }}
                </span>
                <span v-else>
                  {{ selectedApproval?.dean_unit || '' }}
                </span>
              </p>
            </div>
          </div>
          <div>
            <p class="">Request Note:</p>
            <div v-if="selectedApproval">
              <UTextarea color="primary" variant="outline" v-model="selectedApproval.request_note" :disabled="isDisabledRequeset"/>
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
          <p class="text-[#017C35] font-bold">Approval Status</p>
          <p v-if="selectedApproval">{{ selectedApproval?.approval_status || '' }}</p>
        </div>

        <div>
          <p v-if="isReceived" class="text-[#017C35] font-bold">Add Approval Note</p>
          <p v-if="!isReceived" class="text-[#017C35] font-bold">View Approval Note</p>
          <div v-if="selectedApproval">
            <UTextarea color="primary" variant="outline" v-model="selectedApproval.approval_note" :disabled="isDisabledNote"/>
          </div>
        </div>

        <div class="h-[6%]">
          <div v-if="isReceived" class="flex justify-between">
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
  </div>
</template>