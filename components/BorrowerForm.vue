<script setup lang="ts">
const supabase = useNuxtApp().$supabase;
const toast = useToast()

const isOpen = ref(false)

const props = defineProps<{user_auth_id: string}>()

</script>
<template>
  <div>
    <UModal v-modal="isOpen">
      
    </UModal>
  </div>
</template>