import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/auth-context';

type NotificationItem = {
  id: number;
  tipo: 'comentario_publicacion' | 'publicacion_publicada' | 'like_publicacion';
  actor_nombre: string | null;
  publicacion_id: number;
  mensaje: string;
  leida: number | boolean;
  fecha_creacion: string;
};

function isRead(notification: NotificationItem) {
  return notification.leida === true || Number(notification.leida) === 1;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function parseApiResponse(response: Response) {
  const body = await response.text();
  try {
    return JSON.parse(body);
  } catch {
    if (response.status === 404 && body.trimStart().startsWith('<')) {
      throw new Error('Reinicia el backend de Pawsy para cargar las rutas de notificaciones.');
    }
    throw new Error('El servidor devolvió una respuesta no válida.');
  }
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setError('Inicia sesión nuevamente para ver tus notificaciones.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notificaciones?usuario_id=${user.id}`,
      );
      const result = await parseApiResponse(response);
      if (!response.ok) {
        throw new Error(result.error || 'No se pudieron cargar las notificaciones.');
      }
      setNotifications(Array.isArray(result) ? result : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las notificaciones.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => {
    void loadNotifications();
  }, [loadNotifications]));

  const markAllAsRead = async () => {
    if (!user?.id) return;
    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/notificaciones/leidas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user.id }),
      });
      const result = await parseApiResponse(response);
      if (!response.ok) {
        throw new Error(result.error || 'No se pudieron actualizar las notificaciones.');
      }
      setNotifications((current) => current.map((item) => ({ ...item, leida: 1 })));
    } catch (updateError) {
      Alert.alert(
        'No se pudieron marcar',
        updateError instanceof Error ? updateError.message : 'Inténtalo nuevamente.',
      );
    } finally {
      setUpdating(false);
    }
  };

  const openNotification = async (notification: NotificationItem) => {
    if (!user?.id) return;
    if (!isRead(notification)) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/notificaciones/${notification.id}/leida`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: user.id }),
          },
        );
        const result = await parseApiResponse(response);
        if (!response.ok) {
          throw new Error(result.error || 'No se pudo actualizar la notificación.');
        }
        setNotifications((current) =>
          current.map((item) => item.id === notification.id ? { ...item, leida: 1 } : item),
        );
      } catch (updateError) {
        Alert.alert(
          'No se pudo actualizar',
          updateError instanceof Error ? updateError.message : 'Inténtalo nuevamente.',
        );
        return;
      }
    }
    router.push('/(app)/dashboard' as any);
  };

  const unreadCount = notifications.filter((item) => !isRead(item)).length;

  return (
    <View style={{ flex: 1, backgroundColor: '#f1f8f4' }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <Text style={{ flex: 1, color: '#30463d', fontSize: 21, fontWeight: '900' }}>
            Notificaciones
          </Text>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllAsRead} disabled={updating}>
              {updating ? (
                <ActivityIndicator size="small" color="#319d88" />
              ) : (
                <Text style={{ color: '#319d88', fontSize: 12, fontWeight: '800' }}>
                  Marcar todas leídas
                </Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        {loading ? (
          <ActivityIndicator color="#319d88" style={{ marginTop: 24 }} />
        ) : error ? (
          <View style={{ backgroundColor: '#fff2f0', borderRadius: 12, padding: 14 }}>
            <Text style={{ color: '#a94442', fontSize: 13, lineHeight: 18 }}>{error}</Text>
            <TouchableOpacity onPress={() => void loadNotifications()} style={{ marginTop: 10 }}>
              <Text style={{ color: '#a94442', fontSize: 12, fontWeight: '800' }}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : notifications.length === 0 ? (
          <View style={{ backgroundColor: '#fff', borderRadius: 14, alignItems: 'center', padding: 24 }}>
            <Ionicons name="notifications-off-outline" size={30} color="#8fb5a7" />
            <Text style={{ color: '#61736b', fontSize: 13, textAlign: 'center', marginTop: 9 }}>
              Aquí verás comentarios, reacciones y confirmaciones de tus publicaciones.
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => void openNotification(notification)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isRead(notification) ? '#fff' : '#f0faf6',
                borderRadius: 13,
                borderWidth: 1,
                borderColor: isRead(notification) ? '#e4ece7' : '#cce9de',
                padding: 14,
                marginBottom: 9,
              }}
            >
              <View style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: '#e5f4ed',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 11,
              }}>
                <Ionicons
                  name={
                    notification.tipo === 'comentario_publicacion'
                      ? 'chatbubble-ellipses-outline'
                      : notification.tipo === 'like_publicacion'
                        ? 'heart-outline'
                        : 'checkmark-circle-outline'
                  }
                  size={19}
                  color="#319d88"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#354b41', fontSize: 13, lineHeight: 18, fontWeight: isRead(notification) ? '500' : '800' }}>
                  {notification.actor_nombre ? `@${notification.actor_nombre} ` : ''}
                  {notification.mensaje}
                </Text>
                <Text style={{ color: '#8a9991', fontSize: 10, marginTop: 5 }}>
                  {formatDate(notification.fecha_creacion)}
                </Text>
              </View>
              {!isRead(notification) ? (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#319d88', marginLeft: 8 }} />
              ) : null}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
