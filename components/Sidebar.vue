<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userRoles, defaultRoutes } from '@/composables/userRoles'

const props = defineProps<{ userRole: string }>()
const router = useRouter()
const route = useRoute()

// Get available routes for the current user role
const availableRoutes = computed(() => userRoles[props.userRole] || [])

// Initialize selectedIcon based on the current route or default
const selectedIcon = ref(defaultRoutes[props.userRole] || availableRoutes.value[0] || '')

// Update selectedIcon when the route changes
watch(
  () => route.path,
  (newPath) => {
    // Expecting path format like "/faculty/dashboard"
    const segments = newPath.split('/')
    // Set the selected icon to the second segment if it exists
    if (segments.length > 2) {
      selectedIcon.value = segments[2]
    }
  },
  { immediate: true }
)

// Handle icon click: navigate and update the selected icon immediately
function handleRoute(routeName: string) {
  // Update the route; the watcher will update selectedIcon as well.
  
  // handle route for system admin and college admin
  if (props.userRole === 'System Admin') {
    router.push(`/systemAdmin/${routeName}`)
  } else if (props.userRole === 'College Admin') {
    router.push(`/collegeAdmin/${routeName}`)
  } else {
    router.push(`/${props.userRole}/${routeName}`)
  }
  
  // Optionally update selectedIcon immediately (helps with instant UI feedback)
  selectedIcon.value = routeName
}

// Map each route to a corresponding icon name (update as needed)
const iconMap: Record<string, string> = {
  dashboard: "i-material-symbols-home-outline-rounded",
  schedule: "i-tabler-calendar-week-filled",
  courses: "i-tabler-book",
  summary: "i-tabler-file-export",
  "departmental-summary": "i-tabler-report",
  "manageMembers": "i-tabler-user-check",
  "statistics": "i-tabler-chart-bar"
}
</script>

<template>
  <div class="w-[6%] h-screen bg-[#017C35]">
    <div class="flex flex-col h-full justify-between py-6 items-center">
      <h1 class="text-[#017C35]">top</h1>
      <div class="flex flex-col gap-8 text-center items-center">
        <template v-for="route in availableRoutes" :key="route">
          <UIcon
            :name="iconMap[route]"
            @click="handleRoute(route)"
            :class="selectedIcon === route ? 'text-[#EAF33B]' : 'text-white'"
            class="w-10 h-10"
          />
        </template>
      </div>
      <h1 class="text-[#017C35]">bottom</h1>
    </div>
  </div>
</template>
