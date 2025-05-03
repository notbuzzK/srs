<script setup lang="ts">

  

</script>
<template>
  <div class="flex">

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
      <div class="h-[93%] ">
        <DepartmentalSummaryTable />
      </div>

    </div>
  </div>
</template>