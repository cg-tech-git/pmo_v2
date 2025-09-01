import { NextRequest, NextResponse } from 'next/server';
import { getEmployees } from '@/lib/bigquery';

export async function GET(request: NextRequest) {
  console.log('Employee API called');
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchTerm = searchParams.get('search');
    const department = searchParams.get('department');
    
    console.log('Search params:', { searchTerm, department });
    
    const filters: any = {};
    
    if (searchTerm) {
      filters.searchTerm = searchTerm;
    }
    
    if (department) {
      filters.departments = [department];
    }
    
    console.log('Calling getEmployees with filters:', filters);
    const employees = await getEmployees(filters);
    console.log('Employees found:', employees.length);
    
    return NextResponse.json({
      success: true,
      data: employees,
      count: employees.length
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    console.error('Error details:', error instanceof Error ? error.stack : 'Unknown error');
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch employees',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
