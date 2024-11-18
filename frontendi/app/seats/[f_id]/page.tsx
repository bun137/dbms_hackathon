"use client";

import { useState, useEffect } from "react";

interface SeatClass {
  class: "Business" | "Economy";
  total_seats: number;
}  

export default function SeatPage({
  params,
}: {
  params: Promise<{ f_id: string }>;
}) {
  const [seatData, setSeatData] = useState<SeatClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fId, setFId] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<
    Record<string, number | null>
  >({});
  const [showForm, setShowForm] = useState(false);
  const [passengerDetails, setPassengerDetails] = useState({
    dob: "",
    gender: "",
    email: "",
    name: "",
    passport_id: "",
    country: "",
    street: "",
    city: "",
    phone_no: "",
  });

  // New state for seat preference form
  const [seatPrefDetails, setSeatPrefDetails] = useState({
    seat_pref: "",
    seat_id: "",
    seat_class: "",
  });

  useEffect(() => {
    const getParams = async () => {
      try {
        const resolvedParams = await params;
        setFId(resolvedParams.f_id);
      } catch (err) {
        setError("Failed to load flight ID");
      }
    };

    getParams();
  }, [params]);

  useEffect(() => {
    if (!fId) return;

    const fetchSeats = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/seats/${fId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch seat data");
        }

        const data = await response.json();
        setSeatData(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [fId]);

  const handleSeatChange = (classInfo: SeatClass, index: number) => {
    setSelectedSeats((prev) => ({
      ...prev,
      [`seat-${classInfo.class}`]: index,
    }));
    setShowForm(true);
  };

  // Handle passenger form submission
  const handlePassengerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/book-seat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passengerDetails),
      });

      if (!response.ok) {
        throw new Error("Booking successful");
      }

      const data = await response.json();
      console.log("Booking successful:", data);
      setShowForm(false);
      setPassengerDetails({
        dob: "",
        gender: "",
        email: "",
        name: "",
        passport_id: "",
        country: "",
        street: "",
        city: "",
        phone_no: "",
      });
    } catch (err) {
      setError("Failed to book seat");
    }
  };

  // Handle seat preference form submission
  const handleSeatPrefSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Assuming you would send the seat preference data to an API endpoint
      const response = await fetch(
        "http://localhost:5000/api/seat-preference",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(seatPrefDetails),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save seat preferences");
      }

      const data = await response.json();
      console.log("Seat preferences saved:", data);
      // Reset seat preference form
      setSeatPrefDetails({
        seat_pref: "",
        seat_id: "",
        seat_class: "",
      });
    } catch (err) {
      setError("Failed to save seat preferences");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        Available Seats for Flight {fId}
      </h1>

      {/* Seat Selection Table */}
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="bg-gray-900">
            <th className="p-2">Class</th>
            <th className="p-2">Total Seats</th>
            <th className="p-2">Select</th>
          </tr>
        </thead>
        <tbody>
          {seatData.map((classInfo) => (
            <tr key={classInfo.class}>
              <td className="p-2">{classInfo.class}</td>
              <td className="p-2">{classInfo.total_seats}</td>
              <td className="p-2 flex space-x-2">
                {Array(classInfo.total_seats)
                  .fill()
                  .map((_, index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="radio"
                        name={`seat-${classInfo.class}`}
                        value={index}
                        checked={
                          selectedSeats[`seat-${classInfo.class}`] === index
                        }
                        onChange={(e) => handleSeatChange(classInfo, index)}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span className="ml-2">Seat {index + 1}</span>
                    </label>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Passenger Details Form */}
      {showForm && (
        <div className="mt-8 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Book Your Seat</h3>
          <form onSubmit={handlePassengerSubmit}>
            {/* Existing form fields (DOB, Gender, Email, etc.) */}
            <div className="mb-4">
              <label
                htmlFor="dob"
                className="block text-sm font-medium text-white"
              >
                Date of Birth
              </label>
              <input
                type="date"
                id="dob"
                value={passengerDetails.dob}
                onChange={(e) =>
                  setPassengerDetails({
                    ...passengerDetails,
                    dob: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-white"
              >
                Gender
              </label>
              <select
                id="gender"
                value={passengerDetails.gender}
                onChange={(e) =>
                  setPassengerDetails({
                    ...passengerDetails,
                    gender: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={passengerDetails.email}
                onChange={(e) =>
                  setPassengerDetails({
                    ...passengerDetails,
                    email: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-white"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={passengerDetails.name}
                onChange={(e) =>
                  setPassengerDetails({
                    ...passengerDetails,
                    name: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="passport_id"
                className="block text-sm font-medium text-white"
              >
                Passport ID
              </label>
              <input
                type="text"
                id="passport_id"
                value={passengerDetails.passport_id}
                onChange={(e) =>
                  setPassengerDetails({
                    ...passengerDetails,
                    passport_id: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indoga-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="country"
                className="block text-sm font-medium text-white"
              >
                Country
              </label>
              <input
                type="text"
                id="country"
                value={passengerDetails.country}
                onChange={(e) =>
                  setPassengerDetails({
                    ...passengerDetails,
                    country: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="street"
                className="block text-sm font-medium text-white"
              >
                Street
              </label>
              <input
                type="text"
                id="street"
                value={passengerDetails.street}
                onChange={(e) =>
                  setPassengerDetails({
                    ...passengerDetails,
                    street: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="city"
                className="block text-sm font-medium text-white"
              >
                City
              </label>
              <input
                type="text"
                id="city"
                value={passengerDetails.city}
                onChange={(e) =>
                  setPassengerDetails({
                    ...passengerDetails,
                    city: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="phone_no"
                className="block text-sm font-medium text-white"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone_no"
                value={passengerDetails.phone_no}
                onChange={(e) =>
                  setPassengerDetails({
                    ...passengerDetails,
                    phone_no: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-700 shadow-md focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Book Seat
            </button>
          </form>
        </div>
      )}

      {/* Seat Preference Form */}
      <div className="mt-8 p-6 rounded-lg shadow-md bg-gray-800">
        <h3 className="text-xl font-semibold mb-4">Seat Preference</h3>
        <form onSubmit={handleSeatPrefSubmit}>
          {/* Seat Preference (Seat Class, Seat ID, Seat Preference) */}
          <div className="mb-4">
            <label
              htmlFor="seat_class"
              className="block text-sm font-medium text-white"
            >
              Seat Class
            </label>
            <select
              id="seat_class"
              value={seatPrefDetails.seat_class}
              onChange={(e) =>
                setSeatPrefDetails({
                  ...seatPrefDetails,
                  seat_class: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            >
              <option value="">Select Class</option>
              <option value="Business">Business</option>
              <option value="Economy">Economy</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="seat_id"
              className="block text-sm font-medium text-white"
            >
              Seat ID
            </label>
            <input
              type="text"
              id="seat_id"
              value={seatPrefDetails.seat_id}
              onChange={(e) =>
                setSeatPrefDetails({
                  ...seatPrefDetails,
                  seat_id: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="seat_pref"
              className="block text-sm font-medium text-white"
            >
              Seat Preference
            </label>
            <input
              type="text"
              id="seat_pref"
              value={seatPrefDetails.seat_pref}
              onChange={(e) =>
                setSeatPrefDetails({
                  ...seatPrefDetails,
                  seat_pref: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-700 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Save Preferences
          </button>
        </form>
      </div>
    </div>
  );
}
