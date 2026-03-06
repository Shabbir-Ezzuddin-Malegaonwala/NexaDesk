export interface ClassifyResponse {
    priority: "low" | "medium" | "high" | "critical";
    category: string;
    confidence: number;
    reasoning: string;
}

export async function classifyTicket(
    title: string,
    description: string
): Promise<ClassifyResponse> {
    const aiServiceUrl = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

    try {
        const response = await fetch(`${aiServiceUrl}/classify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description }),
        });

        if (!response.ok) {
            throw new Error(`AI service error: ${response.status}`);
        }

        const data = await response.json() as ClassifyResponse;
        return data;
    } catch (err: any) {
        throw new Error(`Failed to classify ticket: ${err.message}`);
    }
}

export async function streamSuggestResponse(
    ticketData: object,
    onChunk: (chunk: string) => void
): Promise<void> {
    const aiServiceUrl = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

    try {
        const response = await fetch(`${aiServiceUrl}/suggest-response`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ticketData),
        });

        if (!response.ok) {
            throw new Error(`AI service error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            onChunk(chunk);
        }
    } catch (err: any) {
        throw new Error(`Failed to stream response: ${err.message}`);
    }
}