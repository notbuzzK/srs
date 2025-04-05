<script setup lang="ts">
const supabase = useNuxtApp().$supabase;
const toast = useToast()

import { useAccountCreationValues } from '~/composables/useAccountCreationValues';

const { userRoles, collegeOptions, departmentOptions, designationOptions } = useAccountCreationValues()

const items = [{
  key: 'account',
  label: 'Basic Information',
  description: ''
}, {
  key: 'roles',
  label: 'Roles & Department',
  description: ''
}]



const accountForm = reactive({name: '', email: '', password: '' ,})
const rolesForm = reactive({ 
  userRole: '',
  college: '', 
  primaryDept: '', 
  secondaryDept: '', 
  designation: '' 
})


async function onSubmit() {
  console.log('values: ', accountForm, rolesForm);

  // Sign up the user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: accountForm.email,
    password: accountForm.password,
  });

  if (signUpError) {
    console.error('Error signing up:', signUpError);
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

  let { data: insertedUser, error: insertError } = await supabase
    .from('users')
    .insert([
      {
        user_auth_id: user_id,
        name: accountForm.name,
        email: accountForm.email,
        password: accountForm.password, // Note: Storing plaintext passwords is not recommended for production.
        role: rolesForm.userRole,
        college_id: rolesForm.college,
        pr_department_id: rolesForm.primaryDept,
        sd_department_id: rolesForm.secondaryDept,
        status: 'Active',
        designation: rolesForm.designation,
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

const isOpen = ref(false);

// TODO: Update whole page to modal
</script>

<template>
  <div class="flex items-center justify-center ">
    <UButton @click="isOpen = true" variant="ghost" class="text-sm  font-medium  cursor-pointer text-[#017C35]" >Add Members</UButton>
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
                Sign up Faculty
              </UButton>
            </template>
          </UCard>
        </template>
      </UTabs>
    </UModal>
  </div>
</template>
