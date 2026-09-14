import { Fredoka_700Bold, useFonts } from '@expo-google-fonts/fredoka';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { shared } from '../../../styles/shared';
import { styles } from '../../../styles/sign-in';
import { useAuth } from '../../context/auth-context';

const usuarioPrueba = { username: 'isa', password: '123' };

export default function SignIn() {
  const [fontsLoaded] = useFonts({ Fredoka_700Bold });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  if (!fontsLoaded) return null;

  const iniciarSesion = () => {
    if (username === usuarioPrueba.username && password === usuarioPrueba.password) {
      signIn();
      router.replace('/dashboard');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

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

        <Text style={shared.title}>Welcome to Pawsy App!</Text>

        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor="#7a7a7a"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#7a7a7a"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error !== '' && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={shared.button} onPress={iniciarSesion}>
          <LinearGradient
            colors={['#4FC3E8', '#3A9FD9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={shared.buttonGradient}
          >
            <Text style={shared.buttonText}>Log in</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/user_form')}>
            <Text style={styles.signupLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}