<script setup lang="ts">
import { useSignup } from '~/composables/useSignup'

const items = [{
  key: 'account',
  label: 'Basic Information',
  description: ''
}, {
  key: 'roles',
  label: 'Roles & Department',
  description: ''
}]

const userRoles = [
  'Faculty',
  'Scheduler',
  'CEEA',
  'College Admin',
  'System Admin'
];

const designationOptions = [
  'Professor',
  'Lecturer'
];

const collegeOptions = [
  'College A',
  'College B'
];

const departmentOptions = [
  'Department A',
  'Department B',
];

const accountForm = reactive({name: '', email: '', password: '' ,})
const rolesForm = reactive({ 
  userRole: '',
  college: '', 
  primaryDept: '', 
  secondaryDept: '', 
  designation: '' 
})

const data = {
    ...accountForm,
    ...rolesForm,
  }



async function onSubmit() {
  try {
    
    console.log('User signed up successfully:')
  } catch (error) {
    console.error('Error signing up:', error)
  }
}

// TODO: Update Cancel Button
// TODO: Update whole page to modal
</script>

<template>
  <div class="flex items-center justify-center h-screen ">
    <UTabs :items="items" class="w-[50%]">
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
          </div>

          
          <div v-else-if="item.key === 'roles'" class="space-y-3">
            <UFormGroup label="User Role" name="current" required>
              <USelect v-model="rolesForm.userRole" :options="userRoles" optionAttribute="name" required />
            </UFormGroup>
            <UFormGroup label="College" name="college">
              <USelect v-model="rolesForm.college" :options="collegeOptions" optionAttribute="name" />
            </UFormGroup>
            <UFormGroup label="Primary Department" name="primaryDept" required>
              <USelect v-model="rolesForm.primaryDept" :options="departmentOptions" optionAttribute="name" required />
            </UFormGroup>
            <UFormGroup label="Secondary Department" name="secondaryDept">
              <USelect v-model="rolesForm.secondaryDept" :options="departmentOptions" optionAttribute="name" />
            </UFormGroup>
            <UFormGroup label="Designation" name="designation" required>
              <USelect v-model="rolesForm.designation" :options="designationOptions" optionAttribute="name" required />
            </UFormGroup>
          </div>

          <template #footer>
            <UButton type="button" class="mr-2 bg-[#B20000]" @click="() => $router.back()">
              Cancel
            </UButton>
            <UButton type="submit" color="primary">
              {{ item.key === 'account' ? 'Save Information' : 'Signup Faculty' }}
            </UButton>
          </template>
        </UCard>
      </template>
    </UTabs>
  </div>
</template>
