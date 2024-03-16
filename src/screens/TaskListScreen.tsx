import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Button,
} from 'react-native';
import {FAB} from 'react-native-paper';
import ActionSheet from 'react-native-action-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {Swipeable} from 'react-native-gesture-handler';
import {formatDate} from '../libs/formatDate';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {useFocusEffect} from '@react-navigation/native';

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

  useFocusEffect(
    React.useCallback(() => {
      if (userId && !tasksFetched) {
        fetchTasks();
      }
      return () => {};
    }, []),
  );

  useEffect(() => {
    navigation.addListener('focus', () => {
      if (userId && !tasksFetched) {
        fetchTasks();
      }
    });
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/tasks/${userId}`);
      const data = response.data;
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

  const handleSortOption = index => {
    let sortedTasks = [...tasks];
    switch (index) {
      case 0:
        sortedTasks.sort((a, b) => {
          if (a.taskPriority < b.taskPriority) {
            return -1;
          }
          if (a.taskPriority > b.taskPriority) {
            return 1;
          }
          return 0;
        });
        break;
      case 1:
        sortedTasks.sort((a, b) => {
          if (a.taskCompleted && !b.taskCompleted) {
            return 1;
          }
          if (!a.taskCompleted && b.taskCompleted) {
            return -1;
          }
          return 0;
        });
        break;
      case 2:
        sortedTasks.sort((a, b) => {
          const dateA = new Date(a.taskDate);
          const dateB = new Date(b.taskDate);
          return dateA - dateB;
        });
        break;
      default:
        break;
    }
    setTasks(sortedTasks);
  };

  const showActionSheet = () => {
    const options = ['Priority', 'Completed', 'Due Date'];
    const cancelButtonIndex = options.length;

    ActionSheet.showActionSheetWithOptions(
      {
        options: [...options, 'Cancel'],
        cancelButtonIndex,
      },
      buttonIndex => {
        if (buttonIndex !== cancelButtonIndex) {
          handleSortOption(buttonIndex);
        }
      },
    );
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
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('AddTask', {
            isUpdate: true,
            taskN: item.taskName,
            taskId: item.taskId,
            taskDesc: item.taskDesc,
            taskPrio: item.taskPriority,
            taskDueDate: item.taskDate,
            taskCompleted: item.taskCompleted,
          })
        }>
        <View style={styles.taskItem}>
          <Text style={styles.taskName}>{item.taskName}</Text>
          <Text style={styles.taskName}>{item.taskPriority}</Text>
          <Text style={styles.taskName}>{formatDate(item.taskDate)}</Text>
          {item.taskCompleted ? (
            <Text style={styles.taskName}>Task is Completed</Text>
          ) : (
            <></>
          )}
        </View>
      </TouchableOpacity>
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
      <Button title="Sort" onPress={showActionSheet} />
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
        // eslint-disable-next-line react/no-unstable-nested-components
        icon={({color, size}) => (
          <MaterialIcon name="add" color={color} size={size} />
        )}
        onPress={() => navigation.navigate('AddTask', {isUpdate: false})}
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
    backgroundColor: 'blue',
    position: 'absolute',
    margin: 16,
    right: 5,
    bottom: 30,
  },
});

export default TaskListScreen;
