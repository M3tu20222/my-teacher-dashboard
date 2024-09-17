// app/api/students/export/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';
import { stringify } from 'csv-stringify/sync';

export async function GET() {
  try {
    await dbConnect();
    const students = await Student.find({});
    const csv = stringify(students, { header: true });
    
    console.log(`Exporting ${students.length} students to CSV`);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=students.csv'
      }
    });
  } catch (error) {
    console.error('Error exporting students to CSV:', error);
    return NextResponse.json({ error: 'An error occurred while exporting students to CSV' }, { status: 500 });
  }
}