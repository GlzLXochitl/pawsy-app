import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/auth-context';

export default function ChangePassword() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Faltan datos', 'Completa los tres campos para continuar.');
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 25) {
      Alert.alert('Contraseña no válida', 'Usa entre 8 y 25 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('No coinciden', 'Confirma la nueva contraseña correctamente.');
      return;
    }
    if (!user?.id) {
      Alert.alert('Sesión no disponible', 'Cierra sesión e inicia nuevamente.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/${user.id}/contrasena`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contrasena_actual: currentPassword,
          contrasena_nueva: newPassword,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        Alert.alert('No se pudo cambiar', result.error || 'Verifica tus datos e inténtalo nuevamente.');
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Contraseña actualizada', 'Tu contraseña se cambió correctamente.', [
        { text: 'Listo', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error de conexión', 'No se pudo contactar al servidor. Inténtalo nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const renderPasswordField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
  ) => (
    <View style={{ marginBottom: 15 }}>
      <Text style={{ color: '#36514a', fontSize: 13, fontWeight: '700', marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#97a49f"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={25}
        style={{
          height: 48,
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#dce7e1',
          borderRadius: 12,
          paddingHorizontal: 13,
          color: '#28332f',
          fontSize: 15,
        }}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f1f8f4' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8 }}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Volver">
          <Ionicons name="arrow-back" size={23} color="#4d9f8b" />
        </TouchableOpacity>
        <Text style={{ color: '#344a40', fontSize: 20, fontWeight: '800', marginLeft: 14 }}>
          Cambiar contraseña
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16 }}>
          <Text style={{ color: '#71827a', fontSize: 13, lineHeight: 19, marginBottom: 17 }}>
            Confirma tu contraseña actual y elige una nueva de 8 a 25 caracteres.
          </Text>
          {renderPasswordField('Contraseña actual', currentPassword, setCurrentPassword, 'Escribe tu contraseña actual')}
          {renderPasswordField('Nueva contraseña', newPassword, setNewPassword, 'Escribe una nueva contraseña')}
          {renderPasswordField('Confirmar nueva contraseña', confirmPassword, setConfirmPassword, 'Repite la nueva contraseña')}
          <TouchableOpacity
            onPress={changePassword}
            disabled={saving}
            style={{
              height: 46,
              borderRadius: 12,
              backgroundColor: saving ? '#8bbcaf' : '#319d88',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 2,
            }}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>Actualizar contraseña</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
