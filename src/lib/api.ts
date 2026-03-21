// Centralized API configuration
// All API calls should use this base URL instead of hardcoding localhost

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

export const API = {
    base: API_BASE_URL,
    players: `${API_BASE_URL}/api/players`,
    dashboard: `${API_BASE_URL}/api/dashboard`,
    notes: `${API_BASE_URL}/api/notes`,
    templates: `${API_BASE_URL}/api/templates`,
    platforms: `${API_BASE_URL}/api/platforms`,
    settings: `${API_BASE_URL}/api/settings`,

    // Dynamic paths
    player: (id: string) => `${API_BASE_URL}/api/players/${id}`,
    note: (id: string) => `${API_BASE_URL}/api/notes/${id}`,
    template: (id: string) => `${API_BASE_URL}/api/templates/${id}`,
    platform: (id: string) => `${API_BASE_URL}/api/platforms/${id}`,
    playerStats: (playerId: string) => `${API_BASE_URL}/api/players/${playerId}/stats`,
    playerProfile: (playerId: string) => `${API_BASE_URL}/api/players/${playerId}/profile`,
    playerExport: `${API_BASE_URL}/api/players/export`,
    playerBulk: `${API_BASE_URL}/api/players/bulk`,
    refreshProfile: `${API_BASE_URL}/api/players/profile/refresh`,

    // Hand Analysis
    hands: `${API_BASE_URL}/api/hands`,
    handAnalyze: `${API_BASE_URL}/api/hands/analyze`,
    handHistory: `${API_BASE_URL}/api/hands/history`,
    hand: (id: string) => `${API_BASE_URL}/api/hands/${id}`,

    // Sessions
    sessions: `${API_BASE_URL}/api/sessions`,
    sessionRegister: `${API_BASE_URL}/api/sessions/register`,
    sessionForceLogout: `${API_BASE_URL}/api/sessions/force-logout`,
    sessionLogoutAll: `${API_BASE_URL}/api/sessions/logout-all`,

    // Payments
    payments: `${API_BASE_URL}/api/payments`,
    paymentCreateInvoice: `${API_BASE_URL}/api/payments/create-invoice`,
} as const;
