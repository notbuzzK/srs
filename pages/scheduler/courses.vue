<script setup lang="ts">
  import { useCourse } from '~/composables/useCourse'

  const {
    courseInfo,
    onSubmit,
    clearInput,
  } = useCourse()

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
  
        <div  class="h-[93%] w-full bg-[#E8F8EF] grid grid-cols-8 grid-rows-5">
  
          <div class="col-span-8 row-span-5 bg-white m-4 mr-2 rounded-[12px] p-4 overflow-y-auto">
            <CoursesTable />
          </div>
  
  
        </div>
      </div>
    </div>
  </template>