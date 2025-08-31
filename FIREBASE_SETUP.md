# 🔥 Firebase 設定指南

## 系統已整合 Firebase！

你的打掃追蹤系統現在已經完全整合 Firebase，具備以下功能：

### ✨ 新功能
- 🔐 **雲端使用者驗證** - Firebase Authentication
- ☁️ **雲端資料儲存** - Firebase Firestore
- 🔄 **即時同步** - 多裝置資料同步
- 👥 **多使用者管理** - 管理員可查看所有使用者

---

## 🚀 使用步驟

### 1. 🚨 **立即修復錯誤**

你遇到的錯誤 `Firebase: Error (auth/configuration-not-found)` 表示 **Firebase Authentication 尚未啟用**。

#### 📋 **必須執行的步驟**：

##### Step 1: 啟用 Authentication
1. 前往 https://console.firebase.google.com
2. 選擇專案 `cleaning-tracker-2025`
3. 左側選單點擊 **「Authentication」**
4. 點擊大大的 **「開始使用」** 按鈕
5. 切換到 **「Sign-in method」** 分頁
6. 找到 **「Email/Password」** 項目
7. 點擊右側的編輯圖示 (筆的圖示)
8. **啟用**第一個選項 「Email/Password」
9. 點擊 **「儲存」**

##### Step 2: 啟用 Firestore Database  
1. 左側選單點擊 **「Firestore Database」**
2. 點擊 **「建立資料庫」**
3. 選擇 **「以測試模式啟動」**
4. 選擇位置：**asia-east1 (Taiwan)**
5. 點擊 **「完成」**

### 2. 設定安全規則
在 Firestore Database → 規則，貼上以下規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 使用者只能存取自己的資料
    match /userData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /trackingData/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // 使用者資訊：可讀取，僅能修改自己的
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. 建立使用者帳號
1. 開啟 `login.html`
2. 點擊「註冊新帳號」
3. 輸入電子信箱和密碼
4. **建議的管理員帳號**：
   - Email: admin@yourdomain.com
   - Password: 你的安全密碼

---

## 📊 資料結構

### Firestore 集合結構：
```
/users/{userId}
├── email: "user@example.com"
├── role: "admin" | "user"  
├── name: "使用者名稱"
└── createdAt: timestamp

/userData/{userId}
├── cleaningTasks: [...]     // 打掃事項
├── students: [...]          // 學生名單
├── assignments: {...}       // 任務分配
└── lastUpdate: timestamp

/trackingData/{userId}
├── "taskIndex-studentName-date": "merit|demerit"
└── ...
```

---

## 🎯 功能特色

### 🔐 驗證系統
- Email/密碼登入註冊
- 自動角色檢測（email含"admin"→管理員）
- 安全的登出機制

### ☁️ 雲端同步
- 資料自動同步到 Firebase
- 多裝置存取相同資料
- 即時更新（未來可擴展）

### 👨‍💼 管理員功能
- 查看所有使用者的追蹤資料
- 統一管理權限
- 系統整體監控

---

## ⚠️ 注意事項

1. **網路連線**：需要網路才能同步資料
2. **帳號安全**：請使用強密碼
3. **資料備份**：Firebase 自動備份，但建議定期匯出
4. **成本控制**：注意 Firebase 用量限制

---

## 🆘 常見問題

### Q: 無法註冊/登入？
A: 檢查 Firebase Authentication 是否啟用 Email/Password

### Q: 資料無法儲存？
A: 檢查 Firestore 安全規則是否正確設定

### Q: 找不到其他使用者？
A: 確認你有管理員權限（email 包含 "admin"）

---

## 🎉 享受你的雲端打掃追蹤系統！

現在你可以：
- 📱 用手機、電腦隨時存取
- 👥 多人協作管理
- 📊 雲端資料永不遺失
- 🚀 隨時隨地追蹤打掃狀況