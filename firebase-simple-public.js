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
    
    async createUserWithoutLogin(email, password, userData, currentUser) {
        console.log('開始創建學生帳號，當前教師:', currentUser.email, currentUser.uid);
        
        const teacherId = currentUser.uid;
        
        try {
            console.log('📝 第1步：創建學生 Firebase Auth 帳號...');
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const newUserUid = userCredential.user.uid;
            console.log('✅ 學生 Auth 帳號創建成功，UID:', newUserUid);
            console.log('⚠️ Firebase 已自動登入學生帳號');
            
            console.log('📝 第2步：立即創建學生的所有資料記錄...');
            
            // 創建 users 記錄
            const userDoc = {
                email: email,
                role: 'student',
                name: userData.name || email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            if (userData.studentNumber) {
                userDoc.studentNumber = userData.studentNumber;
            }
            
            await this.db.collection('users').doc(newUserUid).set(userDoc);
            console.log('✅ 學生 users 記錄創建成功');
            
            // 創建 students 記錄
            await this.db.collection('students').doc(newUserUid).set({
                teacherId: teacherId,
                studentNumber: userData.studentNumber || '',
                name: userData.name || email,
                email: email,
                status: 'active',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ 學生 students 記錄創建成功');
            
            console.log('📝 第3步：登出學生帳號');
            await this.auth.signOut();
            console.log('✅ 已登出學生帳號');
            
            // 返回需要前端處理教師重新登入的訊息
            return { 
                success: true, 
                user: { uid: newUserUid, email: email },
                dataCreated: true,
                needsImmediateReload: true,
                message: '學生帳號創建成功！即將重新載入頁面...'
            };
            
        } catch (error) {
            console.error('創建學生帳號錯誤:', error);
            
            let errorMessage = error.message;
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = '此電子信箱已被註冊';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = '密碼強度不足，請至少輸入6個字元';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = '電子信箱格式不正確';
            } else if (error.code === 'permission-denied') {
                errorMessage = '權限不足，請確認您是否有建立學生帳號的權限';
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
            
            // 如果當前有使用者登入且要創建的是學生，使用特殊方法
            console.log('🔍 創建使用者檢查:', {
                hasCurrentUser: !!currentUser,
                currentUserEmail: currentUser?.email,
                userDataRole: userData.role,
                isStudent: userData.role === 'student'
            });
            
            if (currentUser && userData.role === 'student') {
                console.log('✅ 教師/管理員創建學生帳號，使用特殊方法');
                return await this.createUserWithoutLogin(email, password, userData, currentUser);
            } else {
                console.log('⚠️ 使用一般創建方法，原因:', {
                    noCurrentUser: !currentUser,
                    notStudent: userData.role !== 'student',
                    role: userData.role
                });
            }
            
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
                console.log('🎓 創建學生記錄，教師ID:', userData.teacherId);
                try {
                    await this.db.collection('students').doc(user.uid).set({
                        teacherId: userData.teacherId,
                        studentNumber: userData.studentNumber || '',
                        name: userData.name || email,
                        email: email,
                        status: 'active',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    console.log('✅ 學生記錄創建成功');
                } catch (studentError) {
                    console.error('❌ 創建學生記錄失敗:', studentError);
                    throw new Error('學生記錄創建失敗: ' + studentError.message);
                }
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

    // 學生功能：獲取教師的資料
    async getTeacherDataForStudent(studentId) {
        try {
            // 首先查找學生記錄以獲取教師ID
            const studentDoc = await this.db.collection('students').doc(studentId).get();
            
            if (!studentDoc.exists) {
                return { success: false, error: '找不到學生記錄' };
            }
            
            const studentData = studentDoc.data();
            const teacherId = studentData.teacherId;
            
            if (!teacherId) {
                return { success: false, error: '學生沒有關聯的教師' };
            }
            
            // 直接讀取教師的資料（避免權限問題）
            const [teacherInfo, teacherUserData, teacherTrackingData] = await Promise.all([
                this.db.collection('users').doc(teacherId).get(),
                this.db.collection('userData').doc(teacherId).get(),
                this.db.collection('trackingData').doc(teacherId).get()
            ]);
            
            const teacherInfoData = teacherInfo.exists ? teacherInfo.data() : null;
            const teacherUserDataData = teacherUserData.exists ? teacherUserData.data() : null;
            const teacherTrackingDataData = teacherTrackingData.exists ? teacherTrackingData.data() : {};
            
            return {
                success: true,
                teacherId: teacherId,
                teacherInfo: teacherInfoData,
                teacherData: teacherUserDataData,
                teacherTrackingData: teacherTrackingDataData,
                studentInfo: studentData
            };
            
        } catch (error) {
            console.error('獲取教師資料錯誤:', error);
            return { success: false, error: error.message };
        }
    }

    // 學生監聽教師資料變化
    onTeacherDataChanged(studentId, callback) {
        // 先獲取學生的教師ID，然後監聽教師的資料
        this.getTeacherDataForStudent(studentId).then(result => {
            if (result.success && result.teacherId) {
                // 返回監聽器，同時監聽教師的 userData 和 trackingData
                const teacherId = result.teacherId;
                
                // 監聽教師的 userData 變化
                const unsubscribeUserData = this.db.collection('userData').doc(teacherId)
                    .onSnapshot(doc => {
                        if (doc.exists) {
                            callback({
                                type: 'userData',
                                data: doc.data(),
                                teacherId: teacherId
                            });
                        }
                    });
                
                // 返回取消監聽函數
                return unsubscribeUserData;
            } else {
                console.error('無法監聽教師資料:', result.error);
                return () => {}; // 空的取消監聽函數
            }
        }).catch(error => {
            console.error('設定教師資料監聽器錯誤:', error);
            return () => {};
        });
    }
}

// 建立全域 Firebase 服務實例
window.firebaseService = new FirebaseService();

console.log('🔥 Firebase 服務已初始化（公開版本）');