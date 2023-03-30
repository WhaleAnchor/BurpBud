import React, { useState, useEffect } from "react";
import {addBurpLog} from "../firebase/firebase";
import './BurpButton.css';

// material ui imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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

const BurpButton = ({ uid }) => {
    const [counter, setCounter] = useState(0);
    const [showLogBurp, setShowLogBurp] = useState(false);
    const [newBurpComment, setNewBurpComment] = useState('');

    // state variables for notification upon success/fail logs
    const [snackbarOpenSuccess, setSnackbarOpenSuccess] = useState(false);
    const [snackbarOpenFailure, setSnackbarOpenFailure] = useState(false);

    const handleButtonClick = () => {
        setCounter(counter + 1);
        setShowLogBurp(true);
    };

    const handleMinusClick = () => {
        setCounter(counter - 1);
        setShowLogBurp(true);
    };

    const handleLogBurpClick = async () => {

        const newBurpTime = getCurrentTimeInMilitaryFormat();
        const newBurpDate = getCurrentDateInMMDDYYYYFormat();
    
        // Set the new comment value to "no comment" if it's an empty string
        const commentValue = newBurpComment.trim() === '' ? 'No comment' : newBurpComment;

        // Call the addBurpLog function with the counter value as the newBurpCount
        try {
            await addBurpLog(uid, newBurpTime, counter, newBurpDate, commentValue);
            console.log("logged successfully");
            setSnackbarOpenSuccess(true);
        } catch (error) {
            console.log(error);
            setSnackbarOpenFailure(true);
        }
        // Reset the counter and hide the "Log Burp" button
        // Clear the input fields after submitting
        setCounter(0);
        setShowLogBurp(false);
    };

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

    return (
        <div className="burp-button-wrapper">
            <h1> Press the Button </h1>
            <div className="twobigbuttons">
                <Button
                    variant="contained"
                    color="secondary"
                    className="big-round-button"
                    style={{borderRadius: "50%",
                    width: "100px",
                    height: "100px",
                    marginRight: "10px"
                    }}
                    onClick={handleButtonClick}
                >
                    Burp
                </Button>
            </div>
            
            {showLogBurp && (
                <div className="log-burp-container">
                    
                    <Box component="comment" sx={{ '& > :not(style)': { m: 1 } }} noValidate autoComplete="off">
                        <TextField 
                            id="outlined-basic" 
                            label="Comment" 
                            variant="outlined" 
                            onChange={(e) => setNewBurpComment(e.target.value)} />
                    </Box>
                    <div className="countersection">
                        <p>Counter: {counter}</p>
                        <Button
                            variant="outlined"
                            color="error"
                            style={{
                                margin: "10px"
                                }}
                            onClick={handleMinusClick}
                            >
                            minus
                        </Button>
                    </div>
                    <Button
                        variant="contained"
                        color="primary"
                        style={{
                        margin: "10px"
                        }}
                        onClick={handleLogBurpClick}
                    >
                        Log Burp
                    </Button>
                </div>
            )}
            {/* successful alert */}
            <Snackbar
                open={snackbarOpenSuccess}
                autoHideDuration={6000}
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
                autoHideDuration={6000}
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

export default BurpButton;
