<script>

</script>
<template>
  <div class="flex max-h-screen">

    <!--Sidebar-->
    <Sidebar :userRole="'CEEA'" />

    <div>
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
    </div>

    <!-- Main Content -->
    <div>
      <departmenalSummaryTable />
    </div>

  </div>
</template>