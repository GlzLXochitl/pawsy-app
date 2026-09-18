import { Fredoka_700Bold, useFonts } from '@expo-google-fonts/fredoka';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { shared } from '../../../styles/shared';
import { styles } from '../../../styles/welcome';

export default function Welcome() {
  const [fontsLoaded] = useFonts({ Fredoka_700Bold });
  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={['#D4E157', '#7ED9A8', '#5FC9C0', '#4FB6D6']}
      locations={[0, 0.35, 0.65, 1]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={shared.background}
    >
      <View style={shared.decorCircleTop} />
      <View style={shared.decorCircleBottom} />

      <View style={shared.container}>
        <View style={shared.logoCard}>
          <Image
            source={require('../../img/pawsy-logo.png')}
            style={shared.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>¡Donde cada huella cuenta una historia!</Text>

        <TouchableOpacity style={shared.button} onPress={() => router.push('/sign-in')}>
          <LinearGradient
            colors={['#4FC3E8', '#3A9FD9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={shared.buttonGradient}
          >
            <Text style={shared.buttonText}>Comenzar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}