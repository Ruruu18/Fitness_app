import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { testConnection, getCurrentApiUrl } from '../services/api';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const [serverIp, setServerIp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [currentApiUrl, setCurrentApiUrl] = useState('');
  const [defaultApiUrl, setDefaultApiUrl] = useState('');
  const [easApiUrl, setEasApiUrl] = useState('');
  const navigation = useNavigation();
  
  useEffect(() => {
    loadServerIp();
    loadApiDetails();
  }, []);
  
  const loadServerIp = async () => {
    try {
      const savedIp = await AsyncStorage.getItem('API_URL');
      if (savedIp) {
        setServerIp(savedIp);
      }
    } catch (error) {
      console.error('Error loading server IP:', error);
    }
  };
  
  const loadApiDetails = async () => {
    try {
      const { url, defaultUrl, easUrl } = await getCurrentApiUrl();
      setCurrentApiUrl(url);
      setDefaultApiUrl(defaultUrl);
      setEasApiUrl(easUrl);
    } catch (error) {
      console.error('Error getting API URL details:', error);
    }
  };
  
  const saveServerIp = async () => {
    try {
      if (!serverIp) {
        Alert.alert('Error', 'Please enter a valid server IP');
        return;
      }
      
      // Remove trailing slash if present
      let formattedUrl = serverIp;
      if (formattedUrl.endsWith('/')) {
        formattedUrl = formattedUrl.slice(0, -1);
      }
      
      // Ensure URL has http:// or https://
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `http://${formattedUrl}`;
      }
      
      // Save the formatted server IP
      await AsyncStorage.setItem('API_URL', formattedUrl);
      setServerIp(formattedUrl);
      
      // Reload API details
      loadApiDetails();
      
      Alert.alert('Success', 'Server IP saved successfully. Please restart the app to apply changes.');
    } catch (error) {
      console.error('Error saving server IP:', error);
      Alert.alert('Error', 'Failed to save server IP');
    }
  };
  
  const testServerConnection = async () => {
    try {
      setIsLoading(true);
      setConnectionStatus(null);
      
      if (!serverIp) {
        Alert.alert('Error', 'Please enter a server IP first');
        setIsLoading(false);
        return;
      }
      
      // Format URL for testing
      let testUrl = serverIp;
      if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
        testUrl = `http://${testUrl}`;
      }
      
      // Test the connection
      const result = await testConnection(testUrl);
      
      if (result.success) {
        setConnectionStatus('connected');
        Alert.alert('Success', 'Connected to server successfully!');
      } else {
        setConnectionStatus('failed');
        Alert.alert('Connection Failed', `Could not connect to server: ${result.error}`);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setConnectionStatus('failed');
      Alert.alert('Error', 'Connection test failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const presetLocalhost = () => {
    if (Platform.OS === 'android') {
      setServerIp('http://10.0.2.2:3001');
    } else {
      setServerIp('http://localhost:3001');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Server Settings</Text>
          </View>
          
          <Text style={styles.label}>Server IP Address:</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="http://192.168.1.5:3001"
              placeholderTextColor="#666"
              value={serverIp}
              onChangeText={setServerIp}
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            {connectionStatus === 'connected' && (
              <View style={styles.statusIndicator}>
                <View style={styles.statusDotConnected} />
              </View>
            )}
            
            {connectionStatus === 'failed' && (
              <View style={styles.statusIndicator}>
                <View style={styles.statusDotFailed} />
              </View>
            )}
          </View>
          
          <Text style={styles.helpText}>
            Enter your server's IP address including the port.
            {"\n"}Example: http://192.168.1.5:3001
          </Text>
          
          <View style={styles.connectionInfoContainer}>
            <Text style={styles.infoSectionTitle}>Connection Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current API URL:</Text>
              <Text style={styles.infoValue}>{currentApiUrl}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Default URL:</Text>
              <Text style={styles.infoValue}>{defaultApiUrl}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>EAS Build URL:</Text>
              <Text style={styles.infoValue}>{easApiUrl}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Platform:</Text>
              <Text style={styles.infoValue}>{Platform.OS}</Text>
            </View>
          </View>
          
          <View style={styles.presetContainer}>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={presetLocalhost}
            >
              <Text style={styles.presetButtonText}>Use Localhost/Emulator</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.testButton]}
              onPress={testServerConnection}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>Test Connection</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]}
              onPress={saveServerIp}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>How to connect from a real device:</Text>
            <Text style={styles.infoText}>
              1. Make sure your phone and computer are on the same WiFi network
            </Text>
            <Text style={styles.infoText}>
              2. On your computer running the server, find your local IP address
            </Text>
            <Text style={styles.infoText}>
              3. Type 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux) in terminal
            </Text>
            <Text style={styles.infoText}>
              4. Look for IPv4 address like 192.168.x.x
            </Text>
            <Text style={styles.infoText}>
              5. Enter http://YOUR_IP_ADDRESS:3001
            </Text>
            <Text style={styles.infoText}>
              6. Make sure your server is running and your computer's firewall allows connections
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  connectionInfoContainer: {
    backgroundColor: '#2C2C2C',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  infoLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    width: 100,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  presetContainer: {
    marginBottom: 15,
  },
  presetButton: {
    backgroundColor: '#2C2C2C',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  presetButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButton: {
    backgroundColor: '#2E5BFF',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusIndicator: {
    marginLeft: 10,
    marginBottom: 8,
  },
  statusDotConnected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CD964',
  },
  statusDotFailed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
  },
  infoContainer: {
    backgroundColor: '#2C2C2C',
    padding: 15,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
});

export default SettingsScreen; 