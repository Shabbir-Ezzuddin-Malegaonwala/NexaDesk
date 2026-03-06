import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
}

interface PriorityBadgeProps {
    priority: string | null;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const styles: Record<string, string> = {
        open: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        in_progress: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
        resolved: "bg-green-500/20 text-green-400 border border-green-500/30",
        closed: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
    };

    const labels: Record<string, string> = {
        open: "Open",
        in_progress: "In Progress",
        resolved: "Resolved",
        closed: "Closed",
    };

    return (
        <span className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium",
            styles[status] ?? "bg-slate-500/20 text-slate-400"
        )}>
            {labels[status] ?? status}
        </span>
    );
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
    if (!priority) return null;

    const styles: Record<string, string> = {
        low: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
        medium: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        high: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
        critical: "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse",
    };

    return (
        <span className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium",
            styles[priority] ?? "bg-slate-500/20 text-slate-400"
        )}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </span>
    );
}