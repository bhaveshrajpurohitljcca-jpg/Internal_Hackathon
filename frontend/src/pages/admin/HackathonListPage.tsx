import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { hackathonService } from "@/services/hackathon.service";
import type { Hackathon } from "@/services/hackathon.service";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";

export const HackathonListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["adminHackathons", page],
    queryFn: () => hackathonService.getAll({ page, page_size: 10 }),
  });

  const deleteMutation = useMutation({
    mutationFn: hackathonService.delete,
    onSuccess: () => {
      toast.success("Hackathon deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminHackathons"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to delete hackathon");
    },
    onSettled: () => {
      setDeleteModalOpen(false);
      setSelectedHackathon(null);
    }
  });

  const handleDeleteClick = (hackathon: Hackathon) => {
    setSelectedHackathon(hackathon);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedHackathon) {
      deleteMutation.mutate(selectedHackathon.id);
    }
  };

  const columns: ColumnDef<Hackathon>[] = [
    {
      header: "Title",
      cell: (item) => (
        <div className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</div>
      ),
    },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: "Registration Start",
      cell: (item) => (
        <span className="text-slate-500 dark:text-slate-400">
          {new Date(item.registration_start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} &bull; {new Date(item.registration_start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      header: "Deadline",
      cell: (item) => (
        <span className="text-slate-500 dark:text-slate-400">
          {new Date(item.submission_deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} &bull; {new Date(item.submission_deadline).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (item) => (
        <div className="flex space-x-3">
          <Link
            to={`/admin/hackathons/${item.slug}/edit`}
            className="text-primary-600 hover:text-primary-700 font-semibold text-sm dark:text-primary-400 dark:hover:text-primary-300"
          >
            Edit
          </Link>
          <button
            onClick={() => handleDeleteClick(item)}
            className="text-red-600 hover:text-red-700 font-semibold text-sm dark:text-red-400 dark:hover:text-red-300"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hackathons</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Manage your institution's hackathons</p>
        </div>
        <Link
          to="/admin/hackathons/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 hover:-translate-y-0.5 transition-all duration-200"
        >
          Create Hackathon
        </Link>
      </div>

      <DataTable 
        data={data?.items || []} 
        columns={columns} 
        isLoading={isLoading} 
        emptyTitle="No Hackathons Found"
        emptyDescription="Get started by creating your first hackathon!"
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

      {deleteModalOpen && selectedHackathon && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setDeleteModalOpen(false)}>
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-100 dark:border-slate-700">
              <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-500/10 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-semibold text-slate-900 dark:text-white" id="modal-title">
                      Delete Hackathon
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-slate-300">{selectedHackathon.title}</span>? All of its data will be permanently removed. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2.5 bg-red-600 text-base font-semibold text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2.5 bg-white dark:bg-slate-700 text-base font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonListPage;
