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

const delivery = [
  'Conventional',
  'Team Teaching',
  'Turn Teaching'
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
const isTeamTeaching = ref(false)
const facultyRows = ref<any>([])
const editedEventId = ref<number|null>(null)
const showConfirmModal = ref(false)
const confirmPayload   = ref<{insert: any[], update: any[]}|null>(null)
const newEvent = ref({
  // name: '',
  type: '',
  programCode: '',
  course: '',
  modality: '',
  room: 'TBA',
  day: ['Monday'],  // default to Monday
  startTime: timeSlots[0],
  endTime: timeSlots[1],
  delivery: 'Conventional',  // default delivery mode
  teamTeaching: [] as string[],  // will hold user_auth_id[] of other faculty
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
    faculty_id:   userId.value,            // primary faculty
    teamTeaching: [...newEvent.value.teamTeaching],  // additional faculty
    delivery:     newEvent.value.delivery,
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
    isEdited: false,
  };

  events.value.push(eventToAdd);
  showModal.value = false;

  newEvent.value = {
    type: '',
    programCode: '',
    course: '',
    modality: '',
    room: 'TBA',
    day: ['Monday'],
    startTime: otherTimeSlots[0],
    endTime: otherTimeSlots[1],
    delivery: 'Conventional',
    teamTeaching: [],
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


const fullTimeConfig = {
  semestral: {
    general:         { teachingLoad: 18, overload: 9, consultation: 6, academicPursuits: 6, residency: 30 },
    'Vice Chancellor':       { teachingLoad:  3, overload: 9, consultation: 6, academicPursuits: 6, residency: 30 },
    'Academic Dean':       { teachingLoad:  3, overload: 9, consultation: 6, academicPursuits: 6, residency: 30 },
    'TSA Dean':       { teachingLoad:  3, overload: 9, consultation: 6, academicPursuits: 6, residency: 30 },
    'SHSSHS Director':      { teachingLoad:  9, overload: 9, consultation: 6, academicPursuits: 6, residency: 30 },
    'Director':      { teachingLoad:  9, overload: 9, consultation: 6, academicPursuits: 6, residency: 30 },
    'Vice Dean':      { teachingLoad:  9, overload: 9, consultation: 6, academicPursuits: 6, residency: 30 },
    'Program Director':      { teachingLoad:  9, overload: 9, consultation: 6, academicPursuits: 6, residency: 30 },
    'Assistant Director':      { teachingLoad:  9, overload: 9, consultation: 6, academicPursuits: 6, residency: 30 },
    'Chair':           { teachingLoad: 15, overload: 9, consultation: 6, academicPursuits: 6, residency: 30 },
    'Vice Chair':           { teachingLoad: 15, overload: 9, consultation: 6, academicPursuits: 6, residency: 30 },
    'Coordinator':           { teachingLoad: 15, overload: 9, consultation: 6, academicPursuits: 6, residency: 30 },
    'Academic Teaching Faculty':       { teachingLoad: 18, overload: 9, consultation: 6, academicPursuits: 6, residency: 30 },
    'Academic Services Faculty':       { teachingLoad: 18, overload: 9, consultation: 6, academicPursuits: 6, residency: 30 },
  },
  trimestral: {
    general:         { teachingLoad: 12, overload: 6, consultation: 4, academicPursuits: 9, residency: 25 },
    'Vice Chancellor':       { teachingLoad:  2, overload: 6, consultation: 4, academicPursuits: 9, residency: 25 },
    'Academic Dean':       { teachingLoad:  2, overload: 6, consultation: 4, academicPursuits: 9, residency: 25 },
    'TSA Dean':       { teachingLoad:  2, overload: 6, consultation: 4, academicPursuits: 9, residency: 25 },
    'SHSSHS Director':      { teachingLoad:  6, overload: 6, consultation: 4, academicPursuits: 9, residency: 25 },
    'Director':      { teachingLoad:  6, overload: 6, consultation: 4, academicPursuits: 9, residency: 25 },
    'Vice Dean':      { teachingLoad:  6, overload: 6, consultation: 4, academicPursuits: 9, residency: 25 },
    'Program Director':      { teachingLoad:  6, overload: 6, consultation: 4, academicPursuits: 9, residency: 25 },
    'Assistant Director':      { teachingLoad:  6, overload: 6, consultation: 4, academicPursuits: 9, residency: 25 },
    'Chair':           { teachingLoad: 10, overload: 6, consultation: 4, academicPursuits: 9, residency: 25 },
    'Vice Chair':           { teachingLoad: 10, overload: 6, consultation: 4, academicPursuits: 9, residency: 25 },
    'Coordinator':           { teachingLoad: 10, overload: 6, consultation: 4, academicPursuits: 9, residency: 25 },
    'Academic Teaching Faculty':       { teachingLoad: 12, overload: 6, consultation: 4, academicPursuits: 9, residency: 25 },
    'Academic Services Faculty':       { teachingLoad: 12, overload: 6, consultation: 4, academicPursuits: 9, residency: 25 },
  },
  midyear: {
    general:         { teachingLoad: Infinity, overload: Infinity, consultation: Infinity, academicPursuits: Infinity, residency: 20 },
  }
}

const partTimeConfig = {
  semestral: {
    general:         { teachingLoad: 17, overload: 0,  consultation: 2, academicPursuits: 0, residency: 19 },
  },
  trimestral: {
    general:         { teachingLoad: 11, overload: 0, consultation: 2, academicPursuits: 0, residency: 13 },
  }
}

// colors for different hours
function getHourColor(hour: number, designation: string, type: string, item: string, term: string){
  // 1) Choose full-time vs part-time config
  const cfg = item === 'Part-Time'
    ? partTimeConfig
    : fullTimeConfig;

  // 2) Pick the right term block (normalize to lowercase key)
  // Add a check to ensure term is not null before calling toLowerCase()
  const termKey = term ? term.toLowerCase() as 'semestral' | 'trimestral' | 'midyear' : 'semestral'; // Provide a default like 'semester'
  const termCfg = cfg[termKey] || cfg.semestral;

  // 3) Pick the bucket by designation (fall back to 'general')
  const bucket = termCfg[designation] || termCfg.general;

  // 4) Map your type to the config property
  const key: keyof typeof bucket = (
    type === 'Teaching' ? 'teachingLoad' :
    type === 'CH'       ? 'consultation' :
    type === 'ARP'      ? 'academicPursuits' :
                          'residency'    // covers "Total Hours"
  );

  const threshold = bucket[key];
  // console.log('threshold', threshold)
  // console.log('bucket', bucket)
  // console.log('term key', termKey) 

  // 5) If threshold is zero, we skip the orange band:
  //    any positive hours => RED; zero or below => BLACK
  if (threshold === 0) {
    return hour > 0 ? 'text-red-600' : 'text-black';
  }

  // 6) Otherwise use the 10% margin logic:
  if (hour <= threshold) {
    // At or below threshold → OK
    return 'text-black';
  }
  if (hour <= threshold * 1.1) {
    // Up to 10% over → Warning
    return 'text-orange-600';
  }
  // More than 10% over → Exceeded
  return 'text-red-600';
}

function getOverloadHour(hour: number, designation: string, type: string, item: string, term: string){
  // 1) Choose full-time vs part-time config
  const cfg = item === 'Part-Time'
    ? partTimeConfig
    : fullTimeConfig;

  // 2) Pick the right term block (normalize to lowercase key)
  const termKey = term ? term.toLowerCase() as 'semestral' | 'trimestral' | 'midyear' : 'semestral';
  const termCfg = cfg[termKey] || cfg.semestral;

  // 3) Pick the bucket by designation (fall back to 'general')
  const bucket = termCfg[designation] || termCfg.general;

  // 4) Map your type to the config property
  const key: keyof typeof bucket = 'residency'; // always use 'residency' key

  const residency = bucket[key];
  const overloadHours = hour - residency;
  if (overloadHours >= 0 ){
    return overloadHours;
  } else {
    return 0
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
let overloadHours = ref<any>();

function cancelModal() {
  showModal.value = false
  newEvent.value = {
    type: '',
    programCode: '',
    course: '',
    modality: '',
    room: 'TBA',
    day: ['Monday'],
    startTime: otherTimeSlots[0],
    endTime: otherTimeSlots[1],
    delivery: 'Conventional',
    teamTeaching: [],
  };
}

async function fetchSchedules(user_auth_id: string) {
  const supabase = useNuxtApp().$supabase;

  if (!acadYear.value || !acadSem.value) {
    console.warn('Academic year or term not set, skipping schedule fetch.')
    return
  }

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
      type: item.schedule_type,
      delivery: item.delivery,
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
      isEdited: false,
    }));
  }
}

function saveEvent() {
  const daysArray = Array.isArray(newEvent.value.day) ? newEvent.value.day : [newEvent.value.day];
  const startIndex = otherTimeSlots.indexOf(newEvent.value.startTime);
  const endIndex = otherTimeSlots.indexOf(newEvent.value.endTime);

  if (editedEventId.value !== null) {
    // Only allow editing for a single day event for now
    const idx = events.value.findIndex(e => e.id === editedEventId.value);
    if (idx === -1) return;

    // Check for local conflicts (excluding the event being edited)
    const conflict = events.value.find((evt, i) =>
      i !== idx &&
      evt.day === daysArray[0] &&
      startIndex < evt.endIndex &&
      endIndex > evt.startIndex
    );
    if (conflict) {
      alert(`This event conflicts with an existing event on ${daysArray[0]}.`);
      return;
    }

    Object.assign(events.value[idx], {
      type:         newEvent.value.type,
      programCode:  newEvent.value.programCode,
      course:       newEvent.value.course,
      room:         newEvent.value.room,
      day:          daysArray[0], // Only first day for edit
      startIndex,
      endIndex,
      displayStart: newEvent.value.startTime,
      displayEnd:   newEvent.value.endTime,
      delivery:     newEvent.value.delivery,
      teamTeaching: [...newEvent.value.teamTeaching],
      isEdited:     true,
    });
  } else {
    // Check for conflicts for each selected day
    for (const day of daysArray) {
      const conflict = events.value.find(evt =>
        evt.day === day &&
        startIndex < evt.endIndex &&
        endIndex > evt.startIndex
      );
      if (conflict) {
        alert(`The selected date/time slot has already been taken for ${day}.`);
        return;
      }
    }

    // Insert a new event for each selected day
    for (const day of daysArray) {
      const eventToAdd = {
        id:            Date.now() + Math.random(), // ensure unique id
        faculty_id:    userId.value,
        department_id: primaryDept.value,
        name:          newEvent.value.type,
        type:          newEvent.value.type,
        programCode:   newEvent.value.programCode,
        course:        newEvent.value.course,
        room:          newEvent.value.room,
        day:           day,
        startIndex:    startIndex,
        endIndex:      endIndex,
        displayStart:  newEvent.value.startTime,
        displayEnd:    newEvent.value.endTime,
        acadYear:      acadYear.value,
        acadSem:       acadSem.value,
        delivery:      newEvent.value.delivery,
        teamTeaching:  [...newEvent.value.teamTeaching],
        isNew:         true,
        isEdited:      false,
      };
      events.value.push(eventToAdd);
    }
  }

  // reset everything
  editedEventId.value = null;
  showModal.value     = false;
  newEvent.value      = {
    type: '',
    programCode: '',
    course: '',
    modality: '',
    room: 'TBA',
    day: ['Monday'],
    startTime: otherTimeSlots[0],
    endTime: otherTimeSlots[1],
    delivery: 'Conventional',
    teamTeaching: [],
  };
}

function startEdit(evt: any) {
  editedEventId.value = evt.id
  // copy its data into newEvent so the modal fields populate
  newEvent.value = {
    type:         evt.type,
    programCode:  evt.programCode,
    course:       evt.course,
    room:         evt.room,
    day:          evt.day,
    startTime:    evt.displayStart,
    endTime:      evt.displayEnd,
    modality:     evt.modality,
    delivery:     evt.delivery,
    teamTeaching: [...(evt.teamTeaching||[])],
  }
  showModal.value = true
}

// Call this when the user clicks “Confirm” in the confirm modal:
async function onConfirmUpload() {
  if (!confirmPayload.value) return;
  const supabase = useNuxtApp().$supabase;

  // 1️⃣ Dump what we’re about to send
  console.log('Confirming payload:', JSON.stringify(confirmPayload.value, null, 2));

  // 2️⃣ Try the inserts with .select() so we get full error info
  if (confirmPayload.value.insert.length) {
    const { data, error, status, statusText } = await supabase
      .from('facultySchedules')
      .insert(confirmPayload.value.insert)
      .select();

    console.log('Insert response:', { status, statusText, data, error });
    if (error) {
      console.error('Insert failed:', error);
      return;
    }
  }

  // 3️⃣ Try the updates with .select()
  for (const upd of confirmPayload.value.update) {
    console.log(`Updating schedule_id=${upd.id} with`, upd.updateData);
    const { data, error, status, statusText } = await supabase
      .from('facultySchedules')
      .update(upd.updateData)
      .eq('schedule_id', upd.id)
      .select();

    console.log(`Update response [${upd.id}]:`, { status, statusText, data, error });
    if (error) {
      console.error('Update failed:', error);
      return;
    }
  }

  // 4️⃣ If we get here, everything succeeded
  alert('All schedules saved successfully.');
  showConfirmModal.value = false;
  confirmPayload.value   = null;
  await fetchSchedules(userId.value);
}


// Call this when the user clicks “Cancel” in the confirm modal:
function onCancelUpload() {
  showConfirmModal.value = false
  confirmPayload.value   = null
  // leave events[] intact so they can be edited
}

async function onSubmit() {
  const supabase = useNuxtApp().$supabase

  // 1) Split events into new vs edited
  const toInsert = events.value.filter(e => e.isNew)
  const toUpdate = events.value.filter(e => e.isEdited && !e.isNew)

  // 2) Conflict‐check times for all…
  for (const evt of [...toInsert, ...toUpdate]) {
    const allFaculty = Array.from(new Set([evt.faculty_id, ...(evt.teamTeaching||[])])) // extracts all faculty id
    const { day, displayStart: start, displayEnd: end } = evt

    const { data: overlaps, error: overlapErr } = await supabase
      .from('facultySchedules')
      .select('faculty_id')
      .in('faculty_id', allFaculty)
      .eq('day', day)
      .or(`and(start_time.lte.${end},end_time.gte.${start})`)

    if (overlapErr) {
      console.error('Conflict‐check error', overlapErr)
      alert('Conflict‐check error' + JSON.stringify(overlapErr))
      return
    }
    if (overlaps.length) {
      const names = overlaps.map(o => o.faculty_id).join(', ')
      alert(`Time overlap on ${day} ${start}–${end} for: ${names}`)
      return
    }
  }

  // 3) Duplicate‐booking check for Conventional delivery only
  for (const evt of toInsert.filter(e => e.delivery === 'Conventional')) {
    const allFaculty = Array.from(new Set([evt.faculty_id, ...(evt.teamTeaching||[])]))
    const { day, type, displayStart: start, displayEnd: end } = evt

    const { data: duplicates, error: dupErr } = await supabase
      .from('facultySchedules')
      .select('faculty_id')
      .in('faculty_id', allFaculty)
      .eq('day', day)
      .eq('schedule_type', type)
      .eq('start_time', start)
      .eq('end_time', end)

    if (dupErr) {
      console.error('Duplicate‐check error', dupErr)
      return
    }
    if (duplicates.length) {
      const names = duplicates.map(d => d.faculty_id).join(', ')
      alert(`Exact schedule already exists for ${names} on ${day} ${start}–${end}`)
      return
    }
  }

  // 4) Threshold check: build a combined payload, but check totals first
  const insertPayload = [], updatePayload = []
  let requiresConfirmation = false

  // helper to check a single evt for threshold breach
  function checkThreshold(evt: any) {
    const colors = {
      Teaching: getHourColor(evt.teachingHours, evt.designation,'Teaching',evt.item,evt.term),
      ARP:      getHourColor(evt.arpHours,      evt.designation,'ARP',     evt.item,evt.term),
      CH:       getHourColor(evt.chHours,       evt.designation,'CH',      evt.item,evt.term),
      'Total Hours': getHourColor(evt.totalHours,evt.designation,'Total Hours',evt.item,evt.term),
    }
    return Object.values(colors).some(c => c === 'text-red-600')
  }

  for (const evt of toInsert) {
    const allFaculty = Array.from(new Set([evt.faculty_id, ...(evt.teamTeaching || [])]))
    for (const fac of allFaculty) {
      const row = {
        faculty_id: fac,
        programCode: evt.programCode,
        course_id: evt.course ? Number(evt.course) : null, 
        schedule_type: evt.type,
        delivery: evt.delivery,
        modality: evt.modality,
        day: evt.day,
        start_time: evt.displayStart,
        end_time: evt.displayEnd,
        room: evt.room,
        acadYear: evt.acadYear,
        acadSem: evt.acadSem,
      }
      insertPayload.push(row)
      if (checkThreshold(evt)) {
        requiresConfirmation = true
      }
    }
  }
  for (const evt of toUpdate) {
    const updateData = {
      programCode: evt.programCode,
      course_id: evt.course ? Number(evt.course) : null, 
      schedule_type: evt.type,
      delivery: evt.delivery,
      modality: evt.modality,
      day: evt.day,
      start_time: evt.displayStart,
      end_time: evt.displayEnd,
      room: evt.room,
      acadYear: evt.acadYear,
      acadSem: evt.acadSem,
    }
    updatePayload.push({ id: evt.id, updateData })
    if (checkThreshold(evt)) {
      requiresConfirmation = true
    }
  }

  console.log('Insert payload:', JSON.stringify(insertPayload, null, 2));
  console.log('Update payload:', JSON.stringify(updatePayload, null, 2));

  // 5) check if events goes against faculty availability time
  const { data: availability, error: availabilityError } = await supabase
    .from('facultyAvailability')
    .select('day, start_time, end_time')
    .eq('faculty_id', userId.value)
  if (availabilityError) {
    console.error('Availability check error:', availabilityError)
    alert('Availability check error: ' + JSON.stringify(availabilityError))
    return
  }
  for (const evt of toInsert) {
    const day = evt.day
    const start = evt.displayStart
    const end = evt.displayEnd
    // Only allow if there is at least one availability that fully covers the event
    const isAvailable = availability.some(a =>
      a.day === day &&
      a.start_time <= start &&
      a.end_time >= end
    )
    if (!isAvailable) {
      alert(`Event on ${day} from ${start} to ${end} is OUTSIDE faculty availability.`)
      return
    }
  }

  // 6) If any threshold was breached, pause for confirmation:
  if (requiresConfirmation) {
    confirmPayload.value = {
      insert: insertPayload,
      update: updatePayload,
    }
    showConfirmModal.value = true
    return   // wait for user to confirm
  }

  // 7) Otherwise go ahead and upload immediately
  if (insertPayload.length) {
    const { error: insertError } = await supabase.from('facultySchedules').insert(insertPayload)
    if (insertError) {
      console.error('Insert error:', insertError)
      alert('Insert error: ' + JSON.stringify(insertError))
      return
    }
  }
  const updateResults = await Promise.all(updatePayload.map(u =>
    supabase
      .from('facultySchedules')
      .update(u.updateData)
      .eq('schedule_id', u.id)
  ))
  const updateError = updateResults.find(r => r.error)
  if (updateError) {
    console.error('Update error:', updateError.error)
    alert('Update error: ' + JSON.stringify(updateError.error))
    return
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
    getHourColor,
    isTeamTeaching,
    facultyRows,
    delivery,
    startEdit,
    saveEvent,
    editedEventId,
    showConfirmModal,
    confirmPayload,
    onCancelUpload,
    onConfirmUpload,
    getOverloadHour
  }
}
