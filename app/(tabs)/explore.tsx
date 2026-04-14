import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const USER_KEY = 'loggedInUser';

export default function ExploreScreen() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(USER_KEY).then((stored) => {
      if (stored) setCurrentUser(JSON.parse(stored));
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'books'), orderBy('dateAdded', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllBooks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const otherBooks = allBooks.filter(
    (book) => !currentUser || book.userId !== currentUser.email
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Browse Listings</Text>
      <Text style={styles.subtitle}>Books available to swap</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2f3542" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={otherBooks}
          keyExtractor={(item) => item.id}
          style={{ width: '100%' }}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.bookCard}>
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
              <Text style={styles.listedBy}>
                Listed by {item.userName ?? item.userId ?? 'Unknown'}
              </Text>
              <Text style={styles.bookDate}>
                {new Date(item.dateAdded).toLocaleDateString()}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No listings from other users yet.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2f3542',
  },
  subtitle: {
    fontSize: 15,
    color: '#747d8c',
    marginTop: 4,
    marginBottom: 24,
  },
  bookCard: {
    backgroundColor: '#f1f2f6',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
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
  listedBy: {
    fontSize: 13,
    color: '#2ed573',
    marginTop: 6,
    fontWeight: '500',
  },
  bookDate: {
    fontSize: 12,
    color: '#a4b0be',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#747d8c',
    marginTop: 40,
  },
});
