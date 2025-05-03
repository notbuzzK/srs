const status = [
  'Active',
  'Inactive'
]

const userRoles = [
  'Faculty',
  'Scheduler',
  'CEEA',
  'College Admin',
  'System Admin',
  'Dean',
];

const facultyItems = [
  'Full-Time Permanent',
  'Full-Time Probationary',
  'Full-Time Fixed Term',
  'Full-Time A',
  'Full-Time B',
  'Part-Time'
]

const ranks = [
  'Instructor',
  'Assistant Professor',
  'Associate Professor',
  'Full Professor',
  'Lecturer',
  'Assistant Professorial Lecturer',
  'Associate Professorial Lecturer',
  'Professor Lecturer',
  'Teacher',
  'Master Teacher',
  'ASF-I',
  'ASF-II',
  'ASF-III',
  'ASF-IV',
]

const designationOptions = [
  'Vice Chancellor',
  'Academic Dean',
  'TSA Dean',
  'SHSSHS Director',
  'Director',
  'Vice Dean',
  'Program Director',
  'Assistant Director',
  'Chair',
  'Vice Chair',
  'Coordinator',
  'Academic Teaching Faculty',
  'Academic Services Faculty',
];

const acadServicesOptions = [
  { value: 0, name: 'None' }, 
  { value: 1, name: 'Center for Community Development and Service - Learning', placeholder: 'CCDSL' },
  { value: 2, name: 'Center for Humanities and Social Sciences', placeholder: 'CHSS' },
  { value: 3, name: 'Romeo P. Ariniego, MD, AFSC Library', placeholder: 'RPAMDAFSC Library' },
  { value: 4, name: 'The Student Affairs', placeholder: 'TSA' },
  { value: 5, name: 'Center for Continuing Education and Innovation', placeholder: 'CCEI' },
]

const collegeOptions = [
  { value: 0, name: 'None' },
  { value: 1, name: 'College of Allied Sciences', placeholder: 'CAS' },
  { value: 2, name: 'College of Medical Imaging and Therapy', placeholder: 'CMIT' },
  { value: 3, name: 'College of Medical Laboratory Science', placeholder: 'CMLS' },
  { value: 4, name: 'College of Nursing', placeholder: null },
  { value: 5, name: 'College of Rehabilitation Sciences', placeholder: 'CRS' },
  { value: 6, name: 'Dr. Mariano Que College of Pharmacy', placeholder: null },
  { value: 7, name: 'Special Health Sciences Senior High School', placeholder: 'SHSSHS' },
  { value: 8, name: 'College of Dentistry', placeholder: 'CD' },
  { value: 9, name: 'School of Advanced Studies', placeholder:  null }, 
  { value: 10, name: 'College of Medicine', placeholder: 'CM' },
];

const departmentOptions = [
  { value: 0, name: 'None' },
  { value: 1, name: 'Biochemistry (BCH)', placeholder: 'BCH' },
  { value: 2, name: 'Department of Natural Sciences and Mathematics', placeholder: 'DNSM' },
  { value: 3, name: 'Life and Health Sciences', placeholder: 'LHS'  },
  { value: 4, name: 'National Service Training Program', placeholder: 'NSTP'  },
  { value: 5, name: 'Community Health Development Program', placeholder: 'CHDP'  },
  { value: 6, name: 'Center for Humanities and Social Sciences', placeholder: 'CHSS'  },
  { value: 7, name: 'Radiologic Technology', placeholder: 'RT'  },
  { value: 8, name: 'Nuclear Medicine Technology', placeholder: 'NMT'  },
  { value: 9, name: 'NMT;RT'  },
  { value: 10, name: 'Speech-Language Pathology',  placeholder: 'SLP'  },
  { value: 11, name: 'Physical Therapy', placeholder: 'PT'  },
  { value: 12, name: 'Occupational Therapy', placeholder: 'OT'  },
  { value: 13, name: 'Basic Medical Sciences', placeholder: 'BMS'  },
  { value: 14, name: 'Student Wellness and Guidance and Counseling Department', placeholder: 'SWGCD'  },
  { value: 15, name: 'Master of Arts in Nursing', placeholder: 'MAN'  },
  { value: 16, name: 'Master in Public Health', placeholder: 'MPH'  },
  { value: 17, name: 'Doctor of Philosophy in Health Sciences by Research', placeholder: 'PhD'  },
  { value: 18, name: 'Anatomy', placeholder: 'CM-ANATOMY'  },
  { value: 19, name: 'Biochemistry (CM-BCH)', placeholder: 'CM-BCH'  },
  { value: 20, name: 'Physiology', placeholder: 'CM-PHYSIO'  },
  { value: 21, name: 'Psychiatry', placeholder: 'CM-PSYCH'  },
  { value: 22, name: 'Clinical Epidemiology', placeholder: 'CM-CLI EPI'  },
  { value: 23, name: 'Family & Community Medicine', placeholder: 'CM-COMMED'  },
  { value: 24, name: 'Bioethics', placeholder: 'CM-Bioethics'  },
  { value: 25, name: 'Pediatrics', placeholder: 'CM-PEDIA'  },
  { value: 26, name: 'Health Informatics', placeholder: 'CM-Health Infor'  },
  { value: 27, name: 'Surgery', placeholder: 'CM-Surgery'  },
  { value: 28, name: 'Anesthesiology', placeholder: 'CM-ANES'  },
  { value: 29, name: 'Microbiology & Parasitology', placeholder: 'CM-MICR & PARA'  },
  { value: 30, name: 'Pathology', placeholder: 'CM-PATHO'  },
  { value: 31, name: 'Pharmacology', placeholder: 'CM-PHARMA'  },
  { value: 32, name: 'Obstetrics & Gynecology', placeholder: 'CM-OBGYNE'  },
  { value: 33, name: 'Ophthalmology', placeholder: 'CM-OPHTHA'  },
  { value: 34, name: 'Emergency Medicine', placeholder: 'CM-ER MED'  },
  { value: 35, name: 'Neuroscience', placeholder: 'CM-Neuroscience'  },
  { value: 36, name: 'Internal Medicine', placeholder: 'CM-INTERNAL MED'  },
  { value: 37, name: 'Physical and Rehabilitation Medicine', placeholder: 'CM-PRM'  },
  { value: 38, name: 'Radiology', placeholder: 'CM-RAD'  },
  { value: 39, name: 'Orthopedics', placeholder: 'CM-ORTHOPEDICS'  },
  { value: 40, name: 'Otolaryngology', placeholder: 'CM-ORL-HNS'  },
];

const range = [1, 2, 3, 4, 5, 6]

const getCollegeName = (value: number) => {
  const college = collegeOptions.find((college) => college.value === value);
  return college ? (college.placeholder || college.name) : 'Unknown';
};

const getDepartmentName = (value: number) => {
  const department = departmentOptions.find((element) => element.value === value);
  return department ? (department.placeholder || department.name) : 'Unknown';
};

const getAcadServicesName = (value: number) => {
  const acadService = acadServicesOptions.find((element) => element.value === value);
  return acadService ? (acadService.placeholder || acadService.name) : 'Unknown';
};

export function useAccountCreationValues() {
  return {
    status,
    userRoles,
    designationOptions,
    collegeOptions,
    departmentOptions,
    acadServicesOptions,
    facultyItems,
    ranks,
    range,
    getCollegeName,
    getDepartmentName,
    getAcadServicesName,
  };
}