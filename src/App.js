import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from './components/Login'
import Register from './components/Register';
import Reset from './components/Reset';
import InventoryPage from './pages/InventoryPage';


function App() {
  return (
    <Router>
      <Routes>
        <>
          <Route exact path="/" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
          <Route exact path="/reset" element={<Reset />} />
          <Route exact path="/inventory" element={<InventoryPage />} />
        </>
      </Routes>
    </Router>
  );
}

export default App;
