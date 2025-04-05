<script setup lang="ts">
import getAcadSem from '~/composables/getAcadSem'

const { acadYear, acadSem } = getAcadSem()

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

function onSubmit(){
  acadYear.value = newTerm.value.acadYear
  acadSem.value = newTerm.value.acadSem
  isConfirmed.value = false
  isOpen.value = false
}

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
            <p>Are you sure you want to override the Academic Year and Semester?</p>
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