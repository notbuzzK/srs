<template>
    <div class="flex">
      <div class="w-[6%] h-screen bg-gray-200">
        <h1>sidebar</h1>
      </div>
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
  
        <div  class="h-[94%] w-full bg-orange-700 grid grid-cols-8 grid-rows-5">
  
          <div class="col-span-5 row-span-1 bg-white m-4 mb-2 mr-2">
            tabs
          </div>
  
          <div class="col-span-3 row-span-5 bg-purple-300 m-4 ml-2">
            Availability Time
          </div>
  
          <div class="col-span-5 row-span-4 bg-blue-300 m-4 mt-2 mr-2">
            Summary History
          </div>
  
        </div>
      </div>
    </div>
  </template>