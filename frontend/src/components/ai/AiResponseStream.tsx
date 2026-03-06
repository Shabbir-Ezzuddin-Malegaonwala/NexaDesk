"use client";

import { useSSEStream } from "@/hooks/useSSEStream";

interface AiResponseStreamProps {
    ticketId: string;
}

export default function AiResponseStream({ ticketId }: AiResponseStreamProps) {
    const { data, isStreaming, error, startStream, stopStream } = useSSEStream();
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

    const handleSuggest = () => {
        startStream(`${API_URL}/tickets/${ticketId}/suggest-response`);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                        </svg>
                    </span>
                    AI Response Suggestion
                </h3>
                <div className="flex gap-2">
                    {isStreaming ? (
                        <button
                            onClick={stopStream}
                            className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20"
                        >
                            Stop
                        </button>
                    ) : (
                        <button
                            onClick={handleSuggest}
                            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 transition-all"
                        >
                            ✨ Suggest Response
                        </button>
                    )}
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="glass rounded-xl p-4 border border-red-500/20">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Streaming or result */}
            {(data || isStreaming) && !error && (
                <div className="glass rounded-xl p-5">
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {data}
                        {isStreaming && (
                            <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse rounded-sm" />
                        )}
                    </p>
                </div>
            )}

            {/* Empty state */}
            {!data && !isStreaming && !error && (
                <div className="glass rounded-xl p-6 text-center border border-dashed border-white/10">
                    <p className="text-slate-500 text-sm">
                        Click &quot;Suggest Response&quot; to get an AI-generated response for this ticket
                    </p>
                </div>
            )}
        </div>
    );
}