import './App.css';
import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";


import NavBar from './components/NavBar';
import Login from './components/Login';
import Register from './components/Register';
import Reset from './components/Reset';
import LoggingPage from './pages/LoggingPage';

function App() {
  const [activeComponent, setActiveComponent] = useState('logs');
  const [user, loading, error] = useAuthState(auth);

  return (
    <Router>
      <NavBar setActiveComponent={setActiveComponent} />
      <Routes>
        <>
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/reset" element={<Reset />} />
          <Route exact path="/" element={user ? <LoggingPage activeComponent={activeComponent} /> : <Login />}/>
        </>
      </Routes>
    </Router>
  );
}

export default App;
