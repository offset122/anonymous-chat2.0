import React, { useRef, useState, useEffect } from "react";
import "./App.css";
import Footer from "./Footer";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDOcXz6fxczJpzE7VyiNbQOXCif8b-rDXI",
  authDomain: "anonymous-chat-app-ff02c.firebaseapp.com",
  databaseURL: "https://anonymous-chat-app-ff02c-default-rtdb.firebaseio.com",
  projectId: "anonymous-chat-app-ff02c",
  storageBucket: "anonymous-chat-app-ff02c.appspot.com",
  messagingSenderId: "823082117322",
  appId: "1:823082117322:web:e6e69ee15c772e760e2c33",
  measurementId: "G-E8D2ZJTFCK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode', !darkMode);
  };

  return (
    <>
      <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
        <header>
          <h1>BlindChat</h1>
          <div>
            <button className="toggle-dark-mode" onClick={toggleDarkMode}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <SignOut />
          </div>
        </header>

        <section>{user ? <ChatRoom /> : <SignIn />}</section>
      </div>
      <Footer />
    </>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <h1 className="text-3xl mt-5 text-green-600">Welcome , Let's make New Friends</h1>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => signOut(auth)}>
        Sign Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, "messages");
  const q = query(messagesRef, orderBy("createdAt"), limit(25));

  const [messages] = useCollectionData(q, { idField: "id" });
  const [formValue, setFormValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    dummy.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isTyping) {
      const typingTimer = setTimeout(() => setIsTyping(false), 3000);
      return () => clearTimeout(typingTimer);
    }
  }, [isTyping]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleTyping = () => {
    setIsTyping(true);
  };

  return (
    <>
      <div className="container">
        <main>
          {messages && messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
          {isTyping && <div className="typing-indicator">User is typing...</div>}
          <span ref={dummy}></span>
        </main>
      </div>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => {
            setFormValue(e.target.value);
            handleTyping();
          }}
          placeholder="Say something nice"
        />
        <button type="submit" disabled={!formValue}>
          Send
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img
        alt="profile"
        src={
          photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
        }
      />
      <p>{text}</p>
    </div>
  );
}

export default App;
