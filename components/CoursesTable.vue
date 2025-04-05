<script setup lang="ts">
const supabase = useNuxtApp().$supabase
import { useCourse } from '~/composables/useCourse'

const { courseInfo, onSubmit, clearInput } = useCourse()

const columns = [{
  key: 'program_code',
  label: 'Program Code',
  sortable: true,
  class: 'w-[15%]'
}, {
  key: 'course_code',
  label: 'Course Code',
  sortable: true,
  class: 'w-[15%]'
}, {
  key: 'course_title',
  label: 'Course Title',
  sortable: true,
  class: 'w-[45%]'
}, {
  key: 'hours',
  label: 'Hours',
  class: 'w-[10%]'
}, {
  key: 'units',
  label: 'Units',
  class: 'w-[10%]'
}, {
  key: 'actions',
  class: 'w-[5%]'
}]

const courses = ref([])

const q = ref('')
const page = ref(1)
const pageCount = 6

// TODO: find out how to decrease row height
// TODO: make row count responsive

const filteredRows = computed(() => {
  if (!q.value) return courses.value 
  return courses.value.filter((course) =>
    Object.values(course).some((value) =>
      String(value).toLowerCase().includes(q.value.toLowerCase())
    )
  )
})

const paginatedRows = computed(() => {
  const start = (page.value - 1) * pageCount
  const end = start + pageCount
  return filteredRows.value.slice(start, end)
})

const getCourse = async () => {
  const { data, error } = await supabase
  .from('courses')
  .select('*')

  if (error) {
    console.error('Error fetching courses:', error.message)
    courses.value = []
  } else {
    courses.value = data
  }
}

// insert course info to input groups
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
  console.log("deleting course: ", course)
  
const { error } = await supabase
  .from('courses')
  .delete()
  .eq('course_id', course.course_id)

  if (error) {
    console.error('Error deleting course:', error.message)
  } else {
    getCourse()
  }

}


onMounted(() => {
  getCourse()
})

</script>
<template>
  <div class="flex flex-col px-2 gap-4 justify-between h-full overflow-y-auto">
    <!--Add/Edit Course-->
    <div class="">
      <div class="flex items-center justify-between ">
        <h1 class="text-[#017C35] font-bold text-lg">Add/Edit Course</h1>

        <div class="flex items-center gap-2">

          <UIcon name="i-material-symbols-refresh-rounded" class="w-6 h-6 text-[#017C35] cursor-pointer hover:animate-spin" @click="getCourse()" />

          <UInput v-model="q" placeholder="Filter courses..." />

        </div>

      </div>
      <div class="flex gap-4 mt-4">

        <UFormGroup class="w-[15%] ">
          <template #label>
            <span class="text-[#16B559] ">Program Code</span>
          </template>
          <UInput v-model="courseInfo.programCode" class="mt-1"/>
        </UFormGroup>
        
        <UFormGroup class="w-[15%]">
          <template #label>
            <span class="text-[#16B559] ">Course Code</span>
          </template>
          <UInput v-model="courseInfo.courseCode" class="mt-1"/>
        </UFormGroup>
        
        <UFormGroup class="w-[50%]">
          <template #label>
            <span class="text-[#16B559] ">Course Title</span>
          </template>
          <UInput v-model="courseInfo.courseTitle" class="mt-1"/>
        </UFormGroup>
        
        <UFormGroup class="w-[10%]">
          <template #label>
            <span class="text-[#16B559] ">Hours</span>
          </template>
          <UInput v-model="courseInfo.courseHours" class="mt-1"/>
        </UFormGroup>
        
        <UFormGroup class="w-[10%]">
          <template #label>
            <span class="text-[#16B559] ">Units</span>
          </template>
          <UInput v-model="courseInfo.courseUnits" class="mt-1"/>
        </UFormGroup>
        
      </div>
    </div>
    
    <!--Courses Table-->
    <div class=" h-full">
      <UTable :columns="columns" :rows="paginatedRows">

        <template #actions-data="{ row }">
          <UButton
          icon="i-tabler-pencil" class="text-[#017C35] hover:text-[#16B559]" variant="ghost" @click="editCourse(row)" />
          <UButton
          icon="i-tabler-trash" class="text-[#DD3A3A] hover:text-[#bd3333]" variant="ghost" @click="deleteCourse(row)" />
        </template>
      </UTable>
    </div>

    <div class="flex justify-between items-center ">
      <div class="flex gap-2">
        <UButton @click="onSubmit">Save Course</UButton>
        <UButton @click="clearInput" class="text-[#DD3A3A]" variant="ghost">Clear Input</UButton>
      </div>
      <UPagination v-model="page" :page-count="pageCount" :total="filteredRows.length" />
    </div>

  </div>
</template>