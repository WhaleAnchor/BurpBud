import React, { useState, useEffect } from "react";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import {db, auth, addBurpLog, getLastBurpLog} from "../firebase/firebase";
import './BurpLogs.css'

// material ui imports
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
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
    const [newBurpTime, setNewBurpTime] = useState(getCurrentTimeInMilitaryFormat());
    const [newBurpCount, setNewBurpCount] = useState(1);
    const [newBurpDate, setNewBurpDate] = useState(getCurrentDateInMMDDYYYYFormat());
    const [newBurpComment, setNewBurpComment] = useState('');
    const [lastBurpTime, setLastBurpTime] = useState(null);
    const [newBurpDuration, setNewBurpDuration] = useState(''); 
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

    const timeSinceLastLog = () => {
        if (!lastBurpTime) {
            return 'N/A';
        }
    
        const now = new Date();
        const lastLogTime = new Date(lastBurpTime);
        const diffInMinutes = Math.floor((now - lastLogTime) / 60000);
        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;
    
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Call the addBurpLog function to add the data to Firestore
        await addBurpLog(uid, newBurpTime, newBurpCount, newBurpDuration, newBurpDate, newBurpComment);
    
        // Clear the input fields after submitting
        setNewBurpTime(getCurrentTimeInMilitaryFormat());
        setNewBurpCount('');
        setNewBurpDuration(timeSinceLastLog());
        setNewBurpDate(getCurrentDateInMMDDYYYYFormat());
        setNewBurpComment('');
    };

    // Styling
    const boxStyles = { '& > :not(style)': { m: 1 } };

    return (
        <div className="inventoryWrapper">
            <h1>Log Dem Burps</h1>
            <Grid className="inputGrid" color="secondary">
                <div className="inputFields">
                    Current Time | {getCurrentDateInMMDDYYYYFormat()} | {getCurrentTimeInMilitaryFormat()}
                    <Box component="Count" sx={boxStyles} noValidate autoComplete="off">
                        <TextField
                            id="outlined-basic"
                            label="Count"
                            variant="outlined"
                            value={newBurpCount}
                            onChange={(e) => setNewBurpCount(e.target.value)}
                        />
                    </Box>
                    <Box component="Comment" sx={boxStyles} noValidate autoComplete="off">
                        <TextField 
                            id="outlined-basic" 
                            label="Comment" 
                            variant="outlined" 
                            onChange={(e) => setNewBurpComment(e.target.value)} />
                    </Box>
                    <Stack spacing={2} direction="row" className="logButton">
                        <Button variant="contained" onClick={handleSubmit}>
                            Log Burp
                        </Button>
                    </Stack>
                </div>
            </Grid>
        </div>
    );
};

export default BurpButton;
