import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router, Stack, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/auth-context';
import { API_BASE_URL } from '../../config/api';

export default function AppLayout() {
  const { isLoggedIn, signOut, user } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!user?.id) {
      setUnreadNotifications(0);
      return;
    }

    let active = true;
    const loadUnreadNotifications = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/notificaciones/resumen?usuario_id=${user.id}`,
        );
        if (!response.ok) return;
        const result = await response.json();
        if (active) setUnreadNotifications(Number(result.noLeidas) || 0);
      } catch {
        // La bandeja muestra el error si no se pueden cargar las notificaciones.
      }
    };

    void loadUnreadNotifications();
    const interval = setInterval(() => void loadUnreadNotifications(), 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user?.id]);

  if (!isLoggedIn) {
    return <Redirect href={'/sign-in' as any} />;
  }

  const openCreatePost = () => {
    const createPost = Date.now().toString();
    if (pathname.endsWith('/dashboard')) {
      router.setParams({ createPost });
      return;
    }
    router.push({ pathname: '/(app)/dashboard', params: { createPost } } as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#eef9f3' }}>
      <LinearGradient
        colors={['#c9df58', '#59cfc1', '#4cb3d3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          height: 94,
          paddingTop: 38,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <View style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Ionicons name="paw" size={20} color="#2e75d1" />
          </View>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>PAWSY</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={unreadNotifications ? `Notificaciones, ${unreadNotifications} sin leer` : 'Notificaciones'}
            onPress={() => router.push('/(app)/notifications' as any)}
            style={{ position: 'relative' }}
          >
            <Ionicons name="notifications-outline" size={23} color="#fff" />
            {unreadNotifications > 0 ? (
              <View style={{
                position: 'absolute',
                top: -7,
                right: -9,
                minWidth: 17,
                height: 17,
                borderRadius: 9,
                backgroundColor: '#dc3545',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 3,
              }}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onPress={() => setMenuOpen((open) => !open)}
            hitSlop={8}
          >
            <Ionicons name={menuOpen ? 'close' : 'menu'} size={27} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Stack screenOptions={{ headerShown: false }} />

      <View style={{
        height: 72,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e2e2',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 4,
      }}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Inicio"
          style={{ alignItems: 'center' }}
          onPress={() => router.replace('/(app)/dashboard' as any)}
        >
          <Ionicons name="home-outline" size={22} color={pathname.endsWith('/dashboard') ? '#47a9d1' : '#555'} />
          <Text style={{ fontSize: 9, color: '#555', marginTop: 2 }}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Buscar avisos cercanos"
          style={{ alignItems: 'center' }}
          onPress={() => router.push('/(app)/search' as any)}
        >
          <Ionicons name="search-outline" size={22} color={pathname.endsWith('/search') ? '#47a9d1' : '#555'} />
          <Text style={{ fontSize: 9, color: '#555', marginTop: 2 }}>Buscar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Crear publicación"
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: '#47a9d1',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: -18,
            borderWidth: 3,
            borderColor: '#fff',
          }}
          onPress={openCreatePost}
        >
          <Ionicons name="add" size={25} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Perfil"
          style={{ alignItems: 'center' }}
          onPress={() => router.replace('/(app)/profile' as any)}
        >
          <Ionicons
            name="person-outline"
            size={22}
            color={pathname.includes('/profile') ? '#47a9d1' : '#555'}
          />
          <Text style={{ fontSize: 9, color: '#555', marginTop: 2 }}>Perfil</Text>
        </TouchableOpacity>
      </View>

      {menuOpen && (
        <View style={{
          position: 'absolute',
          zIndex: 20,
          top: 82,
          right: 12,
          width: 205,
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.18,
          shadowRadius: 8,
        }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', padding: 11 }}
            onPress={() => router.push('/(app)/privacy' as any)}
          >
            <Ionicons name="shield-checkmark-outline" size={17} color="#555" />
            <Text style={{ color: '#444', fontWeight: '600', marginLeft: 9 }}>Aviso de privacidad</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', padding: 11 }}
            onPress={() => router.push('/(app)/change-password' as any)}
          >
            <Ionicons name="key-outline" size={17} color="#555" />
            <Text style={{ color: '#444', fontWeight: '600', marginLeft: 9 }}>Cambiar contraseña</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', padding: 11 }}
            onPress={() => {
              setMenuOpen(false);
              signOut();
              router.replace('/(auth)/sign-in' as any);
            }}
          >
            <Ionicons name="log-out-outline" size={17} color="#c0392b" />
            <Text style={{ color: '#c0392b', fontWeight: '600', marginLeft: 9 }}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}