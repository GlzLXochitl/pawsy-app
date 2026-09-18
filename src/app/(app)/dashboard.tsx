import { useState } from 'react';
import { Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from '../../../styles/dashboard';
import { useAuth } from '../../context/auth-context';

export default function Dashboard() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [newPostVisible, setNewPostVisible] = useState(false);
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: 'Isabel López',
      text: 'Se perdió ayer en el parque del Santo...',
      image: 'https://place-puppy.com/300x300',
      likes: 0,
      comments: [] as string[],
    },
    {
      id: 2,
      user: 'David Torres',
      text: 'Un día tranquilo con mi gato 🐱',
      image: 'https://placekitten.com/300/300',
      likes: 0,
      comments: [] as string[],
    },
  ]);

  const { signOut } = useAuth();

  const toggleMenu = () => setMenuVisible(!menuVisible);

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

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.appName}>PAWSY</Text>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Text style={styles.menuText}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <ScrollView>
        {posts.map(post => {
          const [newComment, setNewComment] = useState('');
          return (
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
                    value={newComment}
                    onChangeText={setNewComment}
                  />
                  <TouchableOpacity
                    style={styles.commentButton}
                    onPress={() => {
                      addComment(post.id, newComment);
                      setNewComment('');
                    }}
                  >
                    <Text>Enviar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Menú lateral */}
      <Modal visible={menuVisible} transparent animationType="slide">
        <View style={styles.menuContainer}>
          <View style={styles.menuBox}>
            <Text style={styles.menuTitle}>Menú</Text>
            <TouchableOpacity style={styles.menuItem}>
              <Text>Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setNewPostVisible(true); // abre modal de publicar
              }}
            >
              <Text>Publicar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={signOut}
            >
              <Text>Cerrar sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeMenu} onPress={toggleMenu}>
              <Text>✖</Text>
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
              <Text>✖</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
