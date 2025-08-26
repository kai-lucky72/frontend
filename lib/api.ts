import {
  Manager,
  AuthResponse,
  UserRole,
  AgentType,
  IndividualAgentDashboardData,
  SalesAgentDashboardData,
  GroupPerformanceData,
  ManagerDashboardData,
  Agent,
  Group,
} from "@/lib/types";

const API_URL = "http://localhost:5238/api";

// ====================================================================
// ERROR HANDLING UTILITIES
// ====================================================================

interface ApiError {
  message: string;
  status: number;
  details?: any;
  userFriendly?: string;
}

function createUserFriendlyError(status: number, message: string): string {
  switch (status) {
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return "The requested information was not found.";
    case 422:
      return "Please check your input and try again.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
      return "Something went wrong on our end. Please try again later.";
    case 502:
    case 503:
    case 504:
      return "Our servers are temporarily unavailable. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function parseApiError(error: any): ApiError {
  try {
    // If it's already a parsed error object
    if (typeof error === 'object' && error.message) {
      return {
        message: error.message,
        status: error.status || 500,
        details: error.details,
        userFriendly: error.userFriendly || createUserFriendlyError(error.status || 500, error.message)
      };
    }

    // If it's a JSON string
    if (typeof error === 'string') {
      try {
        const parsed = JSON.parse(error);
        return {
          message: parsed.message || error,
          status: parsed.status || 500,
          details: parsed.details,
          userFriendly: parsed.userFriendly || createUserFriendlyError(parsed.status || 500, parsed.message || error)
        };
      } catch {
        // If JSON parsing fails, treat as generic error
        return {
          message: error,
          status: 500,
          userFriendly: "Something went wrong. Please try again."
        };
      }
    }

    // Default fallback
    return {
      message: error?.message || 'Unknown error occurred',
      status: 500,
      userFriendly: "Something went wrong. Please try again."
    };
  } catch {
    return {
      message: 'Error parsing error message',
      status: 500,
      userFriendly: "Something went wrong. Please try again."
    };
  }
}

// ====================================================================
// UTILITY FUNCTIONS
// ====================================================================

// Extract numeric ID from string ID (e.g., "agt-015" -> "15", "grp-001" -> "1")
function extractNumericId(id: string): string {
  return id.replace(/[^\d]/g, '');
}

// ====================================================================
// API HELPER
// ====================================================================

async function fetchApi(path: string, options: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`;
      let errorDetails = undefined;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        errorDetails = errorData.details;
      } catch {
        try {
          const text = await response.text();
          if (text) {
            errorMessage = text;
          }
        } catch {}
      }

      // Create a structured error object
      const apiError: ApiError = {
        message: errorMessage,
        status: response.status,
        details: errorDetails,
        userFriendly: createUserFriendlyError(response.status, errorMessage)
      };

      // Handle authentication errors specially
      if (response.status === 401) {
        // Clear invalid tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('workId');
        localStorage.removeItem('agentType');
        localStorage.removeItem('groupName');
      }

      throw apiError;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return response.json();
  } catch (error) {
    // If it's a network error or other fetch error
    if (error instanceof TypeError) {
      const networkError: ApiError = {
        message: 'Network error - unable to connect to server',
        status: 0,
        userFriendly: 'Unable to connect to the server. Please check your internet connection and try again.'
      };
      throw networkError;
    }

    // Re-throw API errors as-is
    throw error;
  }
}

// ====================================================================
// AUTH API
// ====================================================================

// Updated to accept phone and password only (role determined by backend)
export const login = async (phone: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber: phone, password }),
    });

    if (response.token) {
      localStorage.setItem('authToken', response.token);
      // Storing user info can be useful to avoid re-fetching it
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  } catch (error) {
    const apiError = parseApiError(error);
    
    // Provide specific login error messages
    if (apiError.status === 401) {
      apiError.userFriendly = "Invalid phone number or password. Please check your credentials and try again.";
    }
    
    throw apiError;
  }
};

// ====================================================================
// AGENT DASHBOARD API
// ====================================================================

// Fetches the dashboard data for the currently authenticated agent.
export async function getAgentDashboardData(): Promise<IndividualAgentDashboardData | SalesAgentDashboardData> {
  return fetchApi('/agent/dashboard');
}

// (Removed) Clients API – feature deprecated

// ====================================================================
// GROUP PERFORMANCE API
// ====================================================================

// (Removed) Group performance – deprecated


// ====================================================================
// MANAGER DASHBOARD API
// ====================================================================

export const getManagerDashboardData = async (): Promise<ManagerDashboardData> => {
  return fetchApi('/manager/dashboard');
};

export const getManagerAttendance = async (date?: string): Promise<any> => {
  let dateParam = date;
  if (!dateParam) {
    const today = new Date();
    dateParam = today.toISOString().slice(0, 10); // yyyy-mm-dd
  }
  return fetchApi(`/manager/attendance?date=${dateParam}`);
};

export const patchManagerDashboardTimeframe = async (timeframe: { startTime: string; endTime: string }): Promise<{ startTime: string; endTime: string }> => {
  return fetchApi('/manager/dashboard/timeframe', {
    method: 'PATCH',
    body: JSON.stringify(timeframe),
  });
};

export const getManagerPerformance = async (period: string = "monthly"): Promise<any> => {
  return fetchApi(`/manager/performance?period=${period}`);
};

export const updateManagerTimeframe = async (timeframe: { startTime: string; endTime: string }): Promise<any> => {
  return fetchApi(`/manager/dashboard/timeframe`, {
    method: 'PATCH',
    body: JSON.stringify(timeframe),
  });
};

// ====================================================================
// MANAGER - AGENT MANAGEMENT API
// ====================================================================

export const getAgents = async (): Promise<Agent[]> => {
  return fetchApi('/manager/agents');
};

// Create agent disabled — backend returns 403

export const updateAgent = async (id: string, agentData: Partial<Omit<Agent, 'id'>>): Promise<Agent> => {
  // Extract numeric ID from string ID (e.g., "agt-015" -> "15")
  const numericId = extractNumericId(id);
  return fetchApi(`/manager/agents/${numericId}`, {
    method: 'PUT',
    body: JSON.stringify(agentData),
  });
};

export const deleteAgent = async (id: string): Promise<void> => {
  // Extract numeric ID from string ID (e.g., "agt-015" -> "15")
  const numericId = extractNumericId(id);
  return fetchApi(`/manager/agents/${numericId}`, {
    method: 'DELETE',
  });
};


// ====================================================================
// MANAGER - GROUP MANAGEMENT API
// ====================================================================

export const getGroups = async (): Promise<Group[]> => {
  return fetchApi('/manager/groups');
};

export const createGroup = async (groupData: { name: string }): Promise<Group> => {
  return fetchApi('/manager/groups', {
    method: 'POST',
    body: JSON.stringify(groupData),
  });
};

export const updateGroup = async (id: string, groupData: { name: string }): Promise<Group> => {
  // Extract numeric ID from string ID (e.g., "grp-001" -> "1")
  const numericId = extractNumericId(id);
  return fetchApi(`/manager/groups/${numericId}`, {
    method: 'PUT',
    body: JSON.stringify(groupData),
  });
};

export const deleteGroup = async (id: string): Promise<void> => {
  // Extract numeric ID from string ID (e.g., "grp-001" -> "1")
  const numericId = extractNumericId(id);
  return fetchApi(`/manager/groups/${numericId}`, {
    method: 'DELETE',
  });
};

export const assignAgentToGroup = async (groupId: string | number, agentIds: (string | number)[]): Promise<any> => {
  // Extract numeric group ID
  const numericGroupId = extractNumericId(String(groupId));
  // Convert all agentIds to numeric
  const numericAgentIds = agentIds.map(id => extractNumericId(String(id)));
  return fetchApi(`/manager/groups/${numericGroupId}/agents`, {
    method: 'POST',
    body: JSON.stringify({ agentIds: numericAgentIds }),
  });
};

export const removeAgentFromGroup = async (groupId: string | number, agentId: string | number): Promise<any> => {
  const numericGroupId = extractNumericId(String(groupId));
  const numericAgentId = extractNumericId(String(agentId));
  return fetchApi(`/manager/groups/${numericGroupId}/agents/${numericAgentId}`, {
    method: 'DELETE',
  });
};

export const setTeamLeader = async (groupId: string | number, agentId: string | number): Promise<any> => {
  const numericGroupId = extractNumericId(String(groupId));
  const numericAgentId = extractNumericId(String(agentId));
  return fetchApi(`/manager/groups/${numericGroupId}/leader?agentId=${numericAgentId}`, {
    method: 'PUT',
  });
};


// ====================================================================
// MANAGER API (Existing)
// ====================================================================

export const getManagers = async (): Promise<Manager[]> => {
  return fetchApi('/admin/managers');
};

export const createManager = async (data: Omit<Manager, 'id'>): Promise<Manager> => {
  return fetchApi('/admin/managers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateManager = async (id: string, data: Partial<Manager>): Promise<Manager> => {
  // Extract numeric ID from string ID (e.g., "mgr-001" -> "1")
  const numericId = extractNumericId(id);
  return fetchApi(`/admin/managers/${numericId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteManager = async (id: string): Promise<{}> => {
  // Extract numeric ID from string ID (e.g., "mgr-001" -> "1")
  const numericId = extractNumericId(id);
  return fetchApi(`/admin/managers/${numericId}`, {
    method: 'DELETE',
  });
};

export const getUsers = async (): Promise<any[]> => {
  return await fetchApi('/admin/users');
}

export const getLogs = async (params: { level?: string; category?: string; search?: string; page?: number; limit?: number } = {}): Promise<any> => {
  const query = new URLSearchParams();
  if (params.level && params.level !== 'all') query.append('level', params.level);
  if (params.category && params.category !== 'all') query.append('category', params.category);
  if (params.search) query.append('search', params.search);
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  const qs = query.toString() ? `?${query.toString()}` : '';
  return await fetchApi(`/admin/logs${qs}`);
}

export const getNotifications = async (params: { page?: number; limit?: number } = {}): Promise<any> => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  const qs = query.toString() ? `?${query.toString()}` : '';
  return await fetchApi(`/admin/notifications${qs}`);
}

export const sendNotification = async (data: { title: string; message: string; recipient: string; priority: string; senderRole?: string }): Promise<any> => {
  const body: any = { title: data.title, message: data.message, recipient: data.recipient, priority: data.priority };
  if (data.senderRole) body.senderRole = data.senderRole;
  return await fetchApi('/admin/notifications', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export const sendManagerNotification = async (data: { title: string; message: string; recipient: string; priority: string; senderRole: string }): Promise<any> => {
  const body: any = { title: data.title, message: data.message, recipient: data.recipient, priority: data.priority, senderRole: data.senderRole };
  return await fetchApi('/manager/notifications', {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const getManagerNotifications = async (params: { page?: number; limit?: number } = {}): Promise<any> => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  const qs = query.toString() ? `?${query.toString()}` : '';
  return await fetchApi(`/manager/notifications${qs}`);
};

export const getAgentNotifications = async (params: { page?: number; limit?: number } = {}): Promise<any> => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  const qs = query.toString() ? `?${query.toString()}` : '';
  return await fetchApi(`/agent/notifications${qs}`);
};

// Agent clients API
export const syncAgentClients = async (): Promise<{ status: string }> => {
  return fetchApi('/agent/clients/sync', { method: 'POST' });
};

export const getAgentClients = async (params: { from?: string; to?: string } = {}): Promise<any[]> => {
  const query = new URLSearchParams();
  if (params.from) query.append('from', params.from);
  if (params.to) query.append('to', params.to);
  const qs = query.toString() ? `?${query.toString()}` : '';
  return fetchApi(`/agent/clients${qs}`);
};

// Manager -> agent clients API
export const syncManagerAgentClients = async (agentId: string | number): Promise<{ status: string }> => {
  const numericId = extractNumericId(String(agentId));
  return fetchApi(`/manager/agents/${numericId}/clients/sync`, { method: 'POST' });
};

export const getManagerAgentClients = async (
  agentId: string | number,
  params: { from?: string; to?: string } = {}
): Promise<any[]> => {
  const numericId = extractNumericId(String(agentId));
  const query = new URLSearchParams();
  if (params.from) query.append('from', params.from);
  if (params.to) query.append('to', params.to);
  const qs = query.toString() ? `?${query.toString()}` : '';
  return fetchApi(`/manager/agents/${numericId}/clients${qs}`);
};

// Mark single notification as read
export const markNotificationAsRead = async (id: string): Promise<void> => {
  return fetchApi(`/notifications/${id}/read`, {
    method: 'POST',
  });
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<{ updated: number }> => {
  return fetchApi('/notifications/read-all', {
    method: 'POST',
  });
};

export const getAgentAttendanceTimeframe = async (): Promise<{ startTime: string; endTime: string }> => {
  return fetchApi('/agent/attendance/timeframe');
};

export const getAgentAttendanceStatus = async (): Promise<{ hasMarkedToday: boolean; time?: string }> => {
  return fetchApi('/agent/attendance/status');
};

export const markAgentAttendance = async (details: { location: string; sector: string }): Promise<any> => {
  return fetchApi('/agent/attendance', {
    method: 'POST',
    body: JSON.stringify(details),
  });
};
