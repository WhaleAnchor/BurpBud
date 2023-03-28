import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { saveAs } from 'file-saver';
import { Workbook } from 'exceljs';

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

const Timeline2 = ({ uid }) => {
  const [rows, setRows] = useState([]);

  // Deleting a burp log entry
  const deleteBurp = async (id) => {
    // Delete the box from Firestore
    await deleteDoc(doc(db, "user_collections", uid, "burpLogs", id));
    setRows(rows.filter((doc) => doc.id !== id));
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
  };
      
  // Fetches data from Firestore
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
    
  // Function to export Firestore snapshots to Excel
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
      <Button variant="contained" color="success" style={{ marginBottom: '10px' }} onClick={handleExport}>
        Export to Excel
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th></th>
            <th>Date</th>
            <th>Time</th>
            <th>Count</th>
            <th>Delta</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <IconButton onClick={() => deleteBurp(row.id)}>
                  <DeleteIcon />
                </IconButton>
              </td>
              <td>{row.burpDate}</td>
                <td>{row.burpTime}</td>
                <td>{row.burpCount}</td>
                <td>{row.burpDuration}</td>
                <td
                  onClick={() => {
                    const newComment = prompt('Enter new comment., row.burpComment');
                    if (newComment !== null) {
                      updateComment(row.id, newComment);
                    }
                  }}
                >
                  {row.burpComment}
              </td>
            </tr>
          ))}
        </tbody>  
      </Table>
    </div>
  );
};

export default Timeline2;
