<script setup lang="ts">
const supabase = useNuxtApp().$supabase;
const { data: { user } } = await supabase.auth.getUser();
const userId = user?.id || '';

const { 
  getCollegeName, 
  getDepartmentName,
  getAcadServicesName
} = useAccountCreationValues();

const props = defineProps<{
  unitType: 'college' | 'service' | 'department'
  unitId: number
}>();

/* state */
const deanInfo = ref<any>(null);
const rows = ref<any[]>([]);
const viewLevel = ref<1|2>(1);
const currentDepartmentId = ref<number | null>(null);
const hasValue = ref(true);
const canGoBack = ref(false);

const q = ref('');
const page = ref(1);
const pageCount = 7;

/* helper: primary unit */
const primaryUnit = computed(() => {
  if (!deanInfo.value) return { type: null as null | 'service' | 'college', id: null as number | null };
  if (deanInfo.value.pr_acadServices_id != null) return { type: 'service', id: deanInfo.value.pr_acadServices_id };
  if (deanInfo.value.pr_college_id != null) return { type: 'college', id: deanInfo.value.pr_college_id };
  return { type: null, id: null };
});

/* get dean info */
const getDeanInfo = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('pr_college_id, pr_acadServices_id, pr_department_id, name')
    .eq('user_auth_id', userId);

  if (error) {
    console.log('Error fetching user row: ', error.message);
  } else {
    deanInfo.value = data && data.length ? data[0] : null;
  }
};

/* get departments (sets canGoBack) */
const getDepartments = async () => {
  if (!deanInfo.value) return;
  rows.value = [];

  const p = primaryUnit.value;
  if (!p.type || !p.id) {
    rows.value = [];
    canGoBack.value = false;
    return;
  }

  try {
    let result;
    if (p.type === 'college') {
      result = await supabase
        .from('departments')
        .select('department_id, department_name')
        .eq('college_id', p.id);
    } else {
      const orFilter = `acad_services_id.eq.${p.id},acadServices_id.eq.${p.id},service_id.eq.${p.id}`;
      result = await supabase
        .from('departments')
        .select('department_id, department_name')
        .or(orFilter);
    }

    const { data, error } = result;
    if (error) {
      console.log('Error fetching departments: ', error.message);
      rows.value = [];
      canGoBack.value = false;
      return;
    }

    if (!data || data.length === 0) {
      rows.value = [];
      canGoBack.value = false;
      return;
    }

    rows.value = data.map((department: any) => ({
      name: department.department_name,
      id: department.department_id,
      type: 'department'
    }));

    canGoBack.value = true;
  } catch (err) {
    console.error('getDepartments error', err);
    rows.value = [];
    canGoBack.value = false;
  }
};

/* --- AFFILIATIONS HELPERS --- */
/* makeAff: includes primary and secondary; if only secondary exists -> treat as primary so nothing is lost */
const makeAff = (type: string, primaryId?: number | null, secondaryId?: number | null, getNameFn?: (n: number)=>string) => {
  const items: any[] = [];
  if (primaryId) {
    items.push({
      type,
      role: 'primary',
      id: primaryId,
      name: getNameFn ? getNameFn(primaryId) : String(primaryId)
    });
    // include secondary only if different
    if (secondaryId && secondaryId !== primaryId) {
      items.push({
        type,
        role: 'secondary',
        id: secondaryId,
        name: getNameFn ? getNameFn(secondaryId) : String(secondaryId)
      });
    }
  } else if (secondaryId) {
    // primary missing but secondary exists -> show it as primary (only affiliation)
    items.push({
      type,
      role: 'primary',
      id: secondaryId,
      name: getNameFn ? getNameFn(secondaryId) : String(secondaryId)
    });
  }
  return items;
};

/* groupAffsByType for template rendering */
const groupAffsByType = (affs: any[]) => {
  const map = new Map<string, any[]>();
  (affs || []).forEach(a => {
    const arr = map.get(a.type) || [];
    arr.push(a);
    map.set(a.type, arr);
  });
  return Array.from(map.entries()).map(([type, items]) => ({ type, items }));
};

/* map users -> include affiliations & affiliationsDisplay */
const mapUsersToRow = (data: any[]) => {
  return data.map((u: any) => {
    const prCol = u.pr_college_id;
    const sdCol = u.sd_college_id;
    const prDept = u.pr_department_id;
    const sdDept = u.sd_department_id;
    const prSvc = u.pr_acadServices_id;
    const sdSvc = u.sd_acadServices_id;
    const prRank = u.pr_rank;
    const prRankValue = u.pr_rankValue;
    const sdRank = u.sd_rank;
    const sdRankValue = u.sd_rankValue;

    const affs = [
      ...makeAff('College', prCol, sdCol, getCollegeName),
      ...makeAff('Department', prDept, sdDept, getDepartmentName),
      ...makeAff('Service', prSvc, sdSvc, getAcadServicesName)
    ];

    // build plain display string grouped by type
    const affiliationsDisplay = affs.reduce((acc: string[], a: any) => {
      const tag = `${a.name}${a.role === 'primary' ? ' (P)' : ' (S)'}`;
      const prefix = `${a.type}: `;
      const foundIdx = acc.findIndex(s => s.startsWith(prefix));
      if (foundIdx >= 0) {
        acc[foundIdx] = acc[foundIdx] + ', ' + tag;
      } else {
        acc.push(prefix + tag);
      }
      return acc;
    }, []).join(' • ');

    // resolve rank similar to your original logic
    let rank = 'None';
    if (sdRank !== null && sdRankValue !== null) {
      rank = `${prRank} ${prRankValue}, ${sdRank} ${sdRankValue}`;
    } else if (prRank !== null && prRankValue !== null) {
      rank = `${prRank} ${prRankValue}`;
    }

    return {
      ...u,
      affiliations: affs,
      affiliationsDisplay,
      rank
    };
  });
};

/* get members of dean (uses mapUsersToRow) */
const getMembersUnderDean = async () => {
  if (!deanInfo.value) return;

  const conditions: string[] = [];
  if (deanInfo.value.pr_college_id != null) {
    conditions.push(`pr_college_id.eq.${deanInfo.value.pr_college_id}`);
  }
  if (deanInfo.value.pr_acadServices_id != null) {
    conditions.push(`pr_acadServices_id.eq.${deanInfo.value.pr_acadServices_id}`);
  }
  if (deanInfo.value.pr_department_id != null) {
    conditions.push(`pr_department_id.eq.${deanInfo.value.pr_department_id}`);
  }

  let query = supabase.from('users').select('*');
  if (conditions.length > 0) query = query.or(conditions.join(','));

  const { data, error } = await query;
  rows.value = [];

  if (error) {
    console.log('Error fetching members: ', error.message);
    hasValue.value = false;
    return;
  }

  if (!data || data.length === 0) {
    hasValue.value = false;
    rows.value = [];
    return;
  }

  hasValue.value = true;
  rows.value = mapUsersToRow(data);
};

/* get members under department (uses mapUsersToRow) */
const getMembersUnderDepartment = async (deptId: number | null) => {
  if (!deptId) {
    currentDepartmentId.value = null;
    await getMembersUnderDean();
    return;
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('pr_department_id', deptId);

  rows.value = [];

  if (error) {
    console.log('Error fetching members: ', error.message);
    hasValue.value = false;
    return;
  }

  if (!data || data.length === 0) {
    hasValue.value = false;
    rows.value = [];
    return;
  }

  hasValue.value = true;
  rows.value = mapUsersToRow(data);
};

/* when clicking a department */
const viewDepartment = async (deptId: number) => {
  currentDepartmentId.value = deptId;
  viewLevel.value = 2;
  canGoBack.value = true;
  await getMembersUnderDepartment(deptId);
};

/* columns: departments + members (members uses affiliations) */
const columnDefinitions = {
  departments: [
    { key: 'name', label: 'Departments', sortable: true },
    { key: 'actions', label: '', class: 'w-[200px]' }
  ],
  members: [
    { key: 'name', label: 'Name', sortable: true, class: 'w-[12%]' },
    { key: 'email', label: 'Email', class: 'w-[15%]' },
    { key: 'rank', label: 'Rank', sortable: true, class: 'w-[10%]' },
    { key: 'designation', label: 'Designation', sortable: true, class: 'w-[18%]' },
    { key: 'affiliations', label: 'Affiliations', sortable: true, class: 'w-[0%]' },
    { key: 'status', label: 'Status', sortable: true, class: 'w-[5%]' },
    { key: 'actions', label: '', class: 'w-[3%]' }
  ]
};

const columns = computed(() => columnDefinitions[viewLevel.value === 1 ? 'departments' : 'members']);

/* filtering includes affiliationsDisplay */
const filteredRows = computed(() => {
  if (!q.value) return rows.value;
  return rows.value.filter((row: any) =>
    // check normal fields
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(q.value.toLowerCase())
    ) ||
    // explicit check for affiliationsDisplay
    (row.affiliationsDisplay || '').toLowerCase().includes(q.value.toLowerCase())
  );
});

const paginatedRows = computed(() => {
  const start = (page.value - 1) * pageCount;
  const end = start + pageCount;
  return filteredRows.value.slice(start, end);
});

const getUnitName = computed(() => {
  if (viewLevel.value === 2 && currentDepartmentId.value) {
    return getDepartmentName(currentDepartmentId.value);
  }
  const p = primaryUnit.value;
  if (p.type === 'college' && p.id) return getCollegeName(p.id);
  if (p.type === 'service' && p.id) return getAcadServicesName(p.id);

  if (props.unitType === 'college') return getCollegeName(props.unitId);
  if (props.unitType === 'department') return getDepartmentName(props.unitId);
  if (props.unitType === 'service') return getAcadServicesName(props.unitId);
  return '';
});

/* lifecycle */
onMounted(async () => {
  await getDeanInfo();
  await getDepartments();

  if (!rows.value || rows.value.length === 0) {
    viewLevel.value = 2;
    canGoBack.value = false;
    await getMembersUnderDean();
  } else {
    viewLevel.value = 1;
    canGoBack.value = true;
  }
});

watch(viewLevel, (v) => {
  if (v === 1) {
    currentDepartmentId.value = null;
    getDepartments();
  }
});
</script>
<template>
  <div class="flex flex-col justify-between h-full">
    <div class="flex justify-between items-center border-b px-3 py-2.5">
      <h1 class="font-sans text-green-700 font-bold">{{ getUnitName }}</h1>
      <div class="flex items-center gap-2">
        <UInput v-model="q" placeholder="Filter people..." />
      </div>
    </div>

    <div class="h-full flex flex-col jutify-between">
      <UTable :rows="paginatedRows" :columns="columns">
        <!-- affiliations column rendering -->
        <template #affiliations-data="{ row }">
          <div class="flex flex-col gap-1">
            <div v-if="row.affiliations && row.affiliations.length">
              <div v-for="(group, idx) in groupAffsByType(row.affiliations)" :key="idx" class="flex items-center gap-2">
                <span class="text-xs font-semibold mr-2">{{ group.type }}:</span>
                <div class="flex flex-wrap gap-2">
                  <span v-for="item in group.items" :key="item.id + '-' + item.role"
                        class="text-xs px-2 py-0.5 rounded-full border flex items-center gap-1">
                    <span class="truncate max-w-[180px]">{{ item.name }}</span>
                    <span class="text-[10px] text-gray-500">{{ item.role === 'primary' ? 'P' : 'S' }}</span>
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="text-xs text-gray-500">{{ row.affiliationsDisplay || 'None' }}</div>
          </div>
        </template>

        <template #actions-data="{ row }">
          <editUser v-if="viewLevel === 2" :user_auth_id="row.user_auth_id" :usedIn="'table'" />
          <UButton v-if="viewLevel === 1" @click="() => viewDepartment(row.id)" variant="ghost" class="text-sm font-medium cursor-pointer text-[#017C35]">View Members</UButton>
        </template>
      </UTable>

      <UButton v-if="viewLevel === 2 && canGoBack" @click="() => { viewLevel = 1 }" variant="ghost" class="text-sm font-medium cursor-pointer text-[#017C35]">Back</UButton>
    </div>

    <div class="flex justify-between items-center px-3 py-2.5 border-t">
      <signup />
      <UPagination v-model="page" :page-count="pageCount" :total="filteredRows.length" />
    </div>
  </div>
</template>
