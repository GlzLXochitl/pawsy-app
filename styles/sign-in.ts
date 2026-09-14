import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 26,
    paddingHorizontal: 20,
    marginBottom: 14,
    color: '#333',
    fontSize: 15,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 10,
    fontSize: 13,
  },
  signupRow: {
    flexDirection: 'row',
    marginTop: 18,
  },
  signupText: {
    color: '#333',
    fontSize: 13,
  },
  signupLink: {
    color: '#1976D2',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});