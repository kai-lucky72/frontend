# Frontend API Integration Specification

This document outlines the backend API endpoints required to support the Prime Management frontend application. It includes details on authentication, request/response structures, and data models for each user role.

## Table of Contents
1. [Authentication](#authentication)
2. [Client Endpoints](#client-endpoints)
3. [Agent Endpoints](#agent-endpoints)
4. [Manager Endpoints](#manager-endpoints)
5. [Admin Endpoints](#admin-endpoints)

---

## 1. Authentication

The application uses JSON Web Tokens (JWT) for securing API endpoints.

### JWT Handling

1.  **Login**: The user sends their credentials to the `/api/auth/login` endpoint.
2.  **Token Response**: The backend validates the credentials and, if successful, returns a JWT and user information.
3.  **Token Storage**: The frontend stores the received `authToken` in the browser's `localStorage`.
4.  **Authenticated Requests**: For all subsequent requests to protected API endpoints, the frontend will include the JWT in the `Authorization` header as a Bearer token.
    -   **Header**: `Authorization: Bearer <your_jwt_token>`

### Endpoint: `POST /api/auth/login`

-   **Description**: Authenticates a user and returns a JWT.
-   **Request Body**:
    ```json
    {
      "email": "agent@company.com",
      "workId": "AGT001",
      "role": "agent"
    }
    ```
-   **Success Response (200 OK)**:
    ```json
    {
      "token": "ey...",
      "user": {
        "id": "user-123",
        "name": "John Doe",
        "email": "agent@company.com",
        "workId": "AGT001",
        "role": "agent",
        "agentType": "individual", // or "sales"
        "groupName": "Alpha Team" // Optional, only for sales agents
      }
    }
    ```
-   **Error Response (401 Unauthorized)**:
    ```json
    {
      "message": "Invalid credentials"
    }
    ```

---

## 2. Client Endpoints

These endpoints are for agent users to manage their clients.

### Endpoint: `GET /api/clients`

-   **Description**: Retrieves a list of all clients assigned to the authenticated agent.
-   **Success Response (200 OK)**:
    ```json
    [
      {
        "id": "client-001",
        "fullName": "Alice Johnson",
        "nationalId": "1234567890",
        "phoneNumber": "+1-202-555-0101",
        "email": "alice.j@example.com",
        "location": "123 Liberty Rd, Philadelphia",
        "dateOfBirth": "1985-05-20",
        "insuranceType": "Health Insurance",
        "payingAmount": 350,
        "payingMethod": "Card",
        "contractYears": 2
      }
    ]
    ```

### Endpoint: `POST /api/clients`

-   **Description**: Creates a new client for the authenticated agent.
-   **Request Body**:
    ```json
    {
      "fullName": "Bob Williams",
      "nationalId": "0987654321",
      "phoneNumber": "+1-202-555-0102",
      "email": "bob.w@example.com",
      "location": "456 Market St, San Francisco",
      "dateOfBirth": "1990-11-30",
      "insuranceType": "Auto Insurance",
      "payingAmount": 120,
      "payingMethod": "Bank Transfer",
      "contractYears": 1
    }
    ```
-   **Success Response (201 Created)**:
    ```json
    {
      "id": "client-002",
      "fullName": "Bob Williams",
      // ... all other client fields
    }
    ```

---


## 3. Agent Endpoints

These endpoints are for users with the `agent` role.

### Endpoint: `POST /api/agent/attendance`

-   **Description**: Marks the authenticated agent's attendance for the day.
-   **Request Body**:
    ```json
    {
      "location": "Downtown Office",
      "sector": "Life Insurance"
    }
    ```
-   **Success Response (200 OK)**:
    ```json
    {
      "message": "Attendance marked successfully at 09:15 AM",
      "attendance": {
        "date": "2024-07-15",
        "time": "09:15",
        "status": "Present"
      }
    }
    ```

### Endpoint: `GET /api/agent/attendance/history`

-   **Description**: Fetches the authenticated agent's attendance history and statistics.
-   **Success Response (200 OK)**:
    ```json
    {
      "attendanceRate": 90,
      "presentCount": 18,
      "lateCount": 2,
      "absentCount": 0,
      "records": [
        { 
          "id": "rec-001", 
          "date": "2024-07-15", 
          "time": "08:30", 
          "location": "Downtown Office", 
          "sector": "Life Insurance", 
          "status": "present" 
        },
        { 
          "id": "rec-002", 
          "date": "2024-07-14", 
          "time": "09:15", 
          "location": "Uptown Branch", 
          "sector": "Health Insurance", 
          "status": "late" 
        }
      ]
    }
    ```

### Endpoint: `GET /api/agent/attendance/timeframe`

-   **Description**: Fetches the manager-defined timeframe for marking attendance.
-   **Success Response (200 OK)**:
    ```json
    {
      "startTime": "09:00",
      "endTime": "10:00"
    }
    ```

### Endpoint: `GET /api/agent/group-performance?period={period}`

-   **Description**: Fetches the performance data for the authenticated agent's group.
-   **Query Parameters**:
    -   `period` (required): `weekly`, `monthly`, or `quarterly`.
-   **Success Response (200 OK)**:
    ```json
    {
      "groupName": "Alpha Team",
      "totalClients": 210,
      "teamMemberCount": 5,
      "teamLeader": {
        "name": "John Doe"
      },
      "chartData": [
        { "name": "Week 1", "clients": 185 },
        { "name": "Week 2", "clients": 210 },
        { "name": "Week 3", "clients": 195 },
        { "name": "Week 4", "clients": 225 }
      ],
      "leaderboard": [
        { "name": "Sarah Smith", "clients": 38, "isTeamLeader": false },
        { "name": "Mike Johnson", "clients": 42, "isTeamLeader": false },
        { "name": "John Doe", "clients": 45, "isTeamLeader": true },
        { "name": "Lisa Brown", "clients": 35, "isTeamLeader": false },
        { "name": "Tom Davis", "clients": 28, "isTeamLeader": false }
      ],
      "recentActivities": [
        {
          "activity": "New team member joined",
          "details": "Tom Davis added to Alpha Team",
          "time": "1 week ago",
          "type": "info"
        }
      ]
    }
    ```

### Endpoint: `GET /api/agent/performance?period={period}`

-   **Description**: Fetches the authenticated agent's performance data for a specified period.
-   **Query Parameters**:
    -   `period` (required): `weekly` or `monthly`.
-   **Success Response (200 OK) for `period=weekly`**:
    ```json
    {
      "totalClients": 25,
      "attendanceRate": 80,
      "chartData": [
        { "name": "Mon", "clients": 4 },
        { "name": "Tue", "clients": 6 },
        { "name": "Wed", "clients": 3 },
        { "name": "Thu", "clients": 8 },
        { "name": "Fri", "clients": 5 },
        { "name": "Sat", "clients": 0 },
        { "name": "Sun", "clients": 0 }
      ],
      "attendanceLog": [
        { "date": "2024-07-15", "status": "Present", "location": "Downtown Office" },
        { "date": "2024-07-14", "status": "Present", "location": "Uptown Kiosk" },
        { "date": "2024-07-13", "status": "Absent", "location": "-" },
        { "date": "2024-07-12", "status": "Present", "location": "Downtown Office" },
        { "date": "2024-07-11", "status": "Present", "location": "Suburbia Mall" }
      ]
    }
    ```

### Endpoint: `GET /api/agent/dashboard`

-   **Description**: Fetches the necessary data for the agent's main dashboard. The response structure depends on the agent's `agentType`.
-   **Success Response (200 OK) - Individual Agent**:
    ```json
    {
      "attendanceMarked": true,
      "clientsThisMonth": 12,
      "totalClients": 85,
      "performanceRate": 92.5,
      "recentActivities": [
        { "id": "act-1", "description": "Added new client: Jane Smith", "timestamp": "2 hours ago" },
        { "id": "act-2", "description": "Updated policy for John Doe", "timestamp": "1 day ago" }
      ]
    }
    ```
-   **Success Response (200 OK) - Sales Agent**:
    ```json
    {
      "attendanceMarked": false,
      "clientsThisMonth": 8,
      "totalClients": 64,
      "performanceRate": 88.0,
      "recentActivities": [
        { "id": "act-3", "description": "Added new client: Peter Pan", "timestamp": "4 hours ago" }
      ],
      "groupName": "Alpha Team",
      "teamLeader": "John Doe"
    }
    ```

### Endpoint: `GET /api/agent/clients`

-   **Description**: Retrieves a list of all clients assigned to the authenticated agent.
-   **Success Response (200 OK)**:
    ```json
    [
      {
        "id": "client-001",
        "fullName": "Alice Johnson",
        "nationalId": "1234567890",
        "phoneNumber": "+1-202-555-0101",
        "email": "alice.j@example.com",
        "location": "123 Liberty Rd, Philadelphia",
        "dateOfBirth": "1985-05-20",
        "insuranceType": "Health Insurance",
        "payingAmount": 350,
        "payingMethod": "Card",
        "contractYears": 2
      }
    ]
    ```

### Endpoint: `POST /api/agent/clients`

-   **Description**: Creates a new client for the authenticated agent.
-   **Request Body**:
    ```json
    {
      "fullName": "Bob Williams",
      "nationalId": "0987654321",
      "phoneNumber": "+1-202-555-0102",
      "email": "bob.w@example.com",
      "location": "456 Market St, San Francisco",
      "dateOfBirth": "1990-11-30",
      "insuranceType": "Auto Insurance",
      "payingAmount": 120,
      "payingMethod": "Bank Transfer",
      "contractYears": 1
    }
    ```
-   **Success Response (201 Created)**:
    ```json
    {
      "id": "client-002",
      "fullName": "Bob Williams",
      // ... all other client fields
    }
    ```

### Endpoint: `GET /api/agent/group-performance`

-   **Description**: Fetches performance data for a sales agent's group. Only accessible to `sales` agents.
-   **Success Response (200 OK)**:
    ```json
    {
      "groupName": "Alpha Team",
      "kpis": {
        "totalClients": 253,
        "teamMembersCount": 5,
        "teamRank": { "rank": 2, "total": 10 }
      },
      "performanceTrends": [
        { "name": "Week 1", "clients": 185 },
        { "name": "Week 2", "clients": 210 }
      ],
      "teamLeader": {
        "id": "agt-001",
        "name": "John Doe",
        "clients": 45,
        "rate": 90,
        "isTeamLeader": true
      },
      "teamMembers": [
        { "id": "agt-002", "name": "Sarah Smith", "clients": 38, "rate": 95, "isTeamLeader": false }
      ],
      "recentActivities": [
        { "id": "act-grp-1", "description": "Team exceeded weekly target", "timestamp": "2 days ago" }
      ]
    }
    ```

---

## 4. Manager Endpoints

These endpoints are for users with the `manager` role.


### Endpoint: `PUT /api/manager/attendance/timeframe`

-   **Description**: Updates the attendance timeframe for all agents.
-   **Request Body**:
    ```json
    {
      "startTime": "07:00",
      "endTime": "10:00"
    }
    ```
-   **Success Response (200 OK)**:
    ```json
    {
      "message": "Attendance timeframe updated successfully.",
      "timeframe": {
        "startTime": "07:00",
        "endTime": "10:00"
      }
    }
    ```

### Endpoint: `GET /api/manager/dashboard`

-   **Description**: Fetches aggregate data for the manager's dashboard.
-   **Success Response (200 OK)**:
    ```json
    {
      "stats": {
        "totalAgents": 24,
        "activeToday": 18,
        "clientsCollected": 156,
        "groupsCount": 4
      },
      "attendanceTimeframe": { "startTime": "06:00", "endTime": "09:00" },
      "attendedAgents": [
        { "name": "John Doe", "time": "08:30" }
      ],
      "groupPerformance": [
        { "name": "Alpha Team", "clients": 125 }
      ],
      "individualPerformance": [
        { "name": "John Doe", "clients": 45 }
      ]
    }
    ```

### Endpoint: `PATCH /api/manager/dashboard/timeframe`

-   **Description**: Updates the attendance timeframe for agents.
-   **Request Body**:
    ```json
    {
      "startTime": "07:00",
      "endTime": "10:00"
    }
    ```
-   **Success Response (200 OK)**:
    ```json
    {
      "startTime": "07:00",
      "endTime": "10:00"
    }
    ```

### Endpoint: `GET /api/manager/agents`

-   **Description**: Retrieves a list of all agents managed by the authenticated manager.
-   **Success Response (200 OK)**:
    ```json
    [
      {
        "id": "agt-001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@company.com",
        "phoneNumber": "+1-202-555-0104",
        "nationalId": "1234567890",
        "workId": "AGT001",
        "type": "sales",
        "group": "Alpha Team",
        "isTeamLeader": true,
        "status": "active",
        "clientsCollected": 45,
        "attendanceRate": 95,
        "createdAt": "2024-01-15"
      }
    ]
    ```

### Endpoint: `POST /api/manager/agents`

-   **Description**: Creates a new agent under the manager.
-   **Request Body**:
    ```json
    {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@company.com",
      "password": "a-strong-password",
      "phoneNumber": "+1-202-555-0105",
      "nationalId": "0987654321",
      "workId": "AGT004",
      "type": "individual"
    }
    ```
-   **Success Response (201 Created)**: Returns the newly created agent object.

### Endpoint: `PUT /api/manager/agents/:id`

-   **Description**: Updates an existing agent's information.
-   **Request Body**: A partial agent object with fields to update (e.g., `firstName`, `lastName`, `email`, `phoneNumber`, `nationalId`, `group`, `password`, etc.).
    ```json
    {
      "lastName": "Smith-Jones",
      "group": "Beta Team",
      "phoneNumber": "+1-202-555-0106"
    }
    ```
-   **Success Response (200 OK)**: Returns the full, updated agent object.

### Endpoint: `DELETE /api/manager/agents/{agentId}`

-   **Description**: Deletes a specific agent.
-   **URL Parameters**:
    -   `agentId` (required): The ID of the agent to delete.
-   **Success Response (204 No Content)**

### Endpoint: `GET /api/manager/groups`

-   **Description**: Fetches a detailed list of all groups managed by the authenticated manager.
-   **Success Response (200 OK)**:
    ```json
    [
      {
        "id": "group-001",
        "name": "Alpha Team",
        "description": "High-performance sales team for downtown sector",
        "members": [
          { "id": "agent-001", "name": "John Doe" },
          { "id": "agent-002", "name": "Sarah Smith" }
        ],
        "teamLeader": { "id": "agent-001", "name": "John Doe" },
        "performance": 85,
        "collectedClients": 125,
        "createdAt": "2024-01-15"
      }
    ]
    ```

### Endpoint: `POST /api/manager/groups`

-   **Description**: Creates a new group.
-   **Request Body**:
    ```json
    {
      "name": "Gamma Team",
      "description": "New team for emerging markets"
    }
    ```
-   **Success Response (201 Created)**: Returns the newly created group object.

### Endpoint: `PUT /api/manager/groups/{groupId}`

-   **Description**: Updates a group's details, such as its name, description, or team leader.
-   **URL Parameters**:
    -   `groupId` (required): The ID of the group to update.
-   **Request Body**:
    ```json
    {
      "name": "Gamma Force",
      "description": "Updated description",
      "teamLeaderId": "agent-005"
    }
    ```
-   **Success Response (200 OK)**: Returns the updated group object.

### Endpoint: `DELETE /api/manager/groups/{groupId}`

-   **Description**: Deletes a group.
-   **URL Parameters**:
    -   `groupId` (required): The ID of the group to delete.
-   **Success Response (204 No Content)**

### Endpoint: `POST /api/manager/groups/{groupId}/members`

-   **Description**: Adds one or more agents to a group.
-   **URL Parameters**:
    -   `groupId` (required): The ID of the group to modify.
-   **Request Body**:
    ```json
    {
      "agentIds": ["agent-006", "agent-008"]
    }
    ```
-   **Success Response (200 OK)**:
    ```json
    {
      "message": "Members added successfully.",
      "group": { ... } // Returns the updated group object
    }
    ```

### Endpoint: `DELETE /api/manager/groups/{groupId}/members/{agentId}`

-   **Description**: Removes an agent from a group.
-   **URL Parameters**:
    -   `groupId` (required): The ID of the group to modify.
    -   `agentId` (required): The ID of the agent to remove.
-   **Success Response (200 OK)**:
    ```json
    {
      "message": "Member removed successfully.",
      "group": { ... } // Returns the updated group object
    }
    ```

### Endpoint: `GET /api/manager/attendance`

-   **Description**: Fetches attendance records for all agents, with filtering and pagination.
-   **Query Parameters**:
    -   `date` (optional): The date to fetch records for (e.g., `YYYY-MM-DD`). Defaults to the current day.
    -   `status` (optional): Filter by status (`present`, `absent`).
    -   `search` (optional): A search term to filter by agent name or work ID.
    -   `page` (optional): The page number for pagination.
    -   `limit` (optional): The number of records per page.
-   **Success Response (200 OK)**:
    ```json
    {
      "records": [
        {
          "id": "rec-001",
          "agentName": "John Doe",
          "workId": "AGT001",
          "date": "2024-07-15",
          "timeIn": "08:30",
          "location": "Downtown Office",
          "status": "present",
          "sector": "Life Insurance"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 24
      }
    }
    ```

### Endpoint: `GET /api/manager/attendance/summary`

-   **Description**: Fetches a summary of attendance statistics.
-   **Query Parameters**:
    -   `date` (optional): The date for the daily summary (e.g., `YYYY-MM-DD`). Defaults to the current day.
-   **Success Response (200 OK)**:
    ```json
    {
      "dailySummary": {
        "present": 18,
        "late": 2,
        "absent": 4,
        "attendanceRate": 83
      },
      "weeklyTrend": [
        { "day": "Monday", "rate": 95 },
        { "day": "Tuesday", "rate": 88 },
        { "day": "Wednesday", "rate": 92 }
      ]
    }
    ```

### Endpoint: `GET /api/manager/performance`

-   **Description**: Fetches a comprehensive performance overview, including KPIs, group performance, and individual agent performance.
-   **Query Parameters**:
    -   `period` (optional): The time period for the data (e.g., `weekly`, `monthly`, `all_time`). Defaults to `weekly`.
-   **Success Response (200 OK)**:
    ```json
    {
      "kpi": {
        "totalClients": 223,
        "topAgent": { "name": "John Doe", "clients": 45 },
        "topGroup": { "name": "Alpha Team", "clients": 125 },
        "topLocation": "Downtown Sector"
      },
      "groupPerformance": [ { ... } ], // Array of group performance objects
      "individualPerformance": [ { ... } ], // Array of individual agent performance objects
      "groupChartData": [ { "date": "Mon", "clients": 15 } ] // Chart data for a default or overall view
    }
    ```

### Endpoint: `GET /api/manager/performance/clients`

-   **Description**: Fetches a paginated list of all clients collected by the manager's agents.
-   **Query Parameters**:
    -   `page` (optional): The page number for pagination.
    -   `limit` (optional): The number of records per page.
    -   `search` (optional): A search term to filter by client name or national ID.
-   **Success Response (200 OK)**:
    ```json
    {
      "clients": [
        {
          "fullName": "Client One",
          "nationalId": "123456789",
          "phoneNumber": "555-0101",
          "location": "Downtown, Central Plaza",
          "agentName": "John Doe"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 223
      }
    }
    ```

## 5. Admin Endpoints

These endpoints are for users with the `admin` role.

### Endpoint: `GET /api/admin/dashboard`

-   **Description**: Fetches aggregate data for the main admin dashboard.
-   **Success Response (200 OK)**:
    ```json
    {
      "userActivity": {
        "managers": { "count": 12, "change": "+2" },
        "agents": { "count": 156, "change": "+8" },
        "activeToday": { "count": 89, "change": "+12" },
        "notificationsSent": { "count": 234, "change": "+45" }
      },
      "systemMetrics": [
        { "name": "Jan", "users": 45, "activity": 78 },
        { "name": "Feb", "users": 52, "activity": 85 }
      ],
      "recentActivities": [
        {
          "action": "New Manager Created",
          "user": "John Smith",
          "time": "2024-07-15T14:30:00Z",
          "type": "success"
        },
        {
          "action": "Agent Deactivated",
          "user": "Sarah Johnson",
          "time": "2024-07-15T14:15:00Z",
          "type": "warning"
        }
      ]
    }
    ```

### Endpoint: `GET /api/admin/users`

-   **Description**: Fetches a paginated list of all users in the system.
-   **Query Parameters**:
    -   `role` (optional): Filter by user role (`manager`, `agent`).
    -   `status` (optional): Filter by status (`active`, `inactive`).
    -   `search` (optional): A search term to filter by name, email, or work ID.
    -   `page` (optional): The page number for pagination.
    -   `limit` (optional): The number of records per page.
-   **Success Response (200 OK)**:
    ```json
    {
      "users": [
        {
          "id": "1",
          "name": "John Smith",
          "email": "john.smith@company.com",
          "workId": "MGR001",
          "role": "manager",
          "status": "active",
          "lastLogin": "2024-07-15T12:30:00Z",
          "details": {
            "agentsCount": 12
          }
        },
        {
          "id": "3",
          "name": "Mike Wilson",
          "email": "mike.wilson@company.com",
          "workId": "AGT001",
          "role": "agent",
          "status": "active",
          "lastLogin": "2024-07-15T14:00:00Z",
          "details": {
            "group": "Alpha Team"
          }
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 5
      }
    }
    ```

### Endpoint: `GET /api/admin/managers`

-   **Description**: Retrieves a list of all managers in the system.
-   **Success Response (200 OK)**:
    ```json
    [
      {
        "id": "mgr-001",
        "firstName": "Robert",
        "lastName": "Brown",
        "email": "robert.brown@company.com",
        "phoneNumber": "+1-202-555-0107",
        "nationalId": "1122334455",
        "workId": "MGR001",
        "status": "active",
        "agentsCount": 24,
        "lastLogin": "2024-07-10T14:20:00Z",
        "createdAt": "2023-11-20"
      }
    ]
    ```

### Endpoint: `POST /api/admin/managers`

-   **Description**: Creates a new manager.
-   **Request Body**:
    ```json
    {
      "firstName": "Emily",
      "lastName": "White",
      "email": "emily.white@company.com",
      "password": "a-strong-password",
      "phoneNumber": "+1-202-555-0108",
      "nationalId": "5566778899",
      "workId": "MGR002"
    }
    ```
-   **Success Response (201 Created)**: Returns the newly created manager object.

### Endpoint: `PUT /api/admin/managers/:id`

-   **Description**: Updates an existing manager's information.
-   **Request Body**: A partial manager object with fields to update (e.g., `firstName`, `lastName`, `email`, `password`, etc.).
    ```json
    {
      "email": "emily.w@company.com",
      "password": "a-new-strong-password"
    }
    ```
-   **Success Response (200 OK)**: Returns the full, updated manager object.

### Endpoint: `DELETE /api/admin/managers/:id`

-   **Description**: Deletes a manager.
-   **Success Response (204 No Content)**.

### Endpoint: `POST /api/admin/notifications`

-   **Description**: Sends a new notification to a specified group of users.
-   **Request Body**:
    ```json
    {
      "title": "Important Update",
      "message": "Please be aware of the new system changes.",
      "recipient": "All Users",
      "priority": "high"
    }
    ```
-   **Success Response (201 Created)**: Returns the newly created notification object.

### Endpoint: `GET /api/admin/notifications`

-   **Description**: Retrieves a paginated history of all sent notifications.
-   **Query Parameters**:
    -   `page` (optional): The page number for pagination.
    -   `limit` (optional): The number of records per page.
-   **Success Response (200 OK)**:
    ```json
    {
      "notifications": [
        {
          "id": "1",
          "title": "System Maintenance",
          "message": "Scheduled maintenance on Sunday 2 AM - 4 AM",
          "recipient": "All Users",
          "status": "sent",
          "sentAt": "2024-07-15T10:30:00Z",
          "readBy": 45,
          "totalRecipients": 50
        }
      ],
      "stats": {
        "totalSent": 2,
        "thisWeek": 5,
        "readRate": 0.89
      },
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 2
      }
    }
    ```

### Endpoint: `GET /api/admin/logs`

-   **Description**: Retrieves a paginated list of system logs, with support for filtering and exporting.
-   **Query Parameters**:
    -   `level` (optional): Filter by log level (`info`, `warning`, `error`, `success`).
    -   `category` (optional): Filter by category (`auth`, `system`, `user`, `security`).
    -   `search` (optional): A search term for the log message, user, or details.
    -   `page` (optional): The page number for pagination.
    -   `limit` (optional): The number of records per page.
    -   `export` (optional): Set to `csv` to download the filtered logs as a CSV file.
-   **Success Response (200 OK)**:
    ```json
    {
      "logs": [
        {
          "id": "1",
          "timestamp": "2024-07-15T10:30:45Z",
          "level": "info",
          "category": "auth",
          "message": "User login successful",
          "user": "john.smith@company.com",
          "ip": "192.168.1.100",
          "details": "Manager login from desktop"
        }
      ],
      "stats": {
        "errorCount": 1,
        "warningCount": 1,
        "infoCount": 2,
        "successCount": 1
      },
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 5
      }
    }
    ```

### Endpoint: `GET /api/admin/settings`

-   **Description**: Retrieves all current system-wide settings.
-   **Success Response (200 OK)**:
    ```json
    {
      "companyName": "Prime Management Corp",
      "companyEmail": "admin@primemanagement.com",
      "timezone": "UTC-5",
      "dateFormat": "MM/DD/YYYY",
      "passwordMinLength": 8,
      "requireTwoFactor": false,
      "sessionTimeout": 30,
      "maxLoginAttempts": 5,
      "emailNotifications": true,
      "smsNotifications": false,
      "pushNotifications": true,
      "notificationFrequency": "immediate",
      "attendanceWindow": 3,
      "attendanceStartTime": "06:00",
      "attendanceEndTime": "09:00",
      "lateThreshold": 15,
      "backupFrequency": "daily",
      "logRetention": 30,
      "maintenanceMode": false,
      "debugMode": false
    }
    ```

### Endpoint: `PUT /api/admin/settings`

-   **Description**: Updates system settings. Accepts a partial settings object.
-   **Request Body**:
    ```json
    {
      "sessionTimeout": 60,
      "maintenanceMode": true
    }
    ```
-   **Success Response (200 OK)**: Returns the full, updated settings object.

## API Documentation

The API documentation will be generated using Swagger and will be available at `/api-docs`.
