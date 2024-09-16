import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';

export async function GET() {
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