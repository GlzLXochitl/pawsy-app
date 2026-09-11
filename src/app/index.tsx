import { router } from 'expo-router';
import { useState } from 'react';

import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { styles } from '../styles';

// DATOS DE PRUEBA
const usuarioPrueba = {
  username: 'isa',
  password: '123',
};

export default function HomeScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const iniciarSesion = () => {
    if (
      username === usuarioPrueba.username &&
      password === usuarioPrueba.password
    ) {
      router.push('/user_form');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Iniciar sesión
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Usuario"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error !== '' && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={iniciarSesion}
      >
        <Text style={styles.buttonText}>
          Iniciar sesión
        </Text>
      </TouchableOpacity>

    </View>
  );
}