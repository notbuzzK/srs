<script setup lang="ts">
const supabase = useNuxtApp().$supabase;
const toast = useToast()
const router = useRouter()

import { useAccountCreationValues } from '~/composables/useAccountCreationValues';

const { 
  userRoles,
  collegeOptions, 
  departmentOptions,
  designationOptions,
  acadServicesOptions,
  facultyItems,
  ranks,
  range
} = useAccountCreationValues()

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
})
const rolesForm = reactive({ 
  primaryCollege: '',
  secondaryCollege: '', 
  primaryDept: '', 
  secondaryDept: '',
  acadServices: '', 
  designation: '',
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
        password: accountForm.password,
        role: accountForm.userRole,
        pr_college_id: rolesForm.primaryCollege,
        sd_college_id: rolesForm.secondaryCollege,
        pr_department_id: rolesForm.primaryDept,
        sd_department_id: rolesForm.secondaryDept,
        acadServices_id: rolesForm.acadServices,
        status: 'Active',
        designation: rolesForm.designation,
        rank: `${accountForm.rank} ${accountForm.rankValue}`,
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

const resetValues = () => {
  accountForm.name = ''
  accountForm.email = ''
  accountForm.password = ''
  accountForm.item = ''
  accountForm.userRole = ''

  rolesForm.primaryCollege = ''
  rolesForm.secondaryCollege = ''
  rolesForm.primaryDept = ''
  rolesForm.secondaryDept = ''
  rolesForm.acadServices = ''
  rolesForm.designation = ''
}

const isOpen = ref(false);

onMounted(() => {
  resetValues()
})

</script>
<template>
  <div class="flex justify-center items-center w-full h-screen bg-[#E8F8EF] shadow-lg">
    <div class="w-[40%] ">

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
              <UButton type="button" class="mr-2 bg-[#B20000]" @click="[router.back(), isOpen = false]">
                Cancel
              </UButton>
              <UButton type="submit" color="primary" v-if="item.key === 'roles'">
                Sign up Faculty
              </UButton>
            </template>
          </UCard>
        </template>
      </UTabs>
    </div>
  </div>
</template>
