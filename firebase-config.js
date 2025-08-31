// Firebase 配置文件
// 請到 https://console.firebase.google.com 建立專案並取得配置

// Firebase 配置 (需要替換為你的實際配置)
const firebaseConfig = {
    // TODO: 替換為你的 Firebase 專案配置
    // 範例配置（請勿在生產環境使用）
    apiKey: "你的API密鑰",
    authDomain: "你的專案.firebaseapp.com",
    projectId: "你的專案ID",
    storageBucket: "你的專案.appspot.com",
    messagingSenderId: "你的發送者ID",
    appId: "你的應用ID"
};

// 初始化 Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 導出 Firebase 服務
export { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc, onSnapshot };