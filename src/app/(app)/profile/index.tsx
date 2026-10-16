import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useProfile } from './ProfileContext';

export default function Profile() {
  const { profile } = useProfile();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
      }}
    >
      {/* Encabezado */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          marginTop: 30,
          marginBottom: 20,
          color: '#222',
        }}
      >
        Mi perfil
      </Text>

      {/* Foto de perfil */}
      <View
        style={{
          alignItems: 'center',
          marginBottom: 15,
        }}
      >
        <View
          style={{
            width: 110,
            height: 110,
            borderRadius: 55,
            backgroundColor: '#d9d9d9',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 45,
            }}
          >
            👤
          </Text>
        </View>
      </View>

      {/* Información del usuario */}
      <Text
        style={{
          fontSize: 22,
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#222',
        }}
      >
       {profile.nombre}
      </Text>

      <Text
        style={{
          fontSize: 16,
          textAlign: 'center',
          color: '#666',
          marginTop: 5,
        }}
      >
      @{profile.usuario}
      </Text>

      <Text
        style={{
          fontSize: 15,
          textAlign: 'center',
          color: '#666',
          marginTop: 10,
        }}
      >
      📍{profile.ubicacion}
      </Text>

      {/* Botón editar */}
      <TouchableOpacity
  style={{
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 25,
  }}
onPress={() => router.push('/profile/edit-profile' as any)}>
        <Text
          style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
          }}
        >
          Editar perfil
        </Text>
      </TouchableOpacity>

      {/* Sección de publicaciones */}
      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          marginTop: 35,
          marginBottom: 15,
          color: '#222',
        }}
      >
        Mis publicaciones
      </Text>

      <View
        style={{
          backgroundColor: '#fff',
          padding: 20,
          borderRadius: 10,
        }}
      >
        <Text
          style={{
            color: '#666',
            textAlign: 'center',
          }}
        >
          Todavía no tienes publicaciones.
        </Text>
      </View>
    </View>
  );
}