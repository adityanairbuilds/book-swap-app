import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD7VFhraXFAIrI_q9-H7e78xUWjEIU1qoY",
  authDomain: "bookswap-c9860.firebaseapp.com",
  projectId: "bookswap-c9860",
  storageBucket: "bookswap-c9860.appspot.com",
  messagingSenderId: "519651684329",
  appId: "1:519651684329:web:2881fb141d91d72c892578",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
