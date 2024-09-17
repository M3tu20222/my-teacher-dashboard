import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

async function parseCSV(content) {
  return parse(content, { columns: true, skip_empty_lines: true });
}

async function stringifyToCSV(data) {
  return stringify(data, { header: true });
}

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const exportCsv = searchParams.get('export') === 'csv';

    if (exportCsv) {
      const students = await Student.find({});
      const csv = await stringifyToCSV(students);
      
      console.log(`Exporting ${students.length} students to CSV`);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=students.csv'
        }
      });
    } else {
      const students = await Student.find({});
      console.log(`Fetched ${students.length} students`);
      return NextResponse.json(students);
    }
  } catch (error) {
    console.error('Error in GET /students:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request' }, { status: 500 });
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
    console.error('Error in POST /students:', error);
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
    const records = await parseCSV(content);

    const createdStudents = await Student.create(records);
    console.log(`Imported ${createdStudents.length} students`);
    return NextResponse.json({ message: `${createdStudents.length} students imported` }, { status: 201 });
  } catch (error) {
    console.error('Error in PUT /students:', error);
    return NextResponse.json({ error: 'An error occurred while importing students' }, { status: 500 });
  }
}