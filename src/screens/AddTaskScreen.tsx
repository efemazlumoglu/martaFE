import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {IconButton} from 'react-native-paper';
import {formatDate} from '../libs/formatDate';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {uuidv4} from '@firebase/util';

const AddTaskScreen = ({navigation}) => {
  const [taskName, setTaskName] = useState<string>('');
  const [userId, setUserId] = useState('');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [taskPriority, setTaskPriority] = useState<string>('Low');
  const [dueDate, setDueDate] = useState<Date | null>(null);
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

  const handleDateConfirm = (date: Date) => {
    setDueDate(date);
    setDatePickerVisibility(false);
  };

  const generateUniqueId = () => {
    return uuidv4();
  };

  const handleAddTask = async () => {
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
      <Picker
        selectedValue={taskPriority}
        onValueChange={itemValue => setTaskPriority(itemValue)}
        style={styles.picker}>
        <Picker.Item label="Low" value="Low" />
        <Picker.Item label="Medium" value="Medium" />
        <Picker.Item label="High" value="High" />
      </Picker>
      <View style={styles.datePickerContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setDatePickerVisibility(true)}>
          <Text>
            {dueDate ? formatDate(dueDate.getTime()) : 'Pick Due Date'}
          </Text>
        </TouchableOpacity>
        <IconButton
          icon="calendar"
          color="gray"
          size={20}
          onPress={() => setDatePickerVisibility(true)}
          style={styles.calendarIcon}
        />
        {/* <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisibility(false)}
        /> */}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Register')}>
        <Text>Add Task</Text>
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
    paddingVertical: 30,
    paddingHorizontal: 10,
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
});

export default AddTaskScreen;
