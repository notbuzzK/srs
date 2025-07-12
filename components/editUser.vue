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
const props = defineProps<{ 
  user_auth_id: string | undefined,
  usedIn: string,
}>()

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
  status: '',
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
  sd_rankValue: '', 
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
    accountForm.name           = users?.[0].name
    accountForm.email          = users?.[0].email
    accountForm.password       = users?.[0].password
    accountForm.item           = users?.[0].item
    accountForm.status         = users?.[0].status
    accountForm.userRole       = users?.[0].role
    accountForm.designation    = users?.[0].designation
    
    primaryForm.primaryCollege   = users?.[0].pr_college_id
    primaryForm.pr_acadServices  = users?.[0].pr_acadServices_id
    primaryForm.primaryDept      = users?.[0].pr_department_id
    primaryForm.pr_rank          = users?.[0].pr_rank
    primaryForm.pr_rankValue     = users?.[0].pr_rankValue
    
    secondaryForm.secondaryCollege = users?.[0].sd_college_id
    secondaryForm.sd_acadServices  = users?.[0].sd_acadServices_id
    secondaryForm.secondaryDept    = users?.[0].sd_department_id
    secondaryForm.sd_rank          = users?.[0].sd_rank
    secondaryForm.sd_rankValue     = users?.[0].sd_rankValue

  }
}

// TODO: make component able to update user email and password via edge functions

const saveAccountChanges = async () => {
  const { data, error } = await supabase
    .from('users')
    .update({
      name: accountForm.name,
      email: accountForm.email,
      password: accountForm.password,
      item: accountForm.item,
      status: accountForm.status,
      role: accountForm.userRole,
      designation: accountForm.designation
    })
    .eq('user_auth_id', props.user_auth_id)
    .select();
  
  if (error) {
    console.error('Error updating user:', error.message)
    toast.add({ title: 'Error updating user', color: 'red' });
  } else {
    toast.add({ title: 'User updated successfully!', color: 'green' });
    console.log('User updated successfully:', data);
  }
}

const saveUnitChanges = async () => {
  if (isDisabled.value) {
    const { data, error } = await supabase
      .from('users')
      .update({
        pr_college_id: primaryForm.primaryCollege,
        pr_acadServices_id: primaryForm.pr_acadServices,
        pr_department_id: primaryForm.primaryDept,
        sd_college_id: secondaryForm.secondaryCollege,
        sd_acadServices_id: secondaryForm.sd_acadServices,
        sd_department_id: secondaryForm.secondaryDept,
        pr_rank: primaryForm.pr_rank,
        pr_rankValue: primaryForm.pr_rankValue,
        sd_rank: secondaryForm.sd_rank,
        sd_rankValue: secondaryForm.sd_rankValue
      })
      .eq('user_auth_id', props.user_auth_id)
      .select();

    if (error) {
      console.error('Error updating user:', error.message)
      toast.add({ title: 'Error updating user', color: 'red' });
    } else {
      toast.add({ title: 'User updated successfully!', color: 'green' });
      console.log('User updated successfully:', data);
    }
  } else {
    const { data, error } = await supabase
      .from('users')
      .update({
        pr_rank: primaryForm.pr_rank,
        pr_rankValue: primaryForm.pr_rankValue,
        sd_rank: secondaryForm.sd_rank,
        sd_rankValue: secondaryForm.sd_rankValue,
      })
      .eq('user_auth_id', props.user_auth_id)
      .select();

    if (error) {
      console.error('Error updating user:', error.message)
      toast.add({ title: 'Error updating user', color: 'red' });
    } else {
      toast.add({ title: 'User updated successfully!', color: 'green' });
      console.log('User updated successfully:', data);
    }
  }
};

const isDisabled = ref(false)

onMounted(() => {
  getUser()
  if(props.usedIn === 'profile') {
    isDisabled.value = true
  } else {
    isDisabled.value = false
  }
})

const isOpen = ref(false);

// TODO: fix this shit

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
          <UCard @submit.prevent="() => saveUnitChanges()">
            <template #header>
              <p class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                {{ item.label }}
              </p>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                leave blank if no value
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
                  :disabled="isDisabled"
                />
              </UFormGroup>

              <UFormGroup label="Primary Services" name="acadServices" required>
                <USelect
                  v-model="primaryForm.pr_acadServices"
                  :options="acadServicesOptions"
                  optionAttribute="name"
                  required
                  :disabled="isDisabled"
                />
              </UFormGroup>
              
              <UFormGroup label="Primary Department" name="primaryDept">
                <USelect
                  v-model="primaryForm.primaryDept"
                  :options="filteredPrimaryDepartments"
                  valueAttribute="value"
                  optionAttribute="name"
                  :disabled="isDisabled"
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
                  :disabled="isDisabled"
                />
              </UFormGroup>

              <UFormGroup label="Secondary Services" name="acadServices" required>
                <USelect
                  v-model="secondaryForm.sd_acadServices"
                  :options="acadServicesOptions"
                  optionAttribute="name"
                  required
                  :disabled="isDisabled"
                />
              </UFormGroup>

              <UFormGroup label="Secondary Department" name="secondaryDept" >
                <USelect
                  v-model="secondaryForm.secondaryDept"
                  :options="filteredSecondaryDepartments"
                  valueAttribute="value"
                  optionAttribute="name"
                  :disabled="isDisabled"
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
              <UButton type="button" class="mr-2 bg-[#B20000]" @click="[, isOpen = false]">
                Cancel
              </UButton>
              <UButton type="button" @click="saveAccountChanges" color="primary" v-if="item.key === 'account'">
                Save Account Changes
              </UButton>
              <UButton type="button" @click="saveUnitChanges" color="primary" v-if="item.key === 'sd_unit' || item.key === 'pr_unit'">
                Save Changes
              </UButton>
            </template>
          </UCard>
        </template>
      </UTabs>
    </UModal>
  </div>
</template>
