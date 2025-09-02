// 檢查學生記錄的腳本
// 在瀏覽器控制台執行

// 檢查特定學生記錄
async function checkStudentRecord(studentEmail) {
    try {
        console.log(`🔍 檢查學生記錄: ${studentEmail}`);
        
        // 1. 先通過 users 集合找到 UID
        const usersSnapshot = await window.firebaseService.db.collection('users')
            .where('email', '==', studentEmail).get();
        
        if (usersSnapshot.empty) {
            console.log('❌ users 集合中找不到此學生');
            return;
        }
        
        const userDoc = usersSnapshot.docs[0];
        const userData = userDoc.data();
        const studentId = userDoc.id;
        
        console.log('✅ users 記錄:', {
            uid: studentId,
            email: userData.email,
            role: userData.role,
            name: userData.name
        });
        
        // 2. 檢查 students 集合記錄
        const studentDoc = await window.firebaseService.db.collection('students').doc(studentId).get();
        
        if (studentDoc.exists) {
            const studentData = studentDoc.data();
            console.log('✅ students 記錄:', studentData);
            
            // 3. 檢查教師記錄
            if (studentData.teacherId) {
                const teacherDoc = await window.firebaseService.db.collection('users').doc(studentData.teacherId).get();
                if (teacherDoc.exists) {
                    console.log('✅ 關聯教師:', teacherDoc.data());
                } else {
                    console.log('❌ 關聯教師不存在');
                }
            }
        } else {
            console.log('❌ students 集合中找不到記錄');
        }
        
    } catch (error) {
        console.error('檢查錯誤:', error);
    }
}

// 測試 getTeacherDataForStudent 方法
async function testGetTeacherData(studentEmail) {
    try {
        console.log(`🧪 測試 getTeacherDataForStudent: ${studentEmail}`);
        
        // 先找到學生 UID
        const usersSnapshot = await window.firebaseService.db.collection('users')
            .where('email', '==', studentEmail).get();
        
        if (usersSnapshot.empty) {
            console.log('❌ 找不到學生記錄');
            return;
        }
        
        const studentId = usersSnapshot.docs[0].id;
        console.log('✅ 找到學生 UID:', studentId);
        
        // 測試方法
        const result = await window.firebaseService.getTeacherDataForStudent(studentId);
        
        if (result.success) {
            console.log('✅ getTeacherDataForStudent 成功:', result);
        } else {
            console.log('❌ getTeacherDataForStudent 失敗:', result.error);
        }
        
    } catch (error) {
        console.error('測試錯誤:', error);
    }
}

// 使用範例:
// checkStudentRecord('123@gmail.com');
// testGetTeacherData('123@gmail.com');

console.log('📋 檢查腳本已載入');
console.log('使用方法:');
console.log('checkStudentRecord("123@gmail.com")');
console.log('testGetTeacherData("123@gmail.com")');