import { Fredoka_700Bold, useFonts } from '@expo-google-fonts/fredoka';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { shared } from '../../../styles/shared';
import { styles } from '../../../styles/sign-in';
import { useAuth } from '../../context/auth-context';

export const API_BASE_URL = 'http://127.0.0.1:3000';

export default function SignIn() {
  const [fontsLoaded] = useFonts({ Fredoka_700Bold });

  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  if (!fontsLoaded) return null;

  const iniciarSesion = async () => {
    console.log('1. Botón presionado');
    setError('');

    if (!nombreUsuario.trim() || !contrasena) {
      console.log('2. Campos vacíos');
      setError('Por favor llena todos los campos');
      return;
    }

    try {
      console.log('3. Enviando POST a:', `${API_BASE_URL}/api/login`);
      const respuesta = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_usuario: nombreUsuario.trim(),
          contrasena,
        }),
      });

      console.log('4. Status de respuesta:', respuesta.status);
      const datos = await respuesta.json();
      console.log('5. Datos recibidos:', datos);

      if (respuesta.ok) {
        const usuarioLogueado = datos.usuario || datos.user || datos;
        console.log('6. Llamando signIn con:', usuarioLogueado);
        signIn(usuarioLogueado);
        console.log('7. Navegando a /dashboard');
        router.replace('/(app)/dashboard');
      } else {
        setError(datos.error || 'Usuario o contraseña incorrectos');
      }
    } catch (err) {
      console.error('8. Error en fetch/catch:', err);
      setError('No se pudo conectar con el servidor');
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={shared.logoCard}>
            <Image
              source={require('../../img/pawsy-logo.png')}
              style={shared.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={shared.title}>
            Welcome to{"\n"}Pawsy App!
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de usuario"
            placeholderTextColor="#7a7a7a"
            value={nombreUsuario}
            onChangeText={setNombreUsuario}
            autoCapitalize="none"
            maxLength={30}
          />

          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Contraseña"
              placeholderTextColor="#7a7a7a"
              secureTextEntry={!mostrarContrasena}
              value={contrasena}
              onChangeText={setContrasena}
              maxLength={25}
            />
            <TouchableOpacity
              onPress={() => setMostrarContrasena(!mostrarContrasena)}
              accessibilityRole="button"
              accessibilityLabel={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              hitSlop={8}
            >
              <Ionicons
                name={mostrarContrasena ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#7a7a7a"
              />
            </TouchableOpacity>
          </View>

          {error !== '' && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={shared.button} onPress={iniciarSesion}>
            <LinearGradient
              colors={['#4FC3E8', '#3A9FD9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={shared.buttonGradient}
            >
              <Text style={shared.buttonText}>Iniciar sesión</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>no tienes una cuenta </Text>
            <TouchableOpacity onPress={() => router.push('/user_form')}>
              <Text style={styles.signupLink}>registrate aqui!</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}