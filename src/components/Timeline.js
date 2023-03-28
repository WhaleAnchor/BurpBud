import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, query, getDocs, doc, updateDoc, orderBy, deleteDoc } from 'firebase/firestore';
import { saveAs } from 'file-saver';
import ExcelJS, {Workbook} from 'exceljs';

// material ui imports
import { DataGrid } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';

const Timeline = ({ uid }) => {
  const [rows, setRows] = useState([]);
  const [sortModel, setSortModel] = useState([
    {
      field: 'burpDate',
      sort: 'desc',
      comparator: (a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time),
    },
    {
      field: 'burpTime',
      sort: 'desc',
      disableSorting: true,
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
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('BurpLogs');
    
    // Add data to the worksheet
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Time', key: 'time', width: 10 },
      { header: 'Count', key: 'count', width: 10 },
      { header: 'Delta', key: 'delta', width: 10 },
      { header: 'Comment', key: 'comment', width: 40 },
      { header: 'Daily Avg Count', key: 'dailyAvgCount', width: 15 },
      { header: 'Daily Avg Delta', key: 'dailyAvgDelta', width: 15 },
    ];
  
    // Group the rows by date
    function groupBy(arr, key) {
      return arr.reduce((acc, obj) => {
        const val = obj[key];
        acc[val] = acc[val] || [];
        acc[val].push(obj);
        return acc;
      }, {});
    }
    const groupedRows = groupBy(rows, 'burpDate');
  
    // Iterate over each date group
    Object.entries(groupedRows).forEach(([date, group]) => {
      // Calculate the daily averages for Count and Delta
      const totalBurps = group.reduce((acc, row) => acc + parseInt(row.burpCount), 0);
      const dailyAvgCount = totalBurps / group.length;
  
      const totalDuration = group.reduce((acc, row) => acc + Number(row.burpDuration), 0);
      const dailyAvgDelta = totalDuration / group.length;

  
      // Iterate over each row in the date group
      group.forEach((row) => {
        worksheet.addRow({
          date: row.burpDate,
          time: row.burpTime,
          count: row.burpCount,
          delta: row.burpDuration,
          comment: row.burpComment,
          dailyAvgCount,
          dailyAvgDelta,
        });
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
      <Button variant='contained' color="success" style={{ marginBottom: "10px" }} onClick={handleExport}> 
        Export to Excel 
      </Button>
      {isSmallScreen ? <SmallScreen /> : < RegularScreen/>}
      
    </div>
  );
};
export default Timeline;