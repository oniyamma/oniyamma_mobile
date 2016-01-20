/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

import TabNavigator from 'react-native-tab-navigator';
import RefreshableListView from 'react-native-refreshable-listview';
// var RefreshableListView = require('react-native-refreshable-listview')

var React = require('react-native');
var {
  TabNavigatorIOS,
  NavigatorIOS,
  AppRegistry,
  StyleSheet,
  Text,
  ListView,
  View,
  TouchableWithoutFeedback,
  Image,
} = React;

var BASE_URL       = "http://localhost:3000";
var API_BASE_URL   = BASE_URL     + "/api/v1/";
var IMAGE_BASE_URL = BASE_URL     + "/upload/";
var TIMELINE_URL   = API_BASE_URL + "timeline";
var USERS_URL      = API_BASE_URL + "users";
var GENERATE_URL   = API_BASE_URL + "generate_user_history/";

var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== rs });

var oniyamma_mobile = React.createClass({
  getInitialState: function() {
    return {
      selectedTab: 'timeline'
    }
  },
  render: function() {
    return (
      <TabNavigator style={styles.tabNavigator}>
        <TabNavigator.Item
          selected={this.state.selectedTab == 'timeline'}
          title='タイムライン'
          renderIcon={() => <Image style={styles.tabIcon} source={require('./icons/timeline_off.png')} />}
          renderSelectedIcon={() => <Image style={styles.tabIcon} source={require('./icons/timeline_on.png')} />}
          onPress={() => this.setState({ selectedTab: 'timeline' })}>
          <NavigatorIOS
            style={styles.navigator}
            initialRoute={{
              component: ReactTimelineList,
              title: 'タイムライン'
            }}/>
        </TabNavigator.Item>
        <TabNavigator.Item
          selected={this.state.selectedTab == 'history'}
          title='家族の歴史'
          renderIcon={() => <Image style={styles.tabIcon} source={require('./icons/family_off.png')} />}
          renderSelectedIcon={() => <Image style={styles.tabIcon} source={require('./icons/family_on.png')} />}
          onPress={() => this.setState({ selectedTab: 'history'})}>
          <NavigatorIOS
            style={styles.navigator}
            initialRoute={{
              component: ReactUserList,
              title: '家族一覧'
            }}/>
        </TabNavigator.Item>
      </TabNavigator>
    );
  },
});

var ReactUserList = React.createClass({
  getInitialState: function() {
    return {
      items: ds.cloneWithRows([])
    }
  },
  componentDidMount: function() {
    this.fetchData();
  },
  render: function() {
    return (
      <RefreshableListView
        style={styles.listView}
        dataSource={this.state.items}
        renderRow={this.renderItem}
        loadData={this.fetchData}
        refreshDescription="Refresh"
        >
      </RefreshableListView>
    );
  },
  renderItem: function(item) {
    return (
      <TouchableWithoutFeedback onPress={() => this.onPressed(item)}>
        <View style={styles.userListContainer}>
          <Image 
            source={{uri: IMAGE_BASE_URL + item.image_file_name}}
            style={styles.thumbnail}/>
          <View style={styles.rightContainer}>
            <Text>{item.name}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  },
  fetchData: function() {
    fetch(USERS_URL)
      .then((res) => res.json())
      .then((resData) => {
        this.setState({
          items: this.state.items.cloneWithRows(resData)
        });
      })
  },
  onPressed: function(item) {
    this.props.navigator.push({
      title: item.name,
      component: ReactUserView,
      passProps: { item: item }
    });
  },
});

var ReactUserView = React.createClass({
  getInitialState: function() {
    return {
      file_name: null
    }
  },
  render: function() {
    return (
      <View style={styles.userViewContainer}>
        <Image 
            source={{ uri: IMAGE_BASE_URL + (this.state.file_name ? this.state.file_name : this.props.item.image_file_name) }}
            style={styles.photo}/>
        <Text style={styles.userViewTexst}>{this.props.item.name}</Text>
        <TouchableWithoutFeedback onPress={() => this.onPressed(this.props.item)}>
          <Image
            source={require('./icons/play.png')}
            style={styles.thumbnail}/>
        </TouchableWithoutFeedback>
      </View>
    );
  },
  onPressed: function(item) {
    fetch(GENERATE_URL + item._id)
      .then((res) => res.json())
      .then((resData) => {
        this.setState({
          file_name: resData.file_name
        });
      });
  },
});

var ReactTimelineList = React.createClass({
  getInitialState: function() {
    return {
      items: ds.cloneWithRows([])
    }
  },
  componentDidMount: function() {
    this.fetchData();
  },
  render: function() {
    return (
      <RefreshableListView
        style={styles.listView}
        dataSource={this.state.items}
        renderRow={this.renderItem}
        loadData={this.fetchData}
        refreshDescription="Refresh"
        >
      </RefreshableListView>
    );
  },
  renderItem: function(item) {
    return (
      <TouchableWithoutFeedback onPress={() => this.onPressed(item)}>
        <View style={styles.container}>
          <Image 
            source={{uri: IMAGE_BASE_URL + item.image_file_name}}
            style={styles.thumbnail}/>
          <View style={styles.rightContainer}>
            <Text>{this.generateTimelineText(item)}</Text>
            <Text>{item.created_at}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  },
  generateTimelineText: function(item) {
    return item.created_by.name + "さんが「" + this.getTypeText(item.type) + "」と言っています";
  },
  getTypeText: function(type) {
    return {
      'go_home': 'いってきます！',
      'leave_home': 'ただいま！',
    }[type];
  },
  fetchData: function() {
    fetch(TIMELINE_URL)
      .then((res) => res.json())
      .then((resData) => {
        this.setState({
          items: ds.cloneWithRows(resData)
        });
      });
  },
  onPressed: function() {
    // TODO: Navigate to detail page
  },
});

var styles = StyleSheet.create({
  tabNavigator: {
    flex: 1
  },
  navigator: {
    flex: 1
  },
  listView: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 5,
  },
  userListContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  rightContainer: {
    flex: 1,
    marginLeft: 10
  },
  thumbnail: {
    width: 80,
    height: 80,
  },
  userViewContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: 320,
    height: 320
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  tabIcon: {
    width: 24,
    height: 24,
    marginBottom: 2,
  },
});

AppRegistry.registerComponent('oniyamma_mobile', () => oniyamma_mobile);
