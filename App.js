import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const private_key = process.env.PRIVATE_KEY;

export default function App() {
  return (
    <View style={styles.container}>
      <Text>myto</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
