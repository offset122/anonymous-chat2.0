import React, { useRef, useState, useEffect } from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Container, Box, TextField, Snackbar, Grid, Paper, IconButton, Menu, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Footer from "./Footer";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, deleteDoc, doc, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCcbs7_KRlWGnTrMj6fgTNXAdV9VvtfsDk",
  authDomain: "anonymous-chatroom-b7f79.firebaseapp.com",
  databaseURL: "https://anonymous-chatroom-b7f79-default-rtdb.firebaseio.com",
  projectId: "anonymous-chatroom-b7f79",
  storageBucket: "anonymous-chatroom-b7f79.appspot.com",
  messagingSenderId: "54549251555",
  appId: "1:54549251555:web:c1e99745ce82f5670d8cd6",
  measurementId: "G-MPB2SND8XR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);
  const [darkMode, setDarkMode] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#556cd6',
      },
      secondary: {
        main: '#19857b',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            BlindChat
          </Typography>
          <Button color="inherit" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>
          {user && <Button color="inherit">Edit Profile</Button>}
          <SignOut />
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        {user ? <ChatRoom /> : <SignIn />}
      </Container>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message="Profile saved successfully!"
      />
      <Footer />
    </ThemeProvider>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <Box textAlign="center" sx={{ mt: 4 }}>
      <Button variant="contained" color="primary" onClick={signInWithGoogle}>
        Sign in with Google
      </Button>
      <Typography variant="h6" sx={{ mt: 2 }}>Welcome! Let's make new friends.</Typography>
    </Box>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <Button color="inherit" onClick={() => signOut(auth)}>
        Sign Out
      </Button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = collection(firestore, "messages");
  const q = query(messagesRef, orderBy("createdAt"), limit(25));
  const [messages] = useCollectionData(q, { idField: "id" });
  const [formValue, setFormValue] = useState("");

  useEffect(() => {
    dummy.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={12} md={8} lg={6}>
        <Paper elevation={3} sx={{ maxHeight: "400px", overflowY: "auto", padding: 2, borderRadius: 2 }}>
          {messages && messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
          <span ref={dummy}></span>
        </Paper>
        <form onSubmit={sendMessage} style={{ display: "flex", marginTop: "16px" }}>
          <TextField
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="Say something nice"
            fullWidth
            variant="outlined"
            sx={{ mr: 1 }}
          />
          <Button type="submit" variant="contained" color="primary" disabled={!formValue}>
            Send
          </Button>
        </form>
      </Grid>
    </Grid>
  );
}

function ChatMessage({ message }) {
  const { text, uid, photoURL, id } = message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const deleteMessage = async () => {
    await deleteDoc(doc(firestore, "messages", id));
    handleClose();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 1,
        bgcolor: uid === auth.currentUser.uid ? 'primary.main' : 'grey.200',
        color: uid === auth.currentUser.uid ? 'white' : 'black',
        padding: 1,
        borderRadius: 1,
        flexDirection: uid === auth.currentUser.uid ? "row-reverse" : "row",
        textAlign: uid === auth.currentUser.uid ? "right" : "left",
        width: "fit-content",
        maxWidth: "80%",
        mx: uid === auth.currentUser.uid ? "auto" : 0, // Align messages based on sender
      }}
    >
      <img
        alt="profile"
        src={photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"}
        style={{ width: 40, height: 40, borderRadius: "50%", marginLeft: uid === auth.currentUser.uid ? 8 : 0, marginRight: uid === auth.currentUser.uid ? 0 : 8 }}
      />
      <Typography variant="body1" sx={{ flexGrow: 1 }}>{text}</Typography>
      
      {uid === auth.currentUser.uid && (
        <>
          <IconButton onClick={handleClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={deleteMessage}>
              <DeleteIcon fontSize="small" /> Delete for Everyone
            </MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
}

export default App;
