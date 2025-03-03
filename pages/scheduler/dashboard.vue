<template>
    <div class="flex">
      <div class="w-[6%] h-screen bg-gray-200">
        <h1>sidebar</h1>
      </div>
      <div class="w-full gap-4">
  
        <div class="h-[6%] bg-slate-200">
          <h1>header</h1>
        </div>
  
        <div  class="h-[94%] w-full bg-orange-700 grid grid-cols-8 grid-rows-5">
  
          <div class="col-span-5 row-span-1 bg-white m-4 mb-2 mr-2">
            tabs
          </div>
  
          <div class="col-span-3 row-span-1 bg-purple-300 m-4 ml-2 mb-2">
            Tracking
          </div>
          
          <div class="col-span-5 row-span-4 bg-blue-300 m-4 mt-2 mr-2">
            Summary History
          </div>
            
          <div class="col-span-3 row-span-2 bg-purple-300 m-4 mt-2 ml-2 mb-2">
            Term Info
          </div>

          <div class="col-span-3 row-span-2 bg-purple-300 m-4 mt-2 ml-2">
            Availability Time
          </div>

        </div>
      </div>
    </div>
  </template>