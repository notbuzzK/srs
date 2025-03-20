<!-- pages/faculty/schedule.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import Faculty from '~/components/Sidebar.vue'
import TimeTable from '~/components/TimeTable.vue'
import { useSchedule } from '~/composables/useSchedule'

const router = useRouter()



const {
  showModal,
  clearEvents,
  onSubmit,
  teachingHours,
  awHours,
  arpHours,
  chHours,
  totalHours,
} = useSchedule()
</script>

<template>
  <div class="flex max-h-screen">
    
    <!-- Sidebar -->
    <Sidebar :userRole="'Faculty'" />

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
          <h1 class="text-[#017C35] font-bold text-xl">ADD SCHEDULE</h1>
          <TimeTable class="overflow-auto" />
        </div>
        
        
        <!-- Quick Actions -->
        <div class="col-span-2 row-span-5 bg-white m-4 ml-2 rounded-[12px] p-4">
          <div class="grid grid-rows-6 h-full">

            <!--
              <h2 class="text-xl font-bold mb-4 row-span-1">Quick Actions</h2>
            -->
            
            <!-- Summary -->
            <div class="row-span-2">
              <h1 class="text-[#017C35] font-bold text-xl">Summary</h1>
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
            <div class="flex flex-col gap-4 row-span-2">
              <h1 class="text-[#017C35] font-bold text-xl">Actions</h1>
              <div class="flex justify-between">
                <UButton variant="solid" @click="showModal = true">Add Event</UButton>
                <UButton variant="ghost" @click="clearEvents">Clear Schedule</UButton>
              </div>
              <UButton variant="solid" class="bg-[#017C35] text-white" @click="onSubmit">Upload Schedule</UButton>
            </div>

            <div class="row-span-2">
              <!-- Space for additional content -->
            </div>
          
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
