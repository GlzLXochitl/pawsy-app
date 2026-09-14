import { Text, View } from 'react-native';
import { styles } from '../../../styles/dashboard';

export default function Dashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>¡Hola, has iniciado sesión!</Text>
    </View>
  );
}