<script setup lang="ts">
import { ref, onMounted } from 'vue'
const supabase = useNuxtApp().$supabase
const toast = useToast()

const isOpen = ref(false)

const { data: { user } } = await supabase.auth.getUser()

const user_id = ref('')

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
]

const newTimeSlot = ref({
  availability_id: '',
  day: '',
  start: '',
  end: ''
})

// Array to store all added time slots
const timeSlotsAdded = ref([])

onMounted(async () => {
  await getUserID()
  // Fetch existing time slots
  const { data: timeSlots, error } = await supabase
    .from('facultyAvailability')
    .select('availability_id, day, start_time, end_time')
    .eq('faculty_id', user_id.value)

  if (error) {
    console.error('Error fetching time slots:', error.message)
  } else {
    timeSlotsAdded.value = timeSlots.map((slot) => ({
      day: slot.day,
      start: slot.start_time,
      end: slot.end_time,
    }));
  }
})

  async function getUserID(){
    let { data: users, error } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', user?.email)
      
      if (error) {
        console.error('Error fetching user id:', error.message)
      } else {
        user_id.value = users[0].user_id
      }
  }

// Add new time slot to the array and reset the form
async function onAddTimeSlot() {
  console.log('Adding time slot:', newTimeSlot.value);

  if (newTimeSlot.value.day && newTimeSlot.value.start && newTimeSlot.value.end) {
    await getUserID();

    const { data, error } = await supabase
      .from('facultyAvailability')
      .insert([{
        faculty_id: user_id.value,
        day: newTimeSlot.value.day,
        start_time: newTimeSlot.value.start,
        end_time: newTimeSlot.value.end
      }])
      .select(); // Ensure we get the inserted data back

    if (error) {
      console.error('Error adding time slot:', error);
    } else {
      console.log('Inserted data:', data);

      // Check if data was returned
      if (data.length > 0 && data[0].availability_id) {
        timeSlotsAdded.value.push({
          availability_id: data[0].availability_id, // Ensure correct ID is stored
          day: newTimeSlot.value.day,
          start: newTimeSlot.value.start,
          end: newTimeSlot.value.end,
        });

        console.log('Updated timeSlotsAdded:', timeSlotsAdded.value);
        toast.add({ title: 'Time slot added successfully!' });
      } else {
        console.error('Error: availability_id missing from response');
      }
    }

    isOpen.value = false;
  } else {
    console.warn('Invalid time slot input');
  }
}


// Remove a time slot from the array by index
function removeTimeSlot(index: number) {
  const timeSlot = timeSlotsAdded.value[index]; // Get the object
  console.log('Attempting to delete:', timeSlot);

  if (!timeSlot || !timeSlot.availability_id) {
    console.error('Error: No availability_id found for deletion');
    return;
  }

  const timeSlotId = timeSlot.availability_id; // Get the correct ID
  console.log('Deleting time slot with id:', timeSlotId);

  supabase
    .from('facultyAvailability')
    .delete()
    .eq('availability_id', timeSlotId)
    .then((response) => {
      console.log('Delete response:', response);
      timeSlotsAdded.value.splice(index, 1); // Remove from local state
      toast.add({ title: 'Time slot deleted successfully!' });
    })
    .catch((error) => {
      console.error('Delete error:', error);
      toast.add({ title: 'Error deleting time slot!', color: 'red' });
    });
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
