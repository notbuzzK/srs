const status = [
  'Active',
  'Inactive'
]

const userRoles = [
  'Faculty',
  'Scheduler',
  'CEEA',
  'College Admin',
  'System Admin'
];

const designationOptions = [
  'Dean',
  'Vice Chancellor',
  'Vice Dean',
  'Program Director',
  'Assistant Director',
  'Chair',
  'Academic Teaching Faculty',
  'Academic Services Faculty',
  'Part Time Teaching Faculty',
];

const collegeOptions = [
  { value: 0, name: 'None' },
  { value: 1, name: 'College of Allied Sciences' },
  { value: 2, name: 'CCDSL'  },
  { value: 3, name: 'CHSS'  },
  { value: 4, name: 'College of Medical Imaging and Therapy'  },
  { value: 5, name: 'College of Medical Laboratory Science'  },
  { value: 6, name: 'College of Nursing'  },
  { value: 7, name: 'College of Rehabilitation Sciences'  },
  { value: 8, name: 'Dr. Mariano Que College of Pharmacy'  },
  { value: 9, name: 'Romeo P. Ariniego, MD, AFSC Library'  },
  { value: 10, name: 'SHSSHS'  },
  { value: 11, name: 'College of Dentistry'  },
  { value: 12, name: 'The Student Affairs'  },
  { value: 13, name: 'CIETI'  },
  { value: 14, name: 'College of Medicine'  },
  { value: 15, name: 'ACCESS'  },
  { value: 16, name: 'CCEI'  },
];

const departmentOptions = [
  { value: 0, name: 'None' },
  { value: 1, name: 'Bioch' },
  { value: 2, name: 'DNSM'  },
  { value: 3, name: 'LHS'  },
  { value: 4, name: 'CCDSL'  },
  { value: 5, name: 'CHSS'  },
  { value: 6, name: 'RT'  },
  { value: 7, name: 'NMT'  },
  { value: 8, name: 'NMT;RT'  },
  { value: 9, name: 'CMLS'  },
  { value: 10, name: 'Nursing'  },
  { value: 11, name: 'GS'  },
  { value: 12, name: 'SLP'  },
  { value: 13, name: 'PT'  },
  { value: 14, name: 'OT'  },
  { value: 15, name: 'BMS'  },
  { value: 16, name: 'Pharmacy'  },
  { value: 17, name: 'Public Health'  },
  { value: 18, name: 'Romeo P. Ariniego, MD, AFSC Library'  },
  { value: 19, name: 'SHSSHS'  },
  { value: 20, name: 'Dentistry'  },
  { value: 21, name: 'Guidance and Counseling'  },
  { value: 22, name: 'CIETI'  },
  { value: 23, name: 'Doctor of Philosophy in Health Sciences'  },
  { value: 24, name: 'PhD in Health Sciences by Research'  },
  { value: 25, name: 'ACCESS'  },
  { value: 26, name: 'CCEI'  },
];

const getCollegeName = (value: number) => {
  const college = collegeOptions.find((college) => college.value === value);
  return college ? college.name : 'Unknown';
};

const getDepartmentName = (value: number) => {
  const department = departmentOptions.find((element) => element.value === value);
  return department ? department.name : 'Unknown';
};

export function useAccountCreationValues() {
  return {
    status,
    userRoles,
    designationOptions,
    collegeOptions,
    departmentOptions,
    getCollegeName,
    getDepartmentName
  };
}