import React, { useState } from "react";
import {addBurpLog} from "../firebase/firebase";
import './BurpLogs.css'

// material ui imports
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { Snackbar } from "@mui/material";
import Alert from "@mui/material/Alert";

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

    // state variables for notification upon success/fail logs
    const [snackbarOpenSuccess, setSnackbarOpenSuccess] = useState(false);
    const [snackbarOpenFailure, setSnackbarOpenFailure] = useState(false);

    const handleCloseSnackbar = (event, reason) => {
        if (reason === "clickaway") {
          return;
        }
        setSnackbarOpenSuccess(false);
    };

    const handleCloseSnackbarFailure = (event, reason) => {
        if (reason === "clickaway") {
          return;
        }
        setSnackbarOpenFailure(false);
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

        try {
            // Call the addBurpLog function to add the data to Firestore
            await addBurpLog(uid, burpTime, burpValue, burpDate, commentValue);
            
            console.log("logged successfully");
            setSnackbarOpenSuccess(true);

            // Clear the input fields after submitting
            setNewBurpDate('');
            setNewBurpTime('');
            setNewBurpCount('');
            setNewBurpComment('');

        } catch (error) {
            console.log(error);
            setSnackbarOpenFailure(true);
        }
        
    };

    // Styling
    const boxStyles = { '& > :not(style)': { m: 1 } };

    return (
        <div className="inventoryWrapper">
            <h1>Manual Log</h1>
            <Grid className="inputGrid" color="secondary">
                <div className="inputFields">
                    Current Time | {getCurrentDateInMMDDYYYYFormat()} | {getCurrentTimeInMilitaryFormat()}
                    <Box sx={boxStyles} noValidate autoComplete="off">
                        <TextField
                            id="outlined-basic"
                            label={getCurrentDateInMMDDYYYYFormat()}
                            variant="outlined"
                            inputProps={{ inputMode: 'numeric' }}
                            placeholder={getCurrentDateInMMDDYYYYFormat()}
                            onChange={(e) => setNewBurpDate(e.target.value)}
                        />
                    </Box>
                    <Box sx={boxStyles} noValidate autoComplete="off">
                        <TextField
                            id="outlined-basic"
                            label={getCurrentTimeInMilitaryFormat()}
                            variant="outlined"
                            placeholder={getCurrentTimeInMilitaryFormat()}
                            onChange={(e) => setNewBurpTime(e.target.value)}
                        />
                    </Box>
                    <Box sx={boxStyles} noValidate autoComplete="off">
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
                    <Box sx={boxStyles} noValidate autoComplete="off">
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
            {/* successful alert */}
            <Snackbar
                open={snackbarOpenSuccess}
                autoHideDuration={2000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
                Log added successfully!
                </Alert>
            </Snackbar>
            {/* failure alert */}
            <Snackbar
                open={snackbarOpenFailure}
                autoHideDuration={2000}
                onClose={handleCloseSnackbarFailure}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
                <Alert onClose={handleCloseSnackbarFailure} severity="error" sx={{ width: "100%" }}>
                Failed. Please let me know in the "request features" asap!
                </Alert>
            </Snackbar>
        </div>
    );
};

export default BurpLogs;
