import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

export async function GET(request) {
  await dbConnect();
  const students = await Student.find({});
  return NextResponse.json(students);
}

export async function POST(request) {
  await dbConnect();
  const data = await request.json();
  const student = await Student.create(data);
  return NextResponse.json(student, { status: 201 });
}

export async function PUT(request) {
  await dbConnect();
  const formData = await request.formData();
  const file = formData.get('file');
  
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const content = await file.text();
  const records = parse(content, { columns: true, skip_empty_lines: true });

  const createdStudents = await Student.create(records);
  return NextResponse.json({ message: `${createdStudents.length} students imported` }, { status: 201 });
}

export async function OPTIONS() {
  await dbConnect();
  const students = await Student.find({});
  const csv = stringify(students, { header: true });
  
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=students.csv'
    }
  });
}