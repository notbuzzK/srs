<script setup lang="ts">
const acadInfo = ref({
  academicYear: undefined,
  term: undefined,
})

const semesters = [
  { label: 'First Semester', value: 'First'},
  { label: 'Second Semester', value: 'Second'},
  { label: 'Third Semseter', value: 'Third'},
  { label: 'Midyear', value: 'Midyear'},
]

const onSubmit = () => {
  if (acadInfo.value.academicYear && acadInfo.value.term) {
    // Assuming you have a function to handle the submission
    console.log('Academic Year:', acadInfo.value.academicYear)
    console.log('Term:', acadInfo.value.term)
  } else {
    console.error('Please fill in all fields')
  }
}

const isOpen = ref(false)
</script>
<template>
  <div class="flex flex-col justify-between gap-4">
    <div class="justify-center items-center text-center">
      <div class="flex flex-row justify-between gap-4">
        <h1>Enter Academic Year</h1>
        <UInput v-model="acadInfo.academicYear" class="mt-1 w-[50%]" placeholder="2024-2025"/>
      </div>
      <div class="flex flex-row justify-between gap-4">
        <h1>Select Term</h1>
        <USelect v-model="acadInfo.term" class="mt-1 w-[50%]" :options="semesters"/>
      </div>
    </div>
    <div>
      <UButton class=" text-white w-full" label="Submit" @click="isOpen = true" variant="solid" />
      <UModal v-model="isOpen" prevent-close>
        <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h1 class="text-lg font-semibold">Action Confirmation</h1>
              <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="[isOpen = false]" />
            </div>
          </template>

          <div>
            <p class="text-justify">Are you sure you want to override the Academic Year and Semester? Doing so sets the Academic Year and Semester of all the faculty members under your department.</p>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton label="Cancel" variant="ghost" @click="[isOpen = false]" class="text-[#dd3a3a]"/>
              <UButton label="Confirm" variant="solid" @click="[onSubmit(), isOpen = false]" />
            </div>
          </template>
        </UCard>  
      </UModal>
    </div>
  </div>
  
</template>