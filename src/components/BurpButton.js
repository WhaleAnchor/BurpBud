import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import {db, auth, addBurpLog, getLastBurpLog} from "../firebase/firebase";
import './BurpButton.css';

// material ui imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const getCurrentTimeInMilitaryFormat = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

const getCurrentDateInMMDDYYYYFormat = () => {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${month}/${day}/${year}`;
};

const BurpButton = ({ uid }) => {
    const [counter, setCounter] = useState(0);
    const [showLogBurp, setShowLogBurp] = useState(false);
    const [lastBurpTime, setLastBurpTime] = useState(null);
    const [newBurpDuration, setNewBurpDuration] = useState('');
    const [newBurpComment, setNewBurpComment] = useState('');

    // find the most recent log 
    useEffect(() => {
        if (uid) {
            (async () => {
                const lastLogTime = await getLastBurpLog(uid);
                setLastBurpTime(lastLogTime);
            })();
        }
    }, [uid]);

    useEffect(() => {
        if (lastBurpTime) {
        const now = new Date();
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
        const [lastHours, lastMinutes] = lastBurpTime.split(':').map(Number);
        const lastTimeInMinutes = lastHours * 60 + lastMinutes;
        const duration = currentTimeInMinutes - lastTimeInMinutes;
        setNewBurpDuration(duration);
        }
    }, [lastBurpTime]);
    const handleButtonClick = () => {
        setCounter(counter + 1);
        setShowLogBurp(true);
    };

    const handleLogBurpClick = async () => {

        const newBurpTime = getCurrentTimeInMilitaryFormat();
        const newBurpDate = getCurrentDateInMMDDYYYYFormat();
    
        // Call the addBurpLog function with the counter value as the newBurpCount
        await addBurpLog(uid, newBurpTime, counter, newBurpDuration, newBurpDate, newBurpComment);
    
        // Reset the counter and hide the "Log Burp" button
        setCounter(0);
        setShowLogBurp(false);
    };

    return (
        <div className="burp-button-wrapper">
            <h1> Press the Button </h1>
            <Button
                variant="contained"
                color="secondary"
                className="big-round-button"
                onClick={handleButtonClick}
            >
                Burp
            </Button>
            {showLogBurp && (
                <div className="log-burp-container">
                    <Box component="Comment" sx={{ '& > :not(style)': { m: 1 } }} noValidate autoComplete="off">
                        <TextField 
                            id="outlined-basic" 
                            label="Comment" 
                            variant="outlined" 
                            onChange={(e) => setNewBurpComment(e.target.value)} />
                    </Box>
                    
                    <p>Counter: {counter}</p>
                    
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleLogBurpClick}
                    >
                        Log Burp
                    </Button>
                    
                </div>
                
            )}
        </div>
    );
};

export default BurpButton;
