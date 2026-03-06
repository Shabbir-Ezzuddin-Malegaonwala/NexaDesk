import { useState, useRef, useCallback } from "react";

interface SSEStreamResult {
    data: string;
    isStreaming: boolean;
    error: string | null;
    startStream: (url: string) => void;
    stopStream: () => void;
}

export function useSSEStream(): SSEStreamResult {
    const [data, setData] = useState<string>("");
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const stopStream = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsStreaming(false);
    }, []);

    const startStream = useCallback((url: string) => {
        // Reset state
        setData("");
        setError(null);
        setIsStreaming(true);

        // Create abort controller for cleanup
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const fetchStream = async () => {
            try {
                const response = await fetch(url, {
                    credentials: "include",
                    signal: abortController.signal,
                });

                if (!response.ok) {
                    throw new Error(`Stream request failed: ${response.status}`);
                }

                const reader = response.body?.getReader();
                if (!reader) throw new Error("No response body");

                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            try {
                                const jsonStr = line.slice(6);
                                const parsed = JSON.parse(jsonStr);

                                if (parsed.error) {
                                    setError(parsed.error);
                                    setIsStreaming(false);
                                    return;
                                }

                                if (parsed.content) {
                                    setData((prev) => prev + parsed.content);
                                }

                                if (parsed.done) {
                                    setIsStreaming(false);
                                    return;
                                }
                            } catch {
                                // skip malformed chunks
                            }
                        }
                    }
                }

                setIsStreaming(false);
            } catch (err: any) {
                if (err.name === "AbortError") return;
                setError(err.message ?? "Stream connection failed");
                setIsStreaming(false);
            }
        };

        fetchStream();

        // Cleanup on unmount
        return () => {
            abortController.abort();
        };
    }, []);

    return { data, isStreaming, error, startStream, stopStream };
}