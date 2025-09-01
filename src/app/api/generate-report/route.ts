import { NextRequest, NextResponse } from 'next/server';
import { getEmployeeDetails } from '@/lib/bigquery';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      customerName, 
      reportDate, 
      selectedEmployees, 
      selectedCategories,
      reportFormats 
    } = body;
    
    console.log('Generating report for:', {
      customerName,
      reportDate,
      employeeCount: selectedEmployees.length,
      categories: Object.keys(selectedCategories),
      fullSelectedCategories: selectedCategories
    });
    
    // Extract employee codes
    const employeeCodes = selectedEmployees.map((emp: any) => emp.employee_code);
    
    // Fetch employee details from BigQuery
    const selectedFields = Object.keys(selectedCategories).filter(
      cat => selectedCategories[cat] && selectedCategories[cat].length > 0
    );
    
    const employeeData = await getEmployeeDetails(employeeCodes, selectedFields);
    
    console.log('Employee data received:', {
      employeeCount: employeeData.employeeDetails?.length || 0,
      documentCategories: Object.keys(employeeData.documents || {}),
      documentCounts: Object.entries(employeeData.documents || {}).map(([key, docs]) => ({
        category: key,
        count: (docs as any[]).length
      }))
    });
    
    // Prepare report data
    const reportData = {
      customerName,
      reportDate,
      employees: employeeData.employeeDetails || [],
      selectedCategories,
      documents: employeeData.documents || {},
      formats: reportFormats
    };
    
    return NextResponse.json({
      success: true,
      data: reportData
    });
    
  } catch (error) {
    console.error('Error fetching report data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch report data'
      },
      { status: 500 }
    );
  }
}
