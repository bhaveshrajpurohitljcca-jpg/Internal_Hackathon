import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { registrationService, RegistrationStatus } from "@/services/registration.service";
import type { Registration } from "@/services/registration.service";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { Check, X as XIcon, Eye } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminRegistrationListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);
  const [adminRemarks, setAdminRemarks] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["adminRegistrations", page, debouncedSearch],
    queryFn: () => registrationService.getAll({ page, search: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => registrationService.approve(id),
    onSuccess: () => {
      toast.success("Registration approved");
      queryClient.invalidateQueries({ queryKey: ["adminRegistrations"] });
    },
    onError: () => {
      toast.error("Failed to approve registration");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks: string }) =>
      registrationService.reject(id, remarks),
    onSuccess: () => {
      toast.success("Registration rejected");
      setRejectModalOpen(false);
      setAdminRemarks("");
      setSelectedRegistrationId(null);
      queryClient.invalidateQueries({ queryKey: ["adminRegistrations"] });
    },
    onError: () => {
      toast.error("Failed to reject registration");
    },
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const openRejectModal = (id: string) => {
    setSelectedRegistrationId(id);
    setAdminRemarks("");
    setRejectModalOpen(true);
  };

  const handleReject = () => {
    if (selectedRegistrationId) {
      rejectMutation.mutate({ id: selectedRegistrationId, remarks: adminRemarks });
    }
  };

  const columns: ColumnDef<Registration>[] = [
    {
      header: "Team Name",
      cell: (item) => (
        <div className="font-semibold text-slate-900 dark:text-slate-100">{item.team_name}</div>
      ),
    },
    {
      header: "Hackathon ID",
      cell: (item) => (
        <div className="text-slate-500 font-mono text-xs dark:text-slate-400" title={item.hackathon_id}>
          {item.hackathon_id.slice(0, 8)}...
        </div>
      ),
    },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: "Date",
      cell: (item) => (
        <span className="text-slate-500 dark:text-slate-400">
          {new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} &bull; {new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (item) => (
        <div className="flex justify-end gap-2">
          {item.status !== RegistrationStatus.APPROVED && (
            <button
              onClick={() => handleApprove(item.id)}
              disabled={approveMutation.isPending}
              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
              title="Approve"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          {item.status !== RegistrationStatus.REJECTED && (
            <button
              onClick={() => openRejectModal(item.id)}
              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
              title="Reject"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
          <a
            href={`/admin/registrations/${item.id}`}
            className="p-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors dark:bg-primary-500/10 dark:text-primary-400 dark:hover:bg-primary-500/20"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Registrations</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage team registrations across all hackathons.
          </p>
        </div>
        <div className="w-full sm:w-auto relative">
          <input
            type="text"
            placeholder="Search teams..."
            className="w-full sm:w-64 rounded-xl border border-slate-300 px-4 py-2.5 bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {isFetching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      <DataTable 
        data={data?.items || []} 
        columns={columns} 
        isLoading={isLoading && !data} 
        emptyTitle="No Registrations Found"
        emptyDescription="There are no team registrations matching your criteria."
      />

      {data && data.total_pages > 1 && (
        <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Page {page} of {data.total_pages}</span>
          <button
            onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
            disabled={page === data.total_pages}
            className="px-4 py-2 border rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
          >
            Next
          </button>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setRejectModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden p-6 relative z-10 border border-slate-100 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Reject Registration</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Please provide a reason for rejecting this registration. This will be visible to the student.
            </p>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-colors"
              rows={4}
              placeholder="Admin remarks..."
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!adminRemarks.trim() || rejectMutation.isPending}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
