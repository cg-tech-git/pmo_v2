import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { 
  personalInfoMapping, 
  employmentInfoMapping,
  passportInfoMapping,
  visaInfoMapping,
  eidInfoMapping,
  molInfoMapping,
  certificateInfoMapping,
  insuranceInfoMapping,
  applyFieldMappings
} from './field-mappings';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export interface ReportData {
  customerName: string;
  reportDate: string;
  employees: any[];
  selectedCategories: {
    personalInfo?: string[];
    employmentInfo?: string[];
    passportInfo?: string[];
    visaInfo?: string[];
    eidInfo?: string[];
    molInfo?: string[];
    insuranceInfo?: string[];
  };
  documents?: Record<string, any>;
}

// Generate PDF Report
export async function generatePDFReport(data: ReportData): Promise<Blob> {
  // Create PDF in landscape orientation
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  let yPosition = 20;
  
  // Title
  pdf.setFontSize(20);
  pdf.text('Site Accreditation Report', 20, yPosition);
  yPosition += 10;
  
  // Customer info
  pdf.setFontSize(12);
  pdf.text(`Customer: ${data.customerName}`, 20, yPosition);
  yPosition += 7;
  pdf.text(`Date: ${data.reportDate}`, 20, yPosition);
  yPosition += 7;
  pdf.text(`Total Employees: ${data.employees.length}`, 20, yPosition);
  yPosition += 15;
  
  // Prepare table headers and data
  const headers: string[] = ['Employee Code', 'Employee Name'];
  const allFieldMappings: Record<string, any> = {};
  
  // Collect all selected fields
  if (data.selectedCategories.personalInfo && data.selectedCategories.personalInfo.length > 0) {
    data.selectedCategories.personalInfo.forEach(field => {
      const mapping = personalInfoMapping[field];
      if (mapping) {
        headers.push(mapping.label);
        allFieldMappings[mapping.label] = { category: 'personal', field, mapping };
      }
    });
  }
  
  if (data.selectedCategories.employmentInfo && data.selectedCategories.employmentInfo.length > 0) {
    data.selectedCategories.employmentInfo.forEach(field => {
      const mapping = employmentInfoMapping[field];
      if (mapping) {
        headers.push(mapping.label);
        allFieldMappings[mapping.label] = { category: 'employment', field, mapping };
      }
    });
  }
  
  // Add document fields headers
  const documentSections = [
    { key: 'passportInfo', mapping: passportInfoMapping },
    { key: 'visaInfo', mapping: visaInfoMapping },
    { key: 'eidInfo', mapping: eidInfoMapping },
    { key: 'molInfo', mapping: molInfoMapping },
    { key: 'certificateInfo', mapping: certificateInfoMapping },
    { key: 'insuranceInfo', mapping: insuranceInfoMapping }
  ];
  
  documentSections.forEach(section => {
    const selectedFields = data.selectedCategories[section.key as keyof typeof data.selectedCategories];
    if (selectedFields && selectedFields.length > 0) {
      selectedFields.forEach(field => {
        const mapping = section.mapping[field];
        if (mapping) {
          headers.push(mapping.label);
          allFieldMappings[mapping.label] = { category: section.key, field, mapping };
        }
      });
    }
  });
  
  // Build table rows
  const tableRows: any[] = [];
  
  data.employees.forEach(employee => {
    const row: any[] = [employee.EmployeeCode, employee.EmployeeName];
    
    // Add values for each field
    headers.slice(2).forEach(header => {
      const fieldInfo = allFieldMappings[header];
      if (!fieldInfo) {
        row.push('N/A');
        return;
      }
      
      let value = 'N/A';
      
      if (fieldInfo.category === 'personal' || fieldInfo.category === 'employment') {
        // Get value from employee data
        value = fieldInfo.mapping.getValue(employee) || 'N/A';
      } else {
        // Get value from documents
        const sectionDocs = data.documents?.[fieldInfo.category] || [];
        const employeeDocs = sectionDocs.filter((doc: any) => 
          doc.employee_code === employee.EmployeeCode
        );
        
        if (employeeDocs.length > 0) {
          // For passport info, find the most complete passport document
          if (fieldInfo.category === 'passportInfo') {
            // Sort by completeness - prefer documents with actual passport numbers
            const validPassports = employeeDocs
              .filter((doc: any) => doc.document_name?.toUpperCase().includes('PASSPORT'))
              .sort((a: any, b: any) => {
                // Prioritize documents with actual passport numbers (not "Pending" or empty)
                const aHasNumber = a.document_number && a.document_number !== 'Pending' && a.document_number !== '';
                const bHasNumber = b.document_number && b.document_number !== 'Pending' && b.document_number !== '';
                if (aHasNumber && !bHasNumber) return -1;
                if (!aHasNumber && bHasNumber) return 1;
                return 0;
              });
            
            if (validPassports.length > 0) {
              console.log(`Processing passport for ${employee.EmployeeCode}, field: ${fieldInfo.field}`, {
                passportDoc: validPassports[0],
                fieldMapping: fieldInfo.mapping.label
              });
              value = fieldInfo.mapping.getValue(validPassports[0], employee) || 'N/A';
            }
          } else {
            // For other document types, try to find a value from any document
            for (const doc of employeeDocs) {
              const docValue = fieldInfo.mapping.getValue(doc, employee);
              if (docValue && docValue !== 'N/A') {
                value = docValue;
                break;
              }
            }
          }
        }
      }
      
      row.push(value);
    });
    
    tableRows.push(row);
  });
  
  // Generate table
  autoTable(pdf, {
    startY: yPosition,
    head: [headers],
    body: tableRows,
    theme: 'grid',
    headStyles: { 
      fillColor: [86, 179, 229],
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Employee Code
      1: { cellWidth: 40 }  // Employee Name
    },
    margin: { left: 10, right: 10 },
    showFoot: false,
    tableWidth: 'auto',
    horizontalPageBreak: true,
    didDrawPage: function (data: any) {
      // Add header to new pages
      if (data.pageNumber > 1) {
        pdf.setFontSize(12);
        pdf.text(`Site Accreditation Report - ${data.customerName} (Page ${data.pageNumber})`, 20, 15);
      }
    }
  });
  
  return pdf.output('blob');
}

// Generate Excel Report
export async function generateExcelReport(data: ReportData): Promise<Blob> {
  const wb = XLSX.utils.book_new();
  
  console.log('generateExcelReport - Full data object:', JSON.stringify({
    customerName: data.customerName,
    reportDate: data.reportDate,
    employeeCount: data.employees?.length,
    selectedCategories: data.selectedCategories,
    documentCount: Object.keys(data.documents || {}).length
  }, null, 2));
  
  // Summary sheet
  const summaryData = [
    ['Site Accreditation Report'],
    [],
    ['Customer:', data.customerName],
    ['Date:', data.reportDate],
    ['Total Employees:', data.employees.length.toString()],
    []
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
  
  // Employee Details sheet
  const headers: string[] = ['Employee Code', 'Employee Name'];
  
  // Add headers for each selected field from all categories
  // Personal Info
  console.log('Checking personalInfo:', data.selectedCategories.personalInfo);
  if (data.selectedCategories.personalInfo && data.selectedCategories.personalInfo.length > 0) {
    console.log('Processing personalInfo fields:', data.selectedCategories.personalInfo);
    data.selectedCategories.personalInfo.forEach(fieldId => {
      console.log('Processing personalInfo field:', fieldId);
      if (fieldId === 'first-name') headers.push('First Name');
      else if (fieldId === 'second-name') headers.push('Second Name');
      else if (fieldId === 'last-name') headers.push('Last Name');
      else if (fieldId === 'full-name-english') headers.push('Full Name English');
      else if (fieldId === 'full-name-arabic') headers.push('Full Name Arabic');
      else if (fieldId === 'gender') headers.push('Gender');
      else if (fieldId === 'date-of-birth') headers.push('Date of Birth');
      else if (fieldId === 'place-of-birth') headers.push('Place of Birth');
      else if (fieldId === 'nationality') headers.push('Nationality');
      else if (fieldId === 'language') headers.push('Language');
    });
  }
  
  // Employment Info
  if (data.selectedCategories.employmentInfo && data.selectedCategories.employmentInfo.length > 0) {
    data.selectedCategories.employmentInfo.forEach(fieldId => {
      if (fieldId === 'job-title') headers.push('Job Title');
      else if (fieldId === 'department') headers.push('Department');
      else if (fieldId === 'date-of-joining') headers.push('Date of Joining');
      else if (fieldId === 'contact-no') headers.push('Contact No');
      else if (fieldId === 'residence-location') headers.push('Residence Location');
    });
  }
  
  // Passport Info
  console.log('Checking passportInfo:', data.selectedCategories.passportInfo);
  if (data.selectedCategories.passportInfo && data.selectedCategories.employmentInfo.length > 0) {
    console.log('Processing passportInfo fields:', data.selectedCategories.passportInfo);
    data.selectedCategories.passportInfo.forEach(fieldId => {
      console.log('Processing passportInfo field:', fieldId);
      if (fieldId === 'passport-no') headers.push('Passport Number');
      else if (fieldId === 'passport-issue-country') headers.push('Passport Issue Country');
      else if (fieldId === 'passport-issue-date') headers.push('Passport Issue Date');
      else if (fieldId === 'passport-expiry-date') headers.push('Passport Expiry Date');
    });
  }
  
  // Visa Info
  console.log('Checking visaInfo:', data.selectedCategories.visaInfo);
  if (data.selectedCategories.visaInfo && data.selectedCategories.employmentInfo.length > 0) {
    console.log('Processing visaInfo fields:', data.selectedCategories.visaInfo);
    data.selectedCategories.visaInfo.forEach(fieldId => {
      console.log('Processing visaInfo field:', fieldId);
      if (fieldId === 'visa-no') headers.push('Visa Number');
      else if (fieldId === 'visa-issue-place') headers.push('Visa Issue Place');
      else if (fieldId === 'visa-issue-date') headers.push('Visa Issue Date');
      else if (fieldId === 'visa-expiry-date') headers.push('Visa Expiry Date');
    });
  }
  
  // EID Info
  console.log('Checking eidInfo:', data.selectedCategories.eidInfo);
  if (data.selectedCategories.eidInfo && data.selectedCategories.employmentInfo.length > 0) {
    console.log('Processing eidInfo fields:', data.selectedCategories.eidInfo);
    data.selectedCategories.eidInfo.forEach(fieldId => {
      console.log('Processing eidInfo field:', fieldId);
      if (fieldId === 'emirates-id-no') headers.push('Emirates ID Number');
      else if (fieldId === 'emirates-id-issue-date') headers.push('Emirates ID Issue Date');
      else if (fieldId === 'emirates-id-expiry-date') headers.push('Emirates ID Expiry Date');
    });
  }
  
  // MOL Info
  console.log('Checking molInfo:', data.selectedCategories.molInfo);
  if (data.selectedCategories.molInfo && data.selectedCategories.employmentInfo.length > 0) {
    console.log('Processing molInfo fields:', data.selectedCategories.molInfo);
    data.selectedCategories.molInfo.forEach(fieldId => {
      console.log('Processing molInfo field:', fieldId);
      if (fieldId === 'mol-number') headers.push('MOL Number');
      else if (fieldId === 'mol-issue-date') headers.push('MOL Issue Date');
      else if (fieldId === 'mol-expiry-date') headers.push('MOL Expiry Date');
    });
  }
  
  // Certificate Info
  if (data.selectedCategories.certificateInfo && data.selectedCategories.employmentInfo.length > 0) {
    data.selectedCategories.certificateInfo.forEach(fieldId => {
      if (fieldId === 'training-certificate-no') headers.push('Training Certificate No');
      else if (fieldId === 'training-certificate-name') headers.push('Training Certificate Name');
      else if (fieldId === 'training-certificate-issue-date') headers.push('Training Certificate Issue Date');
      else if (fieldId === 'training-certificate-expiry-date') headers.push('Training Certificate Expiry Date');
      else if (fieldId === 'hsap-license-no') headers.push('HSAP License No');
      else if (fieldId === 'hsap-license-issue-date') headers.push('HSAP License Issue Date');
      else if (fieldId === 'hsap-license-expiry-date') headers.push('HSAP License Expiry Date');
      else if (fieldId === 'competence-certificate-no') headers.push('Competence Certificate No');
      else if (fieldId === 'competence-certificate-issue-date') headers.push('Competence Certificate Issue Date');
      else if (fieldId === 'competence-certificate-expiry-date') headers.push('Competence Certificate Expiry Date');
    });
  }
  
  // Insurance Info
  if (data.selectedCategories.insuranceInfo && data.selectedCategories.employmentInfo.length > 0) {
    data.selectedCategories.insuranceInfo.forEach(fieldId => {
      if (fieldId === 'insurance-type') headers.push('Insurance Type');
      else if (fieldId === 'insurance-issue-date') headers.push('Insurance Issue Date');
      else if (fieldId === 'insurance-expiry-date') headers.push('Insurance Expiry Date');
      // Legacy fields (keeping for compatibility)
      else if (fieldId === 'medical-insurance-card-no') headers.push('Medical Insurance Card No');
      else if (fieldId === 'medical-insurance-name') headers.push('Medical Insurance Name');
      else if (fieldId === 'medical-insurance-issue-date') headers.push('Medical Insurance Issue Date');
      else if (fieldId === 'medical-insurance-expiry-date') headers.push('Medical Insurance Expiry Date');
      else if (fieldId === 'life-insurance-card-no') headers.push('Life Insurance Card No');
      else if (fieldId === 'life-insurance-name') headers.push('Life Insurance Name');
      else if (fieldId === 'life-insurance-issue-date') headers.push('Life Insurance Issue Date');
      else if (fieldId === 'life-insurance-expiry-date') headers.push('Life Insurance Expiry Date');
    });
  }
  
  // Build employee rows
  const employeeRows: any[][] = [];
  
  console.log('Excel Report - Building rows for employees:', data.employees.map(e => e.EmployeeCode));
  console.log('Excel Report - Headers:', headers);
  console.log('Excel Report - Total columns:', headers.length);
  
  data.employees.forEach(employee => {
    const row: any[] = [employee.EmployeeCode, employee.EmployeeName];
    
    // Add Personal Info fields
    if (data.selectedCategories.personalInfo && data.selectedCategories.personalInfo.length > 0) {
      data.selectedCategories.personalInfo.forEach(fieldId => {
        const mapping = personalInfoMapping[fieldId];
        if (mapping) {
          const value = mapping.getValue(employee) || 'N/A';
          row.push(value);
        }
      });
    }
    
    // Add Employment Info fields
    if (data.selectedCategories.employmentInfo && data.selectedCategories.employmentInfo.length > 0) {
      data.selectedCategories.employmentInfo.forEach(fieldId => {
        const mapping = employmentInfoMapping[fieldId];
        if (mapping) {
          const value = mapping.getValue(employee) || 'N/A';
          row.push(value);
        }
      });
    }
    
    // Add Passport Info fields
    if (data.selectedCategories.passportInfo && data.selectedCategories.employmentInfo.length > 0) {
      const passportDocs = data.documents?.passportInfo || [];
      const employeePassports = passportDocs
        .filter((doc: any) => doc.employee_code === employee.EmployeeCode)
        .filter(doc => doc.document_name?.toUpperCase().includes('PASSPORT'))
        .sort((a, b) => {
          // Prioritize documents with actual passport numbers
          const aHasNumber = a.document_number && a.document_number !== 'Pending' && a.document_number !== '';
          const bHasNumber = b.document_number && b.document_number !== 'Pending' && b.document_number !== '';
          if (aHasNumber && !bHasNumber) return -1;
          if (!aHasNumber && bHasNumber) return 1;
          return 0;
        });
      
      const passportDoc = employeePassports[0]; // Use the most complete passport
      
      data.selectedCategories.passportInfo.forEach(fieldId => {
        const mapping = passportInfoMapping[fieldId];
        if (mapping) {
          const value = mapping.getValue(passportDoc || {}, employee) || 'N/A';
          row.push(value);
        }
      });
    }
    
    // Add Visa Info fields
    if (data.selectedCategories.visaInfo && data.selectedCategories.employmentInfo.length > 0) {
      const visaDocs = data.documents?.visaInfo || [];
      const employeeVisas = visaDocs
        .filter((doc: any) => doc.employee_code === employee.EmployeeCode)
        .filter(doc => doc.document_name?.toUpperCase().includes('VISA'))
        .sort((a, b) => {
          // Prioritize documents with actual visa numbers
          const aHasNumber = a.document_number && a.document_number !== 'Pending' && a.document_number !== '';
          const bHasNumber = b.document_number && b.document_number !== 'Pending' && b.document_number !== '';
          if (aHasNumber && !bHasNumber) return -1;
          if (!aHasNumber && bHasNumber) return 1;
          return 0;
        });
      
      const visaDoc = employeeVisas[0]; // Use the most complete visa
      
      data.selectedCategories.visaInfo.forEach(fieldId => {
        const mapping = visaInfoMapping[fieldId];
        if (mapping) {
          const value = mapping.getValue(visaDoc || {}, employee) || 'N/A';
          row.push(value);
        }
      });
    }
    
    // Add EID Info fields
    if (data.selectedCategories.eidInfo && data.selectedCategories.employmentInfo.length > 0) {
      const eidDocs = data.documents?.eidInfo || [];
      const employeeEids = eidDocs
        .filter((doc: any) => doc.employee_code === employee.EmployeeCode)
        .filter(doc => doc.document_name?.toUpperCase().includes('EMIRATES'))
        .sort((a, b) => {
          // Prioritize documents with actual EID numbers
          const aHasNumber = a.document_number && a.document_number !== 'Pending' && a.document_number !== '';
          const bHasNumber = b.document_number && b.document_number !== 'Pending' && b.document_number !== '';
          if (aHasNumber && !bHasNumber) return -1;
          if (!aHasNumber && bHasNumber) return 1;
          return 0;
        });
      
      const eidDoc = employeeEids[0]; // Use the most complete EID
      
      data.selectedCategories.eidInfo.forEach(fieldId => {
        const mapping = eidInfoMapping[fieldId];
        if (mapping) {
          const value = mapping.getValue(eidDoc || {}, employee) || 'N/A';
          row.push(value);
        }
      });
    }
    
    // Add MOL Info fields
    if (data.selectedCategories.molInfo && data.selectedCategories.employmentInfo.length > 0) {
      const molDocs = data.documents?.molInfo || [];
      const employeeMols = molDocs
        .filter((doc: any) => doc.employee_code === employee.EmployeeCode)
        .filter(doc => doc.document_name?.toUpperCase().match(/MOL|LABOR|LABOUR/))
        .sort((a, b) => {
          // Prioritize documents with actual MOL numbers
          const aHasNumber = a.document_number && a.document_number !== 'Pending' && a.document_number !== '';
          const bHasNumber = b.document_number && b.document_number !== 'Pending' && b.document_number !== '';
          if (aHasNumber && !bHasNumber) return -1;
          if (!aHasNumber && bHasNumber) return 1;
          return 0;
        });
      
      const molDoc = employeeMols[0]; // Use the most complete MOL document
      
      data.selectedCategories.molInfo.forEach(fieldId => {
        const mapping = molInfoMapping[fieldId];
        if (mapping) {
          const value = mapping.getValue(molDoc || {}, employee) || 'N/A';
          row.push(value);
        }
      });
    }
    
    // Add Insurance Info fields
    if (data.selectedCategories.insuranceInfo && data.selectedCategories.employmentInfo.length > 0) {
      const insuranceDocs = data.documents?.insuranceInfo || [];
      const employeeInsurances = insuranceDocs
        .filter((doc: any) => doc.employee_code === employee.EmployeeCode)
        .filter(doc => doc.document_name?.toUpperCase().match(/INSURANCE|MEDICAL|HEALTH/))
        .sort((a, b) => {
          // Prioritize documents with valid dates
          const aHasDate = a.due_date && a.due_date !== '';
          const bHasDate = b.due_date && b.due_date !== '';
          if (aHasDate && !bHasDate) return -1;
          if (!aHasDate && bHasDate) return 1;
          return 0;
        });
      
      const insuranceDoc = employeeInsurances[0]; // Use the most complete insurance document
      
      data.selectedCategories.insuranceInfo.forEach(fieldId => {
        const mapping = insuranceInfoMapping[fieldId];
        if (mapping) {
          const value = mapping.getValue(insuranceDoc || {}, employee) || 'N/A';
          row.push(value);
        }
      });
    }
    
    // All categories have been processed
    console.log(`Row for ${employee.EmployeeCode}: ${row.length} columns`);
    employeeRows.push(row);
  });
  
  // Create worksheet
  const employeeSheet = XLSX.utils.aoa_to_sheet([headers, ...employeeRows]);
  XLSX.utils.book_append_sheet(wb, employeeSheet, 'Employee Details');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

// Generate ZIP with multiple formats
export async function generateZIPReport(data: ReportData): Promise<Blob> {
  const zip = new JSZip();
  
  // Add PDF
  const pdfBlob = await generatePDFReport(data);
  zip.file(`${data.customerName}_${data.reportDate}_report.pdf`, pdfBlob);
  
  // Add Excel
  const excelBlob = await generateExcelReport(data);
  zip.file(`${data.customerName}_${data.reportDate}_report.xlsx`, excelBlob);
  
  // Add JSON data
  const jsonData = JSON.stringify(data, null, 2);
  zip.file(`${data.customerName}_${data.reportDate}_data.json`, jsonData);
  
  // Generate ZIP
  return await zip.generateAsync({ type: 'blob' });
}

// Main report generation function
export async function generateReport(
  data: ReportData,
  formats: { pdf?: boolean; xlsx?: boolean; zip?: boolean }
): Promise<void> {
  const fileName = `${data.customerName}_${data.reportDate}`;
  
  if (formats.zip) {
    const zipBlob = await generateZIPReport(data);
    saveAs(zipBlob, `${fileName}.zip`);
  } else {
    if (formats.pdf) {
      const pdfBlob = await generatePDFReport(data);
      saveAs(pdfBlob, `${fileName}.pdf`);
    }
    
    if (formats.xlsx) {
      const excelBlob = await generateExcelReport(data);
      saveAs(excelBlob, `${fileName}.xlsx`);
    }
  }
}
