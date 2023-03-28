import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, query, getDocs, doc, updateDoc, orderBy, deleteDoc } from 'firebase/firestore';

// material ui imports
import { DataGrid } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';


const Timeline = ({ uid }) => {
  const [rows, setRows] = useState([]);
  const [sortModel, setSortModel] = useState([
    {
      field: "burpTime",
      sort: "desc"
    },
  ]);

  // Deleting a burp log entry
  const deleteBurp = async (id) => {
    // Delete the box from Firestore
      await deleteDoc(doc(db, "user_collections", uid, "burpLogs", id));
      setRows(rows.filter((doc)=> doc.id !== id))
  };

  // Manually update a comment
  const updateComment = async (id, comment) => {
    const burpLogsCollection = collection(db, "user_collections", uid, "burpLogs", id);

    const newFields = {burpComment: comment};
    await updateDoc(burpLogsCollection, newFields);

    const data = await getDocs(burpLogsCollection);

    const formattedData = data.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setRows(formattedData);
  };

  const columns = [
    {
        field: 'delete',
        headerName: '',
        width: 10,
        renderCell: (params) => (
        <IconButton onClick={() => deleteBurp(params.id)}>
            <DeleteIcon />
        </IconButton>
        ),
    },
    { field: 'burpDate', headerName: 'date', width: 100 },
    { field: 'burpTime', headerName: 'time', width: 70 },
    { field: 'burpCount', headerName: 'count', width: 50 },
    { field: 'burpDuration', headerName: 'delta', width: 30 },
    {
      field: 'burpComment',
      headerName: 'comment',
      width: 250,
      renderCell: (params) => (
        <div onClick={() => {
          const newComment = prompt(`Enter new comment.`, params.value);
          if (newComment !== null && newComment.trim() !== '' && /^\d+$/.test(newComment)) {
            updateComment(params.id, parseInt(newComment));
          }
        }}>
          {params.value}
        </div>
      )
  },
];
  
  useEffect(() => {
    const fetchBurpLogs = async () => {
      const burpLogsCollection = collection(db, "user_collections", uid, "burpLogs");
      const data = await getDocs(burpLogsCollection);
      const formattedData = data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRows(formattedData);
    };
    fetchBurpLogs();
  }, [uid]);
  // JSX depeding on screen size
  const isSmallScreen = window.innerWidth <= 1260;

  // JSX depending on screen size
  const SmallScreen = () => (
    <div className="">
      <div className="">
          <div style={{ height: 500, width: 450 }}>
            <div>
              <h1>
                Boxes
              </h1>  
            </div>
            <DataGrid
              rows={rows}
              columns={columns}
              rowsPerPageOptions={[-1]}
              sortModel={sortModel}
              onSortModelChange={(model) => setSortModel(model)}
            />
          </div>
      </div>
    </div>
  );
  const RegularScreen = () => (
    <div className="Row">

    <div  className="firestoreBoxes">
      <div className="title">
        <h1>
          burps
        </h1>
      </div>
      <div style={{ height:500, width:450}}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowsPerPageOptions={[-1]}
          sortModel={sortModel}
          onSortModelChange={(model) => setSortModel(model)}
        />
      </div>
    </div>
  </div>
);

  return (
    <div className="tableWrapper">
      {isSmallScreen ? <SmallScreen /> : < RegularScreen/>}
      <h3 className="userHint">
        * You may click the quantity in each row to manually input the quantity. *
      </h3>
    </div>
  );
};
export default Timeline;