import { NextRequest, NextResponse } from 'next/server';

let tasks: any[] = [];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const task = tasks.find((t) => t.id === resolvedParams.id);

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const index = tasks.findIndex((t) => t.id === resolvedParams.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const updated = {
      ...tasks[index],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    tasks[index] = updated;

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    tasks = tasks.filter((t) => t.id !== resolvedParams.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
