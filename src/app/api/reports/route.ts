import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getBigQueryClient } from '@/lib/bigquery';
import { v4 as uuidv4 } from 'uuid';

// Get all reports
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bigquery = getBigQueryClient();
    
    const query = `
      SELECT 
        id,
        report_name,
        file_type,
        file_size,
        created_at,
        created_by_email,
        created_by_name,
        customer_name,
        report_date,
        employee_count,
        generation_params,
        cloud_storage_url
      FROM \`pmo-v2.pmo_data.report_history\`
      ORDER BY created_at DESC
      LIMIT 1000
    `;
    
    const [rows] = await bigquery.query({
      query,
      location: 'US',
    });
    
    // Transform the data to match frontend format
    const reports = rows.map((row: any) => ({
      id: row.id,
      name: row.report_name,
      fileType: row.file_type,
      size: row.file_size || '0 MB',
      uploadedAt: new Date(row.created_at.value).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      updatedAt: new Date(row.created_at.value).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      uploadedBy: row.created_by_email,
      generationParams: row.generation_params ? JSON.parse(row.generation_params) : null,
    }));
    
    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// Save a new report
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      console.error('POST /api/reports - Unauthorized: No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('POST /api/reports - Request body:', JSON.stringify(body, null, 2));
    
    const {
      reportName,
      fileType,
      fileSize,
      customerName,
      reportDate,
      employeeCount,
      generationParams,
    } = body;

    const bigquery = getBigQueryClient();
    const datasetId = 'pmo_data';
    const tableId = 'report_history';
    
    const row = {
      id: uuidv4(),
      report_name: reportName,
      file_type: fileType,
      file_size: fileSize,
      created_at: bigquery.timestamp(new Date()),
      created_by_email: session.user?.email || 'unknown',
      created_by_name: session.user?.name || 'Unknown User',
      customer_name: customerName,
      report_date: reportDate,
      employee_count: employeeCount,
      generation_params: JSON.stringify(generationParams),
      cloud_storage_url: null, // To be implemented when we add cloud storage
    };
    
    console.log('POST /api/reports - Row to insert:', JSON.stringify(row, null, 2));
    
    await bigquery
      .dataset(datasetId)
      .table(tableId)
      .insert([row]);
    
    console.log('POST /api/reports - Successfully saved report:', row.id);
    
    return NextResponse.json({ 
      success: true, 
      data: { id: row.id } 
    });
  } catch (error: any) {
    console.error('POST /api/reports - Error saving report:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      errors: error.errors || undefined,
      response: error.response || undefined,
    });
    
    // Log specific BigQuery errors if available
    if (error.errors && Array.isArray(error.errors)) {
      error.errors.forEach((err: any, index: number) => {
        console.error(`BigQuery Error ${index + 1}:`, JSON.stringify(err, null, 2));
      });
    }
    
    // Also log the insertErrors from response
    if (error.response?.insertErrors) {
      console.error('BigQuery Insert Errors:', JSON.stringify(error.response.insertErrors, null, 2));
    }
    
    return NextResponse.json(
      { error: 'Failed to save report: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// Delete a report
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');
    
    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    const bigquery = getBigQueryClient();
    
    const query = `
      DELETE FROM \`pmo-v2.pmo_data.report_history\`
      WHERE id = @reportId
    `;
    
    await bigquery.query({
      query,
      location: 'US',
      params: { reportId },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}
