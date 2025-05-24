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

const oldUserdata = reactive({
  name: '', 
  email: '', 
  password: '',
  item: '',
  userRole: '',
  designation: '',
  primaryCollege: '',
  pr_acadServices: '', 
  primaryDept: '', 
  pr_rank: '',
  pr_rankValue: '',
  secondaryCollege: '', 
  sd_acadServices: '', 
  secondaryDept: '',
  sd_rank: '',
  sd_rankValue: '',
  status: '',
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
    primaryForm.pr_rankValue     = users?.[0].pr_rank_value
    
    secondaryForm.secondaryCollege = users?.[0].sd_college_id
    secondaryForm.sd_acadServices  = users?.[0].sd_acadServices_id
    secondaryForm.secondaryDept    = users?.[0].sd_department_id
    secondaryForm.sd_rank          = users?.[0].sd_rank
    secondaryForm.sd_rankValue     = users?.[0].sd_rank_value

    // set the old user data
    oldUserdata.name           = users?.[0].name
    oldUserdata.email          = users?.[0].email
    oldUserdata.password       = users?.[0].password
    oldUserdata.item           = users?.[0].item
    oldUserdata.status         = users?.[0].status
    oldUserdata.userRole       = users?.[0].role
    oldUserdata.designation    = users?.[0].designation
    oldUserdata.primaryCollege   = users?.[0].pr_college_id
    oldUserdata.pr_acadServices  = users?.[0].pr_acadServices_id
    oldUserdata.primaryDept      = users?.[0].pr_department_id
    oldUserdata.pr_rank          = users?.[0].pr_rank
    oldUserdata.pr_rankValue     = users?.[0].pr_rank_value
    oldUserdata.secondaryCollege = users?.[0].sd_college_id
    oldUserdata.sd_acadServices  = users?.[0].sd_acadServices_id
    oldUserdata.secondaryDept    = users?.[0].sd_department_id
    oldUserdata.sd_rank          = users?.[0].sd_rank
    oldUserdata.sd_rankValue     = users?.[0].sd_rank_value
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
      role: accountForm.userRole,
      status: accountForm.status,
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

/**
 * Compare only the specific role/department fields and return diffs.
 */
function getChangedRoleFields(oldRoles: Record<string, any>, newRoles: Record<string, any>) {
  const fields = [
    'primaryCollege',
    'secondaryCollege',
    'primaryDept',
    'secondaryDept',
    'acadServices',
    'designation'
  ];
  const changed: { field_name: string, new_value: string }[] = [];
  for (const key of fields) {
    // Normalize both sides to string for comparison
    const oldVal = oldRoles[key] == null ? '' : String(oldRoles[key]);
    const newVal = newRoles[key] == null ? '' : String(newRoles[key]);
    if (oldVal !== newVal) {
      changed.push({
        field_name: key,
        new_value: newVal
      });
    }
  }
  return changed;
}

const submitRoleChanges = async () => {
  const changedFields = getChangedRoleFields(
    {
      primaryCollege: oldUserdata.primaryCollege,
      secondaryCollege: oldUserdata.secondaryCollege,
      primaryDept: oldUserdata.primaryDept,
      secondaryDept: oldUserdata.secondaryDept,
      acadServices: oldUserdata.acadServices,
      designation: oldUserdata.designation,
    },
    rolesForm
  );

  if (changedFields.length === 0) {
    toast.add({ title: 'No changes detected.', color: 'yellow' });
    return;
  }

  // Prepare the payload for each changed field
  const payload = changedFields.map(field => ({
    user_id: props.user_auth_id,
    pr_college_id: rolesForm.primaryCollege,
    sd_college_id: rolesForm.secondaryCollege,
    academic_service_id: rolesForm.acadServices,
    pr_department_id: rolesForm.primaryDept,
    sd_department_id: rolesForm.secondaryDept,
    field_name: field.field_name,
    old_value: oldUserdata[field.field_name],
    new_value: field.new_value,
    status: 'Pending'
  }));

  const { data, error } = await supabase
    .from('informationApprovals')
    .upsert(payload)
    .select();

  if (error) {
    toast.add({ title: 'Error submitting changes', color: 'red' });
    console.error('Error submitting changes:', error.message);
  } else {
    toast.add({ title: 'Changes submitted for approval!', color: 'green' });
    console.log('Changes submitted successfully:', data);
  }
};

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
          <UCard @submit.prevent="() => submitRoleChanges()">
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
                />
              </UFormGroup>

              <UFormGroup label="Academic Services" name="acadServices" required>
                <USelect
                  v-model="primaryForm.pr_acadServices"
                  :options="acadServicesOptions"
                  optionAttribute="name"
                  required
                />
              </UFormGroup>
              
              <UFormGroup label="Primary Department" name="primaryDept" required>
                <USelect
                  v-model="primaryForm.primaryDept"
                  :options="departmentOptions"
                  valueAttribute="value"
                  optionAttribute="name"
                  required 
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
                  <UFormGroup label="Rank Value" name="rank value" required>
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
            <div v-else-if="item.key === 'sd_unit'">
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

              <UFormGroup label="Academic Services" name="acadServices" required>
                <USelect
                  v-model="secondaryForm.sd_acadServices"
                  :options="acadServicesOptions"
                  optionAttribute="name"
                  required
                />
              </UFormGroup>

              <UFormGroup label="Secondary Department" name="secondaryDept" required>
                <USelect
                  v-model="secondaryForm.secondaryDept"
                  :options="departmentOptions"
                  valueAttribute="value"
                  optionAttribute="name"
                  required
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
                  <UFormGroup label="Rank Value" name="rank value" required>
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
              <UButton type="submit" color="primary" v-if="item.key === 'sd_unit'">
                Save Changes
              </UButton>
            </template>
          </UCard>
        </template>
      </UTabs>
    </UModal>
  </div>
</template>
