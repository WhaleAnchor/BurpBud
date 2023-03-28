import React, { useEffect } from "react";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import './NavBar.css'

// firebase imports
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth, logout } from "../firebase/firebase";


function NavBar({ setActiveComponent }) {
  const [user, loading, error] = useAuthState(auth);
  const navigate = useNavigate();
  
  // If not logged in, takes user back to login page
  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/");
  }, [user, loading]);  

  function burpLogHandler() {
    setActiveComponent('logs');
  }

  function timelineHandler() {
    setActiveComponent('timeline');
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

          {/* Main burp logging page */}
          <Box sx={{ flexGrow: 0 }}>
            <Typography title="Open settings">
              <Button onClick={burpLogHandler} sx={{ my: 2, color: 'white', display: 'block'  }}>
                Burp-Log
              </Button>
            </Typography>
          </Box>

          {/* data page */}
          <Box sx={{ flexGrow: 0 }}>
            <Typography title="Open settings">
              <Button onClick={timelineHandler} sx={{ my: 2, color: 'white', display: 'block'  }}>
              Timeline
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
export default NavBar;
