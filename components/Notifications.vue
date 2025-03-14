<template> 
  <UPopover :popper="{ arrow: true, placement: 'bottom-start' }">
    <UIcon 
      name="i-charm-inbox" 
      @click="" 
      class="w-8 h-8 text-center  text-[#017C35]" 
    />

    <template #panel>
      <div class="p-4">
        <h1>Notifications</h1>
        <h1>Notifications</h1>
        <h1>Notifications</h1>
        <h1>Notifications</h1>
        <h1>Notifications</h1>
        <h1>Notifications</h1>
      </div>
    </template>
  </UPopover>
</template>