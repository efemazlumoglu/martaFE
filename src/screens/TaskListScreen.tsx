import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet, RefreshControl} from 'react-native';
import {FAB} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {Swipeable} from 'react-native-gesture-handler';
import {formatDate} from '../libs/formatDate';

const TaskListScreen = ({navigation}) => {
  const [userId, setUserId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noTasks, setNoTasks] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tasksFetched, setTasksFetched] = useState(false);

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

  useEffect(() => {
    if (userId && !tasksFetched) {
      fetchTasks();
    }
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/tasks/${userId}`);
      const data = response.data;
      console.log('adding task into firebase');
      if (data) {
        const tasksArray = Object.keys(data).map(key => ({
          ...data[key],
          taskId: key,
        }));
        setTasks(tasksArray);
        setRefreshing(false);
        setNoTasks(false);
        setLoading(false);
      } else {
        setLoading(false);
        setNoTasks(true);
        setRefreshing(false);
      }
    } catch (error) {
      setNoTasks(true);
      setRefreshing(false);
      setLoading(false);
    }
    setLoading(false);
    setRefreshing(false);
    setLoading(false);
    setTasksFetched(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const renderTaskItem = ({item}) => {
    // const renderRightActions = () => {
    //   return (
    //     <TouchableOpacity style={styles.deleteButton}>
    //       <Text style={styles.deleteButtonText}>Delete</Text>
    //     </TouchableOpacity>
    //   );
    // };
    return (
      <View style={styles.taskItem}>
        <Text style={styles.taskName}>{item.taskName}</Text>
        <Text style={styles.taskName}>{item.taskPriority}</Text>
        <Text style={styles.taskName}>{formatDate(item.taskDate)}</Text>
      </View>
    );
  };

  const renderEmptyList = () => {
    if (noTasks) {
      return (
        <View style={styles.emptyList}>
          <Text style={styles.emptyText}>
            No tasks found. Please pull to refresh the page or add new task.
          </Text>
        </View>
      );
    } else {
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.taskId}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        // eslint-disable-next-line react-native/no-inline-styles
        contentContainerStyle={{flexGrow: 1}}
      />
      <FAB
        style={styles.fab}
        icon="plus-box"
        onPress={() => navigation.navigate('AddTask')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  taskItem: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  taskName: {
    fontSize: 18,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
    width: 100,
    height: '100%',
  },
  deleteButtonText: {
    color: '#fff',
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
  loadingIndicator: {
    marginTop: 10,
    marginBottom: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 5,
    bottom: 30,
  },
});

export default TaskListScreen;
