import * as Location from 'expo-location';

export type PawsyLocation = {
  latitude: number;
  longitude: number;
  ciudad: string;
  colonia: string;
  calle: string | null;
  referencias: string;
  label: string;
};

async function ensureForegroundPermission() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') {
    throw new Error('Permite el acceso a la ubicación mientras usas Pawsy para calcular distancias.');
  }
}

function mapAddress(
  latitude: number,
  longitude: number,
  address?: Location.LocationGeocodedAddress,
  fallbackAddress?: string,
): PawsyLocation {
  const fallbackParts = (fallbackAddress || '').split(',').map((part) => part.trim()).filter(Boolean);
  const calle = address?.street || address?.name || fallbackParts[0] || '';
  const colonia = address?.district || address?.subregion || fallbackParts[1] || address?.city || '';
  const ciudad = address?.city || address?.region || fallbackParts[fallbackParts.length - 1] || '';
  const locationName = [calle, colonia, ciudad || address?.region]
    .filter((part, index, parts) => !!part && parts.indexOf(part) === index)
    .join(', ');
  const label = locationName || fallbackAddress || `Ubicación ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

  return {
    latitude,
    longitude,
    ciudad: (ciudad || label).slice(0, 100),
    colonia: (colonia || ciudad || label).slice(0, 100),
    calle: calle ? calle.slice(0, 100) : null,
    referencias: (fallbackAddress || label).slice(0, 255),
    label,
  };
}

async function reverseGeocode(latitude: number, longitude: number, fallbackAddress?: string) {
  const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
  return mapAddress(latitude, longitude, addresses[0], fallbackAddress);
}

export async function reverseGeocodeCoordinates(latitude: number, longitude: number) {
  await ensureForegroundPermission();
  return reverseGeocode(latitude, longitude);
}

export async function getCurrentDeviceLocation() {
  await ensureForegroundPermission();
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return reverseGeocode(position.coords.latitude, position.coords.longitude);
}

export async function geocodeAddress(address: string) {
  const cleanAddress = address.trim();
  if (!cleanAddress) {
    throw new Error('Escribe una dirección o lugar para continuar.');
  }

  await ensureForegroundPermission();
  const results = await Location.geocodeAsync(cleanAddress);
  if (results.length === 0) {
    throw new Error('No encontramos ese lugar. Revisa la dirección e inténtalo de nuevo.');
  }
  const { latitude, longitude } = results[0];
  return reverseGeocode(latitude, longitude, cleanAddress);
}
