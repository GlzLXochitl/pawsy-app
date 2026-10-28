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
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: 'Isabel López',
      text: 'Se perdió ayer en el parque del Santo...',
      image: 'https://place-puppy.com/300x300',
      likes: 0,
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

  // Estados para nuevo post
  const [newText, setNewText] = useState('');
  const [newImage, setNewImage] = useState('');

  const publishPost = () => {
    if (newText.trim() === '') return; // no publicar vacío
    const newPost = {
      id: posts.length + 1,
      user: 'Usuario Actual',
      text: newText,
      image: newImage || 'https://placehold.co/300x300',
      likes: 0,
      comments: [] as string[],
    };
    setPosts([newPost, ...posts]); // agrega al inicio del feed
    setNewText('');
    setNewImage('');
    setNewPostVisible(false); // cierra el modal
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
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.appName}>PAWSY</Text>
          <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
            <Text style={styles.menuText}>☰</Text>
          </TouchableOpacity>
        </View>

        {/* Feed */}
        <ScrollView>
          {posts.map(post => (
            <View key={post.id} style={styles.post}>
              <Text style={styles.userName}>{post.user}</Text>
              <Image source={{ uri: post.image }} style={styles.postImage} />
              <Text style={styles.postText}>{post.text}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => addLike(post.id)} style={styles.actionButton}>
                  <Text>❤️ {post.likes}</Text>
                </TouchableOpacity>
              </View>

              {/* Comentarios */}
              <View style={styles.commentsSection}>
                {post.comments.map((c, i) => (
                  <Text key={i} style={styles.commentText}>💬 {c}</Text>
                ))}
                <View style={styles.commentInputRow}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Escribe un comentario..."
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
                    <Text>Enviar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Menú lateral */}
        <Modal visible={menuVisible} transparent animationType="slide">
          <View style={styles.menuContainer}>
            <LinearGradient
              pointerEvents="none"
              colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.menuBackdrop}
            />
            <View style={styles.menuBox}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Cerrar menú"
                onPress={toggleMenu}
                style={styles.menuCloseButton}
              >
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
                  setNewPostVisible(true); // abre modal de publicar
                }}
              >
                <Ionicons name="add-circle-outline" size={21} color="#3A9FD9" />
                <Text style={styles.menuItemText}>Publicar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={signOut}
              >
                <Ionicons name="log-out-outline" size={21} color="#3A9FD9" />
                <Text style={styles.menuItemText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal de nuevo post */}
        <Modal visible={newPostVisible} transparent animationType="fade">
          <View style={styles.menuContainer}>
            <View style={styles.menuBox}>
              <Text style={styles.menuTitle}>Nuevo Post</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Escribe tu publicación..."
                value={newText}
                onChangeText={setNewText}
              />
              <TextInput
                style={styles.commentInput}
                placeholder="URL de imagen (opcional)"
                value={newImage}
                onChangeText={setNewImage}
              />
              <TouchableOpacity style={styles.commentButton} onPress={publishPost}>
                <Text>Publicar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeMenu} onPress={() => setNewPostVisible(false)}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}