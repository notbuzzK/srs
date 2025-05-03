<script setup lang="ts">
import getAcadSem from '~/composables/getAcadSem'
const supabase = useNuxtApp().$supabase;
const toast = useToast()

const { data: { user } } = await supabase.auth.getUser()
const userId = user?.id
const acadYear = ref('')
const acadSem = ref('')

const isOpen = ref(false)
const isConfirmed = ref(false)

const semesters = [
  { label: 'First Semester', value: 'First'},
  { label: 'Second Semester', value: 'Second'},
  { label: 'Third Semseter', value: 'Third'},
  { label: 'Midyear', value: 'Midyear'},
]

const newTerm = ref({
  acadYear: '',
  acadSem: ''
})

const getCurrectAcadYear = async () => {
  const { data, error } = await supabase
  .from('users')
  .select('acadYear')
  .eq('user_auth_id', userId)

  if ( error ) {
    console.error('Error fetching current academic year:', error.message)
  } else {
    acadYear.value = data[0].acadYear
  }
}

const getCurrentTerm = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('acadSem')
    .eq('user_auth_id', userId)

  if (error) {
    console.error('Error fetching current term:', error.message)
  } else {
    acadSem.value = data[0].acadSem
  }
}

const onSubmit = async() =>{
  await getCurrentTerm();
  await getCurrectAcadYear();

  const updates = {
    acadYear: acadYear.value,
    acadSem: acadSem.value
  };

  if (newTerm.value.acadYear !== acadYear.value && newTerm.value.acadYear !== '') {
    updates.acadYear = newTerm.value.acadYear
  } else if (newTerm.value.acadYear === '') {
    updates.acadYear = acadYear.value
  }

  if (newTerm.value.acadSem !== acadSem.value && newTerm.value.acadSem !== '') {
    updates.acadSem = newTerm.value.acadSem
  } else if (newTerm.value.acadSem === '') {
    updates.acadSem = acadSem.value
  }

  console.log('updates: ', updates)

  if (Object.keys(updates).length > 0) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_auth_id', userId)
      .select()

    if (error) {
      console.error('Error updating user:', error.message)
      toast.add({ title: "Error updating", color: 'red' })
    } else {
      console.log('User updated successfully:', data)
      toast.add({ title: "User updated successfully", color: 'green' })
    }
  }

  isConfirmed.value = false
  isOpen.value = false
}

onMounted(async () => {
  await getCurrectAcadYear()
  await getCurrentTerm()
})

</script>
<template>
  <div>
    <UButton class=" text-white w-full" label="Override Acad Year & Sem" @click="isOpen = true" variant="solid" />

      <UModal v-model="isOpen" prevent-close>
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                Override Academic Year and Semester?
              </h3>
              <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="[isOpen = false, isConfirmed = false]" />
            </div>
          </template>

          <div v-if="!isConfirmed">
            <p>Are you sure you want to override the Academic Year and Semester? <b>This only applies to you</b>.</p>
          </div>
          
          <div v-else>
            <div>
              <UFormGroup label="Academic Year">
                <UInput v-model="newTerm.acadYear" placeholder="2021-2022" />
              </UFormGroup>
              <UFormGroup label="Semester">
                <USelect v-model="newTerm.acadSem" placeholder="" :options="semesters"/>
              </UFormGroup>
              
            </div>
            
          </div>

          <template #footer>
            <div v-if="!isConfirmed">
              <div class="flex justify-between">
                <UButton @click="isOpen = false" class="bg-[#DD3A3A]">No</UButton>
                <UButton @click="isConfirmed = true">Yes</UButton>
              </div>
            </div>

            <div v-else>
              <div class="flex justify-between">
                <UButton @click="onSubmit">Submit</UButton>
                <UButton @click="[isConfirmed = false, isOpen = false]">Cancel</UButton>
              </div>
            </div>
          </template>

        </UCard>
      </UModal>
  </div>
</template>