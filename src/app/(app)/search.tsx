import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_BASE_URL } from '../../config/api';
import { geocodeAddress, getCurrentDeviceLocation, PawsyLocation } from '../../config/location';
import { MapLocationPicker } from '../../components/map-location-picker';

type NearbyPost = {
  id: number;
  titulo: string;
  descripcion?: string | null;
  imagen?: string | null;
  estado: string;
  nombre_usuario?: string;
  nombre?: string;
  apellidos?: string;
  ciudad?: string | null;
  colonia?: string | null;
  calle?: string | null;
  distancia_km: number;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo completar la búsqueda.';
}

export default function SearchScreen() {
  const [center, setCenter] = useState<PawsyLocation | null>(null);
  const [radius, setRadius] = useState('10');
  const [customAddress, setCustomAddress] = useState('');
  const [posts, setPosts] = useState<NearbyPost[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);

  const searchNearby = useCallback(async (location: PawsyLocation, radiusKm: number) => {
    setLoadingPosts(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        latitud: String(location.latitude),
        longitud: String(location.longitude),
        radioKm: String(radiusKm),
      });
      const response = await fetch(`${API_BASE_URL}/api/publicaciones/cercanas?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status} al buscar avisos`);
      }
      setPosts(Array.isArray(data) ? data : []);
    } catch (searchError) {
      setError(getErrorMessage(searchError));
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  const handleCurrentLocation = useCallback(async () => {
    setLoadingLocation(true);
    setError(null);
    try {
      const location = await getCurrentDeviceLocation();
      setCenter(location);
      const radiusKm = Number(radius.replace(',', '.'));
      if (Number.isFinite(radiusKm) && radiusKm > 0 && radiusKm <= 500) {
        await searchNearby(location, radiusKm);
      }
    } catch (locationError) {
      setError(getErrorMessage(locationError));
    } finally {
      setLoadingLocation(false);
    }
  }, [radius, searchNearby]);

  useEffect(() => {
    void handleCurrentLocation();
  }, []);

  const applyRadius = async () => {
    const radiusKm = Number(radius.replace(',', '.'));
    if (!Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > 500) {
      setError('El radio debe ser mayor que 0 y no superar los 500 km.');
      return;
    }
    if (!center) {
      setError('Usa tu ubicación actual o busca otra ubicación para establecer el punto de búsqueda.');
      return;
    }
    await searchNearby(center, radiusKm);
  };

  const handleCustomAddress = async () => {
    setLoadingLocation(true);
    setError(null);
    try {
      const location = await geocodeAddress(customAddress);
      setCenter(location);
      const radiusKm = Number(radius.replace(',', '.'));
      if (!Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > 500) {
        setError('El radio debe ser mayor que 0 y no superar los 500 km.');
        return;
      }
      await searchNearby(location, radiusKm);
    } catch (locationError) {
      setError(getErrorMessage(locationError));
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleMapSelection = (location: PawsyLocation) => {
    setCenter(location);
    setError(null);
    const radiusKm = Number(radius.replace(',', '.'));
    if (!Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > 500) {
      setError('El radio debe ser mayor que 0 y no superar los 500 km.');
      return;
    }
    void searchNearby(location, radiusKm);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f1f8f4' }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ backgroundColor: '#fff', borderRadius: 15, padding: 14, marginBottom: 14 }}>
          <TouchableOpacity
            onPress={handleCurrentLocation}
            disabled={loadingLocation}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 13 }}
          >
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#e5f4ed',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
            }}>
              {loadingLocation ? (
                <ActivityIndicator size="small" color="#319d88" />
              ) : (
                <Ionicons name="locate-outline" size={20} color="#319d88" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#355247', fontSize: 13, fontWeight: '800' }}>Usar mi ubicación actual</Text>
              <Text style={{ color: '#7c8b84', fontSize: 11, marginTop: 2 }} numberOfLines={2}>
                {center?.label || 'Pawsy la usará solo para calcular distancias.'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color="#87958e" />
          </TouchableOpacity>

          <Text style={{ color: '#52665d', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
            Buscar alrededor de otra ubicación
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <TextInput
              value={customAddress}
              onChangeText={setCustomAddress}
              placeholder="Colonia, ciudad o dirección"
              placeholderTextColor="#97a49f"
              autoCorrect={false}
              style={{
                flex: 1,
                height: 43,
                borderWidth: 1,
                borderColor: '#dce7e1',
                borderRadius: 10,
                paddingHorizontal: 11,
                color: '#28332f',
                fontSize: 13,
                marginRight: 8,
              }}
            />
            <TouchableOpacity
              onPress={handleCustomAddress}
              disabled={loadingLocation}
              accessibilityLabel="Buscar alrededor de esta dirección"
              style={{
                width: 43,
                height: 43,
                borderRadius: 10,
                backgroundColor: '#319d88',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {loadingLocation ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="search" size={18} color="#fff" />}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => setMapOpen(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              height: 40,
              borderRadius: 10,
              backgroundColor: '#edf7f4',
              marginBottom: 13,
            }}
          >
            <Ionicons name="map-outline" size={16} color="#319d88" />
            <Text style={{ color: '#319d88', fontSize: 12, fontWeight: '800', marginLeft: 6 }}>
              Elegir punto en el mapa
            </Text>
          </TouchableOpacity>

          <Text style={{ color: '#52665d', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
            Radio de búsqueda (km)
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              value={radius}
              onChangeText={setRadius}
              keyboardType="decimal-pad"
              placeholder="10"
              placeholderTextColor="#97a49f"
              style={{
                flex: 1,
                height: 43,
                borderWidth: 1,
                borderColor: '#dce7e1',
                borderRadius: 10,
                paddingHorizontal: 11,
                color: '#28332f',
                fontSize: 13,
                marginRight: 8,
              }}
            />
            <TouchableOpacity
              onPress={applyRadius}
              disabled={loadingPosts || !center}
              style={{
                height: 43,
                borderRadius: 10,
                paddingHorizontal: 15,
                backgroundColor: '#319d88',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {loadingPosts ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>Aplicar radio</Text>}
            </TouchableOpacity>
          </View>
          <Text style={{ color: '#93a098', fontSize: 10, lineHeight: 15, marginTop: 8 }}>
            Tu ubicación actual solo se envía para calcular la distancia; no se guarda en tu perfil.
          </Text>
        </View>

        {error ? (
          <View style={{ backgroundColor: '#fff2f0', borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <Text style={{ color: '#a94442', fontSize: 12, lineHeight: 17 }}>{error}</Text>
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 9 }}>
          <Text style={{ flex: 1, color: '#344a40', fontSize: 17, fontWeight: '800' }}>Publicaciones cercanas</Text>
          {center ? (
            <Text style={{ color: '#6f8178', fontSize: 11 }}>En un radio de {radius} km</Text>
          ) : null}
        </View>

        {loadingPosts ? (
          <ActivityIndicator color="#319d88" style={{ marginTop: 20 }} />
        ) : posts.length === 0 ? (
          <View style={{ backgroundColor: '#fff', borderRadius: 14, alignItems: 'center', padding: 22 }}>
            <Ionicons name="paw-outline" size={30} color="#8fb5a7" />
            <Text style={{ color: '#61736b', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
              {center && !error
                ? `No hay avisos con ubicación precisa dentro de ${radius} km. Prueba ampliar el radio o elegir otro lugar.`
                : 'Activa tu ubicación o busca otra dirección para ver avisos cercanos.'}
            </Text>
          </View>
        ) : (
          posts.map((post) => {
            const imageUri = post.imagen
              ? post.imagen.startsWith('http')
                ? post.imagen
                : `${API_BASE_URL}${post.imagen}`
              : null;
            const location = [post.calle, post.colonia, post.ciudad]
              .filter((part): part is string => !!part?.trim())
              .join(', ');
            const author = [post.nombre, post.apellidos].filter(Boolean).join(' ')
              || (post.nombre_usuario ? `@${post.nombre_usuario}` : 'Usuario de Pawsy');
            const distance = post.distancia_km < 1
              ? `${Math.round(post.distancia_km * 1000)} m`
              : `${post.distancia_km.toFixed(1)} km`;

            return (
              <View key={post.id} style={{
                backgroundColor: '#fff',
                borderRadius: 13,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#e4ece7',
                marginBottom: 11,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#273a32', fontSize: 13, fontWeight: '800' }}>{author}</Text>
                    <Text style={{ color: '#76847d', fontSize: 11, marginTop: 3 }} numberOfLines={1}>
                      {location || 'Ubicación no especificada'}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: '#e8f4ef', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5 }}>
                    <Text style={{ color: '#398976', fontSize: 11, fontWeight: '800' }}>{distance}</Text>
                  </View>
                </View>
                <View style={{
                  position: 'absolute',
                  top: 52,
                  right: 12,
                  backgroundColor: post.estado === 'Encontrado' ? '#51b7a3' : post.estado === 'En Adopción' ? '#4faed1' : '#f1a44b',
                  borderRadius: 10,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  zIndex: 2,
                }}>
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>{post.estado}</Text>
                </View>
                <Text style={{ color: '#2d3e36', fontSize: 16, fontWeight: '800', paddingHorizontal: 12, marginBottom: 6 }}>
                  {post.titulo}
                </Text>
                {post.descripcion ? (
                  <Text style={{ color: '#56665e', fontSize: 12, lineHeight: 17, paddingHorizontal: 12, marginBottom: 10 }}>
                    {post.descripcion}
                  </Text>
                ) : null}
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={{ width: '100%', height: 205, backgroundColor: '#e8efeb' }} resizeMode="cover" />
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
      <MapLocationPicker
        visible={mapOpen}
        onClose={() => setMapOpen(false)}
        initialLocation={center}
        onSelect={handleMapSelection}
      />
    </View>
  );
}
