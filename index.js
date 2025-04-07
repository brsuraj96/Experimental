import { AppRegistry, Platform } from 'react-native';
import App from './App';

// Use a string directly instead of importing from app.json
const appName = 'PuzzleWorld'; 

AppRegistry.registerComponent(appName, () => App);

// Register the app for web as well
if (Platform.OS === 'web') {
  AppRegistry.runApplication(appName, {
    rootTag: document.getElementById('root') || document.getElementById('main')
  });
}
