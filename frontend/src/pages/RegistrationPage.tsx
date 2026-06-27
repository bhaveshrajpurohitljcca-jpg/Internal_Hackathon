import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { registrationService } from "@/services/registration.service";
import PageLoader from "@/components/ui/PageLoader";
import EmptyState from "@/components/ui/EmptyState";
import { ClipboardList, Plus } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import RegistrationModal from "@/components/RegistrationModal";
import { DataTable } from "@/components/ui/DataTable";
import type { ColumnDef } from "@/components/ui/DataTable";
import type { Registration } from "@/services/registration.service";

export default function RegistrationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: registrationsData, isLoading } = useQuery({
    queryKey: ["myRegistrations"],
    queryFn: () => registrationService.getMyRegistrations(),
  });

  if (isLoading) return <PageLoader />;

  const registrations = registrationsData?.items || [];

  const columns: ColumnDef<Registration>[] = [
    {
      header: "Team Name",
      cell: (item) => (
        <div className="font-semibold text-slate-900 dark:text-slate-100">{item.team_name}</div>
      ),
    },
    {
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: "Date",
      cell: (item) => (
        <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">
          {new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} &bull; {new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      header: "Remarks",
      cell: (item) => (
        <div className="text-slate-500 dark:text-slate-400 text-sm max-w-[200px] truncate" title={item.admin_remarks || ""}>
          {item.admin_remarks || "-"}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Registrations</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            View your hackathon registrations and team details.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 hover:-translate-y-0.5 transition-all duration-200 shadow-primary-500/25 shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Register for Hackathon
        </button>
      </div>

      {registrations.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-12 w-12" />}
          title="No registrations yet"
          description="You haven't registered for any hackathons. Click the button above to get started!"
        />
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
          <DataTable data={registrations} columns={columns} />
        </div>
      )}

      <RegistrationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
