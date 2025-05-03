<template> 
  <UPopover :popper="{ arrow: true, placement: 'bottom-start' }">
    <UIcon 
      name="i-octicon-inbox-16" 
      @click="" 
      class="w-6 h-8 text-center text-[#017C35]"
      fallback-icon="i-material-symbols-help"
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