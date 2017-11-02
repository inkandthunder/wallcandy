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
  Text,
  View
} from 'react-native';
import RandManager from './RandManager.js';
import Swiper from 'react-native-swiper';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

const NUM_WALLPAPERS = 5;

export default class App extends Component<{}> {

  constructor(props) {
    super(props);

    this.state = {
      wallsJSON: [],
      isLoading: true
    };
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
            <Text key={index}>
              {wallpaper.author}
            </Text>
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
});
