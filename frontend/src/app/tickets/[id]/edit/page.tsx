"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useTicketStore } from "@/store/ticketStore";
import TicketForm from "@/components/tickets/TicketForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";

export default function EditTicketPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const { selectedTicket, isLoading, fetchTicketById } = useTicketStore();

    useEffect(() => {
        if (!isPending && !session) router.push("/login");
    }, [session, isPending]);

    useEffect(() => {
        if (session) fetchTicketById(id);
    }, [session, id]);

    if (isPending || !session) return null;

    return (
        <div className="p-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6 animate-fadeIn">
                    <Link href={`/tickets/${id}`}>
                        <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Back to Ticket
                        </button>
                    </Link>
                </div>
                <div className="mb-8 animate-fadeIn">
                    <h1 className="text-2xl font-bold text-white mb-1">Edit Ticket</h1>
                    <p className="text-slate-400 text-sm">Update the ticket details below</p>
                </div>
                <div className="glass rounded-2xl p-8 animate-fadeIn">
                    {isLoading ? <LoadingSpinner /> : selectedTicket ? (
                        <TicketForm ticket={selectedTicket} isEditing={true} />
                    ) : (
                        <p className="text-slate-400 text-center">Ticket not found</p>
                    )}
                </div>
            </div>
        </div>
    );
}