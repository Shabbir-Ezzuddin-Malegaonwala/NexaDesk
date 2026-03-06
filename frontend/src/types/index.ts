export interface Ticket {
    id: string;
    title: string;
    description: string;
    status: "open" | "in_progress" | "resolved" | "closed";
    priority: "low" | "medium" | "high" | "critical" | null;
    category: string | null;
    reporterName: string;
    reporterEmail: string;
    reporterId: string | null;
    assigneeId: string | null;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    id: string;
    ticketId: string;
    content: string;
    authorId: string;
    isAiGenerated: boolean;
    organizationId: string;
    createdAt: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    image?: string | null;
}

export interface Organization {
    id: string;
    name: string;
    slug: string | null;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    pagination?: PaginationInfo;
    message?: string;
}