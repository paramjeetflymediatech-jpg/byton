import { NextResponse, NextRequest } from 'next/server';
import { User } from '@/lib/db/models';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Supabase users table (defaults to role 'USER')
    const newUser = await User.create({
      email,
      passwordHash: hashedPassword,
      role: 'USER'
    });

    return NextResponse.json({
      success: true,
      message: 'Account registered successfully.',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during registration.' },
      { status: 500 }
    );
  }
}
