<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)

// Define time slots (half-hour intervals)
const timeSlots = [
  '07:00 AM',
  '07:30 AM',
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM'
]

// Days for the schedule
const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

const newTimeSlot = ref({
  day: '',
  start: '',
  end: ''
})

// Array to store all added time slots
const timeSlotsAdded = ref([])

// Add new time slot to the array and reset the form
function onAddTimeSlot() {
  console.log('added times:', newTimeSlot.value)

  // Basic validation: ensure a day, start, and end are selected
  if (newTimeSlot.value.day && newTimeSlot.value.start && newTimeSlot.value.end) {
    timeSlotsAdded.value.push({ ...newTimeSlot.value })
    newTimeSlot.value = { day: '', start: '', end: '' }
    isOpen.value = false
  } else {
    
  }
}

// Remove a time slot from the array by index
function removeTimeSlot(index: number) {
  timeSlotsAdded.value.splice(index, 1)
}
</script>

<template>
  <div>
    <table class="w-full">
      <thead class="text-center">
        <tr>
          <th>Day</th>
          <th>Start</th>
          <th>End</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody class="text-center">
        <tr v-for="(timeSlot, index) in timeSlotsAdded" :key="index">
          <td>{{ timeSlot.day }}</td>
          <td>{{ timeSlot.start }}</td>
          <td>{{ timeSlot.end }}</td>
          <td>
            <UIcon
              name="i-charm-cross"
              @click="removeTimeSlot(index)"
            />
          </td>
        </tr>
      </tbody>
    </table>
    
    <UModal v-model="isOpen">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <h1>Availability Time</h1>
        </template>

        <div>
          <label>Day</label>
          <USelect
            v-model="newTimeSlot.day"
            :options="days"
            placeholder="Select a day"
            class="w-full"
          />
        </div>

        <div>
          <label>Start Time</label>
          <USelect
            v-model="newTimeSlot.start"
            :options="timeSlots"
            placeholder="Select start time"
            class="w-full"
          />
        </div>

        <div>
          <label>End Time</label>
          <USelect
            v-model="newTimeSlot.end"
            :options="timeSlots"
            placeholder="Select end time"
            class="w-full"
          />
        </div>

        <template #footer>
          <UButton @click="onAddTimeSlot">Add Time</UButton>
        </template>
      </UCard>
    </UModal>

    <div class="flex justify-center pt-4">
      <UIcon
        name="i-material-symbols-add-circle-rounded"
        @click="isOpen = true"
        class="w-8 h-8 text-center text-[#16B559]"
      />
    </div>
  </div>
</template>
