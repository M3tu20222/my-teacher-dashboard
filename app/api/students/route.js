import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

export async function GET(request) {
  try {
    await dbConnect();
    const students = await Student.find({});
    console.log(`Fetched ${students.length} students`);
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'An error occurred while fetching students' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const student = await Student.create(data);
    console.log('Created new student:', student);
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'An error occurred while creating the student' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const formData = await request.formData();
    const file = formData.get('file');
  
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const content = await file.text();
    const records = parse(content, { columns: true, skip_empty_lines: true });

    const createdStudents = await Student.create(records);
    console.log(`Imported ${createdStudents.length} students`);
    return NextResponse.json({ message: `${createdStudents.length} students imported` }, { status: 201 });
  } catch (error) {
    console.error('Error importing students:', error);
    return NextResponse.json({ error: 'An error occurred while importing students' }, { status: 500 });
  }
}

export async function OPTIONS() {
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