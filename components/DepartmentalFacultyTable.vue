<script setup lang="ts">
import { routerViewLocationKey } from 'vue-router';
import signup from '~/components/signup.vue';
const supabase = useNuxtApp().$supabase;

const { 
  getCollegeName, 
  getDepartmentName,
  getAcadServicesName
} = useAccountCreationValues()
const toast = useToast()

// Accept the unit type and id (college, service, or department)
const props = defineProps<{
  unitType: 'college' | 'service' | 'department'
  unitId: number
}>()

const columns = [{
  key: 'name',
  label: 'Name',
  sortable: true,
  class: 'w-[12%]'
}, {
  key: 'email',
  label: 'Email',
  class: 'w-[15%]'
}, {
  key: 'rank',
  label: 'Rank',
  sortable: true,
  class: 'w-[10%]'
}, {
  key: 'college',
  label: 'College',
  sortable: true,
  class: 'w-[10%]'
}, {
  key: 'acadServices_id',
  label: 'Acad Services',
  sortable: true,
  class: 'w-[10%]'
}, {
  key: 'department',
  label: 'Department',
  sortable: true,
  class: 'w-[10%]'
}, {
  key: 'designation',
  label: 'Designation',
  sortable: true,
  class: 'w-[18%]'
}, {
  key: 'status',
  label: 'Status',
  sortable: true,
  class: 'w-[5%]'
}, {
  key: 'actions',
  label: '',
  class: 'w-[3%]'
}]

const people = ref<any[]>([])
const loading = ref(false)

// Load child departments for this unit
const departments = ref<Array<{ department_id: number }>>([])
async function loadDepartments() {
  const fk = getForeignKey(props.unitType);

  if (!fk) {
    departments.value = [];
    return;
  }

  function getForeignKey(unitType: any) {
    switch (unitType) {
      case 'college':
        return 'college_id';
      case 'service':
        return 'acadServices_id';
      default:
        return null;
    }
  }
  const { data, error } = await supabase
    .from('departments')
    .select('department_id')
    .eq(fk, props.unitId)
  if (error) console.error('Error loading departments:', error.message)
  departments.value = data || []
}

// Load users based on unit or child departments
async function loadPeople() {
  loading.value = true
  let query = supabase.from('users').select('*')

  if (departments.value.length) {
    const deptIds = departments.value.map(d => d.department_id)
    query = query.or(
      `pr_department_id.in.(${deptIds.join(',')}),sd_department_id.in.(${deptIds.join(',')})`
    )
  } else {
    let col = ''
    if (props.unitType === 'department') col = 'pr_department_id'
    else if (props.unitType === 'college') col = 'pr_college_id'
    else if (props.unitType === 'service') col = 'acadServices_id'
    query = query.eq(col, props.unitId)
  }

  const { data: users, error } = await query
  if (error) {
    console.error('Error fetching faculty:', error.message)
    loading.value = false
    return
  }

  people.value = users!.map(u => {
    const prCol = u.pr_college_id
    const sdCol = u.sd_college_id
    const prDept = u.pr_department_id
    const sdDept = u.sd_department_id

    // Resolve college logic
    let college = 'None'
    if (u.acadServices_id && u.acadServices_id > 0) {
      college = 'None'
    } else if (prCol && sdCol && prCol !== sdCol) {
      college = `${getCollegeName(prCol)}, ${getCollegeName(sdCol)}`
    } else if (prCol || sdCol) {
      college = getCollegeName(prCol || sdCol)
    }

    // Resolve department logic
    let department = 'None'
    if (prDept && sdDept && prDept !== sdDept) {
      department = `${getDepartmentName(prDept)}, ${getDepartmentName(sdDept)}`
    } else if (prDept || sdDept) {
      department = getDepartmentName(prDept || sdDept)
    }

    return {
      ...u,
      college,
      department,
      acadServices_id: getAcadServicesName(u.acadServices_id ?? 0)
    }
  })

  loading.value = false
}


const q = ref('')
const page = ref(1)
const pageCount = 7

// TODO: find out how to decrease row height
// TODO: make row count responsive

const filteredRows = computed(() => {
  if (!q.value) return people.value 
  return people.value.filter((person: string) =>
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


// React to prop changes
watch(() => [props.unitType, props.unitId], async () => {
  await loadDepartments()
  await loadPeople()
})

onMounted(async () => {
  await loadDepartments()
  await loadPeople()
})
</script>

<template>
  <div class="flex flex-col justify-between h-full">
    <div class="flex justify-between items-center border-b px-3 py-2.5">
      <h1 class="font-sans text-green-700 font-bold">Manage Faculty Members</h1>
      <div class="flex items-center gap-2">
        <button @click="loadPeople" :disabled="loading">
          <UIcon name="i-material-symbols-refresh-rounded" class="w-6 h-6 cursor-pointer text-[#017C35] hover:animate-spin" />
        </button>
        <UInput v-model="q" placeholder="Filter people..." />
      </div>
    </div>

    <div class="h-full">
      <UTable :rows="paginatedRows" :columns="columns">
        <template #actions-data="{ row }">
          <editUser :user_auth_id="row.user_auth_id" :usedIn="'table'" />
            <!-- <UIcon name="i-ic-baseline-remove-red-eye" class="w-6 h-6 text-red-500 cursor-pointer" @click="console.log(row)" /> -->
        </template>
      </UTable>
    </div>

    <div class="flex justify-between items-center px-3 py-2.5 border-t">
      <signup />
      <UPagination v-model="page" :page-count="pageCount" :total="filteredRows.length" />
    </div>
  </div>
</template>