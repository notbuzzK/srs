<script setup lang="ts">
const items = [{
  key: 'basicInformation',
  label: 'Basic Information',
  description: ''
}, {
  key: 'roles',
  label: 'Roles & Department',
  description: ''
}]

const accountForm = reactive({ name: '', email: '', password: '' })
const rolesForm = reactive({ userRole: '', college: '', primaryDept: '', secondaryDept: '', designation: ''})

function onSubmit(form: any) {
  
}
</script>

<template>
  <UTabs :items="items" class="w-full">
    <template #item="{ item }">
      <UCard @submit.prevent="() => onSubmit(item.key === 'account' ? accountForm : rolesForm)">
        <template #header>
          <p class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            {{ item.label }}
          </p>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ item.description }}
          </p>
        </template>


        <div v-if="item.key === 'basicInformation'" class="space-y-3">
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
            <UInput v-model="rolesForm.userRole"" required />
          </UFormGroup>
          <UFormGroup label="College" name="college">
            <UInput v-model="rolesForm.college" />
          </UFormGroup>
          <UFormGroup label="Primary Department" name="primaryDept"  required>
            <UInput v-model="rolesForm.primaryDept" required />
          </UFormGroup>
          <UFormGroup label="Secondary Department" name="secondaryDept">
            <UInput v-model="rolesForm.secondaryDept"/>
          </UFormGroup>
          <UFormGroup label="Designation" name="designation" required>
            <UInput v-model="rolesForm.designation" required />
          </UFormGroup>
        </div>

        <template #footer>
          <UButton type="button" class="mr-2 bg-[#B20000]">
            Cancel
          </UButton>
          <UButton type="submit" color="black">
            Add Faculty
          </UButton>
        </template>
      </UCard>
    </template>
  </UTabs>
</template>
