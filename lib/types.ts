export type UserRole = "admin" | "manager" | "agent";
export type AgentType = "individual" | "sales" | string;

export interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId?: string;
  agentsCount: number;
  status: "active" | "inactive";
  createdAt: string;
  lastLogin: string | null;
}

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId?: string;
  type: AgentType;
  groupName?: string | null;
  status: "active" | "inactive";
  attendanceRate?: number;
  createdAt: string;
  teamLeader: boolean;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string; // full name
    email: string;
    phoneNumber?: string;
    role: UserRole;
    agentType?: AgentType;
    groupName?: string | null;
  };
}

// Removed Client interface – clients feature deprecated

export interface Activity {
  id: string;
  description: string;
  timestamp: string;
}

export interface ManagerActivity {
  id: string;
  agentName: string;
  action: string;
  location: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

export interface Group {
  id: string;
  name: string;
  teamLeader: Agent | null;
  agents: Agent[];
}

export interface ManagerDashboardData {
  stats: {
    totalAgents: number;
    activeToday: number;
    groupsCount: number;
  };
  attendance: {
    rate: number;
    presentCount: number;
    absentCount: number;
    presentAgents: { name: string; time: string }[];
    timeframe: { startTime: string; endTime: string };
  };
  // performance now attendance-only on backend; keep placeholders if provided
  groupPerformance?: { name: string; onTimeRate?: number }[];
  individualPerformance?: { name: string; onTimeRate?: number }[];
  recentActivities: ManagerActivity[];
}

export interface IndividualAgentDashboardData {
  agentType: "individual";
  attendanceMarked: boolean;
  // client metrics removed
  recentActivities: Activity[];
}

export interface SalesAgentDashboardData {
  agentType: "sales";
  attendanceMarked: boolean;
  // client metrics removed
  groupName: string;
  teamLeader: string;
  recentActivities: Activity[];
}

export interface TeamMember {
  id: string;
  name: string;
  isTeamLeader: boolean;
}

export interface GroupPerformanceTrend {
  name: string; // e.g., "Week 1"
}

export interface GroupPerformanceData {
  kpis: {
    teamMembersCount: number;
    teamRank: {
      rank: number;
      total: number;
    };
  };
  performanceTrends: GroupPerformanceTrend[];
  teamLeader: TeamMember;
  teamMembers: TeamMember[];
  recentActivities: Activity[];
}

// DTOs aligned with backend
export type AuthRequest = { phoneNumber: string; password: string };

export type UserDTO = {
  id: number;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  phoneNumber?: string | null;
  nationalId?: string | null;
  role: UserRole;
  active: boolean;
  lastLogin?: string | null;
};

export type AgentListItemDTO = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  nationalId?: string | null;
  workId?: string | null;
  type: AgentType;
  groupName?: string | null;
  managerName?: string | null;
};

export type ManagerListItemDTO = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  nationalId?: string | null;
  workId?: string | null;
  status: 'active' | 'inactive';
  lastLogin?: string | null;
};

export type AttendanceSummary = {
  present: number;
  absent: number;
  onTimeRate: number;
};
