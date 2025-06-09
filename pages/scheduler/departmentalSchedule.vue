<script setup lang="ts">
const name = useNameStore()
const designation = useDesignationStore()
</script>
<template>
  <div class="flex max-h-screen">

    <!--Sidebar-->
    <Sidebar :userRole="'Scheduler'" />

    <div class="w-full gap-4">

      <!--Header-->
      <div class="h-[7%]">

        <Header />

      </div>

      <!-- Main Content -->
      <DepartmentalScheduleTable />
      
    </div>
  </div>
</template>