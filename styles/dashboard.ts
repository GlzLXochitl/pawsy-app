
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  

  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  menuButton: {
    padding: 4,
  },
  
  
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#666',
  },
  postText: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  postImage: {
    width: '100%',
    height: 250, 
    resizeMode: 'cover',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  statsText: {
    fontSize: 13,
    color: '#666',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionBtnText: {
    marginLeft: 6,
    color: '#666',
    fontWeight: '500',
  },
  commentsSection: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  commentBubble: {
    backgroundColor: '#F0F2F5',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  commentUser: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#333',
  },
  commentText: {
    fontSize: 13,
    color: '#333',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  smallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 38,
    fontSize: 13,
  },
  commentButton: {
    backgroundColor: '#3A9FD9',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 19,
    marginLeft: 8,
  },
  
  
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  addNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3A9FD9',
    justifyContent: 'center',
    alignItems: 'center',
  },

 
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuBox: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  menuCloseButton: {
    alignSelf: 'flex-end',
  },
  closeMenu: {
    alignSelf: 'center',
    marginTop: 15,
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalCloseAbsolute: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 10,
    padding: 5,
  },
  modalTitleText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    fontWeight: '600',
  },
  textAreaInput: {
    height: 100,
    textAlignVertical: 'top',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%',
    color: '#333',
  },
  textInputSingle: {
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%',
    color: '#333',
  },
  publishButton: {
    backgroundColor: '#3A9FD9',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 5,
  },
  publishButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },


  

});
