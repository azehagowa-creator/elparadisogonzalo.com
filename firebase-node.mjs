import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString } from "firebase/storage";

// 1️⃣ Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBoS5PKtqBgcm4ONjdls7ByMawWxKHvTA0",
  authDomain: "elparadisogonzalo-project.firebaseapp.com",
  projectId: "elparadisogonzalo-project",
  storageBucket: "elparadisogonzalo-project.appspot.com",
  messagingSenderId: "79549855648",
  appId: "1:79549855648:web:35f36ad1f055ef824756c5",
  measurementId: "G-DMZKPFRL1M"
};

const app = initializeApp(firebaseConfig);
console.log("Firebase initialized:", app.name);

// 2️⃣ Upload string to Firebase Storage
const storage = getStorage(app);
const storageRef = ref(storage, 'hello.txt');

uploadString(storageRef, 'Hello from Firebase Storage!')
  .then((snapshot) => {
    console.log('✅ File uploaded successfully!');
  })
  .catch((error) => {
    console.error('❌ Upload failed:', error.message);
  });
