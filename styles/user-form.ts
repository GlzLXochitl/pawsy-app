import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  formTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 28,
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    paddingHorizontal: 18,
    marginBottom: 16,
    color: '#333',
    fontSize: 15,
  },
  error: {
    color: '#ffe082',
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '600',
  },
  loginRow: {
    flexDirection: 'row',
    marginTop: 18,
  },
  loginText: {
    color: '#fff',
    fontSize: 13,
  },
  loginLink: {
    color: '#0D47A1',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});