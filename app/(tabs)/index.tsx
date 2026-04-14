import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { addDoc, collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const USER_KEY = 'loggedInUser';

export default function Index() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [myBooks, setMyBooks] = useState<any[]>([]);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '1093975353244-50abduf99ts82nfbeltt8ltjb8n707jo.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'books'),
      where('userId', '==', user.email),
      orderBy('dateAdded', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMyBooks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
  AsyncStorage.getItem(USER_KEY).then((stored) => {
    if (stored) setUser(JSON.parse(stored));
  });
}, []);

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo.data) {
        setUser(userInfo.data.user);
        AsyncStorage.setItem(USER_KEY, JSON.stringify(userInfo.data.user));
        Alert.alert('Success!', `Welcome ${userInfo.data.user.name}`);
      }
    } catch (error: any) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Google Error', error.message);
      }
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      setUser(null);
      AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error(error);
    }
  };

  // Simulated login function for demo purposes, when user taps "Log In" button
  const onLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise((res) => setTimeout(res, 900));
    setLoading(false);

    if (email.toLowerCase() === 'test@example.com' && password === 'password') {
      Alert.alert('Success', 'Logged in successfully');
      const userData = { givenName: 'Explorer', email };
      setUser(userData);
      AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    } else {
      setError('Invalid email or password');
    }
  };

  const handleSaveBook = async () => {
    if (!bookTitle || !bookAuthor) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    
    try {
      await addDoc(collection(db, 'books'), {
        title: bookTitle,
        author: bookAuthor,
        dateAdded: new Date().toISOString(),
        userId: user.email,
        userName: user.givenName ?? user.name ?? user.email,
      });
      Alert.alert("Success", `${bookTitle} has been added to your shelf!`);
      setIsAddingBook(false);
      setBookTitle('');
      setBookAuthor('');
    } catch (e) {
      Alert.alert("Error", "Failed to save book. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.dashboard}>
          <Text style={styles.title}>Welcome, {user.givenName}! 📚</Text>
          <Text style={styles.subtitle}>Ready to swap some books?</Text>
          
          {isAddingBook ? (
            <View style={styles.form}>
              <Text style={styles.subtitle}>List a New Book</Text>
              <TextInput
                style={styles.input}
                placeholder="Book Title"
                value={bookTitle}
                onChangeText={setBookTitle}
              />
              <TextInput
                style={styles.input}
                placeholder="Author"
                value={bookAuthor}
                onChangeText={setBookAuthor}
              />
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleSaveBook}
              >
                <Text style={styles.buttonText}>Confirm Listing</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkButton} onPress={() => setIsAddingBook(false)}>
                <Text style={styles.linkText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>You have {myBooks.length} books listed.</Text>
                  {/*<Text style={styles.statLabel}>My Books</Text> */}
                </View>
              </View>

              <FlatList
                data={myBooks}
                keyExtractor={(item) => item.id}
                style={{ width: '100%', maxHeight: 300 }}
                renderItem={({ item }) => (
                  <View style={styles.bookCard}>
                    <Text style={styles.bookTitle}>{item.title}</Text>
                    <Text style={styles.bookAuthor}>{item.author}</Text>
                    <Text style={styles.bookDate}>Added {new Date(item.dateAdded).toLocaleDateString()}</Text>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No books listed yet. Add one below!</Text>
                }
              />

              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#2ed573', width: '100%' }]}
                onPress={() => setIsAddingBook(true)}
              >
                <Text style={styles.buttonText}>+ List a Book</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={signOut} style={styles.linkButton}>
                <Text style={styles.linkText}>Sign Out</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.title}>Hello World! 📚</Text>
          <Text style={styles.subtitle}>Welcome to the School Book Swap.</Text>
          
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={onLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={onGoogleButtonPress}
          >
            <Text style={styles.buttonText}>Sign in with Google</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2f3542',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#747d8c',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    height: 48,
    borderColor: '#e6e6e6',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    height: 48,
    backgroundColor: '#2f3542',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#ff4757',
    marginBottom: 8,
    textAlign: 'center',
  },
  dashboard: {
    width: '100%',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  statBox: {
    backgroundColor: '#f1f2f6',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '95%',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2f3542',
  },
  statLabel: {
    fontSize: 12,
    color: '#747d8c',
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    color: '#747d8c',
    textDecorationLine: 'underline',
  },
  bookCard: {
    backgroundColor: '#f1f2f6',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    width: '100%',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2f3542',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#747d8c',
    marginTop: 2,
  },
  bookDate: {
    fontSize: 12,
    color: '#a4b0be',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#747d8c',
    marginVertical: 16,
  },
});