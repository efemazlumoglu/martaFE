import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import ActionSheet from 'react-native-action-sheet';
import DatePicker from 'react-native-date-picker';
import {formatDate} from '../libs/formatDate';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {uuidv4} from '@firebase/util';
import {useRoute} from '@react-navigation/native';
import CheckBox from '@react-native-community/checkbox';
import * as ImagePicker from 'react-native-image-picker';

const AddTaskScreen = ({navigation}) => {
  const route = useRoute();
  const {
    isUpdate,
    taskId,
    taskN,
    taskDesc,
    taskPrio,
    taskDueDate,
    taskCompleted,
    taskImage,
  } = route.params;
  const [isChecked, setIsChecked] = useState(false);
  const [taskName, setTaskName] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [taskPriority, setTaskPriority] = useState<string>('Low');
  const [dueDate, setDueDate] = useState<Date | null>(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] =
    useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isUpdate && taskN) {
      setTaskName(taskN);
      if (taskDesc) {
        setTaskDescription(taskDesc);
      }
      if (taskPrio) {
        setTaskPriority(taskPrio);
      }
      if (taskDueDate) {
        setDueDate(new Date(taskDueDate));
      }
      if (taskCompleted) {
        setIsChecked(taskCompleted);
      }
      if (taskImage) {
        setSelectedImage(taskImage);
        getDownloadURL();
      }
    }
    navigation.setOptions({
      title: isUpdate ? 'Update Task' : 'Add New Task',
    });
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('uid');
        if (storedUserId !== null) {
          setUserId(storedUserId);
        } else {
          console.log('No user ID found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error retrieving user ID from AsyncStorage:', error);
      }
    };

    fetchUserId();
  }, []);

  const getDownloadURL = async () => {
    // // instead of backend I am getting from URI it is not going to work if the item is deleted somehow.
    // const formData = {
    //   taskId: taskId,
    //   userId: userId,
    // };
    // const baseURL =
    //   Platform.OS === 'ios'
    //     ? 'http://localhost:3000'
    //     : 'http://192.168.178.21:3000';
    // const response = await axios.get(
    //   `${baseURL}/tasks/${userId}/${taskId}/image`,
    //   formData,
    // );
    // const data = response.data;
  };

  const showActionSheet = () => {
    const options = ['Cancel', 'Low', 'Medium', 'High'];
    const cancelButtonIndex = 0;

    ActionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: 'Select Priority',
      },
      buttonIndex => {
        if (buttonIndex !== cancelButtonIndex) {
          const priority = options[buttonIndex];
          setTaskPriority(priority);
        }
      },
    );
  };

  const generateUniqueId = () => {
    return uuidv4();
  };

  const handleAddTask = async () => {
    setLoading(true);
    const baseURL =
      Platform.OS === 'ios'
        ? 'http://localhost:3000'
        : 'http://192.168.178.21:3000';
    if (taskName === '' || taskName === null) {
      Alert.alert(
        'Add Task Failed',
        'Please provide a Task Name to add a task',
      );
      return;
    }
    if (isUpdate) {
      try {
        const taskData = {
          taskName: taskName,
          taskId: taskId,
          taskDate: dueDate,
          taskDesc: taskDescription,
          taskPriority: taskPriority,
          taskImage: selectedImage,
          taskCompleted: isChecked,
        };

        console.log(taskData.taskImage);

        const response = await axios.put(
          `${baseURL}/tasks/${userId}/${taskId}`,
          taskData,
        );
        console.log('Task added successfully:', response.data);
        navigation.popToTop();
        setLoading(false);
        return response.data;
      } catch (error) {
        console.error('Error adding task:', error.message);
        setLoading(false);
        throw error;
      }
    } else {
      try {
        const taskData = {
          taskName: taskName,
          taskId: generateUniqueId(),
          taskDate: dueDate,
          taskDesc: taskDescription,
          taskPriority: taskPriority,
          taskImage: selectedImage,
          taskCompleted: false,
        };

        const response = await axios.post(
          `${baseURL}/tasks/${userId}`,
          taskData,
        );
        console.log('Task added successfully:', response.data);
        navigation.popToTop();
        setLoading(false);
        return response.data;
      } catch (error) {
        console.error('Error adding task:', error.message);
        setLoading(false);
        throw error;
      }
    }
  };

  const handleToggleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  const handleDeleteTask = async () => {
    Alert.alert('Are you sure ?', 'You are going to delete your task.', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'OK', onPress: () => handleDeleteOperation()},
    ]);
  };

  const handleDeleteOperation = async () => {
    setLoading(true);
    const baseURL =
      Platform.OS === 'ios'
        ? 'http://localhost:3000'
        : 'http://192.168.178.21:3000';
    if (isUpdate) {
      try {
        const response = await axios.delete(
          `${baseURL}/tasks/${userId}/${taskId}`,
        );
        console.log('Task deleted successfully:', response.data);
        setLoading(false);
        navigation.popToTop();
        return response.data;
      } catch (error) {
        setLoading(false);
        console.error('Error adding task:', error.message);
        throw error;
      }
    }
  };

  const handleSelectImage = () => {
    const options = ['Cancel', 'Photo Library', 'Camera'];
    const cancelButtonIndex = 0;

    ActionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: 'Select an Option',
      },
      buttonIndex => {
        if (buttonIndex !== cancelButtonIndex) {
          const optionSelected = options[buttonIndex];
          handleImageSelection(optionSelected);
        }
      },
    );
  };

  const handleImageSelection = index => {
    if (index === 1) {
      const options: ImagePicker.CameraOptions = {
        durationLimit: 20,
        saveToPhotos: true,
        cameraType: 'back',
        mediaType: 'mixed',
      };

      ImagePicker.launchCamera(options, response => {
        if (response.didCancel) {
          //
        } else if (response.error) {
          //
        } else {
          setSelectedImage(response.uri);
        }
      });
    } else {
      const options: ImagePicker.ImageLibraryOptions = {
        mediaType: 'mixed',
      };
      ImagePicker.launchImageLibrary(options, response => {
        if (response.didCancel) {
          //
        } else if (response.error) {
          //
        } else {
          console.log(response.uri);
          setSelectedImage(response.assets[0].uri);
        }
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      {loading ? ( // Conditionally render loading indicator
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <View style={styles.container}>
          <TextInput
            placeholder="Enter Task Name"
            value={taskName}
            onChangeText={setTaskName}
            style={styles.input}
          />
          <TextInput
            placeholder="Enter Task Description"
            value={taskDescription}
            onChangeText={setTaskDescription}
            multiline
            style={[styles.input, styles.multilineInput]}
          />
          <Text>Select a Task Priority</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => showActionSheet()}>
            <Text>{taskPriority}</Text>
          </TouchableOpacity>
          <Text>Select a Due Date</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setDatePickerVisibility(true)}>
            <Text>
              {dueDate ? formatDate(dueDate.getTime()) : 'Pick a Due Date'}
            </Text>
          </TouchableOpacity>
          <DatePicker
            modal
            open={isDatePickerVisible}
            date={dueDate}
            onConfirm={date => {
              setDatePickerVisibility(false);
              setDueDate(date);
            }}
            minimumDate={dueDate}
            onCancel={() => {
              setDatePickerVisibility(false);
            }}
          />
          {isUpdate ? (
            <View style={styles.checkbox}>
              <CheckBox
                style={styles.check}
                disabled={false}
                value={isChecked}
                onValueChange={handleToggleCheckbox}
              />
              <Text style={styles.label}>Task Completed</Text>
            </View>
          ) : (
            <></>
          )}
          {selectedImage && (
            <Image source={{uri: selectedImage}} style={styles.selectedImage} />
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleSelectImage()}>
            <Text style={styles.buttonText}>
              {selectedImage ? 'Change Image' : 'Select Image'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleAddTask()}>
            <Text style={styles.buttonText}>
              {!isUpdate ? 'Add Task' : 'Update Task'}
            </Text>
          </TouchableOpacity>
          {isUpdate ? (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteTask()}>
              <Text style={styles.buttonText}>Delete Task</Text>
            </TouchableOpacity>
          ) : (
            <></>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  input: {
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    height: 65,
  },
  multilineInput: {
    height: 120,
  },
  picker: {
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  calendarIcon: {
    marginLeft: 10,
  },
  selectedImage: {
    width: 120,
    height: 120,
    marginTop: 10,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    marginTop: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 12,
    marginTop: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  checkbox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 10,
  },
  label: {
    marginLeft: 10,
    marginTop: 5,
  },
  check: {
    marginBottom: 5,
    padding: 5,
  },
});

export default AddTaskScreen;
