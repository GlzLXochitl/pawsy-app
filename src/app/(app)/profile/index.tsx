import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
  Share,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_BASE_URL } from '../../../config/api';
import { useProfile } from '../../../context/ProfileContext';

type UserPublication = {
  id: number;
  titulo: string;
  descripcion?: string | null;
  imagen?: string | null;
  estado: string;
  fecha_creacion: string;
  likes_count?: number;
  comentarios_count?: number;
  ciudad?: string | null;
  colonia?: string | null;
  calle?: string | null;
  liked_by_user?: number | boolean;
};

type Comment = {
  id: number;
  usuario_id: number;
  nombre_usuario?: string;
  descripcion: string;
};

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Profile() {
  const { userId, profile, loading: profileLoading, error: profileError, refreshProfile } = useProfile();
  const [publicaciones, setPublicaciones] = useState<UserPublication[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [likedIds, setLikedIds] = useState<Record<number, boolean>>({});
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [openComments, setOpenComments] = useState<Record<number, boolean>>({});
  const [commentsCounts, setCommentsCounts] = useState<Record<number, number>>({});
  const [openPostMenu, setOpenPostMenu] = useState<number | null>(null);

  const loadPublicaciones = useCallback(async () => {
    if (!userId) {
      setPublicaciones([]);
      return;
    }

    setLoadingPosts(true);
    setPostsError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuarios/${userId}/publicaciones`);
      if (!response.ok) {
        throw new Error(`Error ${response.status} al cargar tus publicaciones`);
      }
      const data = await response.json();
      const posts: UserPublication[] = Array.isArray(data) ? data : [];
      setPublicaciones(posts);
      setLikedIds(Object.fromEntries(posts.map((post) => [post.id, !!post.liked_by_user])));
    } catch (err) {
      setPostsError(err instanceof Error ? err.message : 'No se pudieron cargar tus publicaciones');
    } finally {
      setLoadingPosts(false);
    }
  }, [userId]);

  useFocusEffect(useCallback(() => {
    refreshProfile();
    loadPublicaciones();
  }, [refreshProfile, loadPublicaciones]));

  const refrescar = async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), loadPublicaciones()]);
    setRefreshing(false);
  };

  const avatarPath = profile.foto_perfil || 'default_avatar.png';
  const avatarUri = avatarPath.startsWith('http')
    ? avatarPath
    : avatarPath.startsWith('/profile-images/')
      ? `${API_BASE_URL}${avatarPath}`
      : `${API_BASE_URL}/profile-images/${encodeURIComponent(avatarPath)}`;
  useEffect(() => {
    setAvatarError(false);
  }, [avatarUri]);
  const nombreCompleto = [profile.nombre, profile.apellidos]
    .filter((parte) => typeof parte === 'string' && parte.trim())
    .join(' ');
  const contacto = [
    profile.email ? `Correo: ${profile.email}` : null,
    profile.celular ? `Celular: ${profile.celular}` : null,
  ].filter((dato): dato is string => dato !== null).join('\n');

  const copiarContacto = async () => {
    try {
      await Clipboard.setStringAsync(contacto);
      Alert.alert('Copiado', 'La información de contacto se copió al portapapeles.');
    } catch {
      Alert.alert('No se pudo copiar', 'Intenta copiar la información de contacto nuevamente.');
    }
  };

  const toggleLike = async (postId: number) => {
    if (!userId) return;
    const wasLiked = !!likedIds[postId];
    setLikedIds((previous) => ({ ...previous, [postId]: !wasLiked }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/publicaciones/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: userId }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Error ${response.status}`);
      }
      setLikedIds((previous) => ({ ...previous, [postId]: !!result.liked }));
    } catch (likeError) {
      setLikedIds((previous) => ({ ...previous, [postId]: wasLiked }));
      Alert.alert(
        'No se pudo actualizar',
        likeError instanceof Error ? likeError.message : 'Intenta dar like nuevamente.',
      );
    }
  };

  const toggleComments = async (postId: number) => {
    if (openComments[postId]) {
      setOpenComments((previous) => ({ ...previous, [postId]: false }));
      return;
    }
    setOpenComments((previous) => ({ ...previous, [postId]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/publicaciones/${postId}/comentarios`);
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      const loaded = Array.isArray(data) ? data : [];
      setComments((previous) => ({ ...previous, [postId]: loaded }));
      setCommentsCounts((previous) => ({ ...previous, [postId]: loaded.length }));
    } catch {
      Alert.alert('No se pudieron cargar los comentarios', 'Intenta abrirlos nuevamente.');
    }
  };

  const enviarComentario = async (postId: number) => {
    const descripcion = (commentDrafts[postId] || '').trim();
    if (!descripcion || !userId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/publicaciones/${postId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: userId, descripcion }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Error ${response.status}`);
      }
      const created: Comment = {
        id: result.id || Date.now(),
        usuario_id: userId,
        nombre_usuario: profile.usuario || 'Tú',
        descripcion,
      };
      setComments((previous) => ({ ...previous, [postId]: [...(previous[postId] || []), created] }));
      setCommentsCounts((previous) => ({
        ...previous,
        [postId]: (previous[postId] ?? comments[postId]?.length ?? 0) + 1,
      }));
      setCommentDrafts((previous) => ({ ...previous, [postId]: '' }));
      setOpenComments((previous) => ({ ...previous, [postId]: true }));
    } catch (commentError) {
      Alert.alert(
        'No se pudo enviar',
        commentError instanceof Error ? commentError.message : 'Intenta publicar tu comentario nuevamente.',
      );
    }
  };

  const compartirPublicacion = async (publicacion: UserPublication) => {
    const ubicacion = [publicacion.calle, publicacion.colonia, publicacion.ciudad]
      .filter((parte): parte is string => typeof parte === 'string' && parte.trim().length > 0)
      .join(', ') || profile.ubicacion || 'No especificada';
    try {
      await Share.share({
        title: `${publicacion.estado}: ${publicacion.titulo} | Pawsy App`,
        message: [
          'Publicación de Pawsy App',
          '',
          `${publicacion.estado}: ${publicacion.titulo}`,
          publicacion.descripcion || '',
          '',
          `Publicado por: ${nombreCompleto || profile.usuario || 'Usuario de Pawsy'}`,
          `Fecha: ${formatDate(publicacion.fecha_creacion)}`,
          `Ubicación: ${ubicacion}`,
          '',
          '¿Tienes información sobre esta mascota? Contacta a quien publicó.',
        ].filter(Boolean).join('\n'),
      });
      setOpenPostMenu(null);
    } catch {
      Alert.alert('No se pudo compartir', 'Intenta compartir la publicación nuevamente.');
    }
  };

  const eliminarPublicacion = (publicacionId: number) => {
    if (!userId) return;
    Alert.alert('Eliminar publicación', '¿Quieres eliminar esta publicación?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/api/publicaciones/${publicacionId}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ usuario_id: userId }),
            });
            if (!response.ok) throw new Error(`Error ${response.status}`);
            setOpenPostMenu(null);
            await loadPublicaciones();
          } catch {
            Alert.alert('No se pudo eliminar', 'Intenta eliminar la publicación nuevamente.');
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f1f8f4' }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refrescar} tintColor="#319d88" />}
      >
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 18,
          padding: 18,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#e3ede7',
        }}>
          <View style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: '#e6f1ec',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {!avatarError ? (
              <Image
                source={{ uri: avatarUri }}
                onError={() => setAvatarError(true)}
                style={{ width: 96, height: 96 }}
              />
            ) : (
              <Ionicons name="person" size={44} color="#79a194" />
            )}
          </View>

          {profileLoading && !profile.nombre ? (
            <ActivityIndicator color="#319d88" style={{ marginTop: 14 }} />
          ) : (
            <>
              <Text style={{ color: '#263b33', fontSize: 22, fontWeight: '800', marginTop: 12, textAlign: 'center' }}>
                {nombreCompleto || 'Completa tu perfil'}
              </Text>
              <Text style={{ color: '#71827a', fontSize: 14, marginTop: 3 }}>
                @{profile.usuario || 'usuario'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <Ionicons name="location-outline" size={16} color="#559887" />
                <Text style={{ color: '#61736b', fontSize: 13, marginLeft: 4, textAlign: 'center' }}>
                  {profile.ubicacion || 'Sin ubicación'}
                </Text>
              </View>
            </>
          )}

          <TouchableOpacity
            onPress={() => router.push('/(app)/profile/edit-profile' as any)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f1f7f4',
              borderRadius: 16,
              paddingVertical: 7,
              paddingHorizontal: 11,
              marginTop: 13,
            }}
          >
            <Ionicons name="create-outline" size={15} color="#568f7f" />
            <Text style={{ color: '#568f7f', fontSize: 12, fontWeight: '600', marginLeft: 5 }}>
              Editar
            </Text>
          </TouchableOpacity>
        </View>

        {(profile.email || profile.celular) && (
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 14, marginTop: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => setContactOpen((open) => !open)}
                accessibilityRole="button"
                accessibilityLabel={contactOpen ? 'Ocultar datos de contacto' : 'Mostrar datos de contacto'}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
              >
                <Text style={{ color: '#354b42', fontSize: 14, fontWeight: '700' }}>
                  Datos de contacto
                </Text>
                <Ionicons
                  name={contactOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#71827a"
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={copiarContacto}
                accessibilityRole="button"
                accessibilityLabel="Copiar información de contacto"
                style={{ flexDirection: 'row', alignItems: 'center', padding: 4 }}
              >
                <Ionicons name="copy-outline" size={14} color="#6e9285" />
                <Text style={{ color: '#6e9285', fontSize: 11, marginLeft: 4 }}>Copiar</Text>
              </TouchableOpacity>
            </View>
            {contactOpen && (
              <View style={{ marginTop: 12 }}>
                {profile.email ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: profile.celular ? 9 : 0 }}>
                    <Ionicons name="mail-outline" size={16} color="#579886" />
                    <Text style={{ color: '#687a72', fontSize: 13, marginLeft: 9 }}>{profile.email}</Text>
                  </View>
                ) : null}
                {profile.celular ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="call-outline" size={16} color="#579886" />
                    <Text style={{ color: '#687a72', fontSize: 13, marginLeft: 9 }}>{profile.celular}</Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>
        )}

        {loadingPosts ? (
          <ActivityIndicator color="#319d88" style={{ marginTop: 18 }} />
        ) : postsError ? (
          <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 16, marginTop: 14 }}>
            <Text style={{ color: '#b04a4a', fontSize: 13 }}>{postsError}</Text>
            <TouchableOpacity onPress={loadPublicaciones} style={{ marginTop: 10 }}>
              <Text style={{ color: '#319d88', fontWeight: '700' }}>Intentar de nuevo</Text>
            </TouchableOpacity>
          </View>
        ) : publicaciones.length === 0 ? (
          <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 20, alignItems: 'center', marginTop: 14 }}>
            <Ionicons name="paw-outline" size={30} color="#8fb5a7" />
            <Text style={{ color: '#61736b', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
              Aún no tienes publicaciones. Comparte un aviso para ayudar a una mascota.
            </Text>
          </View>
        ) : (
          publicaciones.map((publicacion) => {
            const liked = !!likedIds[publicacion.id];
            const totalLikes = (publicacion.likes_count || 0)
              + (liked ? 1 : 0)
              - (publicacion.liked_by_user ? 1 : 0);
            const postComments = comments[publicacion.id] || [];
            const commentCount = commentsCounts[publicacion.id] ?? publicacion.comentarios_count ?? 0;
            const location = [publicacion.calle, publicacion.colonia, publicacion.ciudad]
              .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
              .join(', ') || profile.ubicacion || 'Sin ubicación';
            const imageUri = publicacion.imagen
              ? publicacion.imagen.startsWith('http')
                ? publicacion.imagen
                : `${API_BASE_URL}${publicacion.imagen}`
              : null;
            const statusColor = publicacion.estado === 'Encontrado'
              ? '#51b7a3'
              : publicacion.estado === 'En Adopción'
                ? '#4faed1'
                : '#f1a44b';

            return (
              <View key={publicacion.id} style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                marginTop: 14,
                marginBottom: 2,
                overflow: 'hidden',
                position: 'relative',
                borderWidth: 1,
                borderColor: '#e4ece7',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, paddingBottom: 9 }}>
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#e6f1ec',
                    overflow: 'hidden',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 9,
                  }}>
                    {!avatarError ? (
                      <Image source={{ uri: avatarUri }} onError={() => setAvatarError(true)} style={{ width: 36, height: 36 }} />
                    ) : (
                      <Ionicons name="person" size={19} color="#79a194" />
                    )}
                  </View>
                  <View style={{ flex: 1, paddingRight: 104 }}>
                    <Text style={{ color: '#202020', fontSize: 12, fontWeight: '800' }}>
                      {nombreCompleto || profile.usuario || 'Usuario de Pawsy'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => toggleComments(publicacion.id)}
                      style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}
                    >
                      <Ionicons name="location-outline" size={11} color="#777" />
                      <Text style={{ color: '#777', fontSize: 10, marginLeft: 2 }} numberOfLines={1}>
                        {location}
                      </Text>
                      <Ionicons
                        name={openComments[publicacion.id] ? 'chevron-up' : 'chevron-down'}
                        size={11}
                        color="#777"
                        style={{ marginLeft: 3 }}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    zIndex: 5,
                  }}>
                    <View style={{
                      borderRadius: 12,
                      paddingHorizontal: 9,
                      paddingVertical: 4,
                      backgroundColor: statusColor,
                    }}>
                      <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>{publicacion.estado}</Text>
                    </View>
                    <TouchableOpacity
                      accessibilityLabel="Opciones de publicación"
                      onPress={() => setOpenPostMenu(openPostMenu === publicacion.id ? null : publicacion.id)}
                      hitSlop={8}
                      style={{ padding: 4 }}
                    >
                      <Ionicons name="ellipsis-horizontal" size={19} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>

                {openPostMenu === publicacion.id && (
                  <View style={{
                    position: 'absolute',
                    top: 42,
                    right: 8,
                    width: 150,
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#e2e8e5',
                    zIndex: 20,
                    elevation: 8,
                    paddingVertical: 4,
                  }}>
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 9 }}
                      onPress={() => compartirPublicacion(publicacion)}
                    >
                      <Ionicons name="share-social-outline" size={16} color="#555" />
                      <Text style={{ color: '#555', fontSize: 11, marginLeft: 8 }}>Compartir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 9 }}
                      onPress={() => eliminarPublicacion(publicacion.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#c94d4d" />
                      <Text style={{ color: '#c94d4d', fontSize: 11, marginLeft: 8 }}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <Text style={{ paddingHorizontal: 12, color: '#2d3e36', fontSize: 15, fontWeight: '700', marginBottom: 4 }}>
                  {publicacion.titulo}
                </Text>
                {publicacion.descripcion ? (
                  <Text style={{ paddingHorizontal: 12, color: '#444', fontSize: 11, lineHeight: 15, marginBottom: 9 }}>
                    {publicacion.descripcion}
                  </Text>
                ) : null}
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={{ width: '100%', height: 245, backgroundColor: '#dfe7e2' }} resizeMode="cover" />
                ) : null}

                <View style={{ paddingHorizontal: 12, paddingVertical: 9 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => toggleLike(publicacion.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? '#e84e66' : '#d9507d'} />
                      <Text style={{ color: '#777', fontSize: 10 }}>{totalLikes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleComments(publicacion.id)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    >
                      <Ionicons name="chatbubble-outline" size={15} color="#777" />
                      <Text style={{ color: '#777', fontSize: 10 }}>
                        {commentCount} {commentCount === 1 ? 'comentario' : 'comentarios'}
                      </Text>
                      <Ionicons name={openComments[publicacion.id] ? 'chevron-up' : 'chevron-down'} size={12} color="#777" />
                    </TouchableOpacity>
                  </View>

                  {openComments[publicacion.id] && (
                    <View style={{ borderTopWidth: 1, borderTopColor: '#ececec', marginTop: 8, paddingTop: 8 }}>
                      {postComments.length ? postComments.map((comment) => (
                        <View key={comment.id} style={{ backgroundColor: '#f5f7f6', borderRadius: 8, padding: 8, marginBottom: 5 }}>
                          <Text style={{ color: '#555', fontSize: 10, fontWeight: '700' }}>
                            {comment.nombre_usuario || 'Usuario'}
                          </Text>
                          <Text style={{ color: '#555', fontSize: 10, marginTop: 2 }}>{comment.descripcion}</Text>
                        </View>
                      )) : (
                        <Text style={{ color: '#888', fontSize: 10, marginBottom: 7 }}>Sé el primero en comentar.</Text>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                        <TextInput
                          value={commentDrafts[publicacion.id] || ''}
                          onChangeText={(text) => setCommentDrafts((previous) => ({ ...previous, [publicacion.id]: text }))}
                          placeholder="Escribe un comentario..."
                          placeholderTextColor="#999"
                          style={{ flex: 1, height: 34, borderRadius: 17, backgroundColor: '#f2f4f3', paddingHorizontal: 12, fontSize: 11, color: '#333' }}
                        />
                        <TouchableOpacity
                          onPress={() => enviarComentario(publicacion.id)}
                          accessibilityLabel="Enviar comentario"
                          style={{ marginLeft: 8, padding: 6 }}
                        >
                          <Ionicons name="send" size={17} color="#4b9d88" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                  <Text style={{ color: '#9aa59f', fontSize: 9, marginTop: 7 }}>
                    {formatDate(publicacion.fecha_creacion)}
                  </Text>
                </View>
              </View>
            );
          })
        )}

        {profileError ? (
          <Text style={{ color: '#b04a4a', fontSize: 12, textAlign: 'center', marginTop: 12 }}>
            No se pudo actualizar la información del perfil.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
