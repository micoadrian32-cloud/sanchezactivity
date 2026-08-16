import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAbvyYdxT02VHWnzfxJG70lIzGjKCPN0AI',
  authDomain: 'sanchezactivity.firebaseapp.com',
  projectId: 'sanchezactivity',
  storageBucket: 'sanchezactivity.firebasestorage.app',
  messagingSenderId: '344376938081',
  appId: '1:344376938081:web:3d622fce4b0691ba6f2420',
  measurementId: 'G-5XBJ22X3MB',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
