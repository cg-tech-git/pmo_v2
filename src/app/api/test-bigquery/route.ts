import { NextResponse } from 'next/server';
import { getBigQueryClient } from '@/lib/bigquery';

export async function GET() {
  try {
    const bigquery = getBigQueryClient();
    
    // Test 1: Check if we can list datasets in pmo-v2 project
    let datasetsInPMO = [];
    try {
      const [datasets] = await bigquery.getDatasets();
      datasetsInPMO = datasets.map(ds => ds.id);
    } catch (error) {
      console.error('Error listing datasets in PMO project:', error);
    }
    
    // Test 2: Check if we can access the parent project
    let canAccessParentProject = false;
    let parentProjectError = null;
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM \`al-laith-erp-system.allaith_erp_dbo.Employee_Details\`
        LIMIT 1
      `;
      const [rows] = await bigquery.query({
        query,
        location: 'US'
      });
      canAccessParentProject = true;
    } catch (error: any) {
      parentProjectError = error.message;
    }
    
    // Test 3: Get sample employee data
    let sampleEmployees = [];
    let employeeQueryError = null;
    try {
      const query = `
        SELECT 
          EmployeeCode,
          EmployeeName,
          Department
        FROM \`al-laith-erp-system.allaith_erp_dbo.Employee_Details\`
        LIMIT 5
      `;
      const [rows] = await bigquery.query({
        query,
        location: 'US'
      });
      sampleEmployees = rows;
    } catch (error: any) {
      employeeQueryError = error.message;
    }
    
    // Test 4: Get sample document data
    let sampleDocuments = [];
    let documentQueryError = null;
    try {
      const query = `
        SELECT 
          EmployeeCode,
          DocumentName,
          DocumentNo
        FROM \`al-laith-erp-system.allaith_erp_dbo.Employee_Documents\`
        WHERE DocumentName IN ('PASSPORT', 'VISA', 'EMIRATES')
        LIMIT 5
      `;
      const [rows] = await bigquery.query({
        query,
        location: 'US'
      });
      sampleDocuments = rows;
    } catch (error: any) {
      documentQueryError = error.message;
    }
    
    return NextResponse.json({
      status: 'BigQuery connectivity test',
      environment: process.env.NODE_ENV,
      projectId: process.env.NEXT_PUBLIC_GCP_PROJECT_ID || 'pmo-v2',
      tests: {
        datasetsInPMO,
        canAccessParentProject,
        parentProjectError,
        sampleEmployees,
        employeeQueryError,
        sampleDocuments,
        documentQueryError
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to test BigQuery connectivity',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

