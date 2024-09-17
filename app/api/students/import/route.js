// app/api/students/import/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';
import { parse } from 'csv-parse/sync';

export async function POST(request) {
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