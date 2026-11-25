import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Alert,
  Share,
} from 'react-native';
import { useAuth } from '../../../context/auth-context';
import { useProfile } from '../../../context/ProfileContext';
import { API_BASE_URL as API_URL } from '../../../config/api';
import { geocodeAddress, getCurrentDeviceLocation, PawsyLocation } from '../../../config/location';
import { MapLocationPicker } from '../../../components/map-location-picker';

const DOG_IMAGE =
  'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=85';

type Publicacion = {
  id: number;
  usuario_id: number;
  titulo?: string;
  descripcion?: string | null;
  imagen?: string | null;
  nombre_usuario?: string;
  nombre?: string;
  apellidos?: string;
  estado?: string;
  fecha_creacion?: string;
  ciudad?: string | null;
  colonia?: string | null;
  calle?: string | null;
  likes_count?: number;
  comentarios_count?: number;
};

type Comentario = {
  id: number;
  usuario_id: number;
  nombre_usuario?: string;
  descripcion: string;
};

type PublicationLocationType = 'registrada' | 'actual' | 'personalizada';
type PublicationLocation = PawsyLocation & { tipo: PublicationLocationType };

export default function DashboardScreen() {
  const { user } = useAuth();
  const { profile, refreshProfile } = useProfile();
  const { createPost } = useLocalSearchParams<{ createPost?: string }>();
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Record<number, boolean>>({});
  const [comments, setComments] = useState<Record<number, Comentario[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postImage, setPostImage] = useState('');
  const [postStatus, setPostStatus] = useState('En búsqueda');
  const [postLocationMode, setPostLocationMode] = useState<PublicationLocationType | null>(null);
  const [postLocation, setPostLocation] = useState<PublicationLocation | null>(null);
  const [resolvingPostLocation, setResolvingPostLocation] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [openComments, setOpenComments] = useState<Record<number, boolean>>({});
  const [commentsCounts, setCommentsCounts] = useState<Record<number, number>>({});
  const [openPostMenu, setOpenPostMenu] = useState<number | null>(null);

  const cargarComentarios = useCallback(async (posts: Publicacion[]) => {
    await Promise.all(posts.map(async (post) => {
      try {
        const response = await fetch(`${API_URL}/api/publicaciones/${post.id}/comentarios`);
        if (!response.ok) return;
        const data = await response.json();
        const loadedComments = Array.isArray(data) ? data : [];
        setComments((prev) => ({ ...prev, [post.id]: loadedComments }));
        setCommentsCounts((prev) => ({ ...prev, [post.id]: loadedComments.length }));
      } catch {
        // Los comentarios no impiden mostrar la publicación.
      }
    }));
  }, []);

  const cargarPublicaciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = `${API_URL}/api/publicaciones`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`Error ${response.status} al cargar publicaciones`);
      const data = await response.json();
      const posts = Array.isArray(data) ? data : [];
      setPublicaciones(posts);
      await cargarComentarios(posts);
    } catch (err: any) {
      setError(err?.message || 'No se pudieron cargar las publicaciones');
    } finally {
      setLoading(false);
    }
  }, [cargarComentarios]);

  useEffect(() => {
    if (createPost) {
      setCreateOpen(true);
      router.setParams({ createPost: undefined });
    }
  }, [createPost]);

  useFocusEffect(useCallback(() => {
    refreshProfile();
    cargarPublicaciones();
  }, [refreshProfile, cargarPublicaciones]));

  const toggleLike = async (postId: number) => {
    if (!user?.id) return;
    const previous = !!likedIds[postId];
    setLikedIds((prev) => ({ ...prev, [postId]: !previous }));
    try {
      await fetch(`${API_URL}/api/publicaciones/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user.id }),
      });
    } catch {
      setLikedIds((prev) => ({ ...prev, [postId]: previous }));
    }
  };

  const enviarComentario = async (postId: number) => {
    const descripcion = (commentDrafts[postId] || '').trim();
    if (!descripcion || !user?.id) return;

    try {
      const response = await fetch(`${API_URL}/api/publicaciones/${postId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user.id, descripcion }),
      });
      if (!response.ok) return;
      const created = await response.json();
      setComments((prev) => ({
        ...prev,
        [postId]: [
          ...(prev[postId] || []),
          {
            id: created.id || Date.now(),
            usuario_id: user.id,
            nombre_usuario: profile.usuario || 'Usuario',
            descripcion,
          },
        ],
      }));
      setCommentsCounts((prev) => ({
        ...prev,
        [postId]: (prev[postId] ?? comments[postId]?.length ?? 0) + 1,
      }));
      setOpenComments((prev) => ({ ...prev, [postId]: true }));
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
    } catch {
      // Conserva el borrador si falla el envío.
    }
  };

  useEffect(() => {
    if (createOpen) {
      setPostLocationMode(null);
      setPostLocation(null);
    }
  }, [createOpen]);

  const abrirSelectorMapa = () => {
    setMapOpen(true);
  };

  const seleccionarDireccionRegistrada = async () => {
    const address = [profile.calle, profile.colonia, profile.ciudad]
      .filter((part): part is string => !!part?.trim())
      .join(', ') || profile.ubicacion;
    if (!address || address === 'Sin ubicación') {
      Alert.alert('Sin dirección registrada', 'Agrega una dirección en tu perfil o selecciona otra ubicación.');
      return;
    }

    setResolvingPostLocation(true);
    setPostLocation(null);
    setPostLocationMode('registrada');
    try {
      const location = await geocodeAddress(address);
      setPostLocation({ ...location, tipo: 'registrada' });
    } catch (locationError) {
      Alert.alert(
        'No se encontró la dirección',
        locationError instanceof Error ? locationError.message : 'Verifica tu dirección registrada e inténtalo nuevamente.',
      );
    } finally {
      setResolvingPostLocation(false);
    }
  };

  const seleccionarUbicacionActual = async () => {
    setResolvingPostLocation(true);
    setPostLocation(null);
    setPostLocationMode('actual');
    try {
      const location = await getCurrentDeviceLocation();
      setPostLocation({ ...location, tipo: 'actual' });
    } catch (locationError) {
      Alert.alert(
        'No se pudo obtener la ubicación',
        locationError instanceof Error ? locationError.message : 'Revisa el permiso de ubicación e inténtalo nuevamente.',
      );
    } finally {
      setResolvingPostLocation(false);
    }
  };

  const crearPublicacion = async () => {
    if (!user?.id || (!postTitle.trim() && !postDescription.trim())) return;
    if (!postLocation) {
      Alert.alert('Elige una ubicación', 'Selecciona tu dirección registrada, tu ubicación actual o escribe otro lugar.');
      return;
    }
    setCreating(true);
    try {
      const response = await fetch(`${API_URL}/api/publicaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          titulo: postTitle.trim() || 'Publicación',
          descripcion: postDescription.trim(),
          imagen: postImage.trim() || null,
          estado: postStatus,
          ubicacion: {
            tipo: postLocation.tipo,
            ciudad: postLocation.ciudad,
            colonia: postLocation.colonia,
            calle: postLocation.calle,
            referencias: postLocation.referencias,
            latitud: postLocation.latitude,
            longitud: postLocation.longitude,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Error ${response.status} al publicar`);
      setCreateOpen(false);
      setPostTitle('');
      setPostDescription('');
      setPostImage('');
      setPostStatus('En búsqueda');
      setPostLocation(null);
      setPostLocationMode(null);
      await cargarPublicaciones();
    } catch (error) {
      Alert.alert(
        'No se pudo publicar',
        error instanceof Error ? error.message : 'Revisa tu conexión e inténtalo de nuevo.',
      );
    } finally {
      setCreating(false);
    }
  };

  const eliminarPublicacion = async (postId: number) => {
    if (!user?.id) return;
    Alert.alert(
      'Eliminar publicación',
      '¿Quieres eliminar esta publicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await fetch(`${API_URL}/api/publicaciones/${postId}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ usuario_id: user.id }),
            });
            setOpenPostMenu(null);
            await cargarPublicaciones();
          },
        },
      ]
    );
  };

  const compartirPublicacion = async (post: Publicacion) => {
    const autor = [post.nombre, post.apellidos]
      .filter((parte): parte is string => typeof parte === 'string' && parte.trim().length > 0)
      .join(' ')
      || (post.nombre_usuario ? `@${post.nombre_usuario}` : 'Usuario de Pawsy');
    const ubicacion = [post.calle, post.colonia, post.ciudad]
      .filter((parte): parte is string => typeof parte === 'string' && parte.trim().length > 0)
      .join(', ') || 'No especificada';
    const fecha = post.fecha_creacion
      ? new Date(post.fecha_creacion).toLocaleString('es-MX', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'No disponible';
    const titulo = post.titulo?.trim() || 'Mascota reportada';
    const descripcion = post.descripcion?.trim() || 'Sin descripción adicional.';

    await Share.share({
      title: `${post.estado || 'Aviso'}: ${titulo} | Pawsy App`,
      message: [
        '🐾 Publicación de Pawsy App',
        '',
        `${post.estado || 'Aviso de mascota'}: ${titulo}`,
        '',
        descripcion,
        '',
        `Publicado por: ${autor}`,
        `Fecha: ${fecha}`,
        `Ubicación: ${ubicacion}`,
        '',
        '¿Tienes información sobre esta mascota? Contacta a quien publicó y ayúdanos a reunirla con su familia.',
      ].join('\n'),
    });
    setOpenPostMenu(null);
  };

  const toggleComments = async (postId: number) => {
    const isOpen = !!openComments[postId];
    setOpenComments((prev) => ({ ...prev, [postId]: !isOpen }));

    try {
      const response = await fetch(`${API_URL}/api/publicaciones/${postId}/comentarios`);
      if (!response.ok) return;
      const data = await response.json();
      const loadedComments = Array.isArray(data) ? data : [];
      setComments((prev) => ({ ...prev, [postId]: loadedComments }));
      setCommentsCounts((prev) => ({ ...prev, [postId]: loadedComments.length }));
    } catch {
      // Conserva el contador y los comentarios que ya estén cargados.
    }
  };

  const postsToShow = publicaciones.length > 0
    ? publicaciones
    : [{
        id: 0,
        usuario_id: user?.id || 0,
        titulo: 'Carlos Ramirez (Escuela Canina)',
        descripcion: '¡Hola a todos! 🐾 Ya Efresco servicios de escuela para perros y avestruzamientos positivos. Ayuda a tu lomito a tener una mejor comportamiento. Contáctame por mensaje.',
        imagen: DOG_IMAGE,
      } as Publicacion];

  return (
    <View style={{ flex: 1, backgroundColor: '#eef9f3' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={{ height: 120, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator color="#4badd1" />
          </View>
        )}
        {error && <Text style={{ color: '#c0392b', textAlign: 'center', marginBottom: 10 }}>{error}</Text>}

        {postsToShow.map((post) => {
          const isLiked = !!likedIds[post.id];
          const totalLikes = (post.likes_count || 0) + (isLiked ? 1 : 0);
          const postComments = comments[post.id] || [];
          const commentCount =
            commentsCounts[post.id] ??
            (postComments.length > 0
              ? postComments.length
              : post.comentarios_count ?? 0);
          const author = post.nombre_usuario || profile.usuario || 'Carlos Ramirez';
          const isOwnPost = post.usuario_id === user?.id;
          const postLocation = [post.calle, post.colonia, post.ciudad]
            .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
            .join(', ');
          const location = postLocation || (isOwnPost ? profile.ubicacion : 'Ubicación no disponible');
          const status = post.estado || 'En búsqueda';
          const statusStyle =
            status === 'Encontrado'
              ? { backgroundColor: '#51b7a3', color: '#fff' }
              : status === 'En Adopción'
                ? { backgroundColor: '#4faed1', color: '#fff' }
                : { backgroundColor: '#f1a44b', color: '#fff' };
          const imageUrl = post.imagen
            ? (post.imagen.startsWith('http') ? post.imagen : `${API_URL}${post.imagen}`)
            : DOG_IMAGE;

          return (
            <View
              key={post.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: 8,
                marginBottom: 12,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#e4ece7',
                position: 'relative',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, paddingBottom: 8 }}>
                <View style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: '#d9ecf0',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                  overflow: 'hidden',
                }}>
                  <Image
                    source={{ uri: `${API_URL}/profile-images/default_avatar.png` }}
                    style={{ width: 34, height: 34 }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#202020', fontSize: 12, fontWeight: '800' }}>{author}</Text>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}
                    onPress={() => toggleComments(post.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver comentarios en ${location}`}
                  >
                    <Ionicons name="location-outline" size={10} color="#777" />
                    <Text style={{ color: '#777', fontSize: 9, marginLeft: 2 }} numberOfLines={1}>
                      {location}
                    </Text>
                    <Ionicons
                      name={openComments[post.id] ? 'chevron-up' : 'chevron-down'}
                      size={11}
                      color="#777"
                      style={{ marginLeft: 4 }}
                    />
                  </TouchableOpacity>
                </View>
                <View style={{
                  position: 'absolute',
                  top: 9,
                  right: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  zIndex: 5,
                }}>
                  <View style={{
                    borderRadius: 12,
                    paddingHorizontal: 9,
                    paddingVertical: 4,
                    marginRight: 6,
                    ...statusStyle,
                  }}>
                    <Text style={{ color: statusStyle.color, fontSize: 9, fontWeight: '800' }}>
                      {status}
                    </Text>
                  </View>
                  <TouchableOpacity
                    accessibilityLabel="Opciones de publicación"
                    onPress={() => setOpenPostMenu(openPostMenu === post.id ? null : post.id)}
                    hitSlop={8}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="ellipsis-horizontal" size={19} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              {openPostMenu === post.id && (
                <View style={{
                  position: 'absolute',
                  top: 38,
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
                    onPress={() => compartirPublicacion(post)}
                  >
                    <Ionicons name="share-social-outline" size={16} color="#555" />
                    <Text style={{ color: '#555', fontSize: 11, marginLeft: 8 }}>Compartir</Text>
                  </TouchableOpacity>
                  {isOwnPost && (
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 9 }}
                      onPress={() => eliminarPublicacion(post.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#c94d4d" />
                      <Text style={{ color: '#c94d4d', fontSize: 11, marginLeft: 8 }}>Eliminar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <Text style={{ paddingHorizontal: 12, color: '#444', fontSize: 10.5, lineHeight: 14, marginBottom: 8 }}>
                {post.descripcion || post.titulo || 'Sin descripción'}
              </Text>

              <Image
                source={{ uri: imageUrl }}
                style={{ width: '100%', height: 245, backgroundColor: '#dfe7e2' }}
                resizeMode="cover"
              />

              <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    onPress={() => toggleLike(post.id)}
                  >
                    <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={18} color={isLiked ? '#e84e66' : '#d9507d'} />
                    <Text style={{ color: '#777', fontSize: 10 }}>{totalLikes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    onPress={() => toggleComments(post.id)}
                  >
                    <Ionicons name="chatbubble-outline" size={15} color="#777" />
                    <Text style={{ color: '#777', fontSize: 10 }}>
                      {commentCount} {commentCount === 1 ? 'comentario' : 'comentarios'}
                    </Text>
                    <Ionicons
                      name={openComments[post.id] ? 'chevron-up' : 'chevron-down'}
                      size={12}
                      color="#777"
                    />
                  </TouchableOpacity>
                </View>

                <View style={{ borderTopWidth: 1, borderTopColor: '#ececec', marginTop: 8, paddingTop: 6 }}>
                  {openComments[post.id] && (
                    <View style={{ marginBottom: 8 }}>
                      {postComments.length > 0 ? (
                        postComments.map((comment) => (
                          <View key={comment.id} style={{
                            backgroundColor: '#f5f7f6',
                            borderRadius: 8,
                            paddingHorizontal: 9,
                            paddingVertical: 7,
                            marginBottom: 5,
                          }}>
                            <Text style={{ color: '#555', fontSize: 10, fontWeight: '700' }}>
                              {comment.nombre_usuario || 'Usuario'}
                            </Text>
                            <Text style={{ color: '#555', fontSize: 10, marginTop: 1 }}>
                              {comment.descripcion}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <Text style={{ color: '#888', fontSize: 10, marginBottom: 7 }}>
                          Sé el primero en comentar.
                        </Text>
                      )}
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <View style={{ width: 27, height: 27, borderRadius: 14, backgroundColor: '#bac7bd', marginRight: 7 }}>
                      <Image
                        source={{ uri: `${API_URL}/profile-images/default_avatar.png` }}
                        style={{ width: 27, height: 27, borderRadius: 14 }}
                      />
                    </View>
                    <TextInput
                      value={commentDrafts[post.id] || ''}
                      onChangeText={(text) => setCommentDrafts((prev) => ({ ...prev, [post.id]: text }))}
                      placeholder="Escribe un comentario..."
                      placeholderTextColor="#999"
                      style={{
                        flex: 1,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: '#f1f1f1',
                        paddingHorizontal: 10,
                        fontSize: 10,
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => enviarComentario(post.id)}
                      style={{
                        marginLeft: 7,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: '#47a9d1',
                        paddingHorizontal: 12,
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>Enviar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={createOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateOpen(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'center',
          padding: 20,
        }}>
          <ScrollView
            style={{ maxHeight: '92%', backgroundColor: '#fff', borderRadius: 16 }}
            contentContainerStyle={{ padding: 18 }}
            keyboardShouldPersistTaps="handled"
          >
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ flex: 1, fontSize: 18, fontWeight: '800', color: '#333' }}>
                Nueva publicación
              </Text>
              <TouchableOpacity onPress={() => setCreateOpen(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              value={postTitle}
              onChangeText={setPostTitle}
              placeholder="Título"
              style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 10 }}
            />
            <TextInput
              value={postDescription}
              onChangeText={setPostDescription}
              placeholder="Describe al perro perdido o encontrado"
              multiline
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 10,
                padding: 12,
                height: 90,
                textAlignVertical: 'top',
                marginBottom: 10,
              }}
            />
            <TextInput
              value={postImage}
              onChangeText={setPostImage}
              placeholder="URL de una imagen (opcional)"
              autoCapitalize="none"
              style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 10 }}
            />
            <Text style={{ color: '#38554a', fontSize: 12, fontWeight: '800', marginBottom: 7 }}>
              Ubicación del aviso
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 9 }}>
              {[
                { key: 'registrada' as const, label: 'Registrada', action: seleccionarDireccionRegistrada },
                { key: 'actual' as const, label: 'Actual', action: seleccionarUbicacionActual },
                { key: 'personalizada' as const, label: 'Otra', action: abrirSelectorMapa },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  onPress={option.action}
                  disabled={resolvingPostLocation}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 36,
                    paddingHorizontal: 5,
                    borderRadius: 8,
                    backgroundColor: postLocationMode === option.key ? '#47a9d1' : '#edf2f0',
                  }}
                >
                  <Text style={{
                    color: postLocationMode === option.key ? '#fff' : '#52665d',
                    fontSize: 10,
                    fontWeight: '700',
                  }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {postLocationMode === 'personalizada' && (
              <View style={{ marginBottom: 9 }}>
                <TouchableOpacity
                  onPress={abrirSelectorMapa}
                  disabled={resolvingPostLocation}
                  style={{
                    height: 40,
                    borderRadius: 9,
                    backgroundColor: '#edf7f4',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="map-outline" size={16} color="#319d88" />
                  <Text style={{ color: '#319d88', fontSize: 11, fontWeight: '800', marginLeft: 6 }}>
                    Colocar punto en el mapa
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 11,
              backgroundColor: '#edf7f4',
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 9,
            }}>
              <Ionicons name="location-outline" size={16} color="#4a9aa1" />
              <Text style={{ color: '#5c7771', fontSize: 10, marginLeft: 5, flex: 1 }} numberOfLines={3}>
                {resolvingPostLocation
                  ? 'Buscando la ubicación...'
                  : postLocation
                    ? `Se publicará desde: ${postLocation.label}`
                    : 'Elige una dirección registrada, tu ubicación actual o escribe otro lugar.'}
              </Text>
              {resolvingPostLocation ? <ActivityIndicator size="small" color="#4a9aa1" /> : null}
            </View>
            {!postLocation ? (
              <Text style={{ color: '#87958e', fontSize: 10, marginBottom: 10 }}>
                Pawsy necesita la ubicación del aviso para incluirlo en las búsquedas cercanas.
              </Text>
            ) : null}

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {['En búsqueda', 'Encontrado', 'En Adopción'].map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setPostStatus(status)}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: postStatus === status ? '#47a9d1' : '#edf2f0',
                  }}
                >
                  <Text style={{ fontSize: 10, color: postStatus === status ? '#fff' : '#555' }}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={crearPublicacion}
              disabled={creating || resolvingPostLocation || !postLocation}
              style={{
                backgroundColor: creating || resolvingPostLocation || !postLocation ? '#8bbeca' : '#47a9d1',
                borderRadius: 10,
                alignItems: 'center',
                paddingVertical: 13,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '800' }}>
                {creating ? 'Publicando...' : 'Publicar'}
              </Text>
            </TouchableOpacity>
          </View>
          </ScrollView>
        </View>
      </Modal>

      <MapLocationPicker
        visible={mapOpen}
        onClose={() => setMapOpen(false)}
        initialLocation={postLocation}
        onSelect={(location) => {
          setPostLocationMode('personalizada');
          setPostLocation({ ...location, tipo: 'personalizada' });
        }}
      />
    </View>
  );
}
