<script setup lang="ts">

const router = useRouter()

function handleRoute(route: string){
  const page = '/scheduler/'+route
  router.push(page)
}

</script>
<template>
  <div class="flex max-h-screen">

    <!--Sidebar-->
    <Sidebar :userRole="'Scheduler'" />

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

        <div  class="h-[93%] w-full bg-[#E8F8EF] grid grid-cols-8 grid-rows-7">

          <div class="col-span-5 row-span-2 bg-white m-4 mb-2 mr-2 rounded-[12px] p-4">

            <!--Quick Actions-->
            <div class="flex w-full h-full items-center ">

              <div class="flex w-[50%] align-center items-center  justify-center gap-5 border-r-2 border-[#16B559]" @click="handleRoute('schedule')">
                <UIcon 
                  name="i-tabler-calendar-week-filled" 
                  class="w-20 h-20 text-center text-[#017C35]" 
                />
                <h1 class="text-[#017C35] text-md font-medium">
                  ADD <br>SCHEDULE</h1>
                
              </div>

              <div class="flex w-[50%] align-center items-center border-r-2 border-[#16B559] justify-center gap-5" @click="handleRoute('courses')">
                <UIcon 
                  name="i-tabler-book" 
                  class="w-20 h-20 text-center text-[#017C35]" 
                />
                <h1 class="text-[#017C35] text-md font-medium">
                  MANAGE <br>COURSES</h1>
              </div>
              
              <div class="flex w-[50%] align-center items-center  justify-center gap-5" @click="handleRoute('summary')">
                <UIcon 
                  name="i-tabler-file-export" 
                  class="w-20 h-20 text-center text-[#017C35]" 
                />
                <h1 class="text-[#017C35] text-md font-medium">
                  GENERATE <br>SUMMARY</h1>
              </div>
              
            </div>

          </div>

        <div class="col-span-3 row-span-2 bg-white rounded-[12px] p-4 m-4 ml-2 mb-2">
          <h1 class="text-[#017C35] font-bold text-xl">Track Summary Approval</h1>
        </div>
        
        <div class="col-span-5 row-span-5 bg-white m-4 mt-2 mr-2 rounded-[12px] p-4">
            <h1 class="text-[#017C35] font-bold text-xl">SUMMARY HISTORY</h1>
          </div>
          
        <div class="col-span-3 row-span-2 bg-white rounded-[12px] p-4 m-4 mt-2 ml-2 mb-2">
          <h1 class="text-[#017C35] font-bold text-xl">Term Info</h1>
          <TermInfo />
        </div>

        <div class="col-span-3 row-span-3 bg-white rounded-[12px] p-4 m-4 mt-2 ml-2">
          <h1 class="text-[#017C35] font-bold text-xl">AVAILABILITY TIME</h1>
          <AvailabilityTime />
        </div>

      </div>
    </div>
  </div>
</template>