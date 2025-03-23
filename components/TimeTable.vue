<template>
  <div>
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

              <!-- Render Event Cell -->
              <td
                v-if="shouldRenderCell(day, slotIndex)"
                :rowspan="getRowSpan(day, slotIndex)"
                class="border border-gray-300 p-2 h-full relative"
              >

                <!-- Event Cell -->
                <div v-if="getEvent(day, slotIndex)" class="p-2 rounded min-h-max text-center">

                  <!-- Delete Button remains at top-right -->
                  <UButton class="absolute top-0 right-0 p-1 bg-[#DD3A3A] hover:bg-[#bd3333]"
                          @click="deleteEvent(getEvent(day, slotIndex).id)">
                    X
                  </UButton>

                  <!-- Centered event info -->
                  <div class="flex flex-col items-center justify-center h-full text-center">
                    <strong>{{ getEvent(day, slotIndex).name }}</strong>
                    <span>{{ getEvent(day, slotIndex).type }} - {{ getEvent(day, slotIndex).course }}</span>
                    <span>Room: {{ getEvent(day, slotIndex).room }}</span>
                    <small>
                      {{ otherTimeSlots[getEvent(day, slotIndex).startIndex] }}
                      <br> to <br> 
                      {{ getEvent(day, slotIndex).displayEnd }}
                    </small>
                  </div>
                </div>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Event Modal -->
    <UModal v-model="showModal" :transition="false" >
      <UCard class="!max-h-[60%]">
        <template #header>
          <h2 class="text-xl font-bold">Add Event</h2>
        </template>
        <div class="flex flex-col gap-4">
          
          <!-- Event Name -->
          <div>
            <label class="block mb-1 font-semibold">Event Name</label>
            <UInput v-model="newEvent.name" placeholder="Enter event name" class="w-full" />
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
            <UInput v-model="newEvent.room" placeholder="TBA" class="w-full" />
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
          <div class="flex gap-4">

            <!-- Start Time -->
            <div class="w-1/2">
              <label class="block mb-1 font-semibold">Start Time</label>
              <USelect
                v-model="newEvent.startTime"
                :options="otherTimeSlots"
                placeholder="Select Start Time"
                class="w-full"
              />
            </div>

            <!-- End Time -->
            <div class="w-1/2">
              <label class="block mb-1 font-semibold">End Time</label>
              <USelect
                v-model="newEvent.endTime"
                :options="otherTimeSlots"
                placeholder="Select End Time"
                class="w-full"
              />
            </div>

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

<script setup lang="ts">
import { useSchedule } from '~/composables/useSchedule'
const {
  getEvent,
  otherTimeSlots,
  timeSlots,
  timeSlotsIndices,
  days,
  eventTypes,
  courses,
  showModal,
  newEvent,
  addEvent,
  deleteEvent,
  shouldRenderCell,
  getRowSpan,
  eventAtSlot,
  cancelModal,
} = useSchedule()
</script>
