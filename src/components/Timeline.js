import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, query, getDocs, doc, updateDoc, orderBy, deleteDoc } from 'firebase/firestore';
import { writeFile } from 'xlsx';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';

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

  // firestore data that will go into datagrid
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
  
  // fetches data from firestore
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

  // Regular screen
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

  // Small screen
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

  // Function to export firestore snapshots to excel
  const handleExport = async () => {
    // Create a new workbook instance
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('BoxBud Data');
  
    // Add data to the worksheet
    sheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Time', key: 'time', width: 10 },
      { header: 'Count', key: 'count', width: 10 },
      { header: 'Delta', key: 'delta', width: 10 },
      { header: 'Comment', key: 'comment', width: 40 },
    ];
    
    rows.forEach((row) => {
      sheet.addRow({
        date: row.burpDate,
        time: row.burpTime,
        count: row.burpCount,
        delta: row.burpDuration,
        comment: row.burpComment,
      });
    });
  
    // Write the workbook to a buffer
    const excelBuffer = await workbook.xlsx.writeBuffer();
    const excelBlob = new Blob([excelBuffer], {type:"application/vnd.ms-excel"});
    const filename = `burp_logs_${new Date().toLocaleDateString()}.xlsx`;
    saveAs(excelBlob, filename);
  };
  
  return (
    <div className="tableWrapper">
      {isSmallScreen ? <SmallScreen /> : < RegularScreen/>}
      <button onClick={handleExport}>Export to Excel</button>
    </div>
  );
};
export default Timeline;