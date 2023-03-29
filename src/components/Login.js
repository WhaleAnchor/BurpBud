import React, { useState } from "react";
import { Link } from "react-router-dom";
import { logInWithEmailAndPassword, signInWithGoogle } from "../firebase/firebase";
import "./Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    return (
        <div className="login">
            <h1>Welcome to BurpBud!</h1>
            <div className="login__container">
                <input
                    type="text"
                    className="login__textBox"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail Address"
                />
                <input
                    type="password"
                    className="login__textBox"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                />
                <button
                    className="login__btn"
                    onClick={() => logInWithEmailAndPassword(email, password)}
                    >
                    Login
                </button>
                <button 
                    className="login__btn login__google" 
                    onClick={signInWithGoogle}>
                    Login with Google
                </button>
                <div>
                    <Link to="/reset">Forgot Password</Link>
                </div>
                <div>
                    Don't have an account? <Link to="/register">Register</Link> now.
                </div>
            </div>
            <span className="spanTip">
                Register and Login through Google for better experience
            </span>
        </div>
    );
}
export default Login;