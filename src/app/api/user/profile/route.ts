import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return user profile data
    return NextResponse.json({
      message: 'Profile retrieved successfully',
      user: {
        id: user.userId,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 