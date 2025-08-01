<script setup lang="ts">
const supabase = useNuxtApp().$supabase;


const userId = ref<any>('')

const isOpenOverrideModal = ref(false)

const {
  showModal,
  clearEvents,
  onSubmit,
  totalHours,
  acadYear,
  acadSem,
  semesterType,
  getHourColor,
  getOverloadHour,
  teachingRegular,
  teachingOverload,
  teachingTotal,
  chRegular,
  chOverload,
  awRegular,
  awOverload,
  arpRegular,
  arpOverload

} = useSchedule()

const facultyInfo = ref<any>({})

const getCurrectAcadYear = async () => {
  const { data, error } = await supabase
  .from('users')
  .select('acadYear')
  .eq('user_auth_id', userId.value)

  if ( error ) {
    console.error('Error fetching current academic year:', error.message)
  } else {
    acadYear.value = data[0].acadYear
  }
}

const getCurrentTerm = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('acadSem')
    .eq('user_auth_id', userId.value)

  if (error) {
    console.error('Error fetching current term:', error.message)
  } else {
    acadSem.value = data[0].acadSem
  }
}

const getCurrentSemesterType = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('semester_type')
    .eq('user_auth_id', userId.value)

  if (error) {
    console.error('Error fetching current semester type:', error.message)
  } else {
    semesterType.value = data[0].semester_type
  }
}

const getFacultyInfo = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('designation, item')
    .eq('user_auth_id', userId.value)
    .single()

  if (error) {
    console.error('Error fetching faculty info:', error.message)
  } else {
    facultyInfo.value = data
    console.log(facultyInfo.value)
  }
}

onMounted(async ()=> {
  const { data: { user } } = await supabase.auth.getUser()
  userId.value = user?.id
  await getCurrectAcadYear()
  await getCurrentSemesterType()
  await getCurrentTerm()
  await getFacultyInfo()
})

</script>
<template>
  <div class="flex max-h-screen">

    <!--Sidebar-->
    <Sidebar :userRole="'Faculty'" />

    <div class="w-full gap-4">

      <!--Header-->
      <div class="h-[7%]">

        <Header />

      </div>

      <!-- Main Content -->
      <div class="h-[93%] w-full bg-[#E8F8EF] grid grid-cols-8 grid-rows-5">

        <!-- Timetable Preview -->
        <div class="col-span-6 row-span-5 bg-white m-4 mt-4 mr-2 rounded-[12px] p-4 overflow-y-auto">
          <h1 class="text-[#017C35] font-bold text-xl pb-2">ADD SCHEDULE</h1>
          <TimeTable :user_auth_id="userId" class="overflow-auto" />
        </div>


        <!-- Quick Actions -->
        <div class="col-span-2 row-span-5 bg-white m-4 ml-2 rounded-[12px] p-4">
          <div class="grid grid-rows-6 h-full">

            <!--
              <h2 class="text-xl font-bold mb-4 row-span-1">Quick Actions</h2>
            -->
            
            <!-- Summary -->
            <div class="row-span-3">
              <h1 class="text-[#017C35] font-bold text-xl">Summary</h1>
              
              <div class="flex justify-between mb-2">
                <div>
                  <p class="font-bold">Academic Year: </p>
                  <p class="font-bold">Semester Type: </p>
                  <p class="font-bold">Semester: </p>
                </div>
                <div class="text-right">
                  <p>{{ acadYear }}</p>
                  <p>{{ semesterType }}</p>
                  <p>{{ acadSem }}</p>
                </div>
              </div>

              <div class="flex justify-between mb-4">
                <div>
                  <div class="text-sm">
                    <p>ATF/ASF Load: </p>
                    <p>Consulations:</p>
                    <p>ARP:</p>
                    <p>AW:</p>
                  </div>
                </div>
                
                <div class="text-right">
                  <div class="text-sm">
                  <p :class="getHourColor(teachingRegular, facultyInfo.designation, 'Teaching', facultyInfo.item, semesterType)">{{ teachingRegular }} hrs</p>
                  <p :class="getHourColor(chRegular, facultyInfo.designation, 'CH', facultyInfo.item, semesterType, teachingTotal)">{{ chRegular }} hrs</p>
                  <p :class="getHourColor(arpRegular, facultyInfo.designation, 'ARP', facultyInfo.item, semesterType)">{{ arpRegular }} hrs</p>
                  <p :class="getHourColor(awRegular, facultyInfo.designation, 'AW', facultyInfo.item, semesterType)">{{ awRegular }} hrs</p>
                  </div>
                </div>
              </div>

              <div class="flex justify-between">
                <div>
                  <p class="font-bold">Residency</p>
                  <p class="font-bold">Overload</p>
                </div>
                
                <div class="text-right">
                  <p :class="getHourColor(totalHours, facultyInfo.designation, 'Total Hours', facultyInfo.item, semesterType)">{{ totalHours }} hrs</p>
                  <p>{{ getOverloadHour(totalHours, facultyInfo.designation, 'Total Hours', facultyInfo.item, semesterType) }} hrs</p>
                </div>
              </div>

            </div>
            
            <!-- Action Buttons -->
            <div class="flex flex-col gap-4 row-span-3">

              <h1 class="text-[#017C35] font-bold text-xl">Actions</h1>

              <div class="flex justify-between">
                <UButton variant="solid" @click="showModal = true">Add Event</UButton>
                <UButton class="bg-[#DD3A3A] text-white hover:bg-[#bd3333]" @click="clearEvents">Clear Schedule</UButton>
              </div>
              <!-- <OverrideAcadSem v-model="isOpenOverrideModal"/> -->
              <UButton variant="solid" class="bg-[#017C35] text-white" @click="onSubmit">Upload Schedule</UButton>
            </div>
          
          </div>
        </div>
      </div>
    </div>
  </div>
</template>