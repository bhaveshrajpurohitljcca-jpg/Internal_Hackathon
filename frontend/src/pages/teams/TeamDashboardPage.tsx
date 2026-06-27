import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '@/services/team.service';
import type { Team, TeamInvitation } from '@/services/team.service';
import PageLoader from '@/components/ui/PageLoader';
import Button from '@/components/ui/Button';
import { Users, Crown, Trash2, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/providers/AuthProvider';
import { hackathonService } from '@/services/hackathon.service';

const TeamCard = ({ team, user, deleteTeamMutation, leaveTeamMutation, transferLeadershipMutation, removeMemberMutation }: any) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: (email: string) => teamService.inviteMember(team.id, email),
    onSuccess: () => {
      toast.success("Invitation sent");
      setInviteEmail('');
      queryClient.invalidateQueries({ queryKey: ['myTeams'] });
    },
    onError: (error: any) => toast.error(error.response?.data?.detail || "Failed to invite member")
  });

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200/60 dark:border-slate-700/60 flex flex-col h-full group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none dark:from-primary-900/10"></div>
      
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {team.name}
            {team.leader_id === user?.id && (
              <span title="Team Leader" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 p-1 rounded-md">
                <Crown className="w-4 h-4" />
              </span>
            )}
          </h2>
          {team.hackathon_id && (
            <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50">
              Hackathon ID: {team.hackathon_id.slice(0, 8)}...
            </div>
          )}
        </div>
        {team.leader_id === user?.id ? (
          <Button variant="ghost" size="sm" onClick={() => deleteTeamMutation.mutate(team.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20">
            <Trash2 className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => leaveTeamMutation.mutate(team.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20">
            <LogOut className="w-4 h-4 mr-2" /> Leave
          </Button>
        )}
      </div>

      <div className="flex-1 space-y-4 relative z-10 flex flex-col">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/50 pb-2">Team Members ({team.members.length})</h3>
        <div className="space-y-3 flex-1">
          {team.members.map((member: any) => (
            <div key={member.id} className="flex items-center justify-between p-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-100 to-indigo-100 dark:from-primary-900/40 dark:to-indigo-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold uppercase text-sm border border-primary-200/50 dark:border-primary-800/50 shadow-sm">
                  {member.user_name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {member.user_name}
                    {member.role === 'LEADER' && <Crown className="w-3 h-3 text-yellow-500" />}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{member.user_email}</p>
                </div>
              </div>
              {team.leader_id === user?.id && member.user_id !== user?.id && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-500 p-1.5 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                    title="Make Leader"
                    onClick={() => {
                      if(confirm(`Are you sure you want to make ${member.user_name} the leader?`)) {
                        transferLeadershipMutation.mutate({ teamId: team.id, userId: member.user_id });
                      }
                    }}
                  >
                    <Crown className="w-4 h-4" />
                  </button>
                  <button 
                    className="text-slate-400 hover:text-red-600 dark:hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove Member"
                    onClick={() => {
                      if(confirm(`Are you sure you want to remove ${member.user_name}?`)) {
                        removeMemberMutation.mutate({ teamId: team.id, userId: member.user_id });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {team.leader_id === user?.id && (
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 relative z-10">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="email"
                placeholder="Invite student by email..."
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inviteEmail && !inviteMutation.isPending) {
                    e.preventDefault();
                    inviteMutation.mutate(inviteEmail);
                  }
                }}
                className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50 py-2.5 px-4 text-sm focus:border-primary-500 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-900 dark:text-white transition-all shadow-sm placeholder:text-slate-400"
              />
            </div>
            <Button 
              onClick={() => inviteMutation.mutate(inviteEmail)}
              disabled={!inviteEmail || inviteMutation.isPending}
              size="sm"
              className="py-2.5 rounded-xl px-5 shrink-0"
            >
              {inviteMutation.isPending ? 'Sending...' : 'Invite'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const TeamDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedHackathonId, setSelectedHackathonId] = useState('');

  const { data: teams, isLoading: isTeamsLoading } = useQuery({
    queryKey: ['myTeams'],
    queryFn: teamService.getMyTeams,
  });

  const { data: invitations, isLoading: isInvitesLoading } = useQuery({
    queryKey: ['myInvitations'],
    queryFn: teamService.getMyInvitations,
  });

  const { data: hackathonsData } = useQuery({
    queryKey: ['hackathons', 'open'],
    queryFn: async () => {
      const response = await hackathonService.getAll({ page_size: 100 });
      return response.items.filter(h => h.is_registration_open);
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: () => teamService.createTeam(newTeamName, selectedHackathonId || undefined),
    onSuccess: () => {
      toast.success("Team created successfully");
      setNewTeamName('');
      setSelectedHackathonId('');
      queryClient.invalidateQueries({ queryKey: ['myTeams'] });
    },
    onError: (error: any) => toast.error(error.response?.data?.detail || "Failed to create team")
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, accept }: { id: string, accept: boolean }) => teamService.respondToInvitation(id, accept),
    onSuccess: (_, variables) => {
      toast.success(`Invitation ${variables.accept ? 'accepted' : 'rejected'}`);
      queryClient.invalidateQueries({ queryKey: ['myInvitations'] });
      if (variables.accept) {
        queryClient.invalidateQueries({ queryKey: ['myTeams'] });
      }
    },
    onError: (error: any) => toast.error(error.response?.data?.detail || "Failed to respond")
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string, userId: string }) => teamService.removeMember(teamId, userId),
    onSuccess: () => {
      toast.success("Member removed");
      queryClient.invalidateQueries({ queryKey: ['myTeams'] });
    },
    onError: (error: any) => toast.error(error.response?.data?.detail || "Failed to remove member")
  });

  const transferLeadershipMutation = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string, userId: string }) => teamService.transferLeadership(teamId, userId),
    onSuccess: () => {
      toast.success("Leadership transferred");
      queryClient.invalidateQueries({ queryKey: ['myTeams'] });
    },
    onError: (error: any) => toast.error(error.response?.data?.detail || "Failed to transfer leadership")
  });

  const leaveTeamMutation = useMutation({
    mutationFn: (teamId: string) => teamService.leaveTeam(teamId),
    onSuccess: () => {
      toast.success("You left the team");
      queryClient.invalidateQueries({ queryKey: ['myTeams'] });
    },
    onError: (error: any) => toast.error(error.response?.data?.detail || "Failed to leave team")
  });

  const deleteTeamMutation = useMutation({
    mutationFn: (teamId: string) => teamService.deleteTeam(teamId),
    onSuccess: () => {
      toast.success("Team deleted");
      queryClient.invalidateQueries({ queryKey: ['myTeams'] });
    },
    onError: (error: any) => toast.error(error.response?.data?.detail || "Failed to delete team")
  });

  if (isTeamsLoading || isInvitesLoading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Teams</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Manage your teams across multiple hackathons.</p>
      </div>

      {/* Invitations Section */}
      {invitations && invitations.length > 0 && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft border border-yellow-200 dark:border-yellow-900/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Pending Invitations</h2>
          <div className="space-y-4">
            {invitations.map((inv: TeamInvitation) => (
              <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Team: {inv.team_name}</p>
                  {inv.hackathon_name && <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Hackathon: {inv.hackathon_name}</p>}
                  <p className="text-xs text-slate-500 mt-1">Invited on {new Date(inv.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} &bull; {new Date(inv.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="flex gap-2 mt-4 sm:mt-0">
                  <Button 
                    onClick={() => respondMutation.mutate({ id: inv.id, accept: true })}
                    disabled={respondMutation.isPending}
                    size="sm"
                  >
                    Accept
                  </Button>
                  <Button 
                    onClick={() => respondMutation.mutate({ id: inv.id, accept: false })}
                    disabled={respondMutation.isPending}
                    variant="outline"
                    size="sm"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Team Section */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-soft border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center shrink-0">
            <Users className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 w-full space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create a New Team</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Create a team for an upcoming hackathon.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Team Name"
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                className="flex-1 w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 py-2.5 px-4 text-sm focus:border-primary-500 focus:ring-primary-500 dark:text-white shadow-sm"
              />
              <select
                value={selectedHackathonId}
                onChange={(e) => setSelectedHackathonId(e.target.value)}
                className="flex-1 w-full rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 py-2.5 px-4 text-sm focus:border-primary-500 focus:ring-primary-500 dark:text-white shadow-sm"
              >
                <option value="">Select Hackathon (Optional)</option>
                {hackathonsData?.map(h => (
                  <option key={h.id} value={h.id}>{h.title}</option>
                ))}
              </select>
              <Button 
                onClick={() => createTeamMutation.mutate()}
                disabled={!newTeamName.trim() || createTeamMutation.isPending}
                className="w-full sm:w-auto"
              >
                Create Team
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Teams List */}
      {teams && teams.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
          {teams.map((team: Team) => (
            <TeamCard 
              key={team.id}
              team={team}
              user={user}
              deleteTeamMutation={deleteTeamMutation}
              leaveTeamMutation={leaveTeamMutation}
              transferLeadershipMutation={transferLeadershipMutation}
              removeMemberMutation={removeMemberMutation}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamDashboardPage;
