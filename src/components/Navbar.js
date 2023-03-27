import React, { useEffect, useState } from "react";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import './Navbar.css'

// firebase imports
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth, db, logout } from "../firebase/firebase";
import { query, collection, getDocs, where } from "firebase/firestore";


function Navbar() {
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState("");
  const navigate = useNavigate();
  
  // gets user's name
  const fetchUserName = async () => {
    try {
    const q = query(collection(db, "users"), where("uid", "==", user?.uid));
    const doc = await getDocs(q);
    const data = doc.docs[0].data();
    setName(data.name);
    } catch (err) {
    console.error(err);
    alert("An error occured while fetching user data");
    }
  };


  // If not logged in, takes user back to login page
  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/");
    fetchUserName();
  }, [user, loading]);  

  // Takes user to ULINE website
  function ulineHandler() {
    window.open("https://www.uline.com", "_blank");
  };


  return (
    <AppBar className='navbarWrapper' color="primary">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="./"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            BoxChoi
          </Typography>

          {/* Inventory */}
          <Box sx={{ flexGrow: 0 }}>
            <Typography title="Open settings">
              <Button href="./" sx={{ my: 2, color: 'white', display: 'block'  }}>
                Inventory
              </Button>
            </Typography>
          </Box>

          {/* U-Line */}
          <Box sx={{ flexGrow: 0 }}>
            <Typography title="Open settings">
              <Button onClick={ulineHandler} sx={{ my: 2, color: 'white', display: 'block'  }}>
              U-Line
              </Button>
            </Typography>
          </Box>
          
          {/* Log Out */}
          <Box sx={{ flexGrow: 0 }}>
            <Typography title="Open settings">
              <Button onClick={logout} sx={{ my: 2, color: 'white', display: 'block'  }}>
              Logout
              </Button>
            </Typography>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;
