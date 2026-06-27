import api from './api';

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'LEADER' | 'MEMBER';
  user_name: string;
  user_email: string;
  user_department?: string;
  user_gender?: string;
  created_at: string;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  invitee_email: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  team_name?: string;
  hackathon_name?: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  leader_id: string;
  hackathon_id?: string;
  logo_url?: string;
  banner_url?: string;
  created_at: string;
  members: TeamMember[];
  invitations: TeamInvitation[];
}

export const teamService = {
  getMyTeams: async (): Promise<Team[]> => {
    const { data } = await api.get('/teams/my');
    return data;
  },

  getAllTeams: async (params?: { page?: number; page_size?: number; search?: string }) => {
    const { data } = await api.get('/teams', { params });
    return data;
  },

  createTeam: async (name: string, hackathon_id?: string): Promise<Team> => {
    const { data } = await api.post('/teams', { name, hackathon_id });
    return data;
  },

  updateTeam: async (id: string, name?: string, logo_url?: string, banner_url?: string): Promise<Team> => {
    const { data } = await api.patch(`/teams/${id}`, { name, logo_url, banner_url });
    return data;
  },

  deleteTeam: async (id: string): Promise<void> => {
    await api.delete(`/teams/${id}`);
  },

  inviteMember: async (teamId: string, email: string): Promise<TeamInvitation> => {
    const { data } = await api.post(`/teams/${teamId}/invitations`, { invitee_email: email });
    return data;
  },

  removeMember: async (teamId: string, userId: string): Promise<void> => {
    await api.delete(`/teams/${teamId}/members/${userId}`);
  },

  getMyInvitations: async (): Promise<TeamInvitation[]> => {
    const { data } = await api.get('/teams/invitations/my');
    return data;
  },

  respondToInvitation: async (inviteId: string, accept: boolean): Promise<TeamInvitation> => {
    const { data } = await api.post(`/teams/invitations/${inviteId}/respond?accept=${accept}`);
    return data;
  },

  transferLeadership: async (teamId: string, newLeaderId: string): Promise<void> => {
    await api.post(`/teams/${teamId}/transfer-leadership/${newLeaderId}`);
  },

  leaveTeam: async (teamId: string): Promise<void> => {
    await api.delete(`/teams/${teamId}/leave`);
  }
};
