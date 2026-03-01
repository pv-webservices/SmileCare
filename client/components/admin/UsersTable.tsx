"use client";

interface UsersTableProps {
    users: any[];
    loading: boolean;
    page: number;
    total: number;
    limit: number;
    onPageChange: (newPage: number) => void;
}

export default function UsersTable({
    users,
    loading,
    page,
    total,
    limit,
    onPageChange
}: UsersTableProps) {
    const totalPages = Math.ceil(total / limit) || 1;

    return (
        <div className="bg-white border border-primary/10 rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-primary/5 text-primary/60 uppercase text-[10px] tracking-widest font-bold sticky top-0 z-10">
                        <tr className="border-b border-primary/10">
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Phone</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-primary/40">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                        Loading users...
                                    </div>
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-primary/40">
                                    No users found.
                                </td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.id} className="hover:bg-primary/[0.02] transition-colors">
                                    <td className="px-6 py-4 font-bold text-primary">
                                        {u.name || "Unknown"}
                                    </td>
                                    <td className="px-6 py-4 text-primary/70">
                                        {u.email || "—"}
                                    </td>
                                    <td className="px-6 py-4 text-primary/70 font-mono text-xs">
                                        {u.phone || "—"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                u.role === 'dentist' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-600'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-primary/70 text-xs">
                                        {new Date(u.createdAt).toLocaleDateString("en-IN", {
                                            year: "numeric", month: "short", day: "numeric"
                                        })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!loading && total > 0 && (
                <div className="p-4 border-t border-primary/10 bg-primary/[0.01] flex items-center justify-between text-sm">
                    <p className="text-primary/60 font-semibold">
                        Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total} users
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => onPageChange(page - 1)}
                            className="px-4 py-2 rounded-lg border border-primary/20 text-primary font-bold hover:bg-primary/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        >
                            ← Prev
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => onPageChange(page + 1)}
                            className="px-4 py-2 rounded-lg border border-primary/20 text-primary font-bold hover:bg-primary/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
