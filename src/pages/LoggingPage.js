import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase";
import BurpLogs from "../components/BurpLogs";

const LoggingPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {user ? (
        <>
          <h1>Welcome, {user.displayName}</h1>
          {/* Pass the user's UID as a prop to the BurpLogs component */}
          <BurpLogs uid={user.uid} />
        </>
      ) : (
        <h1>Please sign in</h1>
      )}
    </div>
  );
};

export default LoggingPage;
