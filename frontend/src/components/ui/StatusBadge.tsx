import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      // Hackathon statuses
      case 'UPCOMING':
      case 'SUBMITTED':
        return 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20';
      case 'APPROVED':
      case 'REGISTRATION_OPEN':
      case 'ACCEPTED':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20';
      case 'SUBMISSION_OPEN':
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20';
      case 'CLOSED':
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20';
      case 'UNDER_REVIEW':
        return 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20';
      case 'DRAFT':
      case 'WITHDRAWN':
        return 'bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20';
      default:
        return 'bg-slate-50 text-slate-700 ring-slate-600/20 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-500/20';
    }
  };

  const formatStatus = (s: string) => s.replace('_', ' ');

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${getStyles()}`}
    >
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;
