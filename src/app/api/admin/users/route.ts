import { NextResponse, NextRequest } from 'next/server';
import { User } from '@/lib/db/models';

export async function GET() {
  try {
    const users = await User.findAll();
    // Return users without exposing password hashes
    const sanitizedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt
    }));
    return NextResponse.json({ success: true, users: sanitizedUsers });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve users.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email, role } = body;

    if (!id || !role) {
      return NextResponse.json(
        { error: 'User ID and Role are required.' },
        { status: 400 }
      );
    }

    const updatedUser = await User.update(Number(id), { email, role });
    return NextResponse.json({
      success: true,
      message: 'User role updated successfully.',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required.' },
        { status: 400 }
      );
    }

    await User.delete(Number(id));

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user.' },
      { status: 500 }
    );
  }
}
