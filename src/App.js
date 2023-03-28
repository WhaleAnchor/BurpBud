import './App.css';
import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from './components/Login'
import Register from './components/Register';
import Reset from './components/Reset';
import LoggingPage from './pages/LoggingPage';
import NavBar from './components/NavBar';

function App() {
  const [activeComponent, setActiveComponent] = useState('logs');

  return (
    <Router>
      <NavBar setActiveComponent={setActiveComponent} />
      <Routes>
        <>
          <Route exact path="/" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/reset" element={<Reset />} />
          <Route exact path="/logs" element={<LoggingPage activeComponent={activeComponent} />} />
        </>
      </Routes>
    </Router>
  );
}

export default App;
