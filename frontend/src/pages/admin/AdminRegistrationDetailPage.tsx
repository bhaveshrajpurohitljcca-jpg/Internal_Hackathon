import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { registrationService, RegistrationStatus } from "@/services/registration.service";
import PageLoader from "@/components/ui/PageLoader";
import StatusBadge from "@/components/ui/StatusBadge";
import { ArrowLeft, User, Calendar, MessageSquare, ClipboardList, Clock } from "lucide-react";

export default function AdminRegistrationDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: registration, isLoading } = useQuery({
    queryKey: ["adminRegistration", id],
    queryFn: () => registrationService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) return <PageLoader />;

  if (!registration) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <p>Registration not found.</p>
        <Link to="/admin/registrations" className="mt-4 text-indigo-600 hover:underline">
          Back to Registrations
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/admin/registrations" className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Registration Details</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            View detailed information for team {registration.team_name}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700/60 pb-2">General Information</h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <User className="w-4 h-4" /> Team Name
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{registration.team_name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" /> Hackathon ID
                </span>
                <span className="text-sm text-slate-900 dark:text-white font-mono">{registration.hackathon_id}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" /> Problem Statement ID
                </span>
                <span className="text-sm text-slate-900 dark:text-white font-mono">{registration.problem_statement_id || "Not selected"}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <User className="w-4 h-4" /> Student User ID
                </span>
                <span className="text-sm text-slate-900 dark:text-white font-mono">{registration.user_id}</span>
              </div>
            </div>
          </div>

          {(registration.admin_remarks || registration.status === RegistrationStatus.REJECTED) && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700/60 pb-2">Admin Remarks</h3>
              <div className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-500/20 flex items-start gap-3">
                <MessageSquare className="w-5 h-5 mt-0.5 text-red-500" />
                <p className="text-sm whitespace-pre-wrap font-medium">
                  {registration.admin_remarks || "No remarks provided."}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200/60 dark:border-slate-700/60 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700/60 pb-2">Status & Timeline</h3>
            <div className="space-y-4">
              <div>
                <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Current Status</span>
                <StatusBadge status={registration.status} />
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-2 mb-1">
                  <Calendar className="w-3.5 h-3.5" /> Registered At
                </span>
                <span className="text-sm text-slate-900 dark:text-white">
                  {new Date(registration.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} &bull; {new Date(registration.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {registration.approved_at && (
                <div className="pt-2">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-2 mb-1">
                    <Clock className="w-3.5 h-3.5" /> Approved At
                  </span>
                  <span className="text-sm text-slate-900 dark:text-white">
                    {new Date(registration.approved_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} &bull; {new Date(registration.approved_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              {registration.approved_by && (
                <div className="pt-2">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-2 mb-1">
                    <User className="w-3.5 h-3.5" /> Approved By (Admin ID)
                  </span>
                  <span className="text-sm text-slate-900 dark:text-white font-mono break-all">{registration.approved_by}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
