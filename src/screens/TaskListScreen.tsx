import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import {FAB} from 'react-native-paper';
import ActionSheet from 'react-native-action-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {formatDate} from '../libs/formatDate';
import {useFocusEffect} from '@react-navigation/native';

const TaskListScreen = ({navigation}) => {
  const [userId, setUserId] = useState<string>('');
  const [tasks, setTasks] = useState([]);
  const [noTasks, setNoTasks] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [tasksFetched, setTasksFetched] = useState<boolean>(false);
  const fabOpacity = useRef(new Animated.Value(1)).current;

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
    try {
      const baseURL =
        Platform.OS === 'ios'
          ? 'http://localhost:3000'
          : 'http://192.168.178.21:3000';
      const response = await axios.get(`${baseURL}/tasks/${userId}`);
      const data = response.data;
      if (data) {
        const tasksArray = Object.keys(data).map(key => ({
          ...data[key],
          taskId: key,
        }));
        if (tasksArray.length > 0) {
          setTasks(tasksArray);
          setRefreshing(false);
          setNoTasks(false);
        } else {
          setTasks(tasksArray);
          setRefreshing(false);
          setNoTasks(true);
        }
      } else {
        setTasks([]);
        setNoTasks(true);
        setRefreshing(false);
      }
    } catch (error) {
      Alert.alert('Task fetch failed', error.message);
      setTasks([]);
      setNoTasks(true);
      setRefreshing(false);
    }
    setRefreshing(false);
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

  const handleScroll = event => {
    const {y} = event.nativeEvent.contentOffset;
    const fabOpacityValue = y > 0 ? 0 : 1;
    Animated.timing(fabOpacity, {
      toValue: fabOpacityValue,
      duration: 120,
      useNativeDriver: true,
    }).start();
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
            taskImage: item.taskImage,
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
            <View style={styles.priorityView}>
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
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.taskId}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        // eslint-disable-next-line react-native/no-inline-styles
        contentContainerStyle={{flexGrow: 1}}
      />
      <Animated.View style={{opacity: fabOpacity}}>
        <FAB
          label="Sort"
          color="white"
          style={styles.fab2}
          onPress={showActionSheet}
        />
        <FAB
          label="Add Task"
          color="white"
          style={styles.fab}
          onPress={() => navigation.navigate('AddTask', {isUpdate: false})}
        />
      </Animated.View>
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
    marginTop: 5,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    margin: 2,
    borderRadius: 10,
    backgroundColor: '#e7e7e7',
  },
  taskItemCompleted: {
    marginTop: 5,
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
  priorityView: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginRight: 5,
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
  fab2: {
    backgroundColor: 'navy',
    position: 'absolute',
    margin: 16,
    right: 5,
    bottom: 90,
  },
});

export default TaskListScreen;
