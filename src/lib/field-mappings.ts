// Field mapping configuration for Employee_Details table
// Maps modal toggle IDs to database fields and handles data transformations

interface FieldMapping {
  label: string;
  getValue: (employee: any, document?: any) => string;
}

// Name parsing utility
export const parseName = (employeeName: string) => {
  if (!employeeName) {
    return {
      firstName: 'N/A',
      secondName: 'N/A',
      lastName: 'N/A',
      fullNameEnglish: 'N/A'
    };
  }
  
  const parts = employeeName.trim().split(/\s+/); // Split by any whitespace
  
  return {
    firstName: parts[0] || 'N/A',
    secondName: parts.length > 2 ? parts.slice(1, -1).join(' ') : 'N/A',
    lastName: parts.length > 1 ? parts[parts.length - 1] : 'N/A',
    fullNameEnglish: employeeName
  };
};

// English to Arabic letter transliteration mapping
const englishToArabicLetters: Record<string, string> = {
  // Vowels
  'a': 'ا',
  'e': 'ي',
  'i': 'ي',
  'o': 'و',
  'u': 'و',
  
  // Consonants
  'b': 'ب',
  'c': 'ك', // or 'س' depending on pronunciation
  'd': 'د',
  'f': 'ف',
  'g': 'ج',
  'h': 'ه',
  'j': 'ج',
  'k': 'ك',
  'l': 'ل',
  'm': 'م',
  'n': 'ن',
  'p': 'ب', // Arabic doesn't have 'p', using 'b'
  'q': 'ق',
  'r': 'ر',
  's': 'س',
  't': 'ت',
  'v': 'ف', // Arabic doesn't have 'v', using 'f'
  'w': 'و',
  'x': 'كس',
  'y': 'ي',
  'z': 'ز',
  
  // Special combinations
  'th': 'ث',
  'sh': 'ش',
  'ch': 'تش',
  'kh': 'خ',
  'dh': 'ذ',
  'gh': 'غ',
  'aa': 'آ',
  'ee': 'ي',
  'oo': 'و',
  'ou': 'و',
  'ai': 'اي',
  'ay': 'اي',
  'ph': 'ف',
};

// Function to transliterate English name to Arabic letters
export const translateNameToArabic = (englishName: string): string => {
  if (!englishName || englishName === 'N/A') {
    return 'N/A';
  }

  try {
    let result = '';
    const name = englishName.toLowerCase();
    let i = 0;
    
    while (i < name.length) {
      // Check for two-letter combinations first
      if (i < name.length - 1) {
        const twoLetters = name.substring(i, i + 2);
        if (englishToArabicLetters[twoLetters]) {
          result += englishToArabicLetters[twoLetters];
          i += 2;
          continue;
        }
      }
      
      // Single letter
      const letter = name[i];
      if (letter === ' ') {
        result += ' ';
      } else if (englishToArabicLetters[letter]) {
        result += englishToArabicLetters[letter];
      } else {
        // Keep original character if no mapping found
        result += letter;
      }
      i++;
    }
    
    return result;
  } catch (error) {
    console.error('Error transliterating name to Arabic:', error);
    return 'N/A';
  }
};

// Personal Info field mappings
export const personalInfoMapping: Record<string, FieldMapping> = {
  'first-name': {
    label: 'First Name',
    getValue: (employee) => parseName(employee.EmployeeName).firstName
  },
  'second-name': {
    label: 'Second Name', 
    getValue: (employee) => parseName(employee.EmployeeName).secondName
  },
  'last-name': {
    label: 'Last Name',
    getValue: (employee) => parseName(employee.EmployeeName).lastName
  },
  'full-name-english': {
    label: 'Full Name English',
    getValue: (employee) => employee.EmployeeName || 'N/A'
  },
  'full-name-arabic': {
    label: 'Full Name Arabic',
    getValue: (employee) => translateNameToArabic(employee.EmployeeName)
  },
  'date-of-birth': {
    label: 'Date of Birth',
    getValue: (employee) => employee.BirthDate || 'N/A'
  },
  'place-of-birth': {
    label: 'Place Of Birth',
    getValue: (employee) => 'N/A' // Future datasource
  },
  'nationality': {
    label: 'Nationality',
    getValue: (employee) => employee.Nationality || 'N/A'
  },
  'gender': {
    label: 'Gender',
    getValue: (employee) => employee.Gender || 'N/A'
  },
  'language': {
    label: 'Language',
    getValue: (employee) => 'N/A' // Future datasource
  },
  'photo': {
    label: 'Photo',
    getValue: (employee) => 'N/A' // Future datasource
  }
};

// Employment Info field mappings
export const employmentInfoMapping: Record<string, FieldMapping> = {
  'employee-id': {
    label: 'Employee ID',
    getValue: (employee) => employee.EmployeeCode || 'N/A'
  },
  'job-title': {
    label: 'Job Title',
    getValue: (employee) => employee.Designation || 'N/A'
  },
  'department': {
    label: 'Department',
    getValue: (employee) => employee.Department || 'N/A'
  },
  'date-of-joining': {
    label: 'Date of Joining',
    getValue: (employee) => employee.DOJ || 'N/A'
  },
  'contact-no': {
    label: 'Contact No',
    getValue: (employee) => employee.MobileNo || 'N/A'
  },
  'residence-location': {
    label: 'Residence Location',
    getValue: (employee) => {
      // Combine address fields if available
      const addressParts = [
        employee.Address1,
        employee.Address2,
        employee.Address3,
        employee.Address4
      ].filter(part => part && part.trim());
      
      return addressParts.length > 0 ? addressParts.join(', ') : 'N/A';
    }
  }
};

// Document-based field mappings (from Employee_Documents table)
export const passportInfoMapping: Record<string, FieldMapping> = {
  'passport-no': {
    label: 'Passport Number',
    getValue: (employee, document) => {
      // Check if this is a passport document
      if (document?.document_name?.toUpperCase().includes('PASSPORT')) {
        // Only return passport number if it's not "Pending" or empty
        const passportNo = document.document_number;
        if (passportNo && passportNo !== 'Pending' && passportNo !== '') {
          return passportNo;
        }
      }
      return 'N/A';
    }
  },
  'passport-issue-country': {
    label: 'Passport Issue Country',
    getValue: (employee, document) => {
      // Use employee's nationality as passport issue country (common assumption)
      // Can be overridden in future if specific passport country data becomes available
      if (employee?.Nationality) {
        return employee.Nationality;
      }
      return 'N/A';
    }
  },
  'passport-issue-date': {
    label: 'Passport Issue Date',
    getValue: (employee, document) => {
      // For passport documents, use entry_date as issue date
      if (document?.document_name?.toUpperCase().includes('PASSPORT')) {
        if (document.entry_date) {
          return document.entry_date;
        }
      }
      return 'N/A';
    }
  },
  'passport-expiry-date': {
    label: 'Passport Expiry Date',
    getValue: (employee, document) => {
      // For passport documents, use due_date as expiry date
      if (document?.document_name?.toUpperCase().includes('PASSPORT')) {
        if (document.due_date) {
          return document.due_date;
        }
      }
      return 'N/A';
    }
  }
};

// Visa Info mappings
export const visaInfoMapping: Record<string, FieldMapping> = {
  'visa-no': {
    label: 'Visa Number',
    getValue: (employee, document) => {
      // For VISA documents (can be RESIDENCE VISA, EMPLOYMENT VISA, etc.)
      if (document?.document_name?.toUpperCase().includes('VISA')) {
        // Filter out "Pending" or empty values
        const visaNo = document.document_number;
        if (visaNo && visaNo !== 'Pending' && visaNo !== '') {
          return visaNo;
        }
      }
      return 'N/A';
    }
  },
  'visa-issue-place': {
    label: 'Visa Issue Place',
    getValue: (employee, document) => {
      // For VISA documents
      if (document?.document_name?.toUpperCase().includes('VISA')) {
        // Extract issue place from VisaType field (e.g., "EMPLOYMENT VISA - DXB" -> "DXB")
        if (document.visa_type) {
          const parts = document.visa_type.split(' - ');
          if (parts.length > 1) {
            return parts[parts.length - 1].trim();
          }
          // If no dash, check if it contains location codes
          const locationMatch = document.visa_type.match(/\b(DXB|AUH|SHJ|AJM|RAK|FUJ|UAQ)\b/i);
          if (locationMatch) {
            return locationMatch[0].toUpperCase();
          }
          return document.visa_type;
        }
      }
      return 'N/A';
    }
  },
  'visa-issue-date': {
    label: 'Visa Issue Date',
    getValue: (employee, document) => {
      // For VISA documents, use entry_date as issue date
      if (document?.document_name?.toUpperCase().includes('VISA')) {
        if (document.entry_date) {
          return document.entry_date;
        }
      }
      return 'N/A';
    }
  },
  'visa-expiry-date': {
    label: 'Visa Expiry Date',
    getValue: (employee, document) => {
      // For VISA documents, use due_date as expiry date
      if (document?.document_name?.toUpperCase().includes('VISA')) {
        if (document.due_date) {
          return document.due_date;
        }
      }
      return 'N/A';
    }
  }
};

// EID Info mappings
export const eidInfoMapping: Record<string, FieldMapping> = {
  'emirates-id-no': {
    label: 'Emirates ID Number',
    getValue: (employee, document) => {
      // For EMIRATES ID documents
      if (document?.document_name?.toUpperCase().includes('EMIRATES')) {
        // Filter out "Pending" or empty values
        const eidNo = document.document_number;
        if (eidNo && eidNo !== 'Pending' && eidNo !== '') {
          return eidNo;
        }
      }
      return 'N/A';
    }
  },
  'emirates-id-issue-date': {
    label: 'Emirates ID Issue Date',
    getValue: (employee, document) => {
      // For EMIRATES ID documents, use entry_date as issue date
      if (document?.document_name?.toUpperCase().includes('EMIRATES')) {
        if (document.entry_date) {
          return document.entry_date;
        }
      }
      return 'N/A';
    }
  },
  'emirates-id-expiry-date': {
    label: 'Emirates ID Expiry Date',
    getValue: (employee, document) => {
      // For EMIRATES ID documents, use due_date as expiry date
      if (document?.document_name?.toUpperCase().includes('EMIRATES')) {
        if (document.due_date) {
          return document.due_date;
        }
      }
      return 'N/A';
    }
  }
};

// MOL Info mappings
export const molInfoMapping: Record<string, FieldMapping> = {
  'mol-number': {
    label: 'MOL Number',
    getValue: (employee, document) => {
      // For MOL/Labor Card documents (future implementation)
      // Will look for documents with "MOL" or "LABOR" in document_name
      if (document?.document_name?.toUpperCase().match(/MOL|LABOR|LABOUR/)) {
        const molNo = document.document_number;
        if (molNo && molNo !== 'Pending' && molNo !== '') {
          return molNo;
        }
      }
      return 'N/A'; // Currently no MOL data in Employee_Documents
    }
  },
  'mol-issue-date': {
    label: 'MOL Issue Date',
    getValue: (employee, document) => {
      // For MOL/Labor Card documents, use entry_date as issue date
      if (document?.document_name?.toUpperCase().match(/MOL|LABOR|LABOUR/)) {
        if (document.entry_date) {
          return document.entry_date;
        }
      }
      return 'N/A'; // Currently no MOL data in Employee_Documents
    }
  },
  'mol-expiry-date': {
    label: 'MOL Expiry Date',
    getValue: (employee, document) => {
      // For MOL/Labor Card documents, use due_date as expiry date
      if (document?.document_name?.toUpperCase().match(/MOL|LABOR|LABOUR/)) {
        if (document.due_date) {
          return document.due_date;
        }
      }
      return 'N/A'; // Currently no MOL data in Employee_Documents
    }
  }
};

// Certificate Info mappings
export const certificateInfoMapping: Record<string, FieldMapping> = {
  'certificate-type': {
    label: 'Certificate Type',
    getValue: (document) => document?.document_name || 'N/A'
  },
  'certificate-no': {
    label: 'Certificate No',
    getValue: (document) => document?.document_number || 'N/A'
  },
  'certificate-start-date': {
    label: 'Certificate Start Date',
    getValue: (document) => document?.entry_date || 'N/A'
  },
  'certificate-expiry-date': {
    label: 'Certificate Expiry Date',
    getValue: (document) => document?.due_date || 'N/A'
  }
};

// Insurance Info mappings
export const insuranceInfoMapping: Record<string, FieldMapping> = {
  'insurance-type': {
    label: 'Insurance Type',
    getValue: (employee, document) => {
      // For insurance documents (HEALTH INSURANCE, MEDICAL INSURANCE, etc.)
      if (document?.document_name?.toUpperCase().match(/INSURANCE|MEDICAL|HEALTH/)) {
        // Extract insurance type from document name
        const docName = document.document_name;
        // Clean up common patterns like "HEALTH INSURANCE CARD" -> "Health Insurance"
        const cleanedName = docName
          .replace(/CARD$/i, '')
          .replace(/CERTIFICATE$/i, '')
          .trim()
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        return cleanedName;
      }
      return 'N/A'; // Currently no insurance data in Employee_Documents
    }
  },
  'insurance-issue-date': {
    label: 'Insurance Issue Date',
    getValue: (employee, document) => {
      // For insurance documents, use entry_date as issue date
      if (document?.document_name?.toUpperCase().match(/INSURANCE|MEDICAL|HEALTH/)) {
        if (document.entry_date) {
          return document.entry_date;
        }
      }
      return 'N/A'; // Currently no insurance data in Employee_Documents
    }
  },
  'insurance-expiry-date': {
    label: 'Insurance Expiry Date',
    getValue: (employee, document) => {
      // For insurance documents, use due_date as expiry date
      if (document?.document_name?.toUpperCase().match(/INSURANCE|MEDICAL|HEALTH/)) {
        if (document.due_date) {
          return document.due_date;
        }
      }
      return 'N/A'; // Currently no insurance data in Employee_Documents
    }
  }
};

// Helper function to apply mappings to data
export function applyFieldMappings(
  data: any,
  activeToggles: string[],
  mappingConfig: Record<string, FieldMapping>
): Record<string, any> {
  const result: Record<string, any> = {};
  
  activeToggles.forEach(toggleId => {
    const mapping = mappingConfig[toggleId];
    if (mapping) {
      result[mapping.label] = mapping.getValue(data);
    }
  });
  
  return result;
}

// Get all mappings for a category
export function getMappingsForCategory(category: string): Record<string, FieldMapping> {
  switch (category) {
    case 'personalInfo':
      return personalInfoMapping;
    case 'employmentInfo':
      return employmentInfoMapping;
    case 'passportInfo':
      return passportInfoMapping;
    case 'visaInfo':
      return visaInfoMapping;
    case 'eidInfo':
      return eidInfoMapping;
    case 'molInfo':
      return molInfoMapping;
    case 'certificateInfo':
      return certificateInfoMapping;
    case 'insuranceInfo':
      return insuranceInfoMapping;
    default:
      return {};
  }
}
