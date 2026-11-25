import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { PawsyLocation, reverseGeocodeCoordinates } from '../config/location';

type Props = {
  visible: boolean;
  initialLocation: Pick<PawsyLocation, 'latitude' | 'longitude'> | null;
  onClose: () => void;
  onSelect: (location: PawsyLocation) => void;
};

const DEFAULT_REGION: Region = {
  latitude: 19.432608,
  longitude: -99.133209,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};

export function MapLocationPicker({ visible, initialLocation, onClose, onSelect }: Props) {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [coordinate, setCoordinate] = useState({
    latitude: DEFAULT_REGION.latitude,
    longitude: DEFAULT_REGION.longitude,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const center = initialLocation || DEFAULT_REGION;
    setCoordinate({ latitude: center.latitude, longitude: center.longitude });
    setRegion({ ...DEFAULT_REGION, latitude: center.latitude, longitude: center.longitude });
  }, [visible, initialLocation?.latitude, initialLocation?.longitude]);

  const confirmSelection = async () => {
    setSaving(true);
    try {
      const location = await reverseGeocodeCoordinates(coordinate.latitude, coordinate.longitude);
      onSelect(location);
      onClose();
    } catch (error) {
      Alert.alert(
        'No se pudo identificar el lugar',
        error instanceof Error ? error.message : 'Intenta seleccionar el punto nuevamente.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#f1f8f4', padding: 14, justifyContent: 'center' }}>
        <View style={{
          height: '92%',
          backgroundColor: '#fff',
          borderRadius: 18,
          overflow: 'hidden',
        }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ flex: 1, color: '#30463d', fontSize: 18, fontWeight: '900' }}>
                Selecciona la ubicación
              </Text>
              <TouchableOpacity onPress={onClose} accessibilityLabel="Cerrar mapa">
                <Ionicons name="close" size={23} color="#65756d" />
              </TouchableOpacity>
            </View>
            <Text style={{ color: '#75847d', fontSize: 12, marginTop: 4 }}>
              Toca el mapa o arrastra el marcador hasta el lugar que buscas.
            </Text>
          </View>

          <MapView
            key={`${region.latitude}-${region.longitude}`}
            style={{ flex: 1 }}
            initialRegion={region}
            onPress={(event) => setCoordinate(event.nativeEvent.coordinate)}
          >
            <Marker
              coordinate={coordinate}
              draggable
              onDragEnd={(event) => setCoordinate(event.nativeEvent.coordinate)}
              title="Ubicación seleccionada"
            />
          </MapView>

          <View style={{ flexDirection: 'row', padding: 14 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 11,
                backgroundColor: '#edf2f0',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}
            >
              <Text style={{ color: '#596a62', fontSize: 13, fontWeight: '700' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={confirmSelection}
              disabled={saving}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 11,
                backgroundColor: '#319d88',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>Usar este punto</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
