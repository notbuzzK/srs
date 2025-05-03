<script setup lang="ts">
const supabase = useNuxtApp().$supabase;

const { data: { user } } = await supabase.auth.getUser()
const userId = user?.id

const isOpenOverrideModal = ref(false)

const {
  showModal,
  clearEvents,
  onSubmit,
  teachingHours,
  awHours,
  arpHours,
  chHours,
  totalHours,
  acadYear,
  acadSem
} = useSchedule()

const getCurrectAcadYear = async () => {
  const { data, error } = await supabase
  .from('users')
  .select('acadYear')
  .eq('user_auth_id', userId)

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
    .eq('user_auth_id', userId)

  if (error) {
    console.error('Error fetching current term:', error.message)
  } else {
    acadSem.value = data[0].acadSem
  }
}

onMounted(()=> {
  getCurrectAcadYear()
  getCurrentTerm()
})

</script>
<template>
  <div class="flex max-h-screen">

    <!--Sidebar-->
    <Sidebar :userRole="'CEEA'" />

    <div class="w-full gap-4">

      <!--Header-->
      <div class="h-[7%] bg-[#FFFFFF]">

        <div class="flex justify-between h-full items-center p-2 px-6">
          <h1 class="font-sans text-[#017C35] font-bold">Faculty Schedule Recommendation System</h1>

          <div class="flex justify-between gap-8">

            <!--Notifcation-->
            <Notifications />

            <!--Profile-->
            <Profile />

          </div>
        </div>

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
          <div class="flex flex-col justify-between h-full">

            <!--
              <h2 class="text-xl font-bold mb-4 row-span-1">Quick Actions</h2>
            -->
            
            <!-- Summary -->
            <div class="">
              <h1 class="text-[#017C35] font-bold text-xl">Summary</h1>
              
              <div class="flex justify-between mb-2">
                <div>
                  <p class="font-bold">Academic Year: </p>
                  <p class="font-bold">Semester: </p>
                </div>
                <div class="text-right">
                  <p>{{ acadYear }}</p>
                  <p>{{ acadSem }}</p>
                </div>
              </div>

              <div class="flex justify-between">
                <div>
                  <p class="font-bold">Total Hours: </p>
                  <p>Teaching Hours: </p>
                  <p>AW Hours: </p>
                  <p>ARP Hours: </p>
                  <p>CH Hours: </p>
                </div>
                
                <div>
                  <p class="font-bold">{{ totalHours }} hrs</p>
                  <p>{{ teachingHours }} hrs</p>
                  <p>{{ awHours }} hrs</p>
                  <p>{{ arpHours }} hrs</p>
                  <p>{{ chHours }} hrs</p>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex flex-col gap-4 pb-2">

              <h1 class="text-[#017C35] font-bold text-xl">Actions</h1>

              <div class="flex justify-between">
                <UButton variant="solid" @click="showModal = true">Add Event</UButton>
                <UButton class="bg-[#DD3A3A] text-white hover:bg-[#bd3333]" @click="clearEvents">Clear Schedule</UButton>
              </div>
              <OverrideAcadSem v-model="isOpenOverrideModal"/>
              <UButton variant="solid" class="bg-[#017C35] text-white" @click="onSubmit">Upload Schedule</UButton>
            </div>
          
          </div>
        </div>
      </div>
    </div>
  </div>
</template>