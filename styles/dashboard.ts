
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 24,
    color: '#fff',
  },
  menuButton: {
    padding: 8,
  },
  menuText: {
    fontSize: 20,
    color: '#fff',
  },
  post: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 6,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  postText: {
    marginBottom: 10,
    color: '#333',
    fontSize: 16,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    padding: 5,
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  menuBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#222',
  },
  menuCloseButton: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 1,
    padding: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  menuItemText: {
    color: '#222',
    fontSize: 16,
  },
  closeMenu: {
    marginTop: 15,
    alignItems: 'center',
  },
  
commentsSection: {
  marginTop: 10,
},
commentText: {
  fontSize: 14,
  color: '#333',
  marginBottom: 5,
},
commentInputRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 5,
},
commentInput: {
  flex: 1,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 5,
  paddingHorizontal: 8,
  paddingVertical: 4,
  marginRight: 5,
  backgroundColor: '#fff',
},
commentButton: {
  backgroundColor: '#4FC3E8',
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 5,
},


});
