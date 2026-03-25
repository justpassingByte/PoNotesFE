import React from 'react';

// Keyword Highlighting Helper
export function HighlightKeywords({ text }: { text: string }) {
    if (!text) return null;
    
    const keywords: Record<string, string> = {
        fold: 'text-blue-400 font-bold',
        bet: 'text-red-400 font-bold',
        raise: 'text-red-500 font-black',
        '3-bet': 'text-red-500 font-black',
        '3bet': 'text-red-500 font-black',
        '4-bet': 'text-red-600 font-black',
        '4bet': 'text-red-600 font-black',
        '5-bet': 'text-red-600 font-black',
        shove: 'text-red-600 font-black underline',
        'all-in': 'text-red-600 font-black underline',
        call: 'text-emerald-400 font-bold',
        check: 'text-gray-400 font-bold',
        exploit: 'text-amber-400 font-black uppercase tracking-tighter',
        punish: 'text-amber-400 font-black uppercase tracking-tighter',
        leak: 'text-rose-400 font-black uppercase tracking-tighter',
        isolate: 'text-amber-500 font-black bg-amber-500/10 px-1 rounded',
        'value bet': 'text-emerald-400 font-black',
        monster: 'text-emerald-500 font-black',
        bluff: 'text-rose-500 font-black',
        bluffs: 'text-rose-500 font-black',
        bluffing: 'text-rose-500 font-black',
        'c-bet': 'text-red-400 font-bold',
        'cbet': 'text-red-400 font-bold',
        overbet: 'text-red-600 font-black uppercase',
        barrels: 'text-rose-400 font-bold',
        barrel: 'text-rose-400 font-bold',
        called: 'text-emerald-400 font-bold',
        calling: 'text-emerald-400 font-bold',
        'check-raise': 'text-rose-500 font-black underline',
    };

    // Case-insensitive regex for all keywords
    const regex = new RegExp(`(\\b(?:${Object.keys(keywords).join('|')})\\b)`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) => {
                const lowerPart = part.toLowerCase();
                if (keywords[lowerPart]) {
                    return <span key={i} className={keywords[lowerPart]}>{part}</span>;
                }
                return part;
            })}
        </>
    );
}
