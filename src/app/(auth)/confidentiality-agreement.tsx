import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { shared } from '../../../styles/shared';

export default function ConfidentialityAgreement() {
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

      <TouchableOpacity
        style={shared.backButton}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Volver"
      >
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 30 }}>
        <Text style={shared.title}>Este es el acuerdo de confidencialidad</Text>
      </View>
    </LinearGradient>
  );
}
