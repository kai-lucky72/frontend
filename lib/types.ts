export type UserRole = "admin" | "manager" | "agent";
export type AgentType = "individual" | "sales";

export interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  workId: string;
  agentsCount: number;
  status: "active" | "inactive";
  createdAt: string;
  lastLogin: string;
}

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  workId: string;
  type: AgentType;
  group: string;
  status: "active" | "inactive";
  clientsCollected: number;
  attendanceRate: number;
  createdAt: string;
  teamLeader: boolean;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    workId: string;
    role: UserRole;
    agentType?: AgentType;
    groupName?: string;
  };
}

export interface Client {
  id: string;
  name: string;
  contact: string;
  address: string;
  policy: string;
  amount: number;
  payingMethod: "cash" | "bank" | "check";
  status: "pending" | "approved" | "rejected";
  notes?: string;
  createdAt: string;
}

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
    clientsCollected: number;
    groupsCount: number;
  };
  attendance: {
    rate: number;
    presentCount: number;
    absentCount: number;
    presentAgents: { name: string; time: string }[];
    timeframe: { startTime: string; endTime: string };
  };
  groupPerformance: { name: string; clients: number }[];
  individualPerformance: { name: string; clients: number }[];
  recentActivities: ManagerActivity[];
}

export interface IndividualAgentDashboardData {
  agentType: "individual";
  attendanceMarked: boolean;
  clientsThisMonth: number;
  totalClients: number;
  recentActivities: Activity[];
}

export interface SalesAgentDashboardData {
  agentType: "sales";
  attendanceMarked: boolean;
  clientsThisMonth: number;
  totalClients: number;
  groupName: string;
  teamLeader: string;
  recentActivities: Activity[];
}

export interface TeamMember {
  id: string;
  name: string;
  clients: number;
  isTeamLeader: boolean;
}

export interface GroupPerformanceTrend {
  name: string; // e.g., "Week 1"
  clients: number;
}

export interface GroupPerformanceData {
  kpis: {
    totalClients: number;
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
