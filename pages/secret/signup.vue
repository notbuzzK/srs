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
  range,
  getDepartmentsForCollege,
  getDepartmentsForAcadServices
} = useAccountCreationValues()

function getFilteredDepartments(collegeValue: any, acadServicesValue: any) {
  // Prefer filtering by college if selected, otherwise by academic service
  if (collegeValue && collegeValue !== 'None' && collegeValue !== '') {
    return getDepartmentsForCollege(Number(collegeValue));
  }
  if (acadServicesValue && acadServicesValue !== 'None' && acadServicesValue !== '') {
    return getDepartmentsForAcadServices(Number(acadServicesValue));
  }
  return [];
}

const filteredPrimaryDepartments = computed(() =>
  getFilteredDepartments(primaryForm.primaryCollege, primaryForm.pr_acadServices)
);

const filteredSecondaryDepartments = computed(() =>
  getFilteredDepartments(secondaryForm.secondaryCollege, secondaryForm.sd_acadServices)
);

const items = [{
  key: 'account',
  label: 'Basic Information',
  description: ''
}, {
  key: 'pr_unit',
  label: 'Primary Unit',
  description: ''
}, {
  key: 'sd_unit',
  label: 'Secondary Unit',
}]

const accountForm = reactive({
  name: '',
  email: '',
  password: '',
  item: '',
  userRole: '',
  designation: '',
})
const primaryForm = reactive({ 
  primaryCollege: '',
  pr_acadServices: '', 
  primaryDept: '',
  pr_rank: '',
  pr_rankValue: '', 
})
const secondaryForm = reactive({ 
  secondaryCollege: '', 
  sd_acadServices: '', 
  secondaryDept: '',
  sd_rank: '',
  sd_rankValue: '' , 
})


async function onSubmit() {
  console.log('values: ', accountForm, primaryForm, secondaryForm);

  // Sign up the user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: accountForm.email,
    password: accountForm.password,
  });

  if (signUpError) {
    console.error('Error signing up:', signUpError);
    toast.add({ title: 'Error signing up', color: 'red' })
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

  // --- NEW: Query for dean's acadYear and acadSem ---
  let deanQuery = supabase
    .from('users')
    .select('acadYear, acadSem, semester_type')
    .eq('role', 'Higher Ups')
    .limit(1);

  // Prefer matching by primaryCollege, else by pr_acadServices
  if (primaryForm.primaryCollege && primaryForm.primaryCollege !== '' && primaryForm.primaryCollege !== 'None') {
    deanQuery = deanQuery.eq('pr_college_id', parseUnitValue(primaryForm.primaryCollege));
  } else if (primaryForm.pr_acadServices && primaryForm.pr_acadServices !== '' && primaryForm.pr_acadServices !== 'None') {
    deanQuery = deanQuery.eq('pr_acadServices_id', parseUnitValue(primaryForm.pr_acadServices));
  }

  const { data: deanRows, error: deanError } = await deanQuery;

  let acadYear = null;
  let acadSem = null;
  let semester_type = null;
  if (deanError) {
    console.error('Error fetching dean info:', deanError);
  } else if (deanRows && deanRows.length > 0) {
    acadYear = deanRows[0].acadYear;
    acadSem = deanRows[0].acadSem;
    semester_type = deanRows[0].semester_type;
  }

  let { data: insertedUser, error: insertError } = await supabase
    .from('users')
    .insert([
      {
        user_auth_id: user_id,
        name: accountForm.name,
        email: accountForm.email,
        password: accountForm.password,
        role: accountForm.userRole,
        pr_college_id: parseUnitValue(primaryForm.primaryCollege),
        pr_acadServices_id: parseUnitValue(primaryForm.pr_acadServices),
        pr_department_id: parseUnitValue(primaryForm.primaryDept),
        pr_rank: primaryForm.pr_rank === '' || primaryForm.pr_rank === 'None' ? null : primaryForm.pr_rank,
        pr_rankValue: parseUnitValue(primaryForm.pr_rankValue),
        sd_college_id: parseUnitValue(secondaryForm.secondaryCollege),
        sd_acadServices_id: parseUnitValue(secondaryForm.sd_acadServices),
        sd_department_id: parseUnitValue(secondaryForm.secondaryDept),
        sd_rank: secondaryForm.sd_rank === '' || secondaryForm.sd_rank === 'None' ? null : secondaryForm.sd_rank,
        sd_rankValue: parseUnitValue(secondaryForm.sd_rankValue),
        item: accountForm.item,
        designation: accountForm.designation,
        status: 'Active',
        acadYear, // <-- add dean's acadYear
        acadSem,  // <-- add dean's acadSem
        semester_type,
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

function parseUnitValue(val: any) {
  if (val === '' || val === 'None' || val === null) return null
  if (!isNaN(val)) return Number(val)
  return val
}

const resetValues = () => {
  accountForm.name = ''
  accountForm.email = ''
  accountForm.password = ''
  accountForm.item = ''
  accountForm.userRole = ''

  primaryForm.primaryCollege = ''
  primaryForm.pr_acadServices = ''
  primaryForm.primaryDept = ''
  primaryForm.pr_rank = ''
  primaryForm.pr_rankValue = ''
  
  secondaryForm.secondaryCollege = ''
  secondaryForm.sd_acadServices = ''
  secondaryForm.secondaryDept = ''
  secondaryForm.sd_rank = ''
  secondaryForm.sd_rankValue = ''
}

const isOpen = ref(false);

onMounted(() => {
  resetValues()
})

// TODO: update to match /components/signup.vue

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

            <!-- Basic Information -->
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

              <UFormGroup label="Designation" name="designation" required>
                <USelect
                  v-model="accountForm.designation"
                  :options="designationOptions"
                  optionAttribute="name"
                  required 
                />
              </UFormGroup>

            </div>

            <!-- Primary Unit -->
            <div v-else-if="item.key === 'pr_unit'" class="space-y-3">

              <UFormGroup label="Primary College" name="college" required>
                <USelect
                  v-model="primaryForm.primaryCollege"
                  :options="collegeOptions"
                  valueAttribute="value"
                  optionAttribute="name"
                  required
                  label="name"
                />
              </UFormGroup>

              <UFormGroup label="Primary Services" name="acadServices" required>
                <USelect
                  v-model="primaryForm.pr_acadServices"
                  :options="acadServicesOptions"
                  optionAttribute="name"
                  valueAttribute="value"
                  required
                />
              </UFormGroup>
              
              <UFormGroup label="Primary Department" name="primaryDept" >
                <USelect
                  v-model="primaryForm.primaryDept"
                  :options="filteredPrimaryDepartments"
                  valueAttribute="value"
                  optionAttribute="name"
                />
              </UFormGroup>

              <div class="flex flex-row gap-2">
                <div class="w-1/2">
                  <UFormGroup label="Rank" name="rank" required>
                    <USelect
                      v-model="primaryForm.pr_rank"
                      :options="ranks"
                      optionAttribute="name"
                      required
                    />
                  </UFormGroup>
                </div>
                <div class="w-1/2">
                  <UFormGroup label="Rank Step" name="rank value" required>
                    <USelect
                      v-model="primaryForm.pr_rankValue"
                      :options="range"
                      optionAttribute="name"
                      required
                    />
                  </UFormGroup>
                </div>
              </div>

            </div>

            <!-- Secondary Unit -->
            <div v-else-if="item.key === 'sd_unit'" class="space-y-3">
              <UFormGroup label="Secondary College" name="college" required>
                <USelect
                  v-model="secondaryForm.secondaryCollege"
                  :options="collegeOptions"
                  valueAttribute="value"
                  optionAttribute="name"
                  required
                  label="name"
                />
              </UFormGroup>

              <UFormGroup label="Secondary Services" name="acadServices" required>
                <USelect
                  v-model="secondaryForm.sd_acadServices"
                  :options="acadServicesOptions"
                  optionAttribute="name"
                  valueAttribute="value"
                  required
                />
              </UFormGroup>

              <UFormGroup label="Secondary Department" name="secondaryDept" >
                <USelect
                  v-model="secondaryForm.secondaryDept"
                  :options="filteredSecondaryDepartments"
                  valueAttribute="value"
                  optionAttribute="name"
                />
              </UFormGroup>

              <div class="flex flex-row gap-2">
                <div class="w-1/2">
                  <UFormGroup label="Rank" name="rank" required>
                    <USelect
                      v-model="secondaryForm.sd_rank"
                      :options="ranks"
                      optionAttribute="name"
                      required
                    />
                  </UFormGroup>
                </div>
                <div class="w-1/2">
                  <UFormGroup label="Rank Step" name="rank value" required>
                    <USelect
                      v-model="secondaryForm.sd_rankValue"
                      :options="range"
                      optionAttribute="name"
                      required
                    />
                  </UFormGroup>
                </div>
              </div>

            </div>

            <template #footer>
              <UButton type="button" class="mr-2 bg-[#B20000]" @click="[router.back(), isOpen = false]">
                Cancel
              </UButton>
              <UButton type="submit" color="primary" v-if="item.key === 'sd_unit'">
                Sign up Faculty
              </UButton>
            </template>
          </UCard>
        </template>
      </UTabs>
    </div>
  </div>
</template>
