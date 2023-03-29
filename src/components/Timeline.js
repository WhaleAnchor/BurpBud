import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { saveAs } from 'file-saver';
import {Workbook} from 'exceljs';
import moment from 'moment';


import './ReactTablesStyles.css';
// material ui imports
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

import { useTable, useSortBy, usePagination } from 'react-table';

const Timeline = ({ uid }) => {
  const [rows, setRows] = useState([]);
  // firestore data that will go into datagrid
  const columns = [
    {
      id: "delete",
      Header: "Delete",
      Cell: ({ row }) => (
        <IconButton onClick={() => deleteBurp(row.original.id)}>
            <DeleteIcon />
        </IconButton>
      ),
    },
    { accessor: "burpDate", Header: "date" },
    { accessor: "burpTime", Header: "time" },
    { accessor: "burpCount", Header: "count" },
    {
      accessor: "burpComment",
      Header: "comment",
      width: 300,
      Cell: ({ row }) => (
        <div
          onClick={() => {
            const newComment = prompt("Enter new comment.", row.values.burpComment);
            if (newComment !== null) {
              updateComment(row.id, newComment);
            }
          }}
        >
          {row.values.burpComment}
        </div>
      ),
    },
  ];

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows: tableRows,
    prepareRow,
    state: { pageIndex, pageSize },
    page,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    canPreviousPage,
    canNextPage,
  } = useTable(
    {
      columns: useMemo(() => columns, []),
      data: useMemo(() => rows, [rows]),
      initialState: {
        sortBy: [
          { id: "burpDate", desc: true },
          { id: "burpTime", desc: true },
        ],
        pageIndex: 0,
        pageSize: 12,
      },
    },
    useSortBy,
    usePagination
  );

  // Deleting a burp log entry
  const deleteBurp = async (id) => {
    // Delete the box from Firestore
    
    try {
      await deleteDoc(doc(db, "user_collections", uid, "burpLogs", id));
      setRows(rows.filter((doc)=> doc.id !== id))
      console.log("success")
    } catch (error) {

      console.log(error)
    }
      
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
    <div className='firestoreTable'>
      <table {...getTableProps()} className="ReactTable">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                {column.render("Header")}
                <span>
                  {column.isSorted
                    ? column.isSortedDesc
                      ? " 🔽"
                      : " 🔼"
                    : ""}
                </span>
              </th>
            ))}
          </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Add pagination controls here */}
      <div>
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {"<<"}
        </button>{" "}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {"<"}
          </button>{" "}
      <button onClick={() => nextPage()} disabled={!canNextPage}>
        {">"}
      </button>{" "}
      <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
        {">>"}
      </button>{" "}
      <span>
        Page{" "}
        <strong>
          {pageIndex + 1} of {pageCount}
        </strong>{" "}
      </span>
      <span>
        | Go to page:{" "}
        <input
          type="number"
          defaultValue={pageIndex + 1}
          onChange={(e) => {
            const pageNumber = e.target.value ? Number(e.target.value) - 1 : 0;
            gotoPage(pageNumber);
          }}
          style={{ width: "50px" }}
        />
      </span>{" "}
      <select
        value={pageSize}
        onChange={(e) => setPageSize(Number(e.target.value))}
      >
        {[12, 24, 36, 48, 60].map((size) => (
          <option key={size} value={size}>
            Show {size}
          </option>
        ))}
      </select>
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
      { header: 'Daily Avg Count', key: 'dailyAvgCount', width: 15 },
      { header: 'Daily Avg Delta', key: 'dailyAvgDelta', width: 15 },
      { header: 'Comment', key: 'comment', width: 40 },
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
      // Sort the group by burpTime
      group.sort((a, b) => a.burpTime.localeCompare(b.burpTime));
  
      // Calculate the daily averages for Count and Delta
      const totalBurps = group.reduce((acc, row) => acc + parseInt(row.burpCount), 0);
      const dailyAvgCount = totalBurps / group.length;
      const dailyDeltas = [];
      
      group.forEach((row, index) => {
        let delta = NaN;
        if (index > 0) {
          const previousRow = group[index - 1];
          const currentTime = moment(`${row.burpDate}T${row.burpTime}`, 'MM-DD-YYYYTHH:mm');
          const previousRowTime = moment(`${previousRow.burpDate}T${previousRow.burpTime}`, 'MM-DD-YYYYTHH:mm');
          console.log('currentTime:', currentTime.format());
          console.log('previousRowTime:', previousRowTime.format());
      
          if (row.burpDate === previousRow.burpDate) {
            delta = currentTime.diff(previousRowTime, 'minutes');
            console.log('Delta:', delta);
            dailyDeltas.push(delta);
          }
        }
      
        // Add the row to the worksheet with the calculated delta
        worksheet.addRow({
          date: row.burpDate,
          time: row.burpTime,
          count: row.burpCount,
          delta: delta.toFixed(2),
          comment: row.burpComment,
          dailyAvgCount,
          dailyAvgDelta: 0,
        });
      });
      
      // Calculate the daily average delta after the loop
        const dailyAvgDelta = dailyDeltas.length > 0
        ? dailyDeltas.reduce((acc, delta) => acc + delta, 0) / dailyDeltas.length
        : NaN;

        // Update the dailyAvgDelta value for all rows in the current date group
        worksheet.eachRow((row, rowIndex) => {
        if (rowIndex > 1 && row.getCell('date').value === date) {
          row.getCell('dailyAvgDelta').value = isNaN(dailyAvgDelta) ? 'NaN' : dailyAvgDelta.toFixed(2);
        }
        });
      
    });
  
    // Write the workbook to a buffer
  const excelBuffer = await workbook.xlsx.writeBuffer();
  const excelBlob = new Blob([excelBuffer], { type: "application/vnd.ms-excel" });
  const filename = `burp_logs_${new Date().toLocaleDateString()}.xlsx`;
  saveAs(excelBlob, filename);
};

  
  
  return (
    <div className="tableWrapper">
      <Button
        variant="contained"
        color="success"
        style={{ marginBottom: "10px"}}
        className="exportButton"
        onClick={handleExport}
      >
        Export to Excel
      </Button>
      <RegularScreen />
    </div>
  );
};
export default Timeline;