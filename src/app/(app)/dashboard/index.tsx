import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../context/auth-context';
import { useProfile } from '../../../context/ProfileContext';

const API_URL = 'http://localhost:3000';

type Publicacion = {
  id: number;
  usuario_id: number;
  mascota_id?: number | null;
  titulo?: string;
  descripcion?: string | null;
  imagen?: string | null;
  estado?: string;
  likes_count?: number;
  comentarios_count?: number;
  fecha_creacion?: string;
};

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { refreshProfile } = useProfile();

  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Record<number, boolean>>({});
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const cargarPublicaciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = user?.id
        ? `${API_URL}/api/usuarios/${user.id}/publicaciones`
        : `${API_URL}/api/publicaciones`;

      const res = await fetch(endpoint);
      if (!res.ok) {
        throw new Error(`Error ${res.status} al cargar publicaciones`);
      }
      const data = await res.json();
      setPublicaciones(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'No se pudieron cargar las publicaciones');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      cargarPublicaciones();
    }, [refreshProfile, cargarPublicaciones])
  );

  const toggleLike = (id: number) => {
    setLikedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCerrarSesion = () => {
    setMenuOpen(false);
    signOut();
    router.replace('/(auth)/sign-in' as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f6f5' }}>
      {/* Encabezado superior con degradado suave */}
      <View
        style={{
          backgroundColor: '#9be59c',
          paddingTop: 18,
          paddingBottom: 18,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 16 }}>🐾</Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '900',
              color: '#1e6bd6',
              letterSpacing: 0.5,
            }}
          >
            PAWSY
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity
            onPress={() => cargarPublicaciones()}
            accessibilityLabel="Notificaciones"
          >
            <Text style={{ fontSize: 22, color: '#fff' }}>🔔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMenuOpen((prev) => !prev)}
            accessibilityLabel="Menú"
          >
            <Text style={{ fontSize: 24, color: '#fff', fontWeight: 'bold' }}>
              ☰
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menú desplegable rápido */}
      {menuOpen && (
        <View
          style={{
            backgroundColor: '#fff',
            marginHorizontal: 16,
            marginTop: 8,
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#e0e0e0',
            gap: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setMenuOpen(false);
              router.push('/(app)/profile' as any);
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#222' }}>
              Ver mi perfil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCerrarSesion}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#c0392b' }}>
              Cerrar sesión
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Feed de publicaciones */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 90, gap: 14 }}
      >
        {loading ? (
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 14,
              padding: 32,
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="small" color="#2b7de9" />
          </View>
        ) : error ? (
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 14,
              padding: 20,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#c0392b', textAlign: 'center' }}>{error}</Text>
          </View>
        ) : publicaciones.length === 0 ? (
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 14,
              padding: 24,
              minHeight: 220,
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ color: '#777', fontSize: 15 }}>
              No hay publicaciones para mostrar todavía.
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 20,
              }}
            >
              <Text style={{ fontSize: 15, color: '#555' }}>🩷 0</Text>
              <Text style={{ fontSize: 14, color: '#666' }}>0 comentarios</Text>
            </View>
          </View>
        ) : (
          publicaciones.map((pub) => {
            const isLiked = !!likedIds[pub.id];
            const baseLikes = pub.likes_count ?? 0;
            const totalLikes = isLiked ? baseLikes + 1 : baseLikes;
            const totalComments = pub.comentarios_count ?? 0;

            return (
              <View
                key={pub.id}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 14,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: '#eaeaea',
                }}
              >
                {pub.titulo ? (
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: 'bold',
                      color: '#222',
                      marginBottom: 6,
                    }}
                  >
                    {pub.titulo}
                  </Text>
                ) : null}

                {pub.descripcion ? (
                  <Text
                    style={{
                      fontSize: 15,
                      color: '#444',
                      lineHeight: 21,
                      marginBottom: 14,
                    }}
                  >
                    {pub.descripcion}
                  </Text>
                ) : null}

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 8,
                  }}
                >
                  <TouchableOpacity onPress={() => toggleLike(pub.id)}>
                    <Text style={{ fontSize: 15, color: '#444' }}>
                      {isLiked ? '❤️' : '🩷'} {totalLikes}
                    </Text>
                  </TouchableOpacity>

                  <Text style={{ fontSize: 14, color: '#666' }}>
                    {totalComments}{' '}
                    {totalComments === 1 ? 'comentario' : 'comentarios'}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Barra inferior */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          paddingVertical: 10,
          paddingHorizontal: 20,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          style={{ alignItems: 'center' }}
          onPress={() => cargarPublicaciones()}
        >
          <Text style={{ fontSize: 20 }}>🏠</Text>
          <Text style={{ fontSize: 12, color: '#2b7de9', fontWeight: '600' }}>
            Inicio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ alignItems: 'center' }}
          onPress={() => cargarPublicaciones()}
        >
          <Text style={{ fontSize: 20 }}>🔍</Text>
          <Text style={{ fontSize: 12, color: '#555' }}>Buscar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: '#2b7de9',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => router.push('/(app)/profile' as any)}
          accessibilityLabel="Crear"
        >
          <Text style={{ color: '#fff', fontSize: 24, lineHeight: 26 }}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ alignItems: 'center' }}
          onPress={() => router.push('/(app)/profile' as any)}
        >
          <Text style={{ fontSize: 20 }}>👤</Text>
          <Text style={{ fontSize: 12, color: '#555' }}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}