import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface AttendanceStatus {
  hasMarkedToday: boolean;
  time?: string;
}

interface Timeframe {
  startTime: string;
  endTime: string;
}

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>({ hasMarkedToday: false });
  const [timeframe, setTimeframe] = useState<Timeframe>({ startTime: '5:00 AM', endTime: '5:00 PM' });
  const [timeState, setTimeState] = useState({ isActive: false, isWarning: false, isExpired: false });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [attendanceDetails, setAttendanceDetails] = useState({ location: '', sector: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAttendanceData();
    const interval = setInterval(checkTimeframe, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const loadAttendanceData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockStatus: AttendanceStatus = {
        hasMarkedToday: false,
        time: undefined,
      };
      setAttendanceStatus(mockStatus);
    } catch (error) {
      Alert.alert('Error', 'Failed to load attendance data');
    }
  };

  const checkTimeframe = () => {
    const now = new Date();
    
    // Parse time strings (handle "HH:MM AM/PM" format)
    const parseTime = (timeStr: string) => {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let hour = parseInt(match[1], 10);
        const minute = parseInt(match[2], 10);
        const period = match[3].toUpperCase();
        
        if (period === 'PM' && hour !== 12) {
          hour += 12;
        } else if (period === 'AM' && hour === 12) {
          hour = 0;
        }
        
        return { hour, minute };
      }
      
      // Fallback for "HH:MM" format
      const parts = timeStr.split(":");
      const hour = parseInt(parts[0], 10);
      const minute = parseInt(parts[1], 10);
      return { hour, minute };
    };

    try {
      const startTime = parseTime(timeframe.startTime);
      const endTime = parseTime(timeframe.endTime);

      const startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startTime.hour, startTime.minute);
      const endDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endTime.hour, endTime.minute);

      const warningTime = new Date(endDateTime);
      warningTime.setMinutes(endDateTime.getMinutes() - 15);

      setTimeState({
        isActive: now >= startDateTime && now <= endDateTime,
        isWarning: now > warningTime && now <= endDateTime,
        isExpired: now > endDateTime,
      });
    } catch (error) {
      console.error('Error parsing timeframe:', error);
      setTimeState({ isActive: false, isWarning: false, isExpired: false });
    }
  };

  const handleMarkAttendance = async () => {
    if (!attendanceDetails.location || !attendanceDetails.sector) {
      Alert.alert('Missing Information', 'Please provide both your work location and insurance sector.');
      return;
    }

    try {
      setIsLoading(true);
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setAttendanceStatus({
        hasMarkedToday: true,
        time: new Date().toLocaleTimeString(),
      });
      
      setIsModalVisible(false);
      setAttendanceDetails({ location: '', sector: '' });
      Alert.alert('Success', 'Attendance marked successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark attendance. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceButton = () => {
    if (attendanceStatus.hasMarkedToday) {
      return (
        <TouchableOpacity style={[styles.button, styles.buttonMarked]} disabled>
          <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
          <Text style={styles.buttonText}>
            Attendance Marked{attendanceStatus.time ? ` at ${attendanceStatus.time}` : ''}
          </Text>
        </TouchableOpacity>
      );
    }

    if (timeState.isExpired) {
      return (
        <TouchableOpacity style={[styles.button, styles.buttonExpired]} disabled>
          <IconSymbol name="xmark.circle.fill" size={20} color="white" />
          <Text style={styles.buttonText}>Time Expired</Text>
        </TouchableOpacity>
      );
    }

    if (timeState.isActive) {
      return (
        <TouchableOpacity
          style={[styles.button, styles.buttonActive]}
          onPress={() => setIsModalVisible(true)}
        >
          <IconSymbol name="clock.fill" size={20} color="white" />
          <Text style={styles.buttonText}>Mark Attendance</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={[styles.button, styles.buttonDisabled]} disabled>
        <IconSymbol name="clock.fill" size={20} color="#9ca3af" />
        <Text style={[styles.buttonText, styles.buttonTextDisabled]}>
          Mark Attendance (Disabled)
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
        <Text style={styles.subtitle}>Mark your daily attendance</Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <IconSymbol name="clock.fill" size={24} color="#3b82f6" />
          <Text style={styles.statusTitle}>Today's Status</Text>
        </View>
        
        <View style={styles.statusContent}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[
              styles.statusValue,
              attendanceStatus.hasMarkedToday ? styles.statusMarked : styles.statusPending
            ]}>
              {attendanceStatus.hasMarkedToday ? 'Marked' : 'Pending'}
            </Text>
          </View>
          
          {attendanceStatus.time && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Time:</Text>
              <Text style={styles.statusValue}>{attendanceStatus.time}</Text>
            </View>
          )}
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Window:</Text>
            <Text style={styles.statusValue}>{timeframe.startTime} - {timeframe.endTime}</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {getAttendanceButton()}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Attendance Guidelines</Text>
        <Text style={styles.infoText}>
          • Attendance can only be marked during the designated time window
        </Text>
        <Text style={styles.infoText}>
          • You must provide your work location and insurance sector
        </Text>
        <Text style={styles.infoText}>
          • Attendance can only be marked once per day
        </Text>
        <Text style={styles.infoText}>
          • Late attendance may affect your performance metrics
        </Text>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mark Attendance</Text>
            <Text style={styles.modalSubtitle}>
              Please provide your work location and insurance sector for today.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Work Location</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Downtown Office"
                value={attendanceDetails.location}
                onChangeText={(text) => setAttendanceDetails({ ...attendanceDetails, location: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Insurance Sector</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Life Insurance"
                value={attendanceDetails.sector}
                onChangeText={(text) => setAttendanceDetails({ ...attendanceDetails, sector: text })}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm, isLoading && styles.modalButtonDisabled]}
                onPress={handleMarkAttendance}
                disabled={isLoading}
              >
                <Text style={styles.modalButtonTextConfirm}>
                  {isLoading ? 'Marking...' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  statusCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  statusContent: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusMarked: {
    color: '#10b981',
  },
  statusPending: {
    color: '#f59e0b',
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 0,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonActive: {
    backgroundColor: '#ef4444',
  },
  buttonMarked: {
    backgroundColor: '#10b981',
  },
  buttonExpired: {
    backgroundColor: '#6b7280',
  },
  buttonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#9ca3af',
  },
  infoCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f3f4f6',
  },
  modalButtonConfirm: {
    backgroundColor: '#3b82f6',
  },
  modalButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  modalButtonTextCancel: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
