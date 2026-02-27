// Centralized API configuration
// All API calls should use this base URL instead of hardcoding localhost

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API = {
    base: API_BASE_URL,
    players: `${API_BASE_URL}/api/players`,
    notes: `${API_BASE_URL}/api/notes`,
    templates: `${API_BASE_URL}/api/templates`,
    platforms: `${API_BASE_URL}/api/platforms`,

    // Dynamic paths
    player: (id: string) => `${API_BASE_URL}/api/players/${id}`,
    note: (id: string) => `${API_BASE_URL}/api/notes/${id}`,
    template: (id: string) => `${API_BASE_URL}/api/templates/${id}`,
    playerExport: `${API_BASE_URL}/api/players/export`,
    playerBulk: `${API_BASE_URL}/api/players/bulk`,
} as const;
