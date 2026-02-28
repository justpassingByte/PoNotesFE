export function PlayerListSkeleton() {
    return (
        <div className="animate-pulse">
            {/* Metrics skeleton */}
            <div className="mb-10 p-6 bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl">
                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-16 bg-white/10 rounded" />
                        <div className="h-3 w-20 bg-white/5 rounded" />
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-16 bg-white/10 rounded" />
                        <div className="h-3 w-12 bg-white/5 rounded" />
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="flex flex-col gap-2">
                        <div className="h-3 w-32 bg-white/5 rounded" />
                        <div className="flex gap-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-6 w-16 bg-white/5 rounded-full" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar skeleton */}
            <div className="bg-card/40 border border-white/5 rounded-t-2xl p-5 mt-8">
                <div className="flex justify-between items-center">
                    <div className="h-6 w-48 bg-white/10 rounded" />
                    <div className="flex gap-4">
                        <div className="h-8 w-64 bg-white/5 rounded-full" />
                        <div className="h-8 w-24 bg-white/5 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Grid skeleton */}
            <div className="bg-gradient-to-b from-card/20 to-transparent border-x border-b border-white/5 rounded-b-2xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-card/40 border border-white/5 rounded-2xl p-6 h-48">
                            <div className="flex justify-between mb-4">
                                <div>
                                    <div className="h-5 w-28 bg-white/10 rounded mb-2" />
                                    <div className="h-3 w-16 bg-white/5 rounded" />
                                </div>
                                <div className="h-6 w-12 bg-white/10 rounded" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div>
                                    <div className="h-3 w-16 bg-white/5 rounded mb-2" />
                                    <div className="h-6 w-12 bg-white/10 rounded" />
                                </div>
                                <div>
                                    <div className="h-3 w-16 bg-white/5 rounded mb-2" />
                                    <div className="h-6 w-12 bg-white/10 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
