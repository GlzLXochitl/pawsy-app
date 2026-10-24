import { router } from 'expo-router';
import { useState } from 'react';
import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useProfile } from '../../../context/ProfileContext';

export default function EditProfile() {
  const { profile, updateProfile } = useProfile();

  const [nombre, setNombre] = useState(profile.nombre);
  const [usuario, setUsuario] = useState(profile.usuario);
  const [ubicacion, setUbicacion] = useState(profile.ubicacion);

  const guardarCambios = () => {
    updateProfile({
      nombre,
      usuario,
      ubicacion,
    });

    router.back();
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#222',
          marginTop: 30,
          marginBottom: 25,
        }}
      >
        Editar perfil
      </Text>

      <Text
        style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333',
          marginBottom: 8,
        }}
      >
        Nombre
      </Text>

      <TextInput
        style={{
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 10,
          padding: 14,
          fontSize: 16,
          marginBottom: 20,
        }}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Escribe tu nombre"
      />

      <Text
        style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333',
          marginBottom: 8,
        }}
      >
        Nombre de usuario
      </Text>

      <TextInput
        style={{
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 10,
          padding: 14,
          fontSize: 16,
          marginBottom: 20,
        }}
        value={usuario}
        onChangeText={setUsuario}
        placeholder="Escribe tu usuario"
        autoCapitalize="none"
      />

      <Text
        style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333',
          marginBottom: 8,
        }}
      >
        Ubicación
      </Text>

      <TextInput
        style={{
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 10,
          padding: 14,
          fontSize: 16,
          marginBottom: 30,
        }}
        value={ubicacion}
        onChangeText={setUbicacion}
        placeholder="Escribe tu ubicación"
      />

      <TouchableOpacity
        style={{
          backgroundColor: '#007bff',
          padding: 15,
          borderRadius: 10,
          alignItems: 'center',
          marginBottom: 15,
        }}
        onPress={guardarCambios}
      >
        <Text
          style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
          }}
        >
          Guardar cambios
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: '#ddd',
          padding: 15,
          borderRadius: 10,
          alignItems: 'center',
        }}
        onPress={() => router.back()}
      >
        <Text
          style={{
            color: '#333',
            fontSize: 16,
            fontWeight: 'bold',
          }}
        >
          Cancelar
        </Text>
      </TouchableOpacity>
    </View>
  );
}