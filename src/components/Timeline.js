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
      field: "burpDate",
      sort: "desc"
    },
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
  async function updateComment(docId, newComment) {
    try {
      const burpLogDocRef = doc(db, "user_collections", uid, "burpLogs", docId);
      await updateDoc(burpLogDocRef, { burpComment: newComment });
      console.log("Comment updated successfully!");

      // Update the state with the new comment value
    const updatedRows = rows.map((row) => {
      if (row.id === docId) {
        return { ...row, burpComment: newComment };
      } else {
        return row;
      }
    });
    setRows(updatedRows);
    } catch (error) {
      console.error("Error updating comment: ", error);
    }
  }

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
    { field: 'burpTime', headerName: 'time', width: 100 },
    { field: 'burpCount', headerName: 'count', width: 100 },
    { field: 'burpDuration', headerName: 'delta', width: 100 },
    {
      field: 'burpComment',
      headerName: 'comment',
      width: 250,
      renderCell: (params) => (
        <div onClick={() => {
          const newComment = prompt(`Enter new comment.`, params.value);
          if (newComment !== null) {
            updateComment(params.id, newComment);
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
      <div >
        <DataGrid
          rows={rows}
          columns={columns}
          rowsPerPageOptions={[-1]}
          sortModel={sortModel}
          autoHeight={true}
          style={{ width: "70vw" }}
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
      </h3>
    </div>
  );
};
export default Timeline;