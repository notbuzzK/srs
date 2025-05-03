<script>
const supabase = useNuxtApp().$supabase;

const columns = [{
  key: 'college',
  label: 'College',
  sortable: true,
}, {
  key: 'department',
  label: 'Department',
  sortable: true
}, {
  key: 'action',
  label: ''
}]

const rows = [{
  
}]

</script>
<template>
  <div class="h-full w-full grid grid-cols-6 grid-rows-6 bg-[#E8F8EF]">

    <div class="col-span-2 row-span-6 bg-white rounded-[12px] m-4 mr-2 p-4">
      <h1>table 1</h1>
    </div>

    <div class="col-span-4 row-span-6 bg-white rounded-[12px] m-4 ml-2 p-4">
      <h1>table 2</h1>
    </div>

  </div>
</template>