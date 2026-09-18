
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#40E0D0',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
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
    padding: 10,
    marginBottom: 15,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 5,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuBox: {
    backgroundColor: '#f00606',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  menuItem: {
    paddingVertical: 10,
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
