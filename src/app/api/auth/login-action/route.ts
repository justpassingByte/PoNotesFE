import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API } from '@/lib/api';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        const res = await fetch(`${API.base}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, deviceId: 'web-client' }),
        });

        const json = await res.json();

        if (!json.success) {
            return NextResponse.json({ success: false, error: json.error || 'Login failed' });
        }

        const cookieStore = await cookies();
        const secure = process.env.NEXT_PUBLIC_API_URL?.startsWith('https') || false;
        cookieStore.set('token', json.token, {
            httpOnly: true,
            secure,
            maxAge: 7 * 24 * 60 * 60,
            sameSite: 'lax',
            path: '/',
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ success: false, error: 'Network error during login' });
    }
}
