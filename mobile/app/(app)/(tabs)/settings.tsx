import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  const handleSettingChange = (setting: string, value: boolean) => {
    switch (setting) {
      case 'notifications':
        setNotificationsEnabled(value);
        break;
      case 'darkMode':
        setDarkModeEnabled(value);
        break;
      case 'autoSync':
        setAutoSyncEnabled(value);
        break;
    }
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'This feature will export all system data to a file.');
  };

  const handleBackupData = () => {
    Alert.alert('Backup Data', 'This feature will create a backup of all system data.');
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the app cache? This will free up storage space.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive' },
      ]
    );
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    description: string,
    type: 'switch' | 'button',
    value?: boolean,
    onPress?: () => void
  ) => (
    <View style={styles.settingCard}>
      <View style={styles.settingRow}>
        <View style={styles.settingIcon}>
          <IconSymbol name={icon} size={20} color="#3b82f6" />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingLabel}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
        {type === 'switch' && (
          <Switch
            value={value}
            onValueChange={(newValue) => onPress && onPress()}
            trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
            thumbColor={value ? 'white' : '#f3f4f6'}
          />
        )}
        {type === 'button' && (
          <IconSymbol name="chevron.right" size={16} color="#9ca3af" />
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage system preferences</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        {renderSettingItem(
          'house.fill',
          'Push Notifications',
          'Receive notifications for important updates',
          'switch',
          notificationsEnabled,
          () => handleSettingChange('notifications', !notificationsEnabled)
        )}
        
        {renderSettingItem(
          'house.fill',
          'Dark Mode',
          'Switch between light and dark themes',
          'switch',
          darkModeEnabled,
          () => handleSettingChange('darkMode', !darkModeEnabled)
        )}
        
        {renderSettingItem(
          'house.fill',
          'Auto Sync',
          'Automatically sync data in the background',
          'switch',
          autoSyncEnabled,
          () => handleSettingChange('autoSync', !autoSyncEnabled)
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity onPress={handleExportData}>
          {renderSettingItem(
            'house.fill',
            'Export Data',
            'Export all system data to a file',
            'button'
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleBackupData}>
          {renderSettingItem(
            'house.fill',
            'Backup Data',
            'Create a backup of all system data',
            'button'
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleClearCache}>
          {renderSettingItem(
            'house.fill',
            'Clear Cache',
            'Free up storage space by clearing cache',
            'button'
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Information</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <IconSymbol name="house.fill" size={20} color="#3b82f6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>App Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <IconSymbol name="house.fill" size={20} color="#3b82f6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Company</Text>
              <Text style={styles.infoValue}>Prime Agent Management</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <IconSymbol name="house.fill" size={20} color="#3b82f6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>API Endpoint</Text>
                              <Text style={styles.infoValue}>http://10.50.0.50:5238</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity>
          {renderSettingItem(
            'house.fill',
            'Help & Documentation',
            'Access help guides and documentation',
            'button'
          )}
        </TouchableOpacity>
        
        <TouchableOpacity>
          {renderSettingItem(
            'house.fill',
            'Contact Support',
            'Get in touch with our support team',
            'button'
          )}
        </TouchableOpacity>
        
        <TouchableOpacity>
          {renderSettingItem(
            'house.fill',
            'Rate App',
            'Rate us on the app store',
            'button'
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        
        <TouchableOpacity>
          {renderSettingItem(
            'house.fill',
            'Privacy Policy',
            'Read our privacy policy',
            'button'
          )}
        </TouchableOpacity>
        
        <TouchableOpacity>
          {renderSettingItem(
            'house.fill',
            'Terms of Service',
            'Read our terms of service',
            'button'
          )}
        </TouchableOpacity>
      </View>
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
  settingCard: {
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  infoCard: {
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
});
