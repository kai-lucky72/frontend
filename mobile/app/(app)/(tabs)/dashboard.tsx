import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface DashboardData {
  recentActivities?: Array<{ id: string; description: string; timestamp: string }>;
  groupName?: string;
  teamLeader?: string;
  agentsCount?: number;
  groupsCount?: number;
  totalUsers?: number;
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with actual API call
      const mockData: DashboardData = {
        recentActivities: [
          { id: '1', description: 'Marked attendance', timestamp: '2024-01-15 09:00' },
          { id: '2', description: 'Updated timeframe', timestamp: '2024-01-15 08:30' },
        ],
        groupName: user?.groupName || 'Alpha Team',
        teamLeader: 'John Doe',
        agentsCount: 12,
        groupsCount: 0,
        totalUsers: 45,
      };
      setDashboardData(mockData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const renderAdminDashboard = () => (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>System Overview</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <IconSymbol name="person.2.fill" size={24} color="#3b82f6" />
          <Text style={styles.statNumber}>{dashboardData.totalUsers || 0}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <IconSymbol name="person.3.fill" size={24} color="#10b981" />
          <Text style={styles.statNumber}>{dashboardData.agentsCount || 0}</Text>
          <Text style={styles.statLabel}>Active Agents</Text>
        </View>
        <View style={styles.statCard}>
          <IconSymbol name="chart.bar.fill" size={24} color="#f59e0b" />
          <Text style={styles.statNumber}>{dashboardData.groupsCount || 0}</Text>
          <Text style={styles.statLabel}>Groups</Text>
        </View>
        
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        {dashboardData.recentActivities?.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <Text style={styles.activityText}>{activity.description}</Text>
            <Text style={styles.activityTime}>{activity.timestamp}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderManagerDashboard = () => (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.title}>Manager Dashboard</Text>
        <Text style={styles.subtitle}>Team Overview</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <IconSymbol name="person.3.fill" size={24} color="#3b82f6" />
          <Text style={styles.statNumber}>{dashboardData.agentsCount || 0}</Text>
          <Text style={styles.statLabel}>Team Members</Text>
        </View>
        
        <View style={styles.statCard}>
          <IconSymbol name="chart.line.uptrend.xyaxis" size={24} color="#ef4444" />
          <Text style={styles.statNumber}>85%</Text>
          <Text style={styles.statLabel}>Performance</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Team Information</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Group Name:</Text>
          <Text style={styles.infoValue}>{dashboardData.groupName}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Team Leader:</Text>
          <Text style={styles.infoValue}>{dashboardData.teamLeader}</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderAgentDashboard = () => (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.title}>Agent Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back, {user?.firstName}!</Text>
      </View>

      <View style={styles.statsGrid}>
        
        <View style={styles.statCard}>
          <IconSymbol name="chart.bar.fill" size={24} color="#f59e0b" />
          <Text style={styles.statNumber}>92%</Text>
          <Text style={styles.statLabel}>Performance</Text>
        </View>
        <View style={styles.statCard}>
          <IconSymbol name="clock.fill" size={24} color="#ef4444" />
          <Text style={styles.statNumber}>8:30</Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </View>
      </View>

      {user?.agentType === 'sales' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Information</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Group:</Text>
            <Text style={styles.infoValue}>{dashboardData.groupName}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Team Leader:</Text>
            <Text style={styles.infoValue}>{dashboardData.teamLeader}</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>
        {dashboardData.recentActivities?.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <Text style={styles.activityText}>{activity.description}</Text>
            <Text style={styles.activityTime}>{activity.timestamp}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return renderAdminDashboard();
      case 'manager':
        return renderManagerDashboard();
      case 'agent':
        return renderAgentDashboard();
      default:
        return renderAgentDashboard();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return renderDashboard();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  activityItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activityText: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#64748b',
  },
});
