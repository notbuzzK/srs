<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Faculty Schedule Preview</h1>

    <!-- Event Hours Counters -->
    <div class="mb-4">
      <p class="mb-1">Total Hours: {{ totalHours }} hrs</p>
      <p class="mb-1">Teaching Hours: {{ teachingHours }} hrs</p>
      <p class="mb-1">AW Hours: {{ awHours }} hrs</p>
      <p class="mb-1">ARP Hours: {{ arpHours }} hrs</p>
      <p class="mb-1">CH Hours: {{ chHours }} hrs</p>
    </div>

    <!-- Timetable Preview -->
    <div class="overflow-x-auto">
      <table class="table-fixed w-full border-collapse">
        <thead>
          <tr>
            <th class="w-28 border border-gray-300 bg-gray-100 p-2">Time</th>
            <th
              v-for="day in days"
              :key="day"
              class="border border-gray-300 bg-gray-100 p-2 text-center"
            >
              {{ day }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="slotIndex in timeSlotsIndices" :key="slotIndex">
            <!-- Time Column -->
            <td class="border border-gray-300 p-2 text-sm text-center">
              {{ timeSlots[slotIndex] }}
            </td>
            <!-- Day Columns -->
            <template v-for="day in days" :key="day + '-' + slotIndex">
              <td
                v-if="shouldRenderCell(day, slotIndex)"
                :rowspan="getRowSpan(day, slotIndex)"
                class="border border-gray-300 p-2 align-top relative"
              >
                <div v-if="eventAtSlot(day, slotIndex)">
                  <strong>{{ eventAtSlot(day, slotIndex).name }}</strong><br />
                  {{ eventAtSlot(day, slotIndex).type }} - {{ eventAtSlot(day, slotIndex).course }}<br />
                  Room: {{ eventAtSlot(day, slotIndex).room }}<br />
                  <small>
                    {{ timeSlots[eventAtSlot(day, slotIndex).startIndex] }}
                    to
                    {{ timeSlots[eventAtSlot(day, slotIndex).endIndex] }}
                  </small>
                  <!-- Delete Button -->
                  <UButton
                    class="absolute top-0 right-0 p-1"
                    @click="deleteEvent(eventAtSlot(day, slotIndex).id)"
                  >
                    X
                  </UButton>
                </div>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Save / Upload / Clear Buttons -->
    <div class="mt-4 flex justify-between gap-4">
      <div class="">
        <UButton variant="solid" @click="showModal = true">
          Add Event
        </UButton>
        <UButton variant="ghost" @click="clearEvents">
          Clear Schedule
        </UButton>
      </div>
      <UButton variant="solid" @click="onSubmit">
        Upload Schedule
      </UButton>
    </div>
    
    <!-- Add Event Button -->

    <!-- Add Event Modal -->
    <UModal v-model="showModal">
      <UCard>
        <template #header>
          <h2 class="text-xl font-bold">Add Event</h2>
        </template>
        <div class="flex flex-col gap-4 my-4">
          <!-- Event Name -->
          <div>
            <label class="block mb-1 font-semibold">Event Name</label>
            <UInput
              v-model="newEvent.name"
              placeholder="Enter event name"
              class="w-full"
            />
          </div>
          <!-- Event Type -->
          <div>
            <label class="block mb-1 font-semibold">Event Type</label>
            <USelect
              v-model="newEvent.type"
              :options="eventTypes"
              placeholder="Select Type"
              class="w-full"
            />
          </div>
          <!-- Course -->
          <div>
            <label class="block mb-1 font-semibold">Course</label>
            <USelect
              v-model="newEvent.course"
              :options="courses"
              placeholder="Select Course"
              class="w-full"
            />
          </div>
          <!-- Room -->
          <div>
            <label class="block mb-1 font-semibold">Room</label>
            <UInput
              v-model="newEvent.room"
              placeholder="TBA"
              class="w-full"
            />
          </div>
          <!-- Day Selector -->
          <div>
            <label class="block mb-1 font-semibold">Day</label>
            <USelect
              v-model="newEvent.day"
              :options="days"
              placeholder="Select Day"
              class="w-full"
            />
          </div>
          <!-- Start Time -->
          <div>
            <label class="block mb-1 font-semibold">Start Time</label>
            <USelect
              v-model="newEvent.startTime"
              :options="timeSlots"
              placeholder="Select Start Time"
              class="w-full"
            />
          </div>
          <!-- End Time -->
          <div>
            <label class="block mb-1 font-semibold">End Time</label>
            <USelect
              v-model="newEvent.endTime"
              :options="timeSlots"
              placeholder="Select End Time"
              class="w-full"
            />
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="solid" @click="addEvent">
              Add
            </UButton>
            <UButton variant="ghost" @click="cancelModal">
              Cancel
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Define time slots (half-hour intervals)
const timeSlots = [
  '07:00 - 07:30',
  '07:30 - 08:00',
  '08:00 - 08:30',
  '08:30 - 09:00',
  '09:00 - 09:30',
  '09:30 - 10:00',
  '10:00 - 10:30',
  '10:30 - 11:00',
  '11:00 - 11:30',
  '11:30 - 12:00',
  '12:00 - 12:30',
  '12:30 - 01:00',
  '01:00 - 01:30',
  '01:30 - 02:00',
  '02:00 - 02:30',
  '02:30 - 03:00',
  '03:00 - 03:30',
  '03:30 - 04:00',
  '04:00 - 04:30',
  '04:30 - 05:00',
  '05:00 - 05:30',
  '05:30 - 06:00',
  '06:00 - 06:30',
  '06:30 - 07:00',
]
// Create an array of slot indices (0 to timeSlots.length-1)
const timeSlotsIndices = Array.from({ length: timeSlots.length }, (_, i) => i)

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

// Selection options
const eventTypes = ['Teaching', 'AW', 'ARP', 'CH']
const courses = ['Course 101', 'Course 102', 'Course 103']

// List of scheduled events
// Each event: { id, name, type, course, room, day, startIndex, endIndex }
const events = ref([])

// Modal visibility
const showModal = ref(false)

// New event form model
const newEvent = ref({
  name: '',
  type: '',
  course: '',
  room: 'TBA',
  day: 'Monday',
  startTime: timeSlots[0],
  endTime: timeSlots[1]
})

/**
 * Return the event that starts exactly at the given slot for a specific day.
 */
function eventAtSlot(day, slotIndex) {
  return events.value.find((evt) => evt.day === day && evt.startIndex === slotIndex)
}

/**
 * Determine if a cell for a given day/slotIndex should be rendered.
 * (Skip if a previous event spans into this slot.)
 */
function shouldRenderCell(day, slotIndex) {
  return !events.value.some(
    (evt) =>
      evt.day === day &&
      evt.startIndex < slotIndex &&
      slotIndex < evt.endIndex
  )
}

/**
 * Get the rowspan for an event cell starting at a given slot.
 */
function getRowSpan(day, slotIndex) {
  const evt = eventAtSlot(day, slotIndex)
  return evt ? evt.endIndex - evt.startIndex : 1
}

/**
 * Convert a time slot label to its index.
 */
function parseSlotIndex(slotLabel) {
  return timeSlots.findIndex((slot) => slot === slotLabel)
}

/**
 * Add a new event.
 * Calculate startIndex and endIndex based on selected times.
 */
function addEvent() {
  if (!newEvent.value.name.trim()) {
    alert('Please enter an event name.')
    return
  }
  const startIndex = parseSlotIndex(newEvent.value.startTime)
  const endIndex = parseSlotIndex(newEvent.value.endTime)
  if (endIndex <= startIndex) {
    alert('End time must be later than start time.')
    return
  }
  const eventToAdd = {
    id: Date.now(),
    name: newEvent.value.name,
    type: newEvent.value.type,
    course: newEvent.value.course,
    room: newEvent.value.room || 'TBA',
    day: newEvent.value.day,
    startIndex,
    endIndex
  }
  events.value.push(eventToAdd)
  // Reset form and close modal
  showModal.value = false
  newEvent.value = {
    name: '',
    type: '',
    course: '',
    room: 'TBA',
    day: 'Monday',
    startTime: timeSlots[0],
    endTime: timeSlots[1]
  }
}

/**
 * Delete an event by its id.
 */
function deleteEvent(id) {
  events.value = events.value.filter((evt) => evt.id !== id)
}

/**
 * Clear all events.
 */
function clearEvents() {
  events.value = []
}

/**
 * onSubmit function to simulate uploading the schedule.
 * For now, it simply logs the events.
 */
function onSubmit() {
  console.log('Uploading schedule:', events.value)
  // Later you would insert these into your Supabase "facultySchedules" table.
}

// Computed total hours for each event type (each slot is 0.5 hrs)
const teachingHours = computed(() =>
  events.value
    .filter((evt) => evt.type === 'Teaching')
    .reduce((sum, evt) => sum + (evt.endIndex - evt.startIndex) * 0.5, 0)
)
const awHours = computed(() =>
  events.value
    .filter((evt) => evt.type === 'AW')
    .reduce((sum, evt) => sum + (evt.endIndex - evt.startIndex) * 0.5, 0)
)
const arpHours = computed(() =>
  events.value
    .filter((evt) => evt.type === 'ARP')
    .reduce((sum, evt) => sum + (evt.endIndex - evt.startIndex) * 0.5, 0)
)
const chHours = computed(() =>
  events.value
    .filter((evt) => evt.type === 'CH')
    .reduce((sum, evt) => sum + (evt.endIndex - evt.startIndex) * 0.5, 0)
)

const totalHours = computed(() =>
  events.value.reduce((sum, evt) => sum + (evt.endIndex - evt.startIndex) * 0.5, 0)
)

/**
 * Cancel the modal without saving.
 */
function cancelModal() {
  showModal.value = false
}

defineExpose({
  teachingHours,
  awHours,
  arpHours,
  chHours,
  totalHours,
})
</script>

<style scoped>
/* Additional styles or transitions can be added here if needed */
</style>