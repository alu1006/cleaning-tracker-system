// Firebase 配置範例文件
// 請複製此文件為 firebase-config.js 並填入你的 Firebase 專案配置

const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.firebasestorage.app",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
};

// 匯出配置供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = firebaseConfig;
}