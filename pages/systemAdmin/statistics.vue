<script setup lang="ts">
const supabase = useNuxtApp().$supabase;
const router = useRouter()


function handleRoute(route: string){
  const page = '/faculty/'+route
  router.push(page)
}
const toast = useToast()


</script>
<template>
  <div class="flex max-h-screen">

    <!--Sidebar-->
    <Sidebar :userRole="'System Admin'" />

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
  
          <div class="col-span-8 row-span-2 bg-white m-4 mb-2 rounded-[12px] p-4">
            <h1>
              Parameters
            </h1>
          </div>
  
          <div class="col-span-3 row-span-3 bg-white m-4 mt-2 mr-2 rounded-[12px] p-4">
            <h1>
              Units
            </h1>
          </div>
  
          <div class="col-span-5 row-span-3 bg-white m-4 mt-2 ml-2 rounded-[12px] p-4">
            <h1>
              Bar Graph
            </h1>
          </div>
  
        </div>
      </div>
    </div>
  </template>