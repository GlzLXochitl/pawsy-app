import { Fredoka_700Bold, useFonts } from '@expo-google-fonts/fredoka';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../../../../styles/dashboard';
import { useAuth } from '../../../context/auth-context';

export default function Dashboard() {
  const [fontsLoaded] = useFonts({ Fredoka_700Bold });
  const [menuVisible, setMenuVisible] = useState(false);
  const [newPostVisible, setNewPostVisible] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  
  const [visibleComments, setVisibleComments] = useState<Record<number, boolean>>({});

  const [posts, setPosts] = useState([
    {
      id: 1,
      user: 'Carlos Ramírez (Escuela Canina)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      time: 'Hace 30 minutos · 📍 Aguascalientes',
      text: '¡Hola a todos! 🐕🐾 Ofrezco servicios de escuela para perros y adiestramiento positivo. ¡Ayuda a tu lomito a tener un mejor comportamiento! Contáctame por mensaje.',
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
      likes: 25,
      comments: ['¡Me interesa mucho!', '¿Cuáles son tus horarios?'] as string[],
    },
    {
      id: 2,
      user: 'diego fernando',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      time: 'Hace 1 hora · 📍 en el ita',
      text: 'Se perdió un perro pastor alemán, si lo ven avisen por favor.',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600',
      likes: 12,
      comments: ['lo encontré ayer'] as string[],
    },
    {
      id: 3,
      user: 'Isabel López',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      time: 'Hace 2 horas · 📍 colonia méxico',
      text: 'Se perdió ayer en el parque del Santo un perrito chihuahua de color café.',
      image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600',
      likes: 5,
      comments: [] as string[],
    },
  ]);

  const { signOut } = useAuth();

  const toggleMenu = () => setMenuVisible(visible => !visible);

  const addLike = (id: number) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const addComment = (id: number, comment: string) => {
    if (comment.trim() === '') return;
    setPosts(posts.map(p =>
      p.id === id ? { ...p, comments: [...p.comments, comment] } : p
    ));
  };

  const toggleComments = (id: number) => {
    setVisibleComments(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const [newText, setNewText] = useState('');
  const [newImage, setNewImage] = useState('');

  const publishPost = () => {
    if (newText.trim() === '') return;
    const newPost = {
      id: posts.length + 1,
      user: 'Usuario Actual',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      time: 'Hace un momento',
      text: newText,
      image: newImage || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600',
      likes: 0,
      comments: [] as string[],
    };
    setPosts([newPost, ...posts]);
    setNewText('');
    setNewImage('');
    setNewPostVisible(false);
  };

  const porfilePress = () => {
    setMenuVisible(false);
    router.push('/profile');
  };

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={['#D4E157', '#7ED9A8', '#5FC9C0', '#4FB6D6']}
      locations={[0, 0.35, 0.65, 1]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        
        
        <View style={styles.header}>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            backgroundColor: '#FFF', 
            paddingHorizontal: 12, 
            paddingVertical: 6, 
            borderRadius: 14,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3
          }}>
            <Image 
             source={require('../../../img/pawsy-logo.png')}
             style={{ width: 28, height: 28, marginRight: 6, resizeMode: 'contain' }} 
            />
            <Text style={[styles.appName, { color: '#3A9FD9' }]}>PAWSY</Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setNewPostVisible(true)} style={{ marginRight: 15 }}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
              <Ionicons name="menu" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          {posts.map(post => {
            const isCommentsOpen = !!visibleComments[post.id];

            return (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <Image source={{ uri: post.avatar }} style={styles.avatar} />
                  <View>
                    <Text style={styles.userName}>{post.user}</Text>
                    <Text style={styles.postTime}>{post.time}</Text>
                  </View>
                </View>

                <Text style={styles.postText}>{post.text}</Text>

                {post.image ? (
                  <Image source={{ uri: post.image }} style={styles.postImage} />
                ) : null}

                <View style={styles.statsRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text>❤️</Text>
                    <Text style={styles.statsText}> {post.likes}</Text>
                  </View>
                  <Text style={styles.statsText}>{post.comments.length} comentarios</Text>
                </View>

                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity onPress={() => addLike(post.id)} style={styles.actionBtn}>
                    <Ionicons name="heart-outline" size={20} color="#666" />
                    <Text style={styles.actionBtnText}>Me gusta</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => toggleComments(post.id)} style={styles.actionBtn}>
                    <Ionicons name="chatbubble-outline" size={20} color="#666" />
                    <Text style={styles.actionBtnText}>Comentar</Text>
                  </TouchableOpacity>
                </View>

                {isCommentsOpen && (
                  <View style={styles.commentsSection}>
                    {post.comments.map((c, i) => (
                      <View key={i} style={styles.commentBubble}>
                        <Text style={styles.commentUser}>Usuario</Text>
                        <Text style={styles.commentText}>{c}</Text>
                      </View>
                    ))}

                    <View style={styles.commentInputRow}>
                      <Image source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }} style={styles.smallAvatar} />
                      <TextInput
                        style={styles.commentInput}
                        placeholder="Escribe un comentario..."
                        placeholderTextColor="#888"
                        value={commentDrafts[post.id] ?? ''}
                        onChangeText={comment => setCommentDrafts(drafts => ({
                          ...drafts,
                          [post.id]: comment,
                        }))}
                      />
                      <TouchableOpacity
                        style={styles.commentButton}
                        onPress={() => {
                          addComment(post.id, commentDrafts[post.id] ?? '');
                          setCommentDrafts(drafts => ({ ...drafts, [post.id]: '' }));
                        }}
                      >
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Enviar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(app)/dashboard')}>
            <Ionicons name="home" size={24} color="#3A9FD9" />
            <Text style={[styles.navText, { color: '#3A9FD9' }]}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(app)/dashboard')}>
            <Ionicons name="search-outline" size={24} color="#666" />
            <Text style={styles.navText}>Buscar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => setNewPostVisible(true)}>
            <View style={styles.addNavButton}>
              <Ionicons name="add" size={24} color="#FFF" />
            </View>
            <Text style={styles.navText}>Crear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={porfilePress}>
            <Ionicons name="person-outline" size={24} color="#666" />
            <Text style={styles.navText}>Perfil</Text>
          </TouchableOpacity>
        </View>

        
        <Modal visible={menuVisible} transparent animationType="slide">
          <View style={styles.menuContainer}>
            <View style={styles.menuBox}>
              <TouchableOpacity onPress={toggleMenu} style={styles.menuCloseButton}>
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
              <Text style={styles.menuTitle}>Menú</Text>
              <TouchableOpacity onPress={porfilePress} style={styles.menuItem}>
                <Ionicons name="person-outline" size={21} color="#3A9FD9" />
                <Text style={styles.menuItemText}>Perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  setNewPostVisible(true);
                }}
              >
                <Ionicons name="add-circle-outline" size={21} color="#3A9FD9" />
                <Text style={styles.menuItemText}>Publicar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={signOut}>
                <Ionicons name="log-out-outline" size={21} color="#3A9FD9" />
                <Text style={styles.menuItemText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        
        <Modal visible={newPostVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              
              <TouchableOpacity 
                style={styles.modalCloseAbsolute} 
                onPress={() => setNewPostVisible(false)}
              >
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>

              <Text style={styles.modalTitleText}>Crear Publicación</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>¿Qué quieres compartir?</Text>
                <TextInput
                  style={styles.textAreaInput}
                  placeholder="¿Qué mascota estás buscando o quieres reportar?"
                  placeholderTextColor="#888"
                  multiline
                  value={newText}
                  onChangeText={setNewText}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Imagen (Opcional)</Text>
                <TextInput
                  style={styles.textInputSingle}
                  placeholder="URL de la imagen"
                  placeholderTextColor="#888"
                  value={newImage}
                  onChangeText={setNewImage}
                />
              </View>

              <TouchableOpacity style={styles.publishButton} onPress={publishPost}>
                <Text style={styles.publishButtonText}>Publicar</Text>
              </TouchableOpacity>

            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}