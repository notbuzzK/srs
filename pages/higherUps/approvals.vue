<script setup lang="ts">
import InformationApprovalsTable from '~/components/ApprovalsTable.vue';

const items = [{
  key: 'schedule',
  label: 'Schedule Approval',
}, {
  key: 'information',
  label: 'Update Information Approval',
}]

const columns =[{
  key: 'id',
  label: "ID",
}, {
    key: 'user_id',
    label: "Requestor",
}]
</script>
<template>
  <div class="flex max-h-screen">

    <!--Sidebar-->
    <Sidebar :userRole="'Higher Ups'" />

    <div class="w-full gap-4">

      <!--Header-->
      <div class="h-[7%]">

        <Header />

      </div>
      <div  class="h-[93%] w-full bg-[#E8F8EF]">
        <ApprovalsTable />
      </div>
    </div>
  </div>
</template>