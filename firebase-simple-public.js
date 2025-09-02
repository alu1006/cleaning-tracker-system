// 簡化版 Firebase 整合（公開版本）
// 使用前請先設定你的 Firebase 配置

// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyDpgytqeXPH-6ec1IIIs84UuDhNISO7bUc",
    authDomain: "cleaning-tracker-2025.firebaseapp.com",
    projectId: "cleaning-tracker-2025",
    storageBucket: "cleaning-tracker-2025.firebasestorage.app",
    messagingSenderId: "1031453638079",
    appId: "1:1031453638079:web:fcbcd62e827fb3f2db350a",
    measurementId: "G-HZH8C1S3C7"
};

// 初始化 Firebase
try {
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    console.log('✅ Firebase 初始化成功');
} catch (error) {
    console.error('❌ Firebase 初始化失敗:', error);
    alert('Firebase 初始化失敗，請檢查網路連線和設定。錯誤：' + error.message);
}

// Firebase 工具函數
class FirebaseService {
    
    // 取得 Firebase 服務
    get auth() {
        return firebase.auth();
    }
    
    get db() {
        return firebase.firestore();
    }
    
    // 使用者驗證
    async signIn(email, password) {
        try {
            if (!this.auth) {
                throw new Error('Firebase Authentication 尚未初始化。請檢查 Firebase 設定。');
            }
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            let errorMessage = error.message;
            
            // 中文錯誤訊息
            if (error.code === 'auth/configuration-not-found') {
                errorMessage = 'Firebase Authentication 尚未啟用。請到 Firebase Console 啟用 Email/Password 驗證。';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = '電子信箱格式不正確';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = '找不到此帳號';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = '密碼錯誤';
            }
            
            return { success: false, error: errorMessage };
        }
    }
    
    async createUser(email, password, userData) {
        try {
            if (!this.auth) {
                throw new Error('Firebase Authentication 尚未初始化。請檢查 Firebase 設定。');
            }
            
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // 儲存使用者額外資訊
            await this.db.collection('users').doc(user.uid).set({
                email: email,
                role: userData.role || 'user',
                name: userData.name || email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true, user: user };
        } catch (error) {
            let errorMessage = error.message;
            
            // 中文錯誤訊息
            if (error.code === 'auth/configuration-not-found') {
                errorMessage = 'Firebase Authentication 尚未啟用。請到 Firebase Console 啟用 Email/Password 驗證。';
            } else if (error.code === 'auth/email-already-in-use') {
                errorMessage = '此電子信箱已被註冊';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = '密碼強度不足，請至少輸入6個字元';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = '電子信箱格式不正確';
            }
            
            return { success: false, error: errorMessage };
        }
    }
    
    // Google 登入
    async signInWithGoogle() {
        try {
            if (!this.auth) {
                throw new Error('Firebase Authentication 尚未初始化。請檢查 Firebase 設定。');
            }
            
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');
            
            const userCredential = await this.auth.signInWithPopup(provider);
            const user = userCredential.user;
            
            // 檢查是否為新使用者，如果是則建立使用者資料
            if (userCredential.additionalUserInfo.isNewUser) {
                console.log('新 Google 使用者，建立使用者資料...');
                
                const userData = {
                    email: user.email,
                    role: 'teacher',
                    name: user.displayName || user.email,
                    photoURL: user.photoURL || '',
                    provider: 'google',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                await this.db.collection('users').doc(user.uid).set(userData);
                console.log('✅ 使用者資料已建立');
            }
            
            return { success: true, user: user, isNewUser: userCredential.additionalUserInfo.isNewUser };
        } catch (error) {
            let errorMessage = error.message;
            
            // 中文錯誤訊息
            if (error.code === 'auth/configuration-not-found') {
                errorMessage = 'Firebase Authentication 尚未啟用。請到 Firebase Console 啟用 Google 驗證。';
            } else if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = '登入視窗已關閉';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = '登入視窗被瀏覽器阻擋，請允許彈出式視窗';
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMessage = 'Google 登入尚未啟用，請聯絡管理員';
            }
            
            return { success: false, error: errorMessage };
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // 監聽驗證狀態變化
    onAuthStateChanged(callback) {
        return this.auth.onAuthStateChanged(callback);
    }
    
    // 獲取當前使用者
    getCurrentUser() {
        return this.auth.currentUser;
    }
    
    // 資料操作
    async saveUserData(userId, data) {
        try {
            await this.db.collection('userData').doc(userId).set(data, { merge: true });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async getUserData(userId) {
        try {
            const doc = await this.db.collection('userData').doc(userId).get();
            if (doc.exists) {
                return { success: true, data: doc.data() };
            } else {
                return { success: true, data: null };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async saveTrackingData(userId, data) {
        try {
            await this.db.collection('trackingData').doc(userId).set(data, { merge: true });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    async getTrackingData(userId) {
        try {
            const doc = await this.db.collection('trackingData').doc(userId).get();
            if (doc.exists) {
                return { success: true, data: doc.data() };
            } else {
                return { success: true, data: {} };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // 即時監聽資料變化
    onUserDataChanged(userId, callback) {
        return this.db.collection('userData').doc(userId).onSnapshot(callback);
    }
    
    onTrackingDataChanged(userId, callback) {
        return this.db.collection('trackingData').doc(userId).onSnapshot(callback);
    }
    
    // 管理員功能：獲取所有使用者
    async getAllUsers() {
        try {
            const snapshot = await this.db.collection('users').get();
            const users = [];
            snapshot.forEach(doc => {
                users.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, users: users };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // 管理員功能：獲取特定使用者的資料
    async getUserDataForAdmin(userId) {
        try {
            const [userData, trackingData] = await Promise.all([
                this.getUserData(userId),
                this.getTrackingData(userId)
            ]);
            
            return {
                success: true,
                userData: userData.data,
                trackingData: trackingData.data
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// 建立全域 Firebase 服務實例
window.firebaseService = new FirebaseService();

console.log('🔥 Firebase 服務已初始化（公開版本）');