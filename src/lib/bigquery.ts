import { BigQuery } from '@google-cloud/bigquery';
import path from 'path';

// Initialize BigQuery client
let bigqueryClient: BigQuery | null = null;

export function getBigQueryClient(): BigQuery {
  if (!bigqueryClient) {
    // Set up credentials path
    const credentialsPath = path.join(process.cwd(), 'credentials', 'pmo-service-account-key.json');
    
    bigqueryClient = new BigQuery({
      projectId: process.env.NEXT_PUBLIC_GCP_PROJECT_ID || 'pmo-v2',
      keyFilename: credentialsPath,
    });
  }
  
  return bigqueryClient;
}

// Configuration for cross-project access
const DATA_PROJECT_ID = 'al-laith-erp-system';
const DATASET_ID = 'allaith_erp_dbo';

// Query functions for Employee data from parent project
export async function getEmployees(filters?: {
  ids?: string[];
  departments?: string[];
  searchTerm?: string;
}) {
  const bigquery = getBigQueryClient();

  // Get employee list from Employee_Details table
  let query = `
    SELECT DISTINCT
      EmployeeCode as employee_code,
      EmployeeName as employee_name,
      lEmpId as employee_id,
      Department as department,
      Designation as job_title
    FROM \`${DATA_PROJECT_ID}.${DATASET_ID}.Employee_Details\`
    WHERE (LeavingDate IS NULL OR LeavingDate = '')
  `;
  
  const queryParams: any[] = [];
  
  if (filters?.ids && filters.ids.length > 0) {
    query += ' AND EmployeeCode IN UNNEST(@employeeIds)';
    queryParams.push({ name: 'employeeIds', value: filters.ids });
  }
  
  if (filters?.departments && filters.departments.length > 0) {
    query += ' AND Department IN UNNEST(@departments)';
    queryParams.push({ name: 'departments', value: filters.departments });
  }
  
  if (filters?.searchTerm) {
    query += ' AND (LOWER(EmployeeName) LIKE @searchTerm OR EmployeeCode LIKE @searchTerm)';
    queryParams.push({ name: 'searchTerm', value: `%${filters.searchTerm.toLowerCase()}%` });
  }
  
  query += ' ORDER BY EmployeeCode';
  
  try {
    const options = {
      query,
      location: process.env.BIGQUERY_LOCATION || 'US',
      params: queryParams.reduce((acc, param) => ({ ...acc, [param.name]: param.value }), {}),
    };
    
    const [rows] = await bigquery.query(options);
    return rows;
  } catch (error) {
    console.error('Error querying employees:', error);
    throw error;
  }
}

export async function getEmployeeDetails(employeeCodes: string[], selectedFields: string[]) {
  const bigquery = getBigQueryClient();
  
  const results: Record<string, any> = {};
  
  // Get basic employee details
  if (selectedFields.some(field => ['personalInfo', 'employmentInfo'].includes(field))) {
    const query = `
      SELECT 
        EmployeeCode,
        EmployeeName,
        lEmpId,
        Department,
        Designation,
        BranchName,
        Nationality,
        BirthDate,
        Gender,
        MaritalStatus,
        BloodGroup,
        DOJ,
        EmailID,
        MobileNo,
        Address1,
        Address2,
        Address3,
        Address4
      FROM \`${DATA_PROJECT_ID}.${DATASET_ID}.Employee_Details\`
      WHERE EmployeeCode IN UNNEST(@employeeCodes)
    `;
    
    try {
      const options = {
        query,
        location: process.env.BIGQUERY_LOCATION || 'US',
        params: { employeeCodes },
      };
      
      const [rows] = await bigquery.query(options);
      results.employeeDetails = rows;
    } catch (error) {
      console.error('Error querying employee details:', error);
      results.employeeDetails = [];
    }
  }
  
  // Get employee documents (passport, visa, certificates, etc.)
  if (selectedFields.some(field => ['passportInfo', 'visaInfo', 'eidInfo', 'molInfo', 'certificateInfo', 'insuranceInfo'].includes(field))) {
    const query = `
      SELECT 
        EmployeeCode as employee_code,
        DocumentName as document_name,
        DocumentNo as document_number,
        ReferenceNo as reference_number,
        Entrydate as entry_date,
        DueDate as due_date,
        VisaType as visa_type,
        FileName as file_name,
        FileType as file_type
      FROM \`${DATA_PROJECT_ID}.${DATASET_ID}.Employee_Documents\`
      WHERE EmployeeCode IN UNNEST(@employeeCodes)
      ORDER BY EmployeeCode, DocumentName
    `;
    
    try {
      const options = {
        query,
        location: process.env.BIGQUERY_LOCATION || 'US',
        params: { employeeCodes },
      };
      
      const [rows] = await bigquery.query(options);
      
      // Group documents by type
      const groupedDocs: Record<string, any[]> = {};
      rows.forEach((doc: any) => {
        const docType = doc.document_name?.toLowerCase() || '';
        if (docType.includes('passport')) {
          if (!groupedDocs.passportInfo) groupedDocs.passportInfo = [];
          groupedDocs.passportInfo.push(doc);
        } else if (docType.includes('visa')) {
          if (!groupedDocs.visaInfo) groupedDocs.visaInfo = [];
          groupedDocs.visaInfo.push(doc);
        } else if (docType.includes('emirates')) {
          if (!groupedDocs.eidInfo) groupedDocs.eidInfo = [];
          groupedDocs.eidInfo.push(doc);
        } else if (docType.includes('certificate') || docType.includes('license')) {
          if (!groupedDocs.certificateInfo) groupedDocs.certificateInfo = [];
          groupedDocs.certificateInfo.push(doc);
        } else if (docType.includes('insurance')) {
          if (!groupedDocs.insuranceInfo) groupedDocs.insuranceInfo = [];
          groupedDocs.insuranceInfo.push(doc);
        }
      });
      
      console.log('Grouped documents:', {
        passportCount: groupedDocs.passportInfo?.length || 0,
        visaCount: groupedDocs.visaInfo?.length || 0,
        eidCount: groupedDocs.eidInfo?.length || 0,
        certificateCount: groupedDocs.certificateInfo?.length || 0,
        insuranceCount: groupedDocs.insuranceInfo?.length || 0
      });
      
      results.documents = groupedDocs;
    } catch (error) {
      console.error('Error querying employee documents:', error);
      results.documents = {};
    }
  }
  
  return results;
}

// Function to save report generation history
// TODO: Implement when report_history table is created in PMO-V2 project
export async function saveReportHistory(reportData: {
  reportName: string;
  customerName: string;
  generatedBy: string;
  employeeCount: number;
  selectedFields: string[];
  fileType: string;
  fileSize: string;
  cloudStorageUrl?: string;
}) {
  // For now, we'll store this in localStorage or a temporary solution
  // until we have a proper table in the PMO-V2 project
  console.log('Report history would be saved:', reportData);
  
  // TODO: Create a report_history table in pmo-v2 project
  // and implement the actual saving logic
}
