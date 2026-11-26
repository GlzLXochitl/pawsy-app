import { Ionicons } from '@expo/vector-icons';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import type { PawsyLocation } from '../config/location';

type Props = {
  visible: boolean;
  initialLocation: Pick<PawsyLocation, 'latitude' | 'longitude'> | null;
  onClose: () => void;
  onSelect: (location: PawsyLocation) => void;
};

export function MapLocationPicker({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        padding: 20,
      }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ flex: 1, color: '#30463d', fontSize: 18, fontWeight: '900' }}>
              Selector de mapa no disponible
            </Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Cerrar aviso">
              <Ionicons name="close" size={23} color="#65756d" />
            </TouchableOpacity>
          </View>
          <Text style={{ color: '#65756d', fontSize: 14, lineHeight: 20, marginBottom: 18 }}>
            El mapa está disponible en la app móvil. En la web, cierra este aviso y elige otra opción de ubicación.
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{
              height: 44,
              borderRadius: 10,
              backgroundColor: '#319d88',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
