<template>
  <UPopover :popper="{ arrow: true, placement: 'bottom-start' }">
    <UIcon 
        name="i-ic-round-account-circle" 
        @click="" 
        class="w-8 h-8 text-center  text-[#017C35]" 
    />

    <template #panel>
        <div class="p-4">
        <h1 class="border-b">Name example</h1>
        <h1 class="border-b">Update Info</h1>
        <h1 class="border-b">Update Password</h1>
        <h1 class="border-b">Logout</h1>

        </div>
    </template>
  </UPopover>
</template>