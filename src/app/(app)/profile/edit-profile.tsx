import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useProfile } from '../../../context/ProfileContext';

export default function EditProfile() {
  const { profile, error, updateProfile } = useProfile();
  const [nombre, setNombre] = useState(profile.nombre);
  const [apellidos, setApellidos] = useState(profile.apellidos || '');
  const [usuario, setUsuario] = useState(profile.usuario);
  const [email, setEmail] = useState(profile.email || '');
  const [celular, setCelular] = useState(profile.celular || '');
  const [ciudad, setCiudad] = useState(profile.ciudad || '');
  const [colonia, setColonia] = useState(profile.colonia || '');
  const [calle, setCalle] = useState(profile.calle || '');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    setNombre(profile.nombre);
    setApellidos(profile.apellidos || '');
    setUsuario(profile.usuario);
    setEmail(profile.email || '');
    setCelular(profile.celular || '');
    setCiudad(profile.ciudad || '');
    setColonia(profile.colonia || '');
    setCalle(profile.calle || '');
  }, [profile]);

  const guardarCambios = async () => {
    if (!nombre.trim() || !apellidos.trim() || !usuario.trim() || !email.trim() || !ciudad.trim() || !colonia.trim()) {
      Alert.alert('Faltan datos', 'Completa nombre, apellidos, usuario, correo, ciudad y colonia.');
      return;
    }

    setGuardando(true);
    const ok = await updateProfile({
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      usuario: usuario.trim(),
      email: email.trim(),
      celular: celular.trim() || null,
      ciudad: ciudad.trim(),
      colonia: colonia.trim(),
      calle: calle.trim() || null,
    });
    setGuardando(false);

    if (ok) {
      router.back();
    } else {
      Alert.alert('No se guardaron los cambios', error || 'Revisa tu conexión e inténtalo de nuevo.');
    }
  };

  const field = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    placeholder: string,
    options: { keyboardType?: 'default' | 'email-address' | 'phone-pad'; autoCapitalize?: 'none' | 'words' } = {}
  ) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: '#36514a', fontSize: 13, fontWeight: '700', marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#97a49f"
        keyboardType={options.keyboardType || 'default'}
        autoCapitalize={options.autoCapitalize || 'words'}
        style={{
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#dce7e1',
          borderRadius: 12,
          paddingHorizontal: 13,
          height: 48,
          color: '#28332f',
          fontSize: 15,
        }}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f1f8f4' }}>
      <View style={{
        paddingTop: 14,
        paddingHorizontal: 18,
        paddingBottom: 4,
        backgroundColor: '#f1f8f4',
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Volver al perfil">
          <Ionicons name="arrow-back" size={23} color="#4d9f8b" />
        </TouchableOpacity>
        <Text style={{ color: '#344a40', fontSize: 20, fontWeight: '800', marginLeft: 14 }}>
          Editar perfil
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 18, paddingBottom: 36 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ color: '#72827b', fontSize: 13, marginBottom: 18 }}>
          Mantén tus datos y ubicación actualizados para que puedan contactarte por tus avisos.
        </Text>

        {field('Nombre', nombre, setNombre, 'Tu nombre')}
        {field('Apellidos', apellidos, setApellidos, 'Tus apellidos')}
        {field('Nombre de usuario', usuario, setUsuario, 'usuario', { autoCapitalize: 'none' })}
        {field('Correo electrónico', email, setEmail, 'correo@ejemplo.com', { keyboardType: 'email-address', autoCapitalize: 'none' })}
        {field('Celular', celular, setCelular, 'Número de contacto', { keyboardType: 'phone-pad' })}

        <Text style={{ color: '#3d7465', fontSize: 15, fontWeight: '800', marginTop: 8, marginBottom: 12 }}>
          Ubicación
        </Text>
        {field('Ciudad', ciudad, setCiudad, 'Ciudad')}
        {field('Colonia', colonia, setColonia, 'Colonia')}
        {field('Calle (opcional)', calle, setCalle, 'Calle y número')}

        <TouchableOpacity
          onPress={guardarCambios}
          disabled={guardando}
          style={{
            height: 50,
            backgroundColor: guardando ? '#9ebbb1' : '#319d88',
            borderRadius: 13,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            marginTop: 8,
          }}
        >
          {guardando && <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />}
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} disabled={guardando} style={{ padding: 14, alignItems: 'center' }}>
          <Text style={{ color: '#60736c', fontWeight: '700' }}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
