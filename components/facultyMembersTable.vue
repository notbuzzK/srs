<script setup lang="ts">
import { getDirectory } from 'nuxt/kit';
import signup from '~/components/signup.vue';
const supabase = useNuxtApp().$supabase;

const { getCollegeName, getDepartmentName } = useAccountCreationValues()

const toast = useToast()

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
  key: 'college',
  label: 'College',
  sortable: true,
  class: 'w-[18%]'
}, {
  key: 'department',
  label: 'Department',
  sortable: true,
  class: 'w-[17%]'
}, {
  key: 'role',
  label: 'Role',
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
  class: 'w-[5%]'
}]

const people = ref([])

const getPeople = async () => {
  let { data: users, error } = await supabase
    .from('users')
    .select('*')

  if (error) {
    console.error('Error fetching users:', error.message)
    people.value = []
  } else {
    // Convert college and department IDs to Names
    people.value = users.map((user) => ({
      ...user,
      college: getCollegeName(user.college_id),
      department: getDepartment(user.pr_department_id, user.sd_department_id)
    }))
  }
}

const getDepartment = (primaryDept: number, secondaryDept: number) => {
  const primaryDepartment = getDepartmentName(primaryDept)
  const secondaryDepartment = getDepartmentName(secondaryDept)

  if (secondaryDept === 0) {
    return `${primaryDepartment}`
  } else {
    return `${primaryDepartment}, ${secondaryDepartment}`
  }
}

onMounted(() => {
  getPeople()
})

const q = ref('')
const page = ref(1)
const pageCount = 7

// TODO: find out how to decrease row height
// TODO: make row count responsive

const filteredRows = computed(() => {
  if (!q.value) return people.value 
  return people.value.filter((person) =>
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

async function deleteUser(uuid: any) {
  // Ensure you are using the service role key for admin operations
  const { data, error: userDeleteError } = await supabase.auth.admin.deleteUser(uuid);
  
  if (userDeleteError) {
    // Handle the error if user deletion fails
    console.error('Error deleting user:', userDeleteError.message);
    return; // Exit the function if user deletion fails
  } 
  
  // Proceed to delete user from the public.users table
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('user_auth_id', uuid);

  if (error) {
    // Handle the error if user deletion from the database fails
    console.error('Error deleting user from database:', error.message);
  } else {
    // User deleted successfully and refresh the table
    console.log('User deleted successfully:', data);
    toast.add({ title: 'User Deleted!' });
    getPeople(); // Refresh the user list
  }
}

const isOpen = ref(false)

// TODO: fix edit user modal

</script>
<template>
  <div class="flex flex-col justify-between h-full">
    <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 px-3 py-2.5">
      <h1 class="font-sans text-[#017C35] font-bold">Manage Faculty Members</h1>
      <div class="flex items-center gap-2">
        <UIcon name="i-material-symbols-refresh-rounded" class="w-6 h-6 text-[#017C35] cursor-pointer hover:animate-spin" @click="getPeople()" />
        <UInput v-model="q" placeholder="Filter people..." />
      </div>
    </div>

    <div class="h-full">
      <UTable :rows="paginatedRows" :columns="columns" class="">

        <template #actions-data="{ row }">
          <editUser :user_auth_id="row.user_auth_id"/>
        </template>

      </UTable>
    </div>

    <div class="flex justify-between items-center px-3 py-2.5 border-t border-gray-200 dark:border-gray-700 ">
      <signup />
      <UPagination v-model="page" :page-count="pageCount" :total="filteredRows.length" />
    </div>
  </div>
</template>