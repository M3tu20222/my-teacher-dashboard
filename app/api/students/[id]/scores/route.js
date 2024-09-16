import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';

export async function GET(request, { params }) {
  await dbConnect();
  const student = await Student.findById(params.id);
  if (!student) return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 });
  return NextResponse.json(student.scores);
}

export async function POST(request, { params }) {
  await dbConnect();
  const { value, date } = await request.json();
  const student = await Student.findById(params.id);
  if (!student) return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 });
  
  student.scores.push({ value, date });
  await student.save();
  
  return NextResponse.json(student.scores, { status: 201 });
}