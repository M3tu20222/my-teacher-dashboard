import Class from '@/models/class'
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Class from '@/models/Class';

export async function GET() {
  try {
    await dbConnect();
    const classes = await Class.find({});
    return NextResponse.json(classes);
  } catch (error) {
    console.error('Sınıflar getirilirken hata oluştu:', error);
    return NextResponse.json({ error: 'Sunucu Hatası' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Sınıf adı gereklidir' }, { status: 400 });
    }

    const newClass = new Class({ name });
    await newClass.save();

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Sınıf eklenirken hata oluştu:', error);
    return NextResponse.json({ error: 'Sunucu Hatası' }, { status: 500 });
  }
}