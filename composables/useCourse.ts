import { ref, computed } from 'vue'
import { useNuxtApp } from '#app'


const courseInfo = ref({
  course_id: undefined,
  programCode: undefined,
  courseCode: undefined,
  courseTitle: undefined,
  courseHours: undefined,
  courseUnits: undefined,
})

const onSubmit = async () => {
  const { $supabase } = useNuxtApp();

  if (!courseInfo.value.course_id) {
    const { data, error } = await $supabase
    .from('courses')
    .insert([
      {
        program_code: courseInfo.value.programCode,
        course_code: courseInfo.value.courseCode,
        course_title: courseInfo.value.courseTitle,
        hours: courseInfo.value.courseHours,
        units: courseInfo.value.courseUnits,
      }
    ])
    .select(); // This will return the upserted row(s)

    if (error) {
      console.error('Error inserting course:', error.message); 
    } else {
      console.log('Course inserted successfully:', data);
    }

  } else {
    const { data, error } = await $supabase
      .from('courses')
      .upsert([
        {
          course_id: courseInfo.value.course_id,
          program_code: courseInfo.value.programCode,
          course_code: courseInfo.value.courseCode,
          course_title: courseInfo.value.courseTitle,
          hours: courseInfo.value.courseHours,
          units: courseInfo.value.courseUnits,
        }
      ])
      .select(); // This will return the upserted row(s)
    
    if (error) {
      console.error('Error upserting course:', error.message); // Log the error message for clarity
    } else {
      console.log('Course upserted successfully:', data); // Log the upserted data
    }
  }
}

const clearInput = () => {
  courseInfo.value = {
    course_id: undefined,
    programCode: undefined,
    courseCode: undefined,
    courseTitle: undefined,
    courseHours: undefined,
    courseUnits: undefined
  }
}

const getCourse = async () => {
  const { $supabase } = useNuxtApp();

  const { data, error } = await $supabase
  .from('courses')
  .select('*')

  if (error) {
    console.error('Error fetching courses:', error.message)
    courses.value = []
  } else {
    courses.value = data
  }
}

// insert course info to input group
const editCourse = (course: any) => {
  courseInfo.value.course_id = course.course_id
  courseInfo.value.programCode = course.program_code
  courseInfo.value.courseCode = course.course_code
  courseInfo.value.courseTitle = course.course_title  
  courseInfo.value.courseHours = course.hours
  courseInfo.value.courseUnits = course.units

  console.log("editing course: ", course)
}

const deleteCourse = async (course: any) => {
  const { $supabase } = useNuxtApp();
  console.log("deleting course: ", course)
  
const { error } = await $supabase
  .from('courses')
  .delete()
  .eq('course_id', course.course_id)

  if (error) {
    console.error('Error deleting course:', error.message)
  } else {
    getCourse()
  }
}
  
  export function useCourse() {
    return {
    courseInfo,
    onSubmit,
    clearInput,
    getCourse,
    editCourse,
    deleteCourse
  }
}