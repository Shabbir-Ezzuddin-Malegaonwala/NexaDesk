import { create } from "zustand";
import { api } from "@/lib/api";
import type { Ticket, Comment, PaginationInfo } from "@/types";

interface Filters {
    status: string | null;
    priority: string | null;
    search: string;
}

interface TicketStore {
    // State
    tickets: Ticket[];
    selectedTicket: Ticket | null;
    comments: Comment[];
    isLoading: boolean;
    error: string | null;
    filters: Filters;
    pagination: PaginationInfo;

    // Actions
    fetchTickets: () => Promise<void>;
    fetchTicketById: (id: string) => Promise<void>;
    createTicket: (data: Partial<Ticket>) => Promise<Ticket | null>;
    updateTicket: (id: string, data: Partial<Ticket>) => Promise<void>;
    deleteTicket: (id: string) => Promise<void>;
    updateStatus: (id: string, status: Ticket["status"]) => Promise<void>;
    setFilters: (filters: Partial<Filters>) => void;
    setPage: (page: number) => void;
    clearError: () => void;
}

export const useTicketStore = create<TicketStore>((set, get) => ({
    // Initial state
    tickets: [],
    selectedTicket: null,
    comments: [],
    isLoading: false,
    error: null,
    filters: {
        status: null,
        priority: null,
        search: "",
    },
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    },

    // Fetch all tickets
    fetchTickets: async () => {
        set({ isLoading: true, error: null });
        try {
            const { filters, pagination } = get();
            const params = new URLSearchParams();
            if (filters.status) params.append("status", filters.status);
            if (filters.priority) params.append("priority", filters.priority);
            if (filters.search) params.append("search", filters.search);
            params.append("page", pagination.page.toString());
            params.append("limit", pagination.limit.toString());

            const res = await api.get<{
                success: boolean;
                data: Ticket[];
                pagination: PaginationInfo;
            }>(`/tickets?${params.toString()}`);

            set({
                tickets: res.data,
                pagination: res.pagination ?? get().pagination,
                isLoading: false,
            });
        } catch (err: any) {
            set({ error: err.message ?? "Failed to fetch tickets", isLoading: false });
        }
    },

    // Fetch single ticket with comments
    fetchTicketById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const [ticketRes, commentsRes] = await Promise.all([
                api.get<{ success: boolean; data: Ticket }>(`/tickets/${id}`),
                api.get<{ success: boolean; data: Comment[] }>(`/tickets/${id}/comments`),
            ]);
            set({
                selectedTicket: ticketRes.data,
                comments: commentsRes.data,
                isLoading: false,
            });
        } catch (err: any) {
            set({ error: err.message ?? "Failed to fetch ticket", isLoading: false });
        }
    },

    // Create ticket
    createTicket: async (data: Partial<Ticket>) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post<{ success: boolean; data: Ticket }>("/tickets", data);
            set((state) => ({
                tickets: [res.data, ...state.tickets],
                isLoading: false,
            }));
            return res.data;
        } catch (err: any) {
            set({ error: err.message ?? "Failed to create ticket", isLoading: false });
            return null;
        }
    },

    // Update ticket
    updateTicket: async (id: string, data: Partial<Ticket>) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.put<{ success: boolean; data: Ticket }>(`/tickets/${id}`, data);
            set((state) => ({
                tickets: state.tickets.map((t) => (t.id === id ? res.data : t)),
                selectedTicket: res.data,
                isLoading: false,
            }));
        } catch (err: any) {
            set({ error: err.message ?? "Failed to update ticket", isLoading: false });
        }
    },

    // Delete ticket
    deleteTicket: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/tickets/${id}`);
            set((state) => ({
                tickets: state.tickets.filter((t) => t.id !== id),
                isLoading: false,
            }));
        } catch (err: any) {
            set({ error: err.message ?? "Failed to delete ticket", isLoading: false });
        }
    },

    // Update status
    updateStatus: async (id: string, status: Ticket["status"]) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.patch<{ success: boolean; data: Ticket }>(
                `/tickets/${id}/status`,
                { status }
            );
            set((state) => ({
                tickets: state.tickets.map((t) => (t.id === id ? res.data : t)),
                selectedTicket: res.data,
                isLoading: false,
            }));
        } catch (err: any) {
            set({ error: err.message ?? "Failed to update status", isLoading: false });
        }
    },

    // Set filters and re-fetch
    setFilters: (filters: Partial<Filters>) => {
        set((state) => ({
            filters: { ...state.filters, ...filters },
            pagination: { ...state.pagination, page: 1 },
        }));
        get().fetchTickets();
    },

    // Set page and re-fetch
    setPage: (page: number) => {
        set((state) => ({
            pagination: { ...state.pagination, page },
        }));
        get().fetchTickets();
    },

    // Clear error
    clearError: () => set({ error: null }),
}));