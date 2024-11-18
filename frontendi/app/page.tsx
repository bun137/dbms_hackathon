"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [flights, setFlights] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/flights");
        if (!res.ok) {
          throw new Error("Failed to fetch flights");
        }
        const data = await res.json();
        setFlights(data);
      } catch (error) {
        console.error("Error fetching flights:", error);
      }
    };

    fetchFlights();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Available Flights</h1>

      {flights.length > 0 ? (
        <table className="min-w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="px-4 py-2 border border-gray-300">Flight ID</th>
              <th className="px-4 py-2 border border-gray-300">
                Departure Time
              </th>
              <th className="px-4 py-2 border border-gray-300">Arrival Time</th>
              <th className="px-4 py-2 border border-gray-300">Origin</th>
              <th className="px-4 py-2 border border-gray-300">Destination</th>
              <th className="px-4 py-2 border border-gray-300">
                Seats Available
              </th>
              <th className="px-4 py-2 border border-gray-300">Status</th>
              <th className="px-4 py-2 border border-gray-300">Distance</th>
              <th className="px-4 py-2 border border-gray-300">Flight Type</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight) => (
              <tr
                key={flight.f_id}
                onClick={() => router.push(`./seats/${flight.f_id}`)}
                className="hover:bg-stone-700 cursor-pointer"
              >
                <td className="px-4 py-2 border border-gray-300">
                  {flight.f_id}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {new Date(flight.departure_time).toLocaleString()}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {new Date(flight.arrival_time).toLocaleString()}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {flight.origin}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {flight.destination}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {flight.num_seats}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {flight.status}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {flight.distance} miles
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {flight.flight_type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-4">No flights available.</p>
      )}
    </div>
  );
}
