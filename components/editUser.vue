<script setup lang="ts">
const supabase = useNuxtApp().$supabase;
const toast = useToast()
import { useAccountCreationValues } from '~/composables/useAccountCreationValues';

const { 
  status,
  userRoles,
  collegeOptions,
  departmentOptions,
  designationOptions,
  getCollegeName,
  getDepartmentName
} = useAccountCreationValues()
const props = defineProps<{ user_auth_id: string }>()

const items = [{
  key: 'account',
  label: 'Basic Information',
  description: ''
}, {
  key: 'roles',
  label: 'Roles & Department',
  description: ''
}]


const accountForm = reactive({name: '', email: '', password: '' , status: ''})
const rolesForm = reactive({ 
  userRole: '',
  college: '', 
  primaryDept: '', 
  secondaryDept: '', 
  designation: '' 
})



async function getUser() {
  let { data: users, error } = await supabase
  .from('users')
  .select('*')
  .eq('user_auth_id', props.user_auth_id)
  
    if (error) {
      console.error('Error fetching users:', error.message)
    } else {
      // set the form values
      accountForm.name = users[0].name
      accountForm.email = users[0].email
      accountForm.status = users[0].status
      
      rolesForm.userRole = users[0].role
      rolesForm.college = users[0].college_id
      rolesForm.primaryDept = users[0].pr_department_id
      rolesForm.secondaryDept = users[0].sd_department_id
      rolesForm.designation = users[0].designation
      
    }
}

async function onSubmit() {
  console.log('Form values: ', accountForm, rolesForm);
  
  // Check how many rows exist with the given user_auth_id
  const { count, error: countError } = await supabase
    .from('users')
    .select('user_auth_id', { count: 'exact' })
    .eq('user_auth_id', props.user_auth_id);

  if (countError) {
    console.error('Error counting rows:', countError.message);
    return;
  }

  console.log('Number of rows with user_auth_id:', count);

  if (count !== 1) {
    console.error('Expected exactly one row to update, but found:', count);
    return; // Exit if not exactly one row
  }

  // Proceed with the update if exactly one row is found
  const { data, error } = await supabase
    .from('users')
    .upsert([
      {
        user_auth_id: props.user_auth_id,
        name: accountForm.name,
        email: accountForm.email,
        status: accountForm.status,
        role: rolesForm.userRole,
        college_id: rolesForm.college,
        pr_department_id: rolesForm.primaryDept,
        sd_department_id: rolesForm.secondaryDept,
        designation: rolesForm.designation
      }
    ])
    .select(); // Ensure we get the inserted data back

  if (error) {
    console.error('Error upserting user:', error.message);
    toast.add({ title: 'Error upserting user', color: 'red' });
  } else {
    console.log('User upserted successfully:', data);
    toast.add({ title: 'User upserted successfully', color: 'green' });
  }
}
onMounted(() => {
  getUser()
})

const isOpen = ref(false);

</script>

<template>
  <div class="flex items-center justify-center ">
    <UButton @click="isOpen = true" variant="ghost" icon="i-material-symbols-edit" color="black"/>


    <UModal v-model="isOpen">
      <UTabs :items="items" class="w-full">
        <template #item="{ item }">
          <UCard @submit.prevent="() => onSubmit()">
            <template #header>
              <p class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                {{ item.label }}
              </p>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {{ item.description }}
              </p>
            </template>


            <div v-if="item.key === 'account'" class="space-y-3">

              <UFormGroup label="Name" name="name" required>
                <UInput v-model="accountForm.name" />
              </UFormGroup>
              
              <UFormGroup label="Email" name="email" required>
                <UInput v-model="accountForm.email" />
              </UFormGroup>
              
              <UFormGroup label="Password" name="password" required>
                <UInput v-model="accountForm.password" type="password" />
              </UFormGroup>

              <UFormGroup label="Status" name="status" required>
                <USelect
                  v-model="accountForm.status"
                  :options="status"
                />
              </UFormGroup>
            </div>

            
            <div v-else-if="item.key === 'roles'" class="space-y-3">

              <UFormGroup label="User Role" name="current" required>
                <USelect 
                  v-model="rolesForm.userRole"
                  :options="userRoles"
                  optionAttribute="name"
                  required
                />
              </UFormGroup>

              <UFormGroup label="College" name="college" required>
                <USelect
                  v-model="rolesForm.college"
                  :options="collegeOptions"
                  valueAttribute="value"
                  optionAttribute="name"
                  required
                  label="name"
                />
              </UFormGroup>
              
              <UFormGroup label="Primary Department" name="primaryDept" required>
                <USelect
                  v-model="rolesForm.primaryDept"
                  :options="departmentOptions"
                  valueAttribute="value"
                  optionAttribute="name"
                  required 
                />
              </UFormGroup>

              <UFormGroup label="Secondary Department" name="secondaryDept" required>
                <USelect
                  v-model="rolesForm.secondaryDept"
                  :options="departmentOptions"
                  valueAttribute="value"
                  optionAttribute="name"
                  required
                />
              </UFormGroup>

              <UFormGroup label="Designation" name="designation" required>
                <USelect
                  v-model="rolesForm.designation"
                  :options="designationOptions"
                  optionAttribute="name"
                  required 
                />
              </UFormGroup>

            </div>

            <template #footer>
              <UButton type="button" class="mr-2 bg-[#B20000]" @click="() => $router.back()">
                Cancel
              </UButton>
              <UButton type="submit" color="primary" v-if="item.key === 'roles'">
                Save Changes
              </UButton>
            </template>
          </UCard>
        </template>
      </UTabs>
    </UModal>
  </div>
</template>
