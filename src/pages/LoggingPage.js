import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import BurpLogs from "../components/BurpLogs";
import BurpButton from "../components/BurpButton";
import './LoggingPage.css'
import Button from '@mui/material/Button';
import Timeline from '../components/Timeline';

const LoggingPage = ({ activeComponent }) => {
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [showBurpLogs, setShowBurpLogs] = useState(!isMobile);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setShowBurpLogs(!isMobile);
  }, [isMobile]);

  const toggleBurpLogs = () => {
    setShowBurpLogs(!showBurpLogs);
  };

  return (
    <div className="LoggingPageWrapper">
      {user ? (
        <>
          <h1>Welcome,{" "}
            {user.displayName ? (
              user.displayName
            ) : (
              <span>{user.email}</span>
            )}</h1>
          {/* Pass the user's UID as a prop to the BurpLogs component */}
          <div className="LogContainer">
            {activeComponent === 'logs' && (
              <>
                {showBurpLogs || !isMobile ? <BurpLogs uid={user.uid} /> : null}
                <BurpButton uid={user.uid}/>
              {isMobile && (
                <Button variant="outlined" onClick={toggleBurpLogs}>
                  {showBurpLogs ? "Hide BurpLogs" : "or Manually Log"}
                </Button>
              )}
            </>
            )}
            {activeComponent === 'timeline' && <Timeline uid={user.uid} />}
          </div>
        </>
      ) : (
        <h1>Please sign in</h1>
        
      )}
    </div>
  );
};

export default LoggingPage;
