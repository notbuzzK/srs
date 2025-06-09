<script setup lang="ts">
const name = useNameStore()
const designation = useDesignationStore()
  

</script>
<template>
  <div class="flex">

   <!--Sidebar-->
   <Sidebar :userRole="'Scheduler'" />

  <div class="w-full gap-4">

    <!--Header-->
    <div class="h-[7%]">

      <Header />

    </div>

      <div  class="h-[93%] w-full bg-[#E8F8EF] grid grid-cols-8 grid-rows-5">

        <div class="col-span-6 row-span-5 bg-white m-4 mt-4 mr-2 rounded-[12px] p-4 overflow-y-auto max-h-full">
          <h1 class="text-[#017C35] font-bold text-xl">GENERATE SUMMARY</h1>
          <h1>will use Handlebars + Puppeteer</h1>
        </div>

        <div class="col-span-2 row-span-5 bg-white m-4 ml-2 rounded-[12px] p-4">
          quick actions
        </div>

      </div>
    </div>
  </div>
</template>