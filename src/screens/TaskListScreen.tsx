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
        const priorityOrder = {High: 0, Medium: 1, Low: 2};
        sortedTasks.sort((a, b) => {
          return priorityOrder[a.taskPriority] - priorityOrder[b.taskPriority];
        });
        break;
      case 1:
        sortedTasks.sort((a, b) => {
          if (a.taskCompleted !== b.taskCompleted) {
            return a.taskCompleted ? -1 : 1;
          }
        });
        break;
      case 2:
        sortedTasks.sort((a, b) => {
          const dateA = new Date(a.taskDate);
          const dateB = new Date(b.taskDate);
          const currentDate = new Date().getTime();
          return (
            Math.abs(dateA.getTime() - currentDate) -
            Math.abs(dateB.getTime() - currentDate)
          );
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
        <View
          style={
            item.taskCompleted ? styles.taskItemCompleted : styles.taskItem
          }>
          <View style={styles.taskFirst}>
            <View>
              <Text style={styles.taskName}>{item.taskName}</Text>
            </View>
            <View>
              <Text
                style={
                  item.taskPriority === 'Low'
                    ? styles.taskPriorityLow
                    : item.taskPriority === 'Medium'
                    ? styles.taskPriorityMedium
                    : styles.taskPriorityHigh
                }>
                {item.taskPriority}
              </Text>
            </View>
          </View>
          <Text style={styles.taskDueDate}>{item.taskDesc}</Text>
          <View style={styles.taskSecond}>
            <Text style={styles.taskDueDate}>{formatDate(item.taskDate)}</Text>
            {item.taskCompleted ? (
              <Text style={styles.taskDueDate}>Task is Completed</Text>
            ) : (
              <></>
            )}
          </View>
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
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        // eslint-disable-next-line react-native/no-inline-styles
        contentContainerStyle={{flexGrow: 1}}
      />
      <FAB
        label="Add Task"
        color="white"
        style={styles.fab}
        onPress={() => navigation.navigate('AddTask', {isUpdate: false})}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  taskItem: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    margin: 2,
    borderRadius: 10,
    backgroundColor: '#d3d3d3',
  },
  taskItemCompleted: {
    paddingVertical: 5,
    margin: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#8bca84',
  },
  taskName: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 5,
    marginRight: 5,
    marginLeft: 5,
  },
  taskDueDate: {
    fontSize: 14,
    padding: 5,
    marginRight: 5,
    marginLeft: 5,
  },
  taskPriorityLow: {
    color: '#ffc100',
    fontSize: 12,
    padding: 5,
    marginRight: 5,
    marginLeft: 5,
    fontWeight: '800',
  },
  taskPriorityMedium: {
    color: '#ff7400',
    fontSize: 12,
    padding: 5,
    marginRight: 5,
    marginLeft: 5,
    fontWeight: '800',
  },
  taskPriorityHigh: {
    color: '#ff0000',
    fontSize: 12,
    padding: 5,
    marginRight: 5,
    marginLeft: 5,
    fontWeight: '800',
  },
  taskFirst: {
    display: 'flex',
    flexDirection: 'row',
    marginVertical: 0,
    justifyContent: 'space-between',
  },
  taskSecond: {
    display: 'flex',
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'space-between',
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
