/* Firebase Cloud Messaging service worker */
/* Update firebaseConfig values from Firebase Console → Project settings → Your apps (Web) */
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "REPLACE_ME",
  authDomain: "jobportal-3800e.firebaseapp.com",
  projectId: "jobportal-3800e",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
});

firebase.messaging().onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "LoomHire";
  self.registration.showNotification(title, {
    body: payload.notification?.body || "",
    data: payload.data || {},
  });
});
