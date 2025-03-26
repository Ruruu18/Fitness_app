import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Image,
  Vibration,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import * as api from '../services/api';
import CountdownTimer from '../components/CountdownTimer';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';

// Get dimensions for responsive sizing
const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useContext(AuthContext);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerIntervalId, setTimerIntervalId] = useState(null);
  const [sound, setSound] = useState();
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');

  // Add a reference for the finish sound
  const [finishSound, setFinishSound] = useState(null);

  // Re-fetch workouts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchWorkouts();
      }
      return () => {};
    }, [user])
  );

  useEffect(() => {
    if (user) {
      fetchWorkouts();
    }
  }, [user]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const response = await api.getWorkouts(user.id);
      if (response.success) {
        setWorkouts(response.workouts);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
      Alert.alert('Error', 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkout = () => {
    setEditMode(false);
    setCurrentWorkout(null);
    resetForm();
    setModalVisible(true);
  };

  const handleEditWorkout = (workout) => {
    setEditMode(true);
    setCurrentWorkout(workout);
    setTitle(workout.title);
    setDescription(workout.description || '');
    setDate(workout.workout_date.split('T')[0]);
    setDuration(workout.duration ? workout.duration.toString() : '');
    setCalories(workout.calories ? workout.calories.toString() : '');
    setModalVisible(true);
  };

  const handleDeleteWorkout = async (workoutId) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.deleteWorkout(workoutId);
              if (response.success) {
                setWorkouts(workouts.filter(w => w.id !== workoutId));
                Alert.alert('Success', 'Workout deleted successfully');
              }
            } catch (error) {
              console.error('Error deleting workout:', error);
              Alert.alert('Error', 'Failed to delete workout');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setDuration('');
    setCalories('');
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return false;
    }
    if (!date.trim()) {
      Alert.alert('Error', 'Date is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const workoutData = {
        userId: user.id,
        title,
        description,
        date,
        duration: duration ? parseInt(duration) : null,
        calories: calories ? parseInt(calories) : null,
      };

      if (editMode && currentWorkout) {
        const response = await api.updateWorkout(currentWorkout.id, workoutData);
        if (response.success) {
          setWorkouts(
            workouts.map(w =>
              w.id === currentWorkout.id
                ? { ...w, ...workoutData, workout_date: date }
                : w
            )
          );
          Alert.alert('Success', 'Workout updated successfully');
        }
      } else {
        const response = await api.addWorkout(workoutData);
        if (response.success) {
          const newWorkout = {
            id: response.workoutId,
            user_id: user.id,
            title,
            description,
            workout_date: date,
            duration: duration ? parseInt(duration) : null,
            calories: calories ? parseInt(calories) : null,
            created_at: new Date().toISOString(),
          };
          setWorkouts([newWorkout, ...workouts]);
          Alert.alert('Success', 'Workout added successfully');
        }
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
            navigation.navigate('Login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Play alarm sound using device beeps
  const playAlarmSound = async () => {
    try {
      // Create a sound pattern with different notes
      const playNote = async (frequency, duration) => {
        const { sound } = await Audio.Sound.createAsync(
          { uri: `data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAIAQB8AAEAfAAABAAgAAABMSVNUEAAAAENVRUy/AAAASVBLTQAAAAAAAAAAAEZJTEUAAAAA` },
          { 
            shouldPlay: true,
            volume: 1.0,
            positionMillis: 0,
            pitchCorrectionQuality: Audio.PitchCorrectionQuality.High,
            androidImplementation: 'MediaPlayer',
            rate: frequency / 440,
            ios: { 
              mixWithOthers: false,
              playsInSilentMode: true
            }
          }
        );
        
        setSound(sound);
        await new Promise(resolve => setTimeout(resolve, duration));
        await sound.unloadAsync();
      };
      
      // Play a sequence of notes to create an alarm effect
      await playNote(880, 300); // A5
      await playNote(0, 100);   // brief pause
      await playNote(880, 300); // A5
      await playNote(0, 100);   // brief pause
      await playNote(880, 300); // A5
      await playNote(0, 100);   // brief pause
      await playNote(1046.50, 600); // C6 (higher note to end)
      
    } catch (error) {
      console.error('Error playing alarm sound:', error);
    }
  };

  // Add function to play countdown sound
  const playCountdownSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/starting.mp3'),
        { shouldPlay: true }
      );
      await sound.playAsync();
      // Unload the sound when finished
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          await sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing countdown sound:', error);
    }
  };

  // Add function to play finish sound
  const playFinishSound = async () => {
    try {
      // Stop any existing finish sound first
      if (finishSound) {
        try {
        await finishSound.stopAsync();
        await finishSound.unloadAsync();
        } catch (e) {
          console.log('Error cleaning up previous sound:', e);
        }
        setFinishSound(null);
      }
      
      // Play the finish sound with looping until stopped
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/finish.mp3'),
        { 
          shouldPlay: true, 
          volume: 1.0,
          isLooping: true, // Make it loop until manually stopped
        }
      );
      
      // Don't set up auto-unloading here
      // Just keep the sound playing until explicitly stopped
      setFinishSound(sound);
    } catch (error) {
      console.error('Error playing finish sound:', error);
    }
  };

  // Add function to stop finish sound
  const stopFinishSound = async () => {
    if (finishSound) {
      try {
        // Don't check status - just try to stop and handle errors
          await finishSound.stopAsync();
          await finishSound.unloadAsync();
      } catch (error) {
        console.log('Error stopping sound (this is expected if sound completed):', error);
      } finally {
        // Always clear the reference, regardless of errors
        setFinishSound(null);
      }
    }
  };

  // Start workout with countdown
  const handleStartWorkout = (workout) => {
    setActiveWorkout(workout);
    // Convert duration from minutes to seconds
    const durationInSeconds = workout.duration * 60;
    setTimeRemaining(durationInSeconds);
    setTimerModalVisible(true);
    
    // Start the countdown
    setCountdownActive(true);
    setCountdownValue(3);
    
    // Play the countdown sound
    playCountdownSound();
    
    // Set up the countdown timer
    let count = 3;
    const countdownInterval = setInterval(() => {
      count -= 1;
      setCountdownValue(count);
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        setCountdownActive(false);
        startTimer(); // Start the actual workout timer after countdown
      }
    }, 1000);
  };

  // Modify startTimer to use the finish sound and stop it when clicking "Great!"
  const startTimer = () => {
    setTimerActive(true);
    const intervalId = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          setTimerActive(false);
          
          // Trigger vibration pattern
          Vibration.vibrate([0, 500, 500, 500, 500, 500, 500, 500, 500]);
          
          // Play finish sound
          playFinishSound();
          
          // Show completion alert
          Alert.alert(
            'Workout Complete!',
            `You've completed your ${activeWorkout?.title} workout!`,
            [{ 
              text: 'Great!',
              onPress: () => {
                console.log('Stopping finish sound...');
                stopFinishSound();
              }
            }]
          );
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    setTimerIntervalId(intervalId);
  };

  // Pause the timer
  const pauseTimer = () => {
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerActive(false);
    }
  };

  // Reset the timer
  const resetTimer = () => {
    pauseTimer();
    if (activeWorkout) {
      setTimeRemaining(activeWorkout.duration * 60);
    }
  };

  // Close the timer modal
  const closeTimer = () => {
    pauseTimer();
    stopFinishSound(); // Add this to ensure sound stops when closing modal
    setTimerModalVisible(false);
    setActiveWorkout(null);
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderWorkoutItem = ({ item }) => {
    // Format the date for display
    const formattedDate = new Date(item.workout_date).toLocaleDateString();
    
    return (
      <View style={styles.workoutCard}>
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.title}
          </Text>
          <Text style={styles.workoutDate}>{formattedDate}</Text>
        </View>
        
        {item.description ? (
          <Text style={styles.workoutDescription} numberOfLines={2} ellipsizeMode="tail">
            {item.description}
          </Text>
        ) : null}
        
        <View style={styles.workoutStats}>
          {item.duration ? (
            <View style={styles.statContainer}>
              <Image 
                source={require('../../assets/images/icons/clock.png')} 
                style={styles.statIcon}
                resizeMode="contain"
              />
              <Text style={styles.statText}>{item.duration} min</Text>
            </View>
          ) : null}
          
          {item.calories ? (
            <View style={styles.statContainer}>
              <Image 
                source={require('../../assets/images/icons/fire.png')} 
                style={styles.statIcon}
                resizeMode="contain"
              />
              <Text style={styles.statText}>{item.calories} kcal</Text>
            </View>
          ) : null}
        </View>
        
        <View style={styles.workoutActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={() => handleStartWorkout(item)}
          >
            <Text style={styles.actionButtonText}>Start</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditWorkout(item)}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteWorkout(item.id)}
          >
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Cleanup resources
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (finishSound) {
        finishSound.unloadAsync();
      }
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
      }
    };
  }, [sound, finishSound, timerIntervalId]);

  const renderLogoutButton = () => {
    return (
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Fitness App</Text>
          {renderLogoutButton()}
        </View>
        
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#F9A826" />
          </View>
        ) : (
          <>
            <FlatList
              data={workouts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderWorkoutItem}
              contentContainerStyle={styles.listContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No workouts yet. Add your first workout!</Text>
                </View>
              }
            />
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddWorkout}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </>
        )}
        
        {/* Add/Edit Workout Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Edit Workout' : 'Add Workout'}
              </Text>
              
              <ScrollView style={styles.formContainer}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Workout Title"
                  placeholderTextColor="#666"
                  value={title}
                  onChangeText={setTitle}
                />
                
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Workout Description (optional)"
                  placeholderTextColor="#666"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                />
                
                <Text style={styles.inputLabel}>Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#666"
                  value={date}
                  onChangeText={setDate}
                />
                
                <Text style={styles.inputLabel}>Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Duration in minutes (optional)"
                  placeholderTextColor="#666"
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                />
                
                <Text style={styles.inputLabel}>Calories Burned</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Calories burned (optional)"
                  placeholderTextColor="#666"
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                />
              </ScrollView>
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
        
        {/* Timer Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={timerModalVisible}
          onRequestClose={closeTimer}
        >
          <View style={styles.timerModalContainer}>
            <View style={styles.timerModalContent}>
              <Text style={styles.timerModalTitle} numberOfLines={1} ellipsizeMode="tail">
                {activeWorkout ? activeWorkout.title : ''} Workout
              </Text>
              
              {countdownActive ? (
                <View style={styles.countdownContainer}>
                  <Text style={styles.countdownText}>{countdownValue}</Text>
                  <Text style={styles.countdownLabel}>Get Ready!</Text>
                </View>
              ) : (
                <CountdownTimer 
                  timeRemaining={timeRemaining}
                  duration={activeWorkout?.duration || 0}
                  size={Math.min(250, width * 0.7)}
                  strokeWidth={15}
                  backgroundColor="#f0f0f0"
                  progressColor="#FF9500"
                  isActive={timerActive}
                />
              )}
              
              <View style={styles.timerButtons}>
                {!countdownActive && (
                  <>
                    {!timerActive ? (
                      <TouchableOpacity
                        style={[styles.timerButton, styles.startTimerButton]}
                        onPress={startTimer}
                      >
                        <Text style={styles.timerButtonText}>
                          {timeRemaining === activeWorkout?.duration * 60 ? 'Start' : 'Resume'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.timerButton, styles.pauseTimerButton]}
                        onPress={pauseTimer}
                      >
                        <Text style={styles.timerButtonText}>Pause</Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                      style={[styles.timerButton, styles.resetTimerButton]}
                      onPress={resetTimer}
                    >
                      <Text style={styles.timerButtonText}>Reset</Text>
                    </TouchableOpacity>
                  </>
                )}
                
                <TouchableOpacity
                  style={[styles.timerButton, styles.cancelTimerButton]}
                  onPress={closeTimer}
                  disabled={countdownActive}
                  opacity={countdownActive ? 0.5 : 1}
                >
                  <Text style={styles.timerButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: isSmallDevice ? 20 : 22,
    fontFamily: 'Raleway-Bold',
    color: '#FFFFFF',
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F9A826',
    borderRadius: 6,
  },
  logoutText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Raleway-Bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Extra space at bottom to avoid FAB overlap
  },
  workoutCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  workoutTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    fontFamily: 'Raleway-Bold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  workoutDate: {
    fontSize: isSmallDevice ? 12 : 14,
    fontFamily: 'Raleway-Regular',
    color: '#AAAAAA',
  },
  workoutDescription: {
    fontSize: isSmallDevice ? 13 : 14,
    fontFamily: 'Raleway-Regular',
    color: '#DDDDDD',
    marginBottom: 10,
  },
  workoutStats: {
    flexDirection: 'row',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 5,
  },
  statIcon: {
    width: 18,
    height: 18,
    marginRight: 5,
    tintColor: '#F9A826',
  },
  statText: {
    fontSize: isSmallDevice ? 13 : 14,
    fontFamily: 'Raleway-Medium',
    color: '#CCCCCC',
  },
  workoutActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingVertical: isSmallDevice ? 5 : 6,
    paddingHorizontal: isSmallDevice ? 10 : 12,
    borderRadius: 6,
    marginLeft: 10,
    marginBottom: 5,
  },
  startButton: {
    backgroundColor: '#4CD964',
  },
  editButton: {
    backgroundColor: '#F9A826',
  },
  deleteButton: {
    backgroundColor: '#ff5252',
  },
  actionButtonText: {
    fontSize: isSmallDevice ? 11 : 12,
    fontFamily: 'Raleway-Bold',
    color: '#fff',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Raleway-Regular',
    color: '#AAAAAA',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#F9A826',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
  },
  addButtonText: {
    fontSize: 30,
    fontFamily: 'Raleway-Bold',
    color: '#fff',
    lineHeight: 34,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
  },
  modalTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontFamily: 'Raleway-Bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    maxHeight: isSmallDevice ? '50%' : '70%',
  },
  inputLabel: {
    fontSize: isSmallDevice ? 13 : 14,
    fontFamily: 'Raleway-SemiBold',
    color: '#DDDDDD',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontFamily: 'Raleway-Regular',
    color: '#FFFFFF',
  },
  textArea: {
    height: isSmallDevice ? 80 : 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: isSmallDevice ? 12 : 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#3D3D3D',
  },
  cancelButtonText: {
    fontSize: isSmallDevice ? 14 : 16,
    fontFamily: 'Raleway-Bold',
    color: '#DDDDDD',
  },
  saveButton: {
    backgroundColor: '#F9A826',
  },
  saveButtonText: {
    fontSize: isSmallDevice ? 14 : 16,
    fontFamily: 'Raleway-Bold',
    color: '#fff',
  },
  
  // Timer modal styles
  timerModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
  },
  timerModalContent: {
    width: '90%',
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: isSmallDevice ? 20 : 25,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  timerModalTitle: {
    fontSize: isSmallDevice ? 20 : 24,
    fontFamily: 'Raleway-Bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#FFFFFF',
    width: '90%',
  },
  timerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  timerButton: {
    paddingVertical: isSmallDevice ? 10 : 12,
    paddingHorizontal: isSmallDevice ? 20 : 24,
    borderRadius: 25,
    marginHorizontal: 5,
    marginBottom: 10,
    minWidth: isSmallDevice ? 90 : 100,
    alignItems: 'center',
  },
  timerButtonText: {
    color: 'white',
    fontFamily: 'Raleway-Bold',
    fontSize: isSmallDevice ? 14 : 16,
  },
  startTimerButton: {
    backgroundColor: '#4CD964',
  },
  pauseTimerButton: {
    backgroundColor: '#FF9500',
  },
  resetTimerButton: {
    backgroundColor: '#007AFF',
  },
  cancelTimerButton: {
    backgroundColor: '#FF3B30',
  },
  countdownContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: Math.min(250, width * 0.7),
    width: Math.min(250, width * 0.7),
    borderRadius: Math.min(125, width * 0.35),
    backgroundColor: '#FF9500',
  },
  countdownText: {
    fontSize: isSmallDevice ? 60 : 80,
    fontWeight: 'bold',
    color: 'white',
  },
  countdownLabel: {
    fontSize: isSmallDevice ? 16 : 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  }
});

export default HomeScreen; 