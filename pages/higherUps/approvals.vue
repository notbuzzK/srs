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
      <div class="h-[7%] bg-[#FFFFFF]">

        <div class="flex justify-between h-full items-center p-2 px-6">
          <h1 class="font-sans text-[#017C35] font-bold">Faculty Schedule Recommendation System</h1>

          <div class="flex justify-between gap-8 items-center">
            <!-- <p class="font-bold text-[#017C35]">{{ name.name }}, {{ designation.designation }}</p> -->
            <div class="flex justify-between gap-8">
              <!--Notifcation-->
              <Notifications />

              <!--Profile-->
              <Profile />

            </div>
          </div>
        </div>

      </div>
      <div  class="h-[93%] w-full bg-[#E8F8EF]">
        <ApprovalsTable />
      </div>
    </div>
  </div>
</template>