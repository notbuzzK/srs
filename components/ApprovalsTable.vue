<script setup lang="ts">
import { ref, computed, watch, onMounted, toDisplayString } from 'vue'
import { useNuxtApp } from '#app'
import { useUserUnit } from '@/composables/useUserUnit'
const toast = useToast()

const { 
  getCollegeName, 
  getDepartmentName,
  getAcadServicesName
} = useAccountCreationValues()

const columns = [{
  key: 'name',
  label: "Name",
  sortable: true,
}, {
  key: 'actions',
  label: ""
}]

const approvalColumns = [{
  key: 'field_name_display',
  label: "Field",
  sortable: true,
}, {
  key: 'old_value_display',
  label: "Old Value",
  sortable: true,
}, {
  key: 'new_value_display',
  label: "New Value",
  sortable: true,
}, {
  key: 'status',
  label: "Status",
  sortable: true,
}, {
  key: 'actions',
  label: "Actions",
}]

const approvals = ref<any[]>([])
const people = ref<any[]>([])
const loading = ref(false)
const isToggled = ref(false)

const q = ref('')
const page = ref(1)
const pageCount = 7

// TODO: find out how to decrease row height
// TODO: make row count responsive

const filteredRows = computed(() => {
  if (!q.value) return people.value 
  return people.value.filter((person: any) =>
    Object.values(person).some((value) =>
      String(value).toLowerCase().includes(q.value.toLowerCase())
    )
  )
})

const paginatedRows = computed(() => {
  const start = (page.value - 1) * pageCount
  const end = start + pageCount
  return filteredRows.value.slice(start, end)
})

const filteredApprovalsRows = computed(() => {
  if (!q.value) return approvals.value 
  return approvals.value.filter((approvals: any) =>
    Object.values(approvals).some((value) =>
      String(value).toLowerCase().includes(q.value.toLowerCase())
    )
  )
})

const paginatedApprovalsRows = computed(() => {
  const start = (page.value - 1) * pageCount
  const end = start + pageCount
  return filteredApprovalsRows.value.slice(start, end)
})

const fieldNameMap: Record<string, string> = {
  primaryCollege: 'Primary College',
  secondaryCollege: 'Secondary College',
  primaryDept: 'Primary Department',
  secondaryDept: 'Secondary Department',
  acadServices: 'Academic Services',
}

const userFieldMap: Record<string, string> = {
  primaryCollege: 'pr_college_id',
  secondaryCollege: 'sd_college_id',
  primaryDept: 'pr_department_id',
  secondaryDept: 'sd_department_id',
  acadServices: 'academic_service_id',
}

const mappedApprovalsRows = computed(() => {
  return paginatedApprovalsRows.value.map(row => {
    let oldValueDisplay = row.old_value
    let newValueDisplay = row.new_value

    if (row.field_name === 'primaryCollege' || row.field_name === 'secondaryCollege') {
      oldValueDisplay = getCollegeName(Number(row.old_value))
      newValueDisplay = getCollegeName(Number(row.new_value))
    }
    if (row.field_name === 'primaryDept' || row.field_name === 'secondaryDept') {
      oldValueDisplay = getDepartmentName(Number(row.old_value))
      newValueDisplay = getDepartmentName(Number(row.new_value))
    }
    if (row.field_name === 'acadServices') {
      oldValueDisplay = getAcadServicesName(Number(row.old_value))
      newValueDisplay = getAcadServicesName(Number(row.new_value))
    }

    return {
      ...row,
      field_name_display: fieldNameMap[row.field_name] || row.field_name, // for display
      old_value_display: oldValueDisplay,
      new_value_display: newValueDisplay,
      // keep original values for DB
    }
  })
})

const { $supabase } = useNuxtApp()

// fetch full userRow to derive unit
const userRow = ref<any>(null)
async function loadUserRow() {
  const { data: { user } } = await $supabase.auth.getUser()
  if (!user?.id) return
  const { data, error } = await $supabase
    .from('users')
    .select('pr_college_id, sd_college_id, pr_department_id, sd_department_id, acadServices_id, name')
    .eq('user_auth_id', user.id)
    .single()
  if (error) {
    console.error('Error loading user row:', error.message)
  } else {
    userRow.value = data
  }
}

const { unit } = useUserUnit(userRow)

// load child departments under this unit
const departments = ref<number[]>([])
async function loadDepartments() {
  if (!unit.value) {
    departments.value = []
    return
  }
  if (unit.value.type === 'department') {
    departments.value = [unit.value.id]
    return
  }
  // college or service
  const fk = unit.value.type === 'college'
    ? 'college_id'
    : 'acadServices_id'
  const { data, error } = await $supabase
    .from('departments')
    .select('department_id')
    .eq(fk, unit.value.id)
  if (error) {
    console.error('Error loading departments:', error.message)
    departments.value = []
  } else {
    departments.value = data!.map(d => d.department_id)
  }
}

// load all people under this unit (primary or secondary dept)
async function loadPeople() {
  loading.value = true
  let query = $supabase.from('users').select('name, user_auth_id')

  if (departments.value.length) {
    const list = departments.value.join(',')
    query = query.or(
      `pr_department_id.in.(${list}),sd_department_id.in.(${list})`
    )
  } else if (unit.value) {
    // no child depts: filter by college or service
    if (unit.value.type === 'college') {
      query = query.or(
        `pr_college_id.eq.${unit.value.id},sd_college_id.eq.${unit.value.id}`
      )
    } else if (unit.value.type === 'service') {
      query = query.eq('acadServices_id', unit.value.id)
    }
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching people:', error.message)
    people.value = []
  } else {
    people.value = data || []
  }
  loading.value = false
}

const loadUserApprovals = async (user_id: number) => {
  const { data, error } = await $supabase
    .from('informationApprovals')
    .select('*')
    .eq('user_id', user_id)
  if (error) {
    console.error('Error loading user approvals:', error.message)
  } else {
    console.log('User approvals:', data)
    approvals.value = data
  }
}

const approveRequest = async (id: number, field_name: string, field_value: string, user_id: number) => {
  const { data, error } = await $supabase
    .from('informationApprovals')
    .update({ status: 'Approved' })
    .eq('id', id)
  if (error) {
    console.error('Error approving request:', error.message)
  } else {
    console.log('Request approved:', data)
    loadUserApprovals(user_id)

    // Use the correct DB column name
    const dbField = userFieldMap[field_name] || field_name

    const { data: userData, error: userError } = await $supabase
      .from('users')
      .update({ [dbField]: field_value })
      .eq('user_auth_id', user_id)
      .select()

    if (userError) {
      console.error('Error updating user field:', userError.message)
      toast.add({
        title: 'Error updating user field',
        description: 'See console for more info',
        color: 'red',
      })
    } else {
      console.log('User field updated:', userData)
      toast.add({
        title: 'Request Approved',
        description: `Field ${fieldNameMap[field_name] || field_name} updated.`,
        color: 'green',
      })
    }
  }
}

const rejectRequest = async (id: number, user_id: number) => {
  const { data, error } = await $supabase
    .from('informationApprovals')
    .update({ status: 'Rejected' })
    .eq('id', id)
  if (error) {
    console.error('Error rejecting request:', error.message)
  } else {
    console.log('Request rejected:', data)
    loadUserApprovals(user_id)

    toast.add({
      title: 'Request Rejected',
      description: `Sent notification to user (not working yet)`,
      color: 'red',
    })
  }
}

const approveAll = async () => {
  for (const approval of approvals.value) {
    await approveRequest(
      approval.id,
      approval.field_name, // this is the original field_name
      approval.new_value,  // this is the original value (ID)
      approval.user_id
    )
  }
}


onMounted(async () => {
  await loadUserRow()
  await loadDepartments()
  await loadPeople()
})

// re-load when the unit changes or toggle view (optional)
watch(unit, async () => {
  await loadDepartments()
  await loadPeople()
})
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

      </div>
      <div class="col-span-4 bg-white rounded-[12px] mr-4 mt-4 mb-4 p-4">
        <h1>h1llo</h1>
      </div>
    </div>

    <!-- Information Approval-->
    <div v-if="!isToggled" class="grid grid-cols-6 h-full gap-4">
      <div class="col-span-2 bg-white rounded-[12px] ml-4 mt-4 mb-4 p-4">
        <div>
          <p class="text-[#017C35] font-bold">Requestor</p>
        </div>
        <UTable :rows="paginatedRows" :columns="columns">
          <template #actions-data="{ row }">
            <UIcon name="i-ic-baseline-remove-red-eye" class="w-6 h-6 cursor-pointer text-[#017C35]" @click="loadUserApprovals(row.user_auth_id)" />
          </template>
        </UTable>
      </div>
      <div class="col-span-4 bg-white rounded-[12px] mr-4 mt-4 mb-4 p-4">
        <div class="flex flex-col justify-between h-full">

          <p class="text-[#017C35] font-bold">Information Approval</p>
          
          <div class=" h-[80%]">
            <UTable :rows="mappedApprovalsRows" :columns="approvalColumns">
              <template #actions-data="{ row }" >

                <UButton icon="i-gridicons-cross" variant="ghost" class="text-[#DD3A3A]" @click="rejectRequest(row.id, row.user_id)" />

                <UButton icon="i-ic-round-check" variant="ghost" class="text-[#017C35]" @click="approveRequest(row.id, row.field_name, row.new_value, row.user_id)" />
                
              </template>
            </UTable>
          </div>
          
          <div class=" flex justify-end">
             <UButton
              class="bg-[#017C35] text-white font-bold rounded-lg"
              variant="ghost"
              size="sm"
              @click="approveAll"
            >
              Approve All
            </UButton>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>