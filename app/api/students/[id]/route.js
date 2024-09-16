import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';

export async function GET(request, { params }) {
  await dbConnect();
  const student = await Student.findById(params.id);
  if (!student) return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 });
  return NextResponse.json(student);
}

export async function PATCH(request, { params }) {
  await dbConnect();
  const data = await request.json();
  const student = await Student.findByIdAndUpdate(params.id, data, { new: true });
  if (!student) return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 });
  return NextResponse.json(student);
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const student = await Student.findByIdAndDelete(params.id);
  if (!student) return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 });
  return NextResponse.json({ message: 'Öğrenci başarıyla silindi' });
}