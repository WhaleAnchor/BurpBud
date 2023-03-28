import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { saveAs } from 'file-saver';
import {Workbook} from 'exceljs';

import './ReactTablesStyles.css';
// material ui imports
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';

import { useTable, useSortBy, usePagination } from 'react-table';

const Timeline = ({ uid }) => {
  const [rows, setRows] = useState([]);
  // firestore data that will go into datagrid
  const columns = [
    { accessor: "burpDate", Header: "date", width: 100 },
    { accessor: "burpTime", Header: "time", width: 100 },
    { accessor: "burpCount", Header: "count", width: 100 },
    { accessor: "burpDuration", Header: "delta", width: 100 },
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
        pageSize: 15,
      },
    },
    useSortBy,
    usePagination
  );

  const [sortModel, setSortModel] = useState([
    {
      field: 'burpTime',
      sort: 'desc',
    },
    {
      field: 'burpDate',
      sort: 'desc',
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
      <div className="firestoreBoxes">
        <div>
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
            {[15, 30, 45, 60, 75].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
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
      <Button
        variant="contained"
        color="success"
        style={{ marginBottom: "10px" }}
        onClick={handleExport}
      >
        Export to Excel
      </Button>
      <RegularScreen />
    </div>
  );
};
export default Timeline;