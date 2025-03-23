<script setup lang="ts">
const supabase = useNuxtApp().$supabase;

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

// Faculty, Scheduler, CEEA, College Admin, System Admin

const designationOptions = [
  'Dean',
  'Vice Chancellor',
  'Vice Dean',
  'Program Director',
  'Assistand Director',
  'Chair',
  'Academic Teaching Faculty',
  'Academic Services Faculty',
  'Part Time Teaching Faculty',
];

const collegeOptions = [
  { value: 0, name: 'None' },
  { value: 1, name: 'College of Allied Sciences' },
  { value: 2, name: 'CCDSL'  },
  { value: 3, name: 'CHSS'  },
  { value: 4, name: 'College of Medical Imaging and Therapy'  },
  { value: 5, name: 'College of Medical Laboratory Science'  },
  { value: 6, name: 'College of Nursing'  },
  { value: 7, name: 'College of Rehabilitation Sciences'  },
  { value: 8, name: 'Dr. Mariano Que College of Pharmacy'  },
  { value: 9, name: 'Romeo P. Ariniego, MD, AFSC Library'  },
  { value: 10, name: 'SHSSHS'  },
  { value: 11, name: 'College of Dentistry'  },
  { value: 12, name: 'The Student Affairs'  },
  { value: 13, name: 'CIETI'  },
  { value: 14, name: 'College of Medicine'  },
  { value: 15, name: 'ACCESS'  },
  { value: 16, name: 'CCEI'  },
];

const departmentOptions = [
  { value: 0, name: 'None' },
  { value: 1, name: 'Bioch' },
  { value: 2, name: 'DNSM'  },
  { value: 3, name: 'LHS'  },
  { value: 4, name: 'CCDSL'  },
  { value: 5, name: 'CHSS'  },
  { value: 6, name: 'RT'  },
  { value: 7, name: 'NMT'  },
  { value: 8, name: 'NMT;RT'  },
  { value: 9, name: 'CMLS'  },
  { value: 10, name: 'Nursing'  },
  { value: 11, name: 'GS'  },
  { value: 12, name: 'SLP'  },
  { value: 13, name: 'PT'  },
  { value: 14, name: 'OT'  },
  { value: 15, name: 'BMS'  },
  { value: 16, name: 'Pharmacy'  },
  { value: 17, name: 'Public Health'  },
  { value: 18, name: 'Romeo P. Ariniego, MD, AFSC Library'  },
  { value: 19, name: 'SHSSHS'  },
  { value: 20, name: 'Dentistry'  },
  { value: 21, name: 'Guidance and Counseling'  },
  { value: 22, name: 'CIETI'  },
  { value: 23, name: 'Doctor of Philosophy in Health Sciences'  },
  { value: 24, name: 'PhD in Health Sciences by Research'  },
  { value: 25, name: 'ACCESS'  },
  { value: 26, name: 'CCEI'  },
];

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
  }
}



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
  </div>
</template>
