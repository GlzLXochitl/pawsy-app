import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
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
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setNombre(profile.nombre);
    setUsuario(profile.usuario);
    setUbicacion(profile.ubicacion);
  }, [profile]);

  const irAlDashboard = () => {
    router.replace('/dashboard' as any);
  };

  const guardarCambios = async () => {
    setGuardando(true);
    const ok = await updateProfile({
      nombre,
      usuario,
      ubicacion,
    });
    setGuardando(false);

    if (ok) {
      irAlDashboard();
    } else {
      Alert.alert('Error', 'No se pudieron guardar los cambios en el servidor.');
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
      }}
    >
      {/* Barra superior con flecha para volver al dashboard */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 25,
          marginBottom: 20,
        }}
      >
        <TouchableOpacity
          onPress={irAlDashboard}
          disabled={guardando}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 12,
            backgroundColor: '#fff',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#ddd',
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#222' }}>
            ←
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '600',
              color: '#222',
              marginLeft: 6,
            }}
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#222',
          }}
        >
          Editar perfil
        </Text>
      </View>

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
          backgroundColor: guardando ? '#7aaee8' : '#007bff',
          padding: 15,
          borderRadius: 10,
          alignItems: 'center',
          marginBottom: 15,
        }}
        onPress={guardarCambios}
        disabled={guardando}
      >
        <Text
          style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
          }}
        >
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: '#ddd',
          padding: 15,
          borderRadius: 10,
          alignItems: 'center',
        }}
        onPress={irAlDashboard}
        disabled={guardando}
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