import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const sections = [
  {
    title: 'Información que utilizamos',
    body: 'Pawsy utiliza los datos que proporcionas al crear y editar tu cuenta, como nombre, usuario, correo, teléfono y ubicación. También almacena el contenido de tus avisos, fotografías, comentarios y reacciones. Si autorizas el acceso a la ubicación del dispositivo, se usa para calcular avisos cercanos; al publicar, se guardan las coordenadas del lugar que elegiste.',
  },
  {
    title: 'Para qué se utiliza',
    body: 'La información permite mantener tu cuenta, mostrar avisos de mascotas perdidas, encontradas o en adopción, y facilitar que la comunidad pueda aportar información y contactar a quien publicó.',
  },
  {
    title: 'Información visible en la comunidad',
    body: 'Tu nombre o usuario, la dirección asociada y el contenido de tus publicaciones pueden mostrarse a otras personas dentro de Pawsy. Las coordenadas de la búsqueda actual solo se envían para calcular distancias; no se guardan en tu perfil. Comparte únicamente la información que consideres necesaria. Si eliges compartir un aviso desde tu dispositivo, la aplicación seleccionada aplicará sus propias políticas.',
  },
  {
    title: 'Control de tus datos',
    body: 'Puedes actualizar los datos de tu perfil desde la aplicación. Para solicitar ayuda sobre tus datos o la eliminación de tu cuenta, contacta al equipo responsable de Pawsy.',
  },
];

export default function PrivacyNotice() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f1f8f4' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8 }}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Volver">
          <Ionicons name="arrow-back" size={23} color="#4d9f8b" />
        </TouchableOpacity>
        <Text style={{ color: '#344a40', fontSize: 20, fontWeight: '800', marginLeft: 14 }}>
          Aviso de privacidad
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        <View style={{ backgroundColor: '#e3f2eb', borderRadius: 14, padding: 14, marginBottom: 12 }}>
          <Text style={{ color: '#426c5e', fontSize: 13, lineHeight: 19 }}>
            Este resumen explica cómo se usa la información en Pawsy. Comparte datos personales con cuidado y solo cuando sean necesarios para ayudar a una mascota.
          </Text>
        </View>
        {sections.map((section) => (
          <View key={section.title} style={{ backgroundColor: '#fff', borderRadius: 14, padding: 15, marginBottom: 10 }}>
            <Text style={{ color: '#344a40', fontSize: 14, fontWeight: '800', marginBottom: 6 }}>
              {section.title}
            </Text>
            <Text style={{ color: '#65756d', fontSize: 13, lineHeight: 19 }}>{section.body}</Text>
          </View>
        ))}
        <Text style={{ color: '#87958e', fontSize: 11, lineHeight: 16, marginTop: 2 }}>
          Aviso informativo de la versión actual de Pawsy. Consulta al equipo responsable para dudas o solicitudes relacionadas con tus datos.
        </Text>
      </ScrollView>
    </View>
  );
}
