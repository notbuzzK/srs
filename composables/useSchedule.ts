// composables/useSchedule.ts
import { ref, computed } from 'vue'

import  getUserId from '~/composables/getUserId'

const { userId } = getUserId()

// Shared state is defined as a singleton
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

const otherTimeSlots = [ 
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


const timeSlotsIndices = Array.from({ length: timeSlots.length }, (_, i) => i)
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const eventTypes = ['Teaching', 'AW', 'ARP', 'CH']
const courses = ['Course 101', 'Course 102', 'Course 103']

const events = ref<any[]>([])
const showModal = ref(false)
const newEvent = ref({
  name: '',
  type: '',
  course: '',
  room: 'TBA',
  day: 'Monday',
  startTime: timeSlots[0],
  endTime: timeSlots[1]
})

function parseSlotIndex(slotLabel: string) {
  return timeSlots.findIndex(slot => slot === slotLabel)
}

function addEvent() {
  // Validate that a non-empty name has been entered.
  if (!newEvent.value.name || !newEvent.value.name.trim()) {
    alert('Please enter an event name.');
    return;
  }
  
  // Use otherTimeSlots to determine the index of the selected times.
  const startIndex = otherTimeSlots.indexOf(newEvent.value.startTime);
  const rawEndIndex = otherTimeSlots.indexOf(newEvent.value.endTime);
  
  if (rawEndIndex <= startIndex) {
    alert('End time must be later than start time.');
    return;
  }
  
  // Check for conflicts with an existing event on the same day.
  const conflict = events.value.find(evt => {
    return (
      evt.day === newEvent.value.day &&
      startIndex < evt.endIndex &&
      rawEndIndex > evt.startIndex
    );
  });
  if (conflict) {
    alert('This event conflicts with an existing event.');
    return;
  }
  
  // Create the event object.
  // We treat rawEndIndex as exclusive so that the merged cell spans from startIndex up to rawEndIndex - 1.
  // The original selected end time is stored in displayEnd.
  const eventToAdd = {
    id: Date.now(),
    name: newEvent.value.name,
    type: newEvent.value.type,
    course: newEvent.value.course,
    room: newEvent.value.room,
    day: newEvent.value.day,
    startIndex: startIndex,
    endIndex: rawEndIndex,
    displayEnd: newEvent.value.endTime,
  };
  
  events.value.push(eventToAdd);
  showModal.value = false;
  
  // Reset the form for the next event.
  newEvent.value = {
    name: '',
    type: '',
    course: '',
    room: 'TBA',
    day: 'Monday',
    startTime: otherTimeSlots[0],
    endTime: otherTimeSlots[1],
  };
}

function onSubmit() {
  console.log('Uploading schedule:', events.value)
  // Later: Insert events into your Supabase "facultySchedules" table.
}

function getEvent(day: string, slotIndex: number) {
  return events.value.find(evt => evt.day === day && evt.startIndex === slotIndex);
}


function deleteEvent(id: number) {
  events.value = events.value.filter(evt => evt.id !== id)
}

function clearEvents() {
  events.value = []
}

// Helper functions for rendering the timetable
function eventAtSlot(day: string, slotIndex: number) {
  return events.value.find(evt => evt.day === day && evt.startIndex === slotIndex)
}

function shouldRenderCell(day: string, slotIndex: number) {
  return !events.value.some(
    evt =>
      evt.day === day &&
      evt.startIndex < slotIndex &&
      slotIndex < evt.endIndex
  )
}

function getRowSpan(day: string, slotIndex: number) {
  const evt = eventAtSlot(day, slotIndex)
  return evt ? evt.endIndex - evt.startIndex : 1
}

// Computed total hours (each slot = 0.5 hrs)
const teachingHours = computed(() =>
  events.value
    .filter(evt => evt.type === 'Teaching')
    .reduce((sum, evt) => sum + (evt.endIndex - evt.startIndex) * 0.5, 0)
)
const awHours = computed(() =>
  events.value
    .filter(evt => evt.type === 'AW')
    .reduce((sum, evt) => sum + (evt.endIndex - evt.startIndex) * 0.5, 0)
)
const arpHours = computed(() =>
  events.value
    .filter(evt => evt.type === 'ARP')
    .reduce((sum, evt) => sum + (evt.endIndex - evt.startIndex) * 0.5, 0)
)
const chHours = computed(() =>
  events.value
    .filter(evt => evt.type === 'CH')
    .reduce((sum, evt) => sum + (evt.endIndex - evt.startIndex) * 0.5, 0)
)
const totalHours = computed(() =>
  events.value.reduce((sum, evt) => sum + (evt.endIndex - evt.startIndex) * 0.5, 0)
)

function cancelModal() {
  showModal.value = false
}

export function useSchedule() {
  return {
    getEvent,
    otherTimeSlots,
    timeSlots,
    timeSlotsIndices,
    days,
    eventTypes,
    courses,
    events,
    showModal,
    newEvent,
    addEvent,
    deleteEvent,
    clearEvents,
    onSubmit,
    teachingHours,
    awHours,
    arpHours,
    chHours,
    totalHours,
    eventAtSlot,
    shouldRenderCell,
    getRowSpan,
    parseSlotIndex,
    cancelModal,
  }
}
