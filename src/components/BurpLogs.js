import React, { useState, useEffect } from "react";
import {addBurpLog, getLastBurpLog} from "../firebase/firebase";
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


const BurpLogs = ({ uid }) => {
    const [newBurpTime, setNewBurpTime] = useState('');
    const [newBurpCount, setNewBurpCount] = useState('');
    const [newBurpDate, setNewBurpDate] = useState('');
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

        // Set the new comment value to "no comment" if it's an empty string
        const commentValue = newBurpComment.trim() === '' ? 'No comment' : newBurpComment;
        
        // Set the new burp count value to "1" if it's an empty string
        const burpValue = newBurpCount.trim() === '' ? 1 : parseInt(newBurpCount);
        
        // Set the new burp time value to "current time" if it's an empty string
        const burpTime = newBurpTime.trim() === '' ? getCurrentTimeInMilitaryFormat() : newBurpTime;

        // Set the new burp time value to "current time" if it's an empty string
        const burpDate = newBurpDate.trim() === '' ? getCurrentDateInMMDDYYYYFormat() : newBurpDate;

        // Call the addBurpLog function to add the data to Firestore
        await addBurpLog(uid, burpTime, burpValue, newBurpDuration, burpDate, commentValue);
    
        // Clear the input fields after submitting
        setNewBurpDate('');
        setNewBurpTime('');
        setNewBurpCount('');
        setNewBurpComment('');
        setNewBurpDuration(timeSinceLastLog());
    };

    // Styling
    const boxStyles = { '& > :not(style)': { m: 1 } };

    return (
        <div className="inventoryWrapper">
            <h1>Manual Log</h1>
            <Grid className="inputGrid" color="secondary">
                <div className="inputFields">
                    Current Time | {getCurrentDateInMMDDYYYYFormat()} | {getCurrentTimeInMilitaryFormat()}
                    <Box component="Date" sx={boxStyles} noValidate autoComplete="off">
                        <TextField
                            id="outlined-basic"
                            label={getCurrentDateInMMDDYYYYFormat()}
                            variant="outlined"
                            inputProps={{ inputMode: 'numeric' }}
                            placeholder={getCurrentDateInMMDDYYYYFormat()}
                            onChange={(e) => setNewBurpDate(e.target.value)}
                        />
                    </Box>
                    <Box component="Time" sx={boxStyles} noValidate autoComplete="off">
                        <TextField
                            id="outlined-basic"
                            label={getCurrentTimeInMilitaryFormat()}
                            variant="outlined"
                            inputProps={{ inputMode: 'numeric' }}
                            placeholder={getCurrentTimeInMilitaryFormat()}
                            onChange={(e) => setNewBurpTime(e.target.value)}
                        />
                    </Box>
                    <Box component="Count" sx={boxStyles} noValidate autoComplete="off">
                        <TextField
                            id="outlined-basic"
                            label="Count. 1 if blank."
                            variant="outlined"
                            inputProps={{ inputMode: 'numeric' }}
                            placeholder="1"
                            value={newBurpCount}
                            onChange={(e) => setNewBurpCount(e.target.value)}
                        />
                    </Box>
                    <Box component="Comment" sx={boxStyles} noValidate autoComplete="off">
                        <TextField 
                            id="outlined-basic" 
                            label="Comment" 
                            variant="outlined" 
                            value={newBurpComment} 
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

export default BurpLogs;
