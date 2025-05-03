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
  acadServicesOptions,
  facultyItems,
  ranks,
  range
} = useAccountCreationValues()

const props = defineProps<{ 
  user_auth_id: string | undefined,
  usedIn: string,
}>()

const { data: { user } } = await supabase.auth.getUser()


const items = [{
  key: 'account',
  label: 'Basic Information',
  description: ''
}, {
  key: 'roles',
  label: 'Roles & Department',
  description: ''
}]


const accountForm = reactive({
  name: '', 
  email: '', 
  password: '',
  item: '',
  userRole: '',
  rank: '',
  rankValue: '',
  status: ''
})
const rolesForm = reactive({ 
  primaryCollege: '',
  secondaryCollege: '', 
  primaryDept: '', 
  secondaryDept: '',
  acadServices: '', 
  designation: '',
})

const getUser = async () => {
  let { data: users, error } = await supabase
  .from('users')
  .select('*')
  .eq('user_auth_id', props.user_auth_id)
  
    if (error) {
      console.error('Error fetching users:', error.message)
    } else {
      // set the form values
      accountForm.name = users?.[0].name
      accountForm.email = users?.[0].email
      accountForm.password = users?.[0].password
      accountForm.rank = users?.[0].rank
      accountForm.rankValue = users?.[0].rank_value
      accountForm.item = users?.[0].item
      accountForm.status = users?.[0].status
      accountForm.userRole = users?.[0].role
      
      rolesForm.primaryCollege = users?.[0].pr_college_id
      rolesForm.secondaryCollege = users?.[0].sd_college_id
      rolesForm.primaryDept = users?.[0].pr_department_id
      rolesForm.secondaryDept = users?.[0].sd_department_id
      rolesForm.acadServices = users?.[0].acadServices_id
      rolesForm.designation = users?.[0].designation
      
    }
}

// TODO: make component able to update user email and password via edge functions

const onSubmit = async () => {
  console.log('Form values: ', accountForm, rolesForm);

  /*
  
  // check if user's email and password changed
  if (accountForm.email !== user?.email) {
    const { error } = await supabase.auth.updateUser({
      email: accountForm.email,
      password: accountForm.password
    })
    if (error) {
      console.error('Error updating user:', error.message)
      toast.add({ title: 'Error updating user', color: 'red' });
    } else {
      console.log('User updated successfully:', data);
    }
  }
  */

  const { data, error } = await supabase
    .from('users')
    .update({
      name: accountForm.name,
      email: accountForm.email,
      password: accountForm.password,
      rank: `${accountForm.rank} ${accountForm.rankValue}`,
      item: accountForm.item,
      role: accountForm.userRole,
      status: accountForm.status,
      pr_college_id: rolesForm.primaryCollege,
      sd_college_id: rolesForm.secondaryCollege,
      pr_department_id: rolesForm.primaryDept,
      sd_department_id: rolesForm.secondaryDept,
      acadServices_id: rolesForm.acadServices,
      designation: rolesForm.designation,
      })
    .eq('user_auth_id', props.user_auth_id)
    .select();
    

  if (error) {
    console.error('Error updating user:', error.message);
    toast.add({ title: 'Error updating user', color: 'red' });
  } else {
    console.log('User updated successfully:', data);
    if (data.length === 0) {
      console.warn('No rows were updated. Check if user_auth_id is correct or if RLS policies are blocking the update.');
    } else {
      console.log('Updated user data:', data);
      toast.add({ title: 'User updated successfully!', color: 'green' });
      isOpen.value = false; 
    }
  }
}

onMounted(() => {
  getUser()
})

const isOpen = ref(false);

</script>

<template>
  <div class="flex items-center justify-center ">
    <div v-if="usedIn === 'table'" class="flex items-center justify-center">
      <UButton @click="isOpen = true" variant="ghost" icon="i-material-symbols-edit" color="black"/>
    </div>

    <div v-else-if="usedIn === 'profile'">
      <UButton @click="isOpen = true" variant="ghost">Edit Info</UButton>
    </div>


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


              <div class="flex flex-row gap-2">
                <div class="w-1/2">
                  <UFormGroup label="Rank" name="rank" required>
                    <USelect
                      v-model="accountForm.rank"
                      :options="ranks"
                      optionAttribute="name"
                      required
                    />
                  </UFormGroup>
                </div>
                <div class="w-1/2">
                  <UFormGroup label="Rank Value" name="rank value" required>
                    <USelect
                      v-model="accountForm.rankValue"
                      :options="range"
                      optionAttribute="name"
                      required
                    />
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

              <UFormGroup label="User Status" name="current" required>
                <USelect 
                  v-model="accountForm.status"
                  :options="status"
                  optionAttribute="name"
                  required
                />
              </UFormGroup>

            </div>


            <div v-else-if="item.key === 'roles'" class="space-y-3">

              <UFormGroup label="Primary College" name="college" required>
                <USelect
                  v-model="rolesForm.primaryCollege"
                  :options="collegeOptions"
                  valueAttribute="value"
                  optionAttribute="name"
                  required
                  label="name"
                />
              </UFormGroup>

              <UFormGroup label="Secondary College" name="college" required>
                <USelect
                  v-model="rolesForm.secondaryCollege"
                  :options="collegeOptions"
                  valueAttribute="value"
                  optionAttribute="name"
                  required
                  label="name"
                />
              </UFormGroup>

              <UFormGroup label="Academic Services" name="acadServices" required>
                <USelect
                  v-model="rolesForm.acadServices"
                  :options="acadServicesOptions"
                  optionAttribute="name"
                  required 
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
