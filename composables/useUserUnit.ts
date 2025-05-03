export function useUserUnit(userRef: Ref<any>) {
  console.log('userRef:', userRef.value) // log the value of userRef

  const unit = computed(() => {
    const user = userRef.value || {}
    console.log('user:', user) // log the value of user

    if (!user) return null // or some default value

    if (user.pr_department_id) return { type: 'department', id: user.pr_department_id }
    if (user.sd_department_id) return { type: 'department', id: user.sd_department_id }
    if (user.acadServices_id)   return { type: 'service',    id: user.acadServices_id }
    if (user.pr_college_id)     return { type: 'college',    id: user.pr_college_id }
    if (user.sd_college_id)     return { type: 'college',    id: user.sd_college_id }
    return null
  })
  console.log('unit:', unit.value) // log the value of unit

  return { unit }
}