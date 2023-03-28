import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from './components/Login'
import Register from './components/Register';
import Reset from './components/Reset';
import BurpLogs from './components/BurpLogs';
import NavBar from './components/NavBar';


function App() {
  return (
    <Router>
      <NavBar/>
      <Routes>
        <>
          <Route exact path="/" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/reset" element={<Reset />} />
          <Route exact path="/logs" element={<BurpLogs />} />
        </>
      </Routes>
    </Router>
  );
}

export default App;
