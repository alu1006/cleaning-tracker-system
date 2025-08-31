// 簡化版 Firebase 整合（使用 CDN）

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
            
            // 保存當前登入的使用者
            const currentUser = this.auth.currentUser;
            
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // 儲存使用者基本資訊
            const userDoc = {
                email: email,
                role: userData.role || 'user',
                name: userData.name || email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // 如果有學號，加入基本資料
            if (userData.studentNumber) {
                userDoc.studentNumber = userData.studentNumber;
            }

            await this.db.collection('users').doc(user.uid).set(userDoc);
            
            // 如果是學生，同時在 students 集合中創建記錄
            if (userData.role === 'student' && userData.teacherId) {
                await this.db.collection('students').doc(user.uid).set({
                    teacherId: userData.teacherId,
                    studentNumber: userData.studentNumber || '',
                    name: userData.name || email,
                    email: email,
                    status: 'active',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            // 如果是管理員創建學生帳號，需要重新登入原始使用者
            if (currentUser && userData.role === 'student') {
                // 先登出新創建的使用者
                await this.auth.signOut();
                // 這裡不能直接重新登入，因為我們沒有原始使用者的密碼
                // 返回成功但標記需要重新整理頁面
                return { success: true, user: user, needsReauth: true };
            }
            
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

// 內建管理員帳號
const BUILT_IN_ADMIN = {
    email: 'admin@cleaning-system.internal',
    password: 'CleanAdmin2025!',
    uid: 'built-in-admin-uid',
    role: 'admin',
    name: '系統管理員'
};

// 檢查並建立內建管理員帳號
async function ensureBuiltInAdmin() {
    console.log('開始檢查管理員帳號...');
    
    // 等待 Firebase 完全初始化
    if (!window.firebaseService || !window.firebaseService.db) {
        console.log('等待 Firebase 服務初始化...');
        setTimeout(ensureBuiltInAdmin, 1000);
        return;
    }
    
    try {
        // 檢查是否已存在管理員帳號，使用資料庫查詢而非登入
        const usersSnapshot = await window.firebaseService.db.collection('users')
            .where('email', '==', BUILT_IN_ADMIN.email).limit(1).get();
        
        if (!usersSnapshot.empty) {
            console.log('✅ 內建管理員帳號已存在');
            return;
        }
        
        console.log('管理員帳號不存在，開始建立...');
        
        // 建立管理員帳號
        const result = await window.firebaseService.createUser(
            BUILT_IN_ADMIN.email, 
            BUILT_IN_ADMIN.password, 
            {
                role: BUILT_IN_ADMIN.role,
                name: BUILT_IN_ADMIN.name
            }
        );
        
        if (result.success) {
            console.log('✅ 內建管理員帳號建立成功！');
            console.log('==========================================');
            console.log('🔑 管理員登入資訊：');
            console.log('📧 Email:', BUILT_IN_ADMIN.email);
            console.log('🔒 Password:', BUILT_IN_ADMIN.password);
            console.log('==========================================');
            
            // 建立成功後立即登出，避免影響其他操作
            if (result.needsReauth) {
                // 如果需要重新認證，表示已經登出了
                return;
            } else {
                // 正常情況下登出
                await window.firebaseService.signOut();
            }
        } else {
            console.error('❌ 建立管理員失敗:', result.error);
            // 如果是帳號已存在的錯誤，這是正常的
            if (result.error.includes('email-already-in-use')) {
                console.log('✅ 管理員帳號已存在（註冊時發現）');
            }
        }
    } catch (error) {
        console.error('檢查管理員帳號時發生錯誤:', error);
    }
}

// 手動建立管理員帳號的函數（供調試用）
window.createAdminNow = ensureBuiltInAdmin;

// 系統啟動時自動檢查管理員帳號
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(ensureBuiltInAdmin, 3000); // 等待3秒確保所有組件載入完成
});

console.log('🔥 Firebase 服務已初始化');