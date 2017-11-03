/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */


import React, { Component } from 'react';
import {
  Platform,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Text,
  PanResponder,  
  View,
  CameraRoll,
  AlertIOS
} from 'react-native';
import RandManager from './RandManager.js';
import Utils from './Utils.js';
import ProgressHUD from './ProgressHUD.js';
import Swiper from 'react-native-swiper';
import NetworkImage from 'react-native-image-progress';
import * as Progress from 'react-native-progress';
import ProgressBar from 'react-native-progress/Bar';
import ShakeEvent from 'react-native-shake-event';
//import * as ProgressHUD from 'react-native-progress-hud';

let {width, height} = Dimensions.get('window');
const NUM_WALLPAPERS = 5;
const DOUBLE_TAP_DELAY = 300; // milliseconds
const DOUBLE_TAP_RADIUS = 20;
//let isHudVisible = true;

export default class App extends Component<{}> {

  constructor(props) {
    super(props);

    this.state = {
      wallsJSON: [],
      isLoading: true,
      isHudVisible: true
    };
    this.currentWallIndex = 0;
    this.imagePanResponder = {};
    this.prevTouchInfo = {
      prevTouchX: 0,
      prevTouchY: 0,
      prevTouchTimeStamp: 0
    };
    this.handlePanResponderGrant = this.handlePanResponderGrant.bind(this);
    this.onMomentumScrollEnd = this.onMomentumScrollEnd.bind(this);
  }

  fetchWallsJSON() {
	var url = 'https://unsplash.it/list';
    fetch(url)
      .then( response => response.json() )
      .then( jsonData => {
      var randomIds = RandManager.uniqueRandomNumbers(NUM_WALLPAPERS, 0, jsonData.length);
      var walls = [];
      randomIds.forEach(randomId => {
        walls.push(jsonData[randomId]);
      });

      this.setState({
        isLoading: false,
        wallsJSON: [].concat(walls)
      });
/*        console.log(jsonData);
        this.setState({isLoading: false});*/
      })
	.catch( error => console.log('Fetch error ' + error) );
    }
    
  componentDidMount() {
	this.fetchWallsJSON();
    }
   
render() {
    var {isLoading} = this.state;
    if(isLoading)
      return this.renderLoadingMessage();
    else
      return this.renderResults();
  }

renderLoadingMessage() {
    return (
        
       <View style={styles.loadingContainer}>
<ActivityIndicator
          animating={true}
          color={'#fff'}
          size={'small'} 
          style={{margin: 15}} />
  
        <Text style={{color: '#fff'}}>
          Contacting Unsplash
        </Text>
        
        
      </View>
    )}

componentWillMount() {
    this.imagePanResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
      onPanResponderGrant: this.handlePanResponderGrant,
      onPanResponderRelease: this.handlePanResponderEnd,
      onPanResponderTerminate: this.handlePanResponderEnd
    });
    
    // Fetch new wallpapers on shake
  ShakeEvent.addEventListener('shake', () => {
    this.initialize();
    this.fetchWallsJSON();
  });
  }

initialize() {
  this.setState({
    wallsJSON: [],
    isLoading: true,
    isHudVisible: false
  });

  this.currentWallIndex = 0;
}

handleStartShouldSetPanResponder(e, gestureState) {
    return true;
}

handlePanResponderGrant(e, gestureState) {
  //console.log('Finger touched the image');
    var currentTouchTimeStamp = Date.now();

  //if( this.isDoubleTap(currentTouchTimeStamp, gestureState) ) 
      if( this.isDoubleTap(currentTouchTimeStamp, gestureState) )
	//this.saveCurrentWallpaperToCameraRoll();
    this.handlePressImage();
          //console.log('Double tap detected');

  this.prevTouchInfo = {
    prevTouchX: gestureState.x0,
    prevTouchY: gestureState.y0,
    prevTouchTimeStamp: currentTouchTimeStamp
  };
}

handlePanResponderEnd(e, gestureState) {
  console.log('Finger pulled up from the image');
}

isDoubleTap(currentTouchTimeStamp, {x0, y0}) {
  var {prevTouchX, prevTouchY, prevTouchTimeStamp} = this.prevTouchInfo;
  var dt = currentTouchTimeStamp - prevTouchTimeStamp;

  return (dt < DOUBLE_TAP_DELAY && Utils.distance(prevTouchX, prevTouchY, x0, y0) < DOUBLE_TAP_RADIUS);
}

onMomentumScrollEnd(e, state, context) {
  this.currentWallIndex = state.index;
}

saveCurrentWallpaperToCameraRoll() {
  var {wallsJSON} = this.state;
  var currentWall = wallsJSON[this.currentWallIndex];
  var currentWallURL = `https://unsplash.it/${currentWall.width}/${currentWall.height}?image=${currentWall.id}`;

  CameraRoll.saveImageWithTag(currentWallURL, (data) => {
/*    AlertIOS.alert(
      'Saved',
      'Wallpaper successfully saved to Camera Roll',
      [
        {text: 'High 5!', onPress: () => console.log('OK Pressed!')}
      ]
    );*/
  },(err) =>{
    console.log('Error saving to camera roll', err);
  });
}

handlePressImage()
{
    var {wallsJSON} = this.state;
  var currentWall = wallsJSON[this.currentWallIndex];
  var currentWallURL = `https://unsplash.it/${currentWall.width}/${currentWall.height}?image=${currentWall.id}`;
    
  
    CameraRoll.saveToCameraRoll(currentWallURL)
          .then(
        console.log("Saved to Camera Roll?"),

        AlertIOS.alert('Success', 'Photo added to camera roll!')
        
    )
          .catch(err => console.log('err:', err))
    
}


renderResults() {
var {wallsJSON, isLoading} = this.state;
  if( !isLoading ) {
    return (
     
  <Swiper 

        dot={<View style={{backgroundColor:'rgba(255,255,255,.4)', width: 8, height: 8,borderRadius: 10, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}

        activeDot={<View style={{backgroundColor: '#fff', width: 13, height: 13, borderRadius: 7, marginLeft: 7, marginRight: 7}} />}

        loop={false} 
        onMomentumScrollEnd={this.onMomentumScrollEnd}>
        
        {wallsJSON.map((wallpaper, index) => {
          return(
              
              
      <View key={index}>
         
              
<NetworkImage 
  source={{ uri: `https://unsplash.it/${wallpaper.width}/${wallpaper.height}?image=${wallpaper.id}` }} 
  indicator={Progress.CircleSnail} 
   indicatorProps={{
    color: 'rgba(255, 255, 255)',
    size: 80,
    thickness: 3 
  }}           
  style={styles.wallpaperImage}
              {...this.imagePanResponder.panHandlers}>
              
        <Text style={styles.label}>Photo by</Text>
        <Text style={styles.label_authorName}>{wallpaper.author}</Text>
              </NetworkImage>

      </View>
              
            /*<Text key={index}>
              {wallpaper.author}
            </Text>*/
          );
        })}
       
   </Swiper>

    );
  }
}


}

const styles = StyleSheet.create({
  loadingContainer: {
	flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
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
 wallpaperImage: {
  //flex: 1,
  width: width,
  height: height,
  backgroundColor: '#000'
},
label: {
  position: 'absolute',
  color: '#fff',
  fontSize: 13,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  padding: 2,
  paddingLeft: 5,
  top: 20,
  left: 20,
  width: width/2
},
label_authorName: {
  position: 'absolute',
  color: '#fff',
  fontSize: 15,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  padding: 2,
  paddingLeft: 5,
  top: 41,
  left: 20,
  fontWeight: 'bold',
  width: width/2
}
});
