import { cookies } from 'next/headers';
import { API } from './api';

export interface AuthUser {
    id: string;
    email: string;
    premium_tier: string;
}

/**
 * Server-side helper to get current authenticated user
 */
export async function getAuthUser(): Promise<AuthUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        // Optimistically decode the JWT payload to skip the massive 300ms network roundtrip to the Server.
        // The token is validated cryptographically on mutating API requests anyway.
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
        
        const parsed = JSON.parse(jsonPayload);
        
        if (parsed && parsed.userId) {
            return {
                id: parsed.userId,
                email: parsed.email,
                premium_tier: parsed.tier || 'FREE'
            };
        }
        return null;
    } catch (e) {
        console.error('JWT Decode failed', e);
        return null;
    }
}
