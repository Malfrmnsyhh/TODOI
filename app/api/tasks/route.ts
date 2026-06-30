import { NextRequest, NextResponse } from 'next/server';

// Temporary in-memory storage (nanti bisa diganti dengan Supabase/Database)
let tasks: any[] = [];

export async function GET() {
  try {
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newTask = {
      id: Date.now().toString(),
      ...body,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.push(newTask);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 400 }
    );
  }
}
