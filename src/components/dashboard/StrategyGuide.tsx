import { Target } from "lucide-react";

interface StrategyGuideProps {
    playstyle: string;
}

// Dictionary mapping known styles to exploitative strategy bullet points
const STRATEGIES: Record<string, string[]> = {
    "LAG": [
        "Widen your value 3-betting range preflop to punish their wide opens.",
        "Smooth call with strong draws and monsters on the flop to induce bluffs on later streets.",
        "They will over-barrel; use your strong top-pairs as bluff catchers.",
        "Do not try to bluff this player off top pair."
    ],
    "NIT": [
        "Steal their blinds relentlessly preflop; they fold too often without a premium holding.",
        "If they 3-bet you, fold unless you look down at QQ+ or AKs.",
        "Float the flop and bet the turn if they check to you; they play 'fit-or-fold'.",
        "Never pay off their river raises."
    ],
    "TAG": [
        "Avoid tangling out of position without a solid range advantage.",
        "Attack their c-bets on coordinated boards; they often have air when they check the turn.",
        "Pay attention to sizing tells—they often bet larger with polarized value.",
        "Do not run multi-street elaborate bluffs; TAGs have rigid calling ranges."
    ],
    "MANIAC": [
        "Tighten up preflop and play exclusively for value.",
        "Never slowplay your strong hands preflop.",
        "Let them do the betting for you post-flop.",
        "Prepare for high variance; buy-in full and do not tilt when they hit their 2-outers."
    ],
    "CALLING STATION": [
        "Never bluff under any circumstances. Value bet thinly across all three streets.",
        "Size your value bets larger on wet boards—they don't understand pot odds.",
        "If you miss your draw, give up immediately.",
        "Do not overthink hand reading; they are playing their cards face up."
    ],
    "FISH": [
        "Isolate them preflop to play pots heads-up in position.",
        "Extract maximum value. Size up dramatically when you hit Gin.",
        "Watch for passive limping—punish it with large isolation raises.",
    ],
};

export const StrategyGuide = ({ playstyle }: StrategyGuideProps) => {
    // Normalize to upper case keys
    const normalizedStyle = playstyle ? playstyle.toUpperCase() : "UNKNOWN";
    const guidelines = STRATEGIES[normalizedStyle] || [
        "Not enough intelligence gathered to formulate a specific exploitative strategy.",
        "Play default GTO ranges and observe their VPIP/PFR deviation.",
        "Log more hands specifically regarding their 3-Bet behavior."
    ];

    return (
        <div className="bg-card/40 backdrop-blur-xl border border-gold/20 rounded-2xl p-6 shadow-[0_8px_30px_rgba(255,196,0,0.1)] relative overflow-hidden">
            <div className="flex items-center mb-6">
                <Target className="w-5 h-5 text-gold mr-3" />
                <h2 className="text-lg font-bold text-white tracking-wide uppercase">
                    Exploit Strategy: <span className="text-felt-light">{normalizedStyle}</span>
                </h2>
            </div>
            <ul className="space-y-4 text-sm text-gray-300">
                {guidelines.map((heuristic, index) => (
                    <li key={index} className="flex items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 mr-3 shrink-0 box-shadow-glow"></span>
                        <p className="leading-relaxed">{heuristic}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};
