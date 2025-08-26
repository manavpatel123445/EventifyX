/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/CreateEvent.tsx

import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { DatePickerDemo } from "../components/datePicker";
import { useQuery } from "@tanstack/react-query";

import { fetchCategories } from "../services/categoryService";


// CategorySelect component using TanStack Query
interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
}
const CategorySelect: React.FC<CategorySelectProps> = ({ value, onChange }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <select
      className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-red-500 focus:ring focus:ring-red-300"
      name="category"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="" disabled>
        {isLoading ? "Loading..." : error ? "Error loading categories" : "Select category"}
      </option>
      {Array.isArray(data) &&
        data.map((cat: any) => (
          <option key={cat._id || cat.id} value={cat._id || cat.id}>
            {cat.name}
          </option>
        ))}
    </select>
  );
};

const CreateEventPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [eventTitle, setEventTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [venueName, setVenueName] = React.useState("");
  const [venueAddress, setVenueAddress] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [ticketPrice, setTicketPrice] = React.useState("");
  const [totalSeats, setTotalSeats] = React.useState("");

  return (
    <>
      <Navbar/>
      <div className="flex min-h-screen justify-center bg-gray-50 px-4 py-8">
        <div className="w-full max-w-4xl rounded-2xl bg-white p-8 shadow-md">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">Create Event</h2>

          <form className="space-y-6">
            {/* Event Title & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Title
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  
                  onChange={e => setEventTitle(e.target.value)}
                  placeholder="Enter event title"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-red-500 focus:ring focus:ring-red-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Category
                </label>
                <CategorySelect value={selectedCategory} onChange={setSelectedCategory} />
              </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              placeholder="Enter event description"
              rows={4}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-red-500 focus:ring focus:ring-red-300"
            ></textarea>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <DatePickerDemo />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <DatePickerDemo />
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-red-500 focus:ring focus:ring-red-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="time"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-red-500 focus:ring focus:ring-red-300"
              />
            </div>
          </div>

          {/* Venue Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Venue Name
            </label>
            <input
              type="text"
              placeholder="Enter venue name"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-red-500 focus:ring focus:ring-red-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Venue Address
            </label>
            <input
              type="text"
              placeholder="Enter venue address"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-red-500 focus:ring focus:ring-red-300"
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                placeholder="Enter city"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-red-500 focus:ring focus:ring-red-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                placeholder="Enter state"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-red-500 focus:ring focus:ring-red-300"
              />
            </div>
          </div>

          {/* Country 
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              type="text"
              placeholder="Enter country"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-red-500 focus:ring focus:ring-red-300"
            />
          </div>
*/}
          {/* Ticket*/}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ticket Price
              </label>
              <input
                type="text"
                placeholder="Ticket Price"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-red-500 focus:ring focus:ring-red-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Seats
              </label>
              <input
                type="text"
                placeholder="Total seats"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-red-500 focus:ring focus:ring-red-300"
              />
            </div>
          </div>
         

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full rounded-lg bg-red-500 py-3 font-medium text-white shadow-md hover:bg-red-600 transition"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default CreateEventPage;
