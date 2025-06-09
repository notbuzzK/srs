<script setup lang="ts">

  

</script>
<template>
  <div class="flex">

   <!--Sidebar-->
   <Sidebar :userRole="'CEEA'" />

  <div class="w-full gap-4">

    <!--Header-->
    <div class="h-[7%]">

      <Header />

    </div>

      <!-- Main Content -->
      <div class="h-[93%] ">
        <DepartmentalSummaryTable />
      </div>

    </div>
  </div>
</template>