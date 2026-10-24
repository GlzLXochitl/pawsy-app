import { Fredoka_700Bold, useFonts } from '@expo-google-fonts/fredoka';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { shared } from '../../../styles/shared';
import { styles } from '../../../styles/user-form';
import { API_BASE_URL } from '../../config/api';

export default function UserForm() {
  const [fontsLoaded] = useFonts({ Fredoka_700Bold });
  const [username, setUsername] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [celular, setCelular] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [colonia, setColonia] = useState('');
  const [calle, setCalle] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [visibleInfo, setVisibleInfo] = useState<'contact' | 'location' | 'account' | null>(null);
  const [acceptedAgreement, setAcceptedAgreement] = useState(false);
  const [successOpacity] = useState(() => new Animated.Value(0));
  const [successScale] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    if (!registrationComplete) return;

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(120),
          Animated.spring(successScale, {
            toValue: 1,
            damping: 8,
            stiffness: 140,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.delay(1300),
    ]);

    animation.start(({ finished }) => {
      if (finished) router.replace('/sign-in');
    });

    return () => animation.stop();
  }, [registrationComplete, successOpacity, successScale]);

  if (!fontsLoaded) return null;

  const passwordGuidelines = [
    { label: 'Al menos 8 caracteres', met: password.length >= 8 },
    { label: 'Incluye una mayúscula y una minúscula', met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: 'Incluye un número', met: /\d/.test(password) },
  ];
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleRegister = async () => {
    if (
      !username.trim() ||
      !nombre.trim() ||
      !apellidos.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword ||
      !celular.trim() ||
      !ciudad.trim() ||
      !colonia.trim()
    ) {
      setError('Por favor, completa todos los campos');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Ingresa un correo electrónico válido');
      return;
    }

    if (!acceptedAgreement) {
      setError('Debes aceptar el acuerdo de confidencialidad');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const respuesta = await fetch(`${API_BASE_URL}/api/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_usuario: username.trim(),
          nombre: nombre.trim(),
          apellidos: apellidos.trim(),
          email: email.trim(),
          contrasena: password,
          celular: celular.trim(),
          ciudad: ciudad.trim(),
          colonia: colonia.trim(),
          calle: calle.trim() || null,
        }),
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error || 'No se pudo registrar la cuenta');
        return;
      }

      setRegistrationComplete(true);
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      setError('No se pudo conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationComplete) {
    return (
      <LinearGradient
        colors={['#D4E157', '#7ED9A8', '#5FC9C0', '#4FB6D6']}
        locations={[0, 0.35, 0.65, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={[shared.background, { justifyContent: 'center', alignItems: 'center', padding: 30 }]}
      >
        <View style={shared.decorCircleTop} />
        <View style={shared.decorCircleBottom} />
        <Animated.View
          style={{
            alignItems: 'center',
            opacity: successOpacity,
            transform: [{ scale: successScale }],
          }}
        >
          <View
            style={{
              width: 104,
              height: 104,
              borderRadius: 52,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.9)',
              marginBottom: 22,
            }}
          >
            <Ionicons name="checkmark" size={62} color="#287a54" />
          </View>
          <Text
            style={{
              color: '#fff',
              fontFamily: 'Fredoka_700Bold',
              fontSize: 30,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            ¡Registro exitoso!
          </Text>
        </Animated.View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#D4E157', '#7ED9A8', '#5FC9C0', '#4FB6D6']}
      locations={[0, 0.35, 0.65, 1]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={shared.background}
    >
      <View style={shared.decorCircleTop} />
      <View style={shared.decorCircleBottom} />

      <TouchableOpacity
        style={shared.backButton}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/sign-in');
          }
        }}
      >
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
        <View style={[shared.logoCard, styles.logoCard]}>
          <Image
            source={require('../../img/pawsy-logo.png')}
            style={[shared.logoImage, styles.logoImage]}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.formTitle}>Crea una cuenta</Text>
        <Text style={styles.requiredNote}>
          <Text style={styles.requiredMark}>*</Text> Campo obligatorio
        </Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Datos de contacto</Text>
          <TouchableOpacity
            onPress={() => setVisibleInfo(visibleInfo === 'contact' ? null : 'contact')}
            accessibilityRole="button"
            accessibilityLabel="Información sobre los datos de contacto"
            accessibilityState={{ expanded: visibleInfo === 'contact' }}
            hitSlop={8}
          >
            <Ionicons name="information-circle-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        {visibleInfo === 'contact' && (
          <Text style={styles.infoText}>
            Tu nombre, apellidos y número telefónico se usarán para mantener el contacto
            entre usuarios, coordinar adopciones y reportar avistamientos o resguardos de
            mascotas. Tu número solo se compartirá si tú lo autorizas.
          </Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Nombre *"
          placeholderTextColor="#888"
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
          maxLength={30}
        />

        <TextInput
          style={styles.input}
          placeholder="Apellidos *"
          placeholderTextColor="#888"
          value={apellidos}
          onChangeText={setApellidos}
          autoCapitalize="words"
          maxLength={50}
        />

        <TextInput
          style={styles.input}
          placeholder="Número de celular *"
          placeholderTextColor="#888"
          value={celular}
          onChangeText={setCelular}
          keyboardType="phone-pad"
          autoCapitalize="none"
          maxLength={45}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Zona</Text>
          <TouchableOpacity
            onPress={() => setVisibleInfo(visibleInfo === 'location' ? null : 'location')}
            accessibilityRole="button"
            accessibilityLabel="Información sobre los datos de ubicación"
            accessibilityState={{ expanded: visibleInfo === 'location' }}
            hitSlop={8}
          >
            <Ionicons name="information-circle-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        {visibleInfo === 'location' && (
          <Text style={styles.infoText}>
            Tu ciudad, colonia y calle se usarán para mostrarte publicaciones de adopción
            y avistamientos cercanos a ti. La calle es opcional.
          </Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Ciudad *"
          placeholderTextColor="#888"
          value={ciudad}
          onChangeText={setCiudad}
          autoCapitalize="words"
          maxLength={100}
        />

        <TextInput
          style={styles.input}
          placeholder="Colonia *"
          placeholderTextColor="#888"
          value={colonia}
          onChangeText={setColonia}
          autoCapitalize="words"
          maxLength={100}
        />

        <TextInput
          style={styles.input}
          placeholder="Calle (opcional)"
          placeholderTextColor="#888"
          value={calle}
          onChangeText={setCalle}
          autoCapitalize="words"
          maxLength={100}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Datos de cuenta</Text>
          <TouchableOpacity
            onPress={() => setVisibleInfo(visibleInfo === 'account' ? null : 'account')}
            accessibilityRole="button"
            accessibilityLabel="Información sobre los datos de cuenta"
            accessibilityState={{ expanded: visibleInfo === 'account' }}
            hitSlop={8}
          >
            <Ionicons name="information-circle-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        {visibleInfo === 'account' && (
          <Text style={styles.infoText}>
            Tu nombre de usuario, correo y contraseña se usarán para identificarte,
            acceder a la aplicación y proteger tu cuenta.
          </Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Nombre de usuario *"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          maxLength={30}
        />

        <TextInput
          style={styles.input}
          placeholder="Email *"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          maxLength={100}
        />

        <View style={styles.passwordSection}>
          <Text style={styles.passwordTitle}>Crea tu contraseña *</Text>
          <Text style={styles.passwordHint}>
            Estas recomendaciones ayudan a crear una contraseña más segura, pero son opcionales.
          </Text>

          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Contraseña"
              placeholderTextColor="#888"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              maxLength={25}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              hitSlop={8}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#64746f"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordGuidelines}>
            {passwordGuidelines.map(({ label, met }) => (
              <View key={label} style={styles.passwordGuideline}>
                <Ionicons
                  name={met ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={met ? '#287a54' : '#71827d'}
                />
                <Text style={[styles.passwordGuidelineText, met && styles.passwordGuidelineMet]}>
                  {label}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.confirmPasswordTitle}>Confirma tu contraseña *</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Vuelve a escribir la contraseña"
              placeholderTextColor="#888"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
              maxLength={25}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              accessibilityRole="button"
              accessibilityLabel={
                showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'
              }
              hitSlop={8}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color="#64746f"
              />
            </TouchableOpacity>
          </View>
          {confirmPassword.length > 0 && (
            <View style={styles.passwordMatch}>
              <Ionicons
                name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={passwordsMatch ? '#287a54' : '#b33b3b'}
              />
              <Text
                style={[
                  styles.passwordMatchText,
                  passwordsMatch ? styles.passwordGuidelineMet : styles.passwordMatchMismatch,
                ]}
              >
                {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.agreementRow}>
          <TouchableOpacity
            style={styles.agreementCheckbox}
            onPress={() => setAcceptedAgreement(!acceptedAgreement)}
            accessibilityRole="checkbox"
            accessibilityLabel="Acepto el acuerdo de confidencialidad"
            accessibilityState={{ checked: acceptedAgreement }}
            hitSlop={8}
          >
            {acceptedAgreement && <Ionicons name="checkmark" size={18} color="#1976D2" />}
          </TouchableOpacity>
          <View style={styles.agreementTextContainer}>
            <Text style={styles.agreementText}>
              Acepto el <Text style={styles.requiredMark}>*</Text>{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/confidentiality-agreement')}>
              <Text style={styles.agreementLink}>acuerdo de confidencialidad</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error !== '' && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[shared.button, !acceptedAgreement && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isSubmitting || !acceptedAgreement}
          accessibilityState={{ disabled: isSubmitting || !acceptedAgreement }}
        >
          <LinearGradient
            colors={['#4FC3E8', '#3A9FD9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={shared.buttonGradient}
          >
            <Text style={shared.buttonText}>
              {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/sign-in')}>
            <Text style={styles.loginLink}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}