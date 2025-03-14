<script setup lang="ts">

const router = useRouter()

function handleRoute(route: string){
  const page = '/faculty/'+route
  router.push(page)
}

function logout() {
  console.log("Logging out")
  router.push('/')
}

</script>
<template>
    <div class="flex max-h-screen">
      <div class="w-[6%] h-screen bg-[#017C35]">
        <div class="flex flex-col h-full justify-between py-6 items-center">

          <h1 class="text-[#017C35]">top</h1>

          <div class="flex flex-col gap-8 text-center items-center">
            <UIcon
              name="i-material-symbols-home-outline-rounded"
              @click="handleRoute('dashboard')" class="w-10 h-10 text-center text-white"
            />
            <UIcon 
              name="i-tabler-calendar-week-filled" 
              @click="handleRoute('schedule')" 
              class="w-10 h-10 text-center text-[#EAF33B]" 
            />
            <UIcon 
              name="i-tabler-file-export" 
              @click="handleRoute('summary')" 
              class="w-10 h-10 text-center text-white" 
            />
          </div>
          
          <h1 class="text-[#017C35]">bottom</h1>
          <!--
            <UIcon 
            name="i-bx-log-out" 
            @click="logout()" 
            class="w-10 h-10 text-center  text-white" 
            />
          -->
          
          
        </div>
      </div>
      <div class="w-full gap-4">
  
        <div class="max-h-[6%] bg-[#FFFFFF]">

          <div class="flex justify-between h-full items-center p-2 px-6">
            <h1 class="font-sans text-[#017C35] font-bold">Faculty Schedule Recommendation System</h1>

            <div class="flex justify-between gap-8">
              <UIcon 
                name="i-charm-inbox" 
                @click="" 
                class="w-8 h-8 text-center  text-[#017C35]" 
              />
              <UIcon 
                name="i-ic-round-account-circle" 
                @click="" 
                class="w-8 h-8 text-center  text-[#017C35]" 
              />

            </div>
          </div>

        </div>
  
        <div  class="h-[94%] w-full bg-[#E8F8EF] grid grid-cols-8 grid-rows-5">
  
          <div class="col-span-6 row-span-5 bg-white m-4 mt-4 mr-2 rounded-[12px] p-4 overflow-y-auto max-h-fit-content">
            <h1 class="text-[#017C35] font-bold text-xl">ADD SCHEDULE</h1>
            <TimeTable class="overflow-auto" />
          </div>
  
          <div class="col-span-2 row-span-5 bg-white m-4 ml-2 rounded-[12px] p-4">
            quick actions
          </div>
  
        </div>
      </div>
    </div>
  </template>