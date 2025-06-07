// composables/useSchedule.ts
import { ref, computed } from 'vue'
import { useNuxtApp } from '#app'
/* import { useToast } from '#imports'
const toast = useToast() */

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

const modality = [
  'Blended',
  'Classroom',
  'Lab/Clin/RLE',
  'Online',
  'Laboratory',
  'ISP/Online/Lab',
  'Others'
]

const timeSlotsIndices = Array.from({ length: timeSlots.length }, (_, i) => i)
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const eventTypes = ['Teaching', 'AW', 'ARP', 'CH']
const courses = ref<any[]>([])
const primaryDept = ref('')
const userId = ref('')
const acadYear = ref('')
const acadSem = ref('')
const semesterType = ref('')
const events = ref<any[]>([])
const showModal = ref(false)
const newEvent = ref({
  // name: '',
  type: '',
  programCode: '',
  course: '',
  modality: '',
  room: 'TBA',
  day: 'Monday',
  startTime: timeSlots[0],
  endTime: timeSlots[1]
})

// TODO: modify course fetching to handle 100+ courses

let courseSearchTimeout: ReturnType<typeof setTimeout> | null = null

async function onCourseSearch(query: string) {
  // debounce so we don’t fire on every keystroke
  if (courseSearchTimeout) clearTimeout(courseSearchTimeout)
  courseSearchTimeout = setTimeout(async () => {
    const supabase = useNuxtApp().$supabase
    const { data, error } = await supabase
      .from('courses')
      .select('course_id, course_code, course_title')
      .ilike('course_code', `%${query}%`)     // search by code…
      .or(`course_title.ilike.%${query}%`)    // …or title
      .limit(20)                              // only first 20 matches
    if (error) {
      console.error('Course search error', error)
      courses.value = []
    } else {
      console.log('Course search results:', data)
      courses.value = data.map(c => ({
        name: `${c.course_code} – ${c.course_title}`,
        value: c.course_id
      }))
    }
  }, 300)  // wait 300ms after typing stops
}

const getPrimaryDept = async () => {
  const supabase = useNuxtApp().$supabase
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id

  const { data, error } = await supabase
    .from('users')
    .select('pr_department_id')
    .eq('user_auth_id', userId)

  if (error) {
    console.error('Error fetching primary department:', error.message)
  } else {
    primaryDept.value = data[0].pr_department_id
  }
}

async function getCourses() {
  const supabase = useNuxtApp().$supabase

  let { data, error } = await supabase
  .from('courses')
  .select('*')

  if (error) {
    console.error('Error fetching courses:', error.message)
    courses.value = []
  } else {
    // maps data into an object and stores it in courses array
    // otherwise return an empty array
    courses.value = data?.map(course => ({
      name: `${course.course_code} - ${course.course_title}`,
      value: course.course_id,
      course_code: course.course_code,
    })) ?? []
  }
}

// cross references course id to find course name
// otherwise return empty string
function getCourseCode(courseId: number) {
  const course = courses.value.find(course => course.value === courseId);
  return course ? course.course_code : '';
}

function parseSlotIndex(slotLabel: string) {
  return timeSlots.findIndex(slot => slot === slotLabel)
}

function addEvent() {
  if (!newEvent.value.type) {
    alert('Please select an event type.');
    return;
  }

  const startIndex = otherTimeSlots.indexOf(newEvent.value.startTime);
  const rawEndIndex = otherTimeSlots.indexOf(newEvent.value.endTime);

  if (rawEndIndex <= startIndex) {
    alert('End time must be later than start time.');
    return;
  }

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

  const eventToAdd = {
    id: Date.now(),
    faculty_id: userId.value,
    name: newEvent.value.type,
    type: newEvent.value.type,
    programCode: newEvent.value.programCode,
    course: newEvent.value.course,
    modality: newEvent.value.modality,
    room: newEvent.value.room,
    day: newEvent.value.day,
    startIndex: startIndex,
    endIndex: rawEndIndex,
    displayStart: newEvent.value.startTime,
    displayEnd: newEvent.value.endTime,
    acadYear: acadYear.value,
    acadSem: acadSem.value,
    isNew: true, // Mark as new
  };

  events.value.push(eventToAdd);
  showModal.value = false;

  newEvent.value = {
    type: '',
    programCode: '',
    course: '',
    modality: '',
    room: 'TBA',
    day: '',
    startTime: otherTimeSlots[0],
    endTime: otherTimeSlots[1],
  };
}

function getEvent(day: string, slotIndex: number) {
  return events.value.find(evt => evt.day === day && evt.startIndex === slotIndex);
}


async function deleteEvent(id: number) {
  const supabase = useNuxtApp().$supabase
  events.value = events.value.filter(evt => evt.id !== id)
  console.log('Deleting event with ID:', id)

    
  const { error } = await supabase
    .from('facultySchedules')
    .delete()
    .eq('schedule_id', id)

  if (error) {
    console.error('Error deleting event:', error.message)
  } else {
    console.log('Event deleted successfully')
    await fetchSchedules(userId.value)
  }
  // toast.add({ title: 'Deleting event with ID: ' + id, color: 'red'})
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


/*
  hour: number,
  designation: string,
  type: keyof typeof typeToKey,
  isPrimary: boolean,
  program: 'semester' | 'trimestral' | 'midyear',
  isFullTime: boolean
)
*/

const getConditionsForColors = () => {

}

const fullTimeConfig = {
  semester: {
    general:         { teachingLoad: 18, overload: 9, consultation: 6, academicPursuits: 6, residency: 30 },
    'VC/Dean':       { teachingLoad:  3, overload: 9, consultation: 6, academicPursuits: 6, residency: 30 },
    'VD/PD/AD':      { teachingLoad:  9, overload: 9, consultation: 6, academicPursuits: 6, residency: 30 },
    Chair:           { teachingLoad: 15, overload: 9, consultation: 6, academicPursuits: 6, residency: 30 },
    'ATF/ASF':       { teachingLoad: 18, overload: 9, consultation: 6, academicPursuits: 6, residency: 30 },
  },
  trimestral: {
    general:         { teachingLoad: 12, overload: 6, consultation: 4, academicPursuits: 9, residency: 25 },
    'VC/Dean':       { teachingLoad:  2, overload: 6, consultation: 4, academicPursuits: 9, residency: 25 },
    'VD/PD/AD':      { teachingLoad:  6, overload: 6, consultation: 4, academicPursuits: 9, residency: 25 },
    Chair:           { teachingLoad: 10, overload: 6, consultation: 4, academicPursuits: 9, residency: 25 },
    'ATF/ASF':       { teachingLoad: 12, overload: 6, consultation: 4, academicPursuits: 9, residency: 25 },
  },
  midyear: {
    general:         { teachingLoad: Infinity, overload: Infinity, consultation: Infinity, academicPursuits: Infinity, residency: 20 },
    // you can repeat per‐role if needed, but midyear is uniform
  }
}

const partTimeConfig = {
  semester: {
    general:         { teachingLoad: 17, overload: 0,  consultation: 2, academicPursuits: 0, residency: 19 },
  },
  trimestral: {
    general:         { teachingLoad: 11, overload: 0, consultation: 2, academicPursuits: 0, residency: 13 },
  }
}

// colors for different hours
function getHourColor(hour: number, designation: string, type: string, item: string, term: string){
  console.log('hour:', hour, 'designation:', designation, 'type:', type, 'item:', item, 'term:', term)
  // top level: check if faculty item is part time, else full time
  if (item === 'Part-Time') {

    // second level: check semester type
    if (term === 'Semestral') {

      // if part time, go directly to checking of type

      // fourth level: check type
      if (type === 'Teaching') {
        if (hour >= partTimeConfig.semester['general'].teachingLoad) {
          return 'text-red-600'
        } else {
          return 'text-black'
        }
      } else if (type === 'CH') {
        if (hour >= partTimeConfig.semester['general'].consultation) {
          return 'text-red-600'
        } else {
          return 'text-black'
        }
      } else if (type === 'Total Hours') {
        if (hour >= partTimeConfig.semester['general'].residency) {
          return 'text-red-600'
        } else {
          return 'text-black'
        }
      }
    } else if (term === 'Trimestral') {
      // check type
      if (type === 'Teaching') {
        if (hour >= partTimeConfig.trimestral['general'].teachingLoad) {
          return 'text-red-600'
        } else {
          return 'text-black'
        }
      } else if (type === 'CH') {
        if (hour >= partTimeConfig.trimestral['general'].consultation) {
          return 'text-red-600'
        } else {
          return 'text-black'
        }
      } else if (type === 'Total Hours') {
        if (hour >= partTimeConfig.trimestral['general'].residency) {
          return 'text-red-600'
        } else {
          return 'text-black'
        }
      }
    }
  } else {
    // second level: check semester type
    if (term === 'Semestral') {

      // third level: check faculty designation
      if (designation === 'Vice Chancellor' || designation === 'Academic Dean' || designation === 'TSA Dean') {

        // fourth level: check type
        if (type === 'Teaching') {

          // fifth level: check hour
          if (hour <= fullTimeConfig.semester['VC/Dean'].teachingLoad) {
            return 'text-orange-600'
          } else if (hour >= fullTimeConfig.semester['general'].teachingLoad) {
            return 'text-red-600'
          } else {
            return 'text-black'
          }

        } else if (type === 'CH') {
          
          if (hour <= fullTimeConfig.semester['VC/Dean'].consultation) {
            return 'text-orange-600'
          } else {
            return 'text-black'
          }

        } else if (type === 'ARP') {
          
          if (hour <= fullTimeConfig.semester['VC/Dean'].academicPursuits) {
            return 'text-orange-600'
          } else {
            return 'text-black'
          }

        } else if (type === 'Total Hours') {

          if (hour >= fullTimeConfig.semester['general'].residency + fullTimeConfig.semester['general'].overload) {
            return 'text-red-600'
          } else {
            return 'text-black'
          }
        }
      } else if (designation === 'SHSSHS Director' || designation === 'Director' || designation === 'Vice Dean' || designation === 'Program Director' || designation === 'Assistant Director') {

        // fourth level: check type
        if (type === 'Teaching') {

          if (hour <= fullTimeConfig.semester['VD/PD/AD'].teachingLoad) {
            return 'text-orange-600'
          } else if (hour >= fullTimeConfig.semester['general'].teachingLoad) {
            return 'text-red-600'
          } else {
            return 'text-black'
          }

        } else if (type === 'CH') {
          
          if (hour <= fullTimeConfig.semester['VD/PD/AD'].consultation) {
            return 'text-orange-600'
          } else {
            return 'text-black'
          }

        } else if (type === 'ARP') {
          
          if (hour <= fullTimeConfig.semester['VD/PD/AD'].academicPursuits) {
            return 'text-orange-600'
          } else {
            return 'text-black'
          }
        } else if (type === 'Total Hours') {

          if (hour >= fullTimeConfig.semester['general'].residency + fullTimeConfig.semester['general'].overload) {
            return 'text-red-600'
          } else {
            return 'text-black'
          }
        }
      } else if (designation === 'Chair' || designation === 'Vice Chair' || designation === 'Coordinator') {

        // fourth level: check type
        if (type === 'Teaching') {

          if (hour <= fullTimeConfig.semester['Chair'].teachingLoad) {
            return 'text-orange-600'
          } else if (hour >= fullTimeConfig.semester['general'].teachingLoad) {
            return 'text-red-600'
          } else {
            return 'text-black'
          }

        } else if (type === 'CH') {
          
          if (hour <= fullTimeConfig.semester['Chair'].consultation) {
            return 'text-orange-600'
          } else {
            return 'text-black'
          }

        } else if (type === 'ARP') {
          
          if (hour <= fullTimeConfig.semester['Chair'].academicPursuits) {
            return 'text-orange-600'
          } else {
            return 'text-black'
          }
        
        } else if (type === 'Total Hours') {

          if (hour >= fullTimeConfig.semester['general'].residency + fullTimeConfig.semester['general'].overload) {
            return 'text-red-600'
          } else {
            return 'text-black'
          }
        }
      } else if (designation === 'Academic Teaching Faculty' || designation === 'Academic Service Faculty') {
        
        // fourth level: check type
        if (type === 'Teaching') {

          if (hour <= fullTimeConfig.semester['ATF/ASF'].teachingLoad) {
            return 'text-orange-600'
          } else if (hour >= fullTimeConfig.semester['general'].teachingLoad) {
            return 'text-red-600'
          } else {
            return 'text-black'
          }

        } else if (type === 'CH') {
          
          if (hour <= fullTimeConfig.semester['ATF/ASF'].consultation) {
            return 'text-orange-600'
          } else {
            return 'text-black'
          }

        } else if (type === 'ARP') {
          
          if (hour <= fullTimeConfig.semester['ATF/ASF'].academicPursuits) {
            return 'text-orange-600'
          } else {
            return 'text-black'
          }
        } else if (type === 'Total Hours') {

          if (hour >= fullTimeConfig.semester['general'].residency + fullTimeConfig.semester['general'].overload) {
            return 'text-red-600'
          } else {
            return 'text-black'
          }
        }
      }
      
    } else if (term === 'Trimestral') {
      if (designation === 'Vice Chancellor' || designation === 'Academic Dean' || designation === 'TSA Dean') {
        // second level: check type
        if (type === 'Teaching') {

          // third level: check hour
          if (hour <= fullTimeConfig.trimestral['VC/Dean'].teachingLoad) {
            return 'text-orange-600'
          } else if (hour >= fullTimeConfig.trimestral['general'].teachingLoad) {
            return 'text-red-600'
          } else {
            return 'text-black'
          }

        } else if (type === 'CH') {
          
          if (hour <= fullTimeConfig.trimestral['VC/Dean'].consultation) {
            return 'text-orange-600'
          } else {
            return 'text-black'
          }

        } else if (type === 'ARP') {
          
          if (hour <= fullTimeConfig.trimestral['VC/Dean'].academicPursuits) {
            return 'text-orange-600'
          } else {
            return 'text-black'
          }

        } else if (type === 'Total Hours') {

          if (hour >= fullTimeConfig.trimestral['general'].residency + fullTimeConfig.trimestral['general'].overload) {
            return 'text-red-600'
          } else {
            return 'text-black'
          }
        }
      } else if (designation === 'SHSSHS Director' || designation === 'Director' || designation === 'Vice Dean' || designation === 'Program Director' || designation === 'Assistant Director') {

        // second level: check type
        if (type === 'Teaching') {

          // third level: check hour
          if (hour <= fullTimeConfig.trimestral['VD/PD/AD'].teachingLoad) {
            return 'text-orange-600'
          } else if (hour >= fullTimeConfig.trimestral['general'].teachingLoad) {
            return 'text-red-600'
          } else {
            return 'text-black'
          }
          
        } else if (type === 'CH') {
          
          if (hour <= fullTimeConfig.trimestral['VD/PD/AD'].consultation) {
            return 'text-orange-600'
          } else {
            return 'text-black'
          }

        } else if (type === 'ARP') {
          
          if (hour <= fullTimeConfig.trimestral['VD/PD/AD'].academicPursuits) {
            return 'text-orange-600'
          } else {
            return 'text-black'
          }

        } else if (type === 'Total Hours') {

          if (hour >= fullTimeConfig.trimestral['general'].residency + fullTimeConfig.trimestral['general'].overload) {
            return 'text-red-600'
          } else {
            return 'text-black'
          }
        }
      }

    } else if (term === 'Midyear') {
      
      // second level: check type
      if (type === 'Total Hours') {

        if (hour >= fullTimeConfig.midyear['general'].residency) {
          return 'text-red-600'
        } else {
          return 'text-black'
        }
      }
    }
  }
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
  newEvent.value = {
    type: '',
    programCode: '',
    course: '',
    modality: '',
    room: 'TBA',
    day: 'Monday',
    startTime: otherTimeSlots[0],
    endTime: otherTimeSlots[1],
  };
}

async function fetchSchedules(user_auth_id: string) {
  const supabase = useNuxtApp().$supabase;

  const { data, error } = await supabase
    .from('facultySchedules')
    .select('*')
    .eq('faculty_id', user_auth_id)
    .eq('acadYear', acadYear.value)
    .eq('acadSem', acadSem.value);

  if (error) {
    console.error('Error fetching schedules:', error.message);
  } else if (data) {
    events.value = data.map((item: any) => ({
      id: item.schedule_id,
      faculty_id: item.faculty_id,
      programCode: item.programCode,
      course: item.course_id,
      name: item.schedule_name,
      type: item.schedule_type,
      modality: item.modality,
      day: item.day,
      displayStart: item.start_time,
      displayEnd: item.end_time,
      room: item.room,
      acadYear: item.acadYear,
      acadSem: item.acadSem,
      startIndex: otherTimeSlots.indexOf(item.start_time),
      endIndex: otherTimeSlots.indexOf(item.end_time),
      isNew: false, // Mark as existing
    }));
  }
}

async function onSubmit() {
  const supabase = useNuxtApp().$supabase;

  const payload = events.value
    .filter(event => event.isNew) // Only include new events
    .map(event => ({
      faculty_id: event.faculty_id,
      programCode: event.programCode,
      course_id: event.course,
      modality: event.modality,
      day: event.day,
      schedule_type: event.type,
      start_time: event.displayStart,
      end_time: event.displayEnd,
      room: event.room,
      acadYear: event.acadYear,
      acadSem: event.acadSem,
    }));

  if (payload.length === 0) {
    console.log('No new schedules to upload.');
    return;
  }

  const { data, error } = await supabase
    .from('facultySchedules')
    .insert(payload)
    .select();

  if (error) {
    console.error('Error uploading schedule:', error.message, payload);
  } else {
    console.log('Schedule uploaded successfully:', data);
    await fetchSchedules(userId.value);
  }
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
    getCourses,
    getPrimaryDept,
    getCourseCode,
    userId,
    acadYear,
    acadSem,
    semesterType,
    fetchSchedules,
    onCourseSearch,
    modality,
    getHourColor
  }
}
