# Firestore 安全規則更新

為了讓學生能夠讀取關聯教師的資料，需要更新 Firestore 安全規則。

## 目前的問題
學生無法讀取教師的 `userData` 和 `trackingData` 集合，因為安全規則限制使用者只能讀取自己的資料。

## 需要更新的安全規則

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 使用者基本資料
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // 允許所有已登入使用者讀取基本資料
    }
    
    // 學生記錄
    match /students/{studentId} {
      allow read, write: if request.auth != null;
    }
    
    // 使用者資料（包含匯入的清掃任務）
    match /userData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // 允許學生讀取關聯教師的資料
      allow read: if request.auth != null && 
                     exists(/databases/$(database)/documents/students/$(request.auth.uid)) &&
                     get(/databases/$(database)/documents/students/$(request.auth.uid)).data.teacherId == userId;
    }
    
    // 追蹤資料
    match /trackingData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // 允許學生讀取關聯教師的追蹤資料
      allow read: if request.auth != null && 
                     exists(/databases/$(database)/documents/students/$(request.auth.uid)) &&
                     get(/databases/$(database)/documents/students/$(request.auth.uid)).data.teacherId == userId;
    }
  }
}
```

## 安全規則說明

1. **users 集合**: 
   - 使用者可以讀寫自己的基本資料
   - 所有已登入使用者可以讀取其他使用者的基本資料（姓名等）

2. **students 集合**: 
   - 所有已登入使用者可以讀寫學生記錄

3. **userData 集合**: 
   - 使用者可以讀寫自己的資料
   - **新增**: 學生可以讀取關聯教師的資料（如果學生記錄中的 teacherId 匹配）

4. **trackingData 集合**: 
   - 使用者可以讀寫自己的追蹤資料
   - **新增**: 學生可以讀取關聯教師的追蹤資料

## 如何更新規則

1. 開啟 Firebase Console
2. 前往 Firestore Database
3. 點擊 "規則" 標籤
4. 將上述規則複製貼上
5. 點擊 "發布" 按鈕

## 測試建議

更新規則後，建議測試：
1. 學生登入後能否讀取關聯教師的 userData
2. 學生登入後能否讀取關聯教師的 trackingData  
3. 學生無法讀取非關聯教師的資料（安全性測試）
4. 教師仍能正常讀寫自己的資料