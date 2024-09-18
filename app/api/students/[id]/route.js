import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Student from '@/models/Student';

async function handleRequest(request, params, method) {
  await dbConnect();

  try {
    switch (method) {
      case 'GET':
        const student = await Student.findById(params.id);
        if (!student) return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 });
        return NextResponse.json(student);

      case 'PATCH':
      case 'PUT':
        const data = await request.json();
        const updatedStudent = await Student.findByIdAndUpdate(params.id, data, { new: true, runValidators: true });
        if (!updatedStudent) return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 });
        return NextResponse.json(updatedStudent);

      case 'DELETE':
        const deletedStudent = await Student.findByIdAndDelete(params.id);
        if (!deletedStudent) return NextResponse.json({ error: 'Öğrenci bulunamadı' }, { status: 404 });
        return NextResponse.json({ message: 'Öğrenci başarıyla silindi' });

      default:
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  return handleRequest(request, params, 'GET');
}

export async function PATCH(request, { params }) {
  return handleRequest(request, params, 'PATCH');
}

export async function PUT(request, { params }) {
  return handleRequest(request, params, 'PUT');
}

export async function DELETE(request, { params }) {
  return handleRequest(request, params, 'DELETE');
}