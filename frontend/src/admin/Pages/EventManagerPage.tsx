/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { getAllEventRequests } from "../../services/eventService";

const EventManagerPage = () => {
  const [requests, setRequests] = useState<any[]>([]);
    
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getAllEventRequests();
        const requestsArray = Array.isArray(data?.requests) ? data.requests : Array.isArray(data) ? data : [];
        setRequests(requestsArray);
        if (!Array.isArray(requestsArray)) {
          setError("Invalid data format: expected an array of requests.");
        }
      } catch (err) {
        setError("Failed to fetch event requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) return <div>Loading event requests...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Event Creation Requests</h2>
      {requests.length === 0 ? (
        <div>No event requests found.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Event Name</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Requested By</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Status</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req: any) => (
              <tr key={req._id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{req.eventName}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{req.requestedBy?.name || req.requestedBy}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{req.status}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {/* Approve/Reject buttons can be added here */}
                  <button style={{ marginRight: "8px" }}>Approve</button>
                  <button>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EventManagerPage;