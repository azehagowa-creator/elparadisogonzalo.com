const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "elparadisogonzalo-project"
});

const db = admin.firestore();

db.collection("users").add({
  name: "Koa Gonzalo",
  created: new Date()
}).then(() => {
  console.log("User saved");
  process.exit();
}).catch(console.error);
