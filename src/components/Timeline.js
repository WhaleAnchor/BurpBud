import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { doc, collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

function Timeline() {
  const timelineColRef = collection(db, "timeline");
  const [timelineRows, setTimelineRows] = useState([]);
  const [timelineSortModel, setTimelineSortModel] = useState([
    {
      field: "timelineDate",
      sort: "asc",
    },
  ]);

  const timelineColumns = [
    { field: "timelineDate", headerName: "Date", width: 200 },
    {
      field: "timelineValue",
      headerName: "Value",
      width: 150,
      renderCell: (params) => (
        <div
          onClick={() => {
            const newValue = prompt(`Enter new value. Current value is ${params.row.timelineValue}.`, params.value)
            if (newValue !== null && newValue.trim() !== "" && /^\d+$/.test(newValue)) {
              updateTimelineValue(params.id, parseInt(newValue));
            }
          }}
        >
          {params.value}
        </div>
      ),
    },
  ];

  // Update timeline value
  const updateTimelineValue = async (id, value) => {
    const timelineDoc = doc(db, "timeline", id);
    const newFields = { timelineValue: value };
    await updateDoc(timelineDoc, newFields);

    const data = await getDocs(timelineColRef);
    const formattedData = data.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTimelineRows(formattedData);
  };

  // Fetch Firestore data
  useEffect(() => {
    const fetchData = async () => {
      const data = await getDocs(timelineColRef);
      const formattedData = data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTimelineRows(formattedData);
    };
    fetchData();
  }, []);

  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={timelineRows}
        columns={timelineColumns}
        rowsPerPageOptions={[-1]}
        sortModel={timelineSortModel}
        onSortModelChange={(model) => setTimelineSortModel(model)}
      />
    </div>
  );
}

export default Timeline;