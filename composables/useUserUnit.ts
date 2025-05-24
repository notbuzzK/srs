export function useUserUnit(userRef: Ref<any>) {
  const unit = computed(() => {
    const u = userRef.value || {}
    if (u.pr_department_id)   return { type: 'department',     id: u.pr_department_id }
    if (u.sd_department_id)   return { type: 'department',     id: u.sd_department_id }
    if (u.pr_college_id)      return { type: 'college',        id: u.pr_college_id }
    if (u.sd_college_id)      return { type: 'college',        id: u.sd_college_id }
    if (u.pr_acadServices_id) return { type: 'service',        id: u.pr_acadServices_id }
    if (u.sd_acadServices_id) return { type: 'service',        id: u.sd_acadServices_id }
    return null
  })
  return { unit }
}
