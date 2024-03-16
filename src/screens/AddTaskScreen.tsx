import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import ActionSheet from 'react-native-action-sheet';
import DatePicker from 'react-native-date-picker';
import {formatDate} from '../libs/formatDate';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {uuidv4} from '@firebase/util';

const AddTaskScreen = ({navigation}) => {
  const [taskName, setTaskName] = useState<string>('');
  const [userId, setUserId] = useState('');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [taskPriority, setTaskPriority] = useState<string>('Low');
  const [dueDate, setDueDate] = useState<Date | null>(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] =
    useState<boolean>(false);

  useEffect(() => {
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

  const showActionSheet = () => {
    console.log('hello I am here');
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
    if (taskName === '' || taskName === null) {
      Alert.alert(
        'Add Task Failed',
        'Please provide a Task Name to add a task',
      );
      return;
    }

    try {
      const taskData = {
        taskName: taskName,
        taskId: generateUniqueId(),
        taskDate: dueDate,
        taskDesc: taskDescription,
        taskPriority: taskPriority,
      };

      const response = await axios.post(
        `http://localhost:3000/tasks/${userId}`,
        taskData,
      );
      console.log('Task added successfully:', response.data);
      navigation.popToTop();
      return response.data;
    } catch (error) {
      console.error('Error adding task:', error.message);
      throw error;
    }
  };

  return (
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
      <TouchableOpacity style={styles.input} onPress={() => showActionSheet()}>
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
        onCancel={() => {
          setDatePickerVisibility(false);
        }}
      />
      <TouchableOpacity style={styles.button} onPress={() => handleAddTask()}>
        <Text style={styles.buttonText}>Add Task</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddTaskScreen;
