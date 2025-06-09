<script setup lang="ts">
import { useSchedule } from '~/composables/useSchedule'
const {
  getCourses,
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
  getPrimaryDept,
  getCourseCode,
  userId,
  fetchSchedules,
  onCourseSearch,
  modality,
  isTeamTeaching,
  facultyRows,
  delivery,
  startEdit,
  saveEvent,
  editedEventId,
  showConfirmModal,
  confirmPayload,
  onCancelUpload,
  onConfirmUpload
} = useSchedule()

const props = defineProps<{ user_auth_id: string }>()

watch(() => props.user_auth_id, (newId) => {
  userId.value = newId
  fetchSchedules(newId)
  getPrimaryDept()
  getCourses()
})

// Reset all modal fields on close
function onModalClose() {
  cancelModal()
  newEvent.value = {
    type: '',
    programCode: '',
    course: '',
    modality: '',
    room: 'TBA',
    day: '',
    startTime: otherTimeSlots[0],
    endTime: otherTimeSlots[1],
    delivery: 'Conventional',
    teamTeaching: [],
  }
}

</script>
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
              <td
                v-if="shouldRenderCell(day, slotIndex)"
                :rowspan="getRowSpan(day, slotIndex)"
                class="border border-gray-300 p-2 h-full relative"
              >
                <!-- Event Cell -->
                <div v-if="getEvent(day, slotIndex)" class="p-2 rounded min-h-max text-center">
                  <!-- Delete Button -->
                  <UButton
                    class="absolute top-0 right-0 p-1 bg-[#DD3A3A] hover:bg-[#bd3333]"
                    @click="deleteEvent(getEvent(day, slotIndex).id)"
                  >
                    X
                  </UButton>
                  <UButton
                    class="absolute top-0 left-0 p-1 text-sm"
                    @click="startEdit(getEvent(day, slotIndex))"
                  >
                    ✎
                  </UButton>
                  <!-- Centered event info: use type instead of name -->
                  <div class="flex flex-col items-center justify-center h-full text-center">
                    <b>{{ getEvent(day, slotIndex).type }}</b>
                    <span>
                      {{ getEvent(day, slotIndex).programCode }}
                      <b>{{ getCourseCode(getEvent(day, slotIndex).course) }}</b>
                    </span>
                    <span>{{ getEvent(day, slotIndex).delivery }}</span>
                    <span>{{ getEvent(day, slotIndex).modality }}</span> 
                    <span>{{ getEvent(day, slotIndex).room }}</span>
                    <small>
                      {{ otherTimeSlots[getEvent(day, slotIndex).startIndex] }} <br> to <br> 
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
    <UModal v-model="showModal" :transition="false" @hide="onModalClose">
      <UCard class="!max-h-[60%]">
        <template #header>
          <div class="flex justify-between">
            <h2 class="text-xl font-bold">Add Schedule</h2>
            <!-- <UButton variant="ghost" @click="isTeamTeaching = true">Make Team/Turn Teaching</UButton> -->
          </div>
        </template>
        <div class="flex flex-col gap-4">
          <!-- Event Type (no name) -->
          <div>
            <label class="block mb-1 font-semibold">Schedule Type</label>
            <USelect
              v-model="newEvent.type"
              :options="eventTypes"
              placeholder="Select Type"
              class="w-full"
            />
          </div>

          <!-- Course -->
          <div class="flex gap-4">
            <div class="w-1/2">
              <label class="block mb-1 font-semibold">Program Code</label>
              <UInput v-model="newEvent.programCode" placeholder="TBA" class="w-full" />
            </div>
            <div class="w-1/2">
              <label class="block mb-1 font-semibold">Course</label>
              <UInputMenu
                v-model="newEvent.course"
                :options="courses"
                optionAttribute="name"
                valueAttribute="value"
                placeholder="Start typing course…"
                :filterable="true"
                :onFilter="onCourseSearch" 
                class="w-full"
              />
            </div>
          </div>

          <!-- Room & Modality-->
          <div class="flex gap-4">
            <div class="w-1/2">
              <label class="block mb-1 font-semibold">Room</label>
              <UInput v-model="newEvent.room" placeholder="TBA" class="w-full" />
            </div>
            <div class="w-1/2">
              <label class="block mb-1 font-semibold">Modality</label>
              <USelect v-model="newEvent.modality" :options="modality" class="w-full" />
            </div>
          </div>

          <div class="flex gap-4">
            <!-- Delivery -->
            <div class="w-full" v-if="newEvent.delivery === 'Conventional'">
              <label class="block mb-1 font-semibold">Delivery</label>
              <USelect
                v-model="newEvent.delivery"
                :options="delivery"
                class="w-full"
              />
            </div>
            <div class="w-1/2" v-if="newEvent.delivery !== 'Conventional'">
              <label class="block mb-1 font-semibold">Delivery</label>
              <USelect
                v-model="newEvent.delivery"
                :options="delivery"
                class="w-full"
              />
            </div>

            <!-- Team Teaching -->
            <div v-if="newEvent.delivery !== 'Conventional'" class="w-1/2">
              <label class="block mb-1 font-semibold">Select Other Faculty</label>
              <USelectMenu
                v-model="newEvent.teamTeaching"
                :options="facultyRows"
                optionAttribute="name"
                valueAttribute="user_auth_id"
                placeholder="Search & select faculty…"
                class="w-full"
                multiple
                searchable
              />
            </div>
          </div>

          <!-- Day -->
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
            <UButton variant="solid" @click="saveEvent">
              {{ editedEventId ? 'Save' : 'Add' }}
            </UButton>
            <UButton variant="ghost" @click="cancelModal">
              Cancel
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <UModal v-model="showConfirmModal">
      <UCard>
        <template #header><h3>Confirm Over-load</h3></template>
        <div>
          One or more schedules exceed the allowed hours. Proceed anyway?
        </div>
        <template #footer>
          <UButton @click="onConfirmUpload">Confirm</UButton>
          <UButton variant="ghost" @click="onCancelUpload">Cancel</UButton>
        </template>
      </UCard>
    </UModal>

  </div>
</template>