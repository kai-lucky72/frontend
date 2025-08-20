# Prime Agent Management - Mobile App

A React Native mobile application for the Prime Agent Management system, built with Expo.

## Features

### 🔐 Authentication
- Login with email, work ID, and role
- Role-based access control (Admin, Manager, Agent)
- Secure token storage with AsyncStorage
- Automatic session management

### 📊 Role-Based Dashboards

#### **Admin Dashboard**
- System overview with user statistics
- Total users, active agents, groups count
- Recent activities tracking
- System-wide performance metrics

#### **Manager Dashboard**
- Team overview and performance
- Agent management
- Attendance monitoring
- Group performance tracking

#### **Agent Dashboard**
- Personal performance metrics
- Client statistics
- Attendance status
- Recent activities

### ⏰ Attendance System
- Mark daily attendance with location and sector
- Time window validation (5:00 AM - 5:00 PM)
- Attendance status tracking
- Real-time time checking

### 👥 Client Management (Agents)
- Add new clients with detailed information
- View client list with status tracking
- Client statistics and performance
- Search and filter capabilities

### 👤 User Management (Admin)
- View all system users
- Search and filter users
- Role-based user categorization
- User status tracking

### ⚙️ Settings (Admin)
- App preferences management
- Data export and backup
- System information
- Support and legal information

### 👤 Profile Management
- User profile information
- Account settings
- Logout functionality
- Role and group information

## Project Structure

```
mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx          # Login screen
│   │   └── _layout.tsx        # Auth layout
│   ├── (app)/
│   │   ├── (tabs)/
│   │   │   ├── dashboard.tsx  # Role-based dashboard
│   │   │   ├── attendance.tsx # Attendance management
│   │   │   ├── clients.tsx    # Client management
│   │   │   ├── users.tsx      # User management (Admin)
│   │   │   ├── settings.tsx   # Settings (Admin)
│   │   │   ├── profile.tsx    # User profile
│   │   │   └── _layout.tsx    # Tab navigation
│   │   └── _layout.tsx        # App layout
│   └── _layout.tsx            # Root layout
├── components/
│   ├── ui/
│   │   └── IconSymbol.tsx     # Icon component
│   └── ...                    # Other components
├── contexts/
│   └── AuthContext.tsx        # Authentication context
└── ...
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on device/simulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

### Demo Credentials

Use these credentials to test different roles:

- **Admin:** admin@company.com | ADM001
- **Manager:** manager@company.com | MGR001
- **Individual Agent:** agent@company.com | AGT001
- **Sales Agent:** sales@company.com | AGT002

## Key Features

### 🔄 Real-time Updates
- Live attendance status checking
- Automatic data synchronization
- Real-time performance metrics

### 📱 Mobile-Optimized UI
- Responsive design for all screen sizes
- Touch-friendly interface
- Native mobile components
- Smooth animations and transitions

### 🔒 Security
- Secure authentication flow
- Token-based session management
- Role-based access control
- Data encryption in storage

### 📊 Data Management
- Offline data caching
- Automatic data synchronization
- Export and backup capabilities
- Cache management

## API Integration

The mobile app is designed to work with the same backend API as the web application:

- **Base URL:** `http://localhost:5238/api`
- **Authentication:** JWT token-based
- **Data Format:** JSON
- **Error Handling:** Comprehensive error management

## Development Notes

### State Management
- React Context for authentication
- Local state for component-specific data
- AsyncStorage for persistent data

### Navigation
- Expo Router for file-based routing
- Tab navigation for main app sections
- Stack navigation for authentication flow

### Styling
- StyleSheet for component styling
- Consistent design system
- Responsive layouts
- Platform-specific optimizations

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues:**
   ```bash
   npx expo start --clear
   ```

2. **Dependencies issues:**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **iOS Simulator issues:**
   ```bash
   npx expo run:ios
   ```

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow React Native best practices
4. Test on both iOS and Android
5. Update documentation for new features

## License

This project is part of the Prime Agent Management system.
