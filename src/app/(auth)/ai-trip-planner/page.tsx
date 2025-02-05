"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DatePickerWithRange from "@/components/DateRangePicker";
import { DateRange } from "react-day-picker";
import { useSession } from "next-auth/react";

const TripPlanner = () => {
  const [destination, setDestination] = useState("");
  const [preferences, setPreferences] = useState("");
  const [budget, setBudget] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [generatedItinerary, setGeneratedItinerary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>();
  const { data: session } = useSession();

  const handleGenerateItinerary = async () => {
    setIsLoading(true);
    try {
      // Call the API to generate the itinerary
      const response = await fetch("/api/generate-trip-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination,
          duration: date,
          preferences,
          budget,
          travelStyle,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate itinerary");
      }

      const data = await response.json();

      // Save the generated itinerary to the user's saved itineraries
      setGeneratedItinerary(data.data);

      // Add itinerary to recent generated itineraries if user is logged in and the request was successful
      if (response.ok && session?.user?._id) {
        try {
          const response = await fetch("/api/itinerary/add", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: session.user._id,
              destination,
              days: date,
              activities: preferences.split(","),
              budget,
              travelStyle,
              itinerary: data.data,
            }),
          });
          console.log("Itinerary added to history:", response);
          if (!response.ok) {
            throw new Error("Failed to add itinerary to history");
          }
        } catch (error) {
          console.error("Error adding itinerary to history:", error);
        }
      }


    } catch (error) {
      console.error("Error generating itinerary:", error);
      setGeneratedItinerary("Failed to generate itinerary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen h-full flex flex-col md:flex-row gap-4 p-4 text-lg overflow-y-auto pb-10 bg-gradient-to-br from-teal-100 to-green-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w full md:w-1/2"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-center bg-yellow-50 p-2 rounded-md">
              Generate Itinerary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <label className="block text-base ml-2 font-bold">Destination name:</label>
              <Input
                placeholder="Europe"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full md:w-[300px] ml-2"
              />
              <label className="block text-base mt-2 ml-2 font-bold">Duration: <span className=" block text-sm text-red-500"> ( Due to API constraints ,please keep the duration under to 10 days ) </span></label>

              <DatePickerWithRange date={date} setDate={setDate} />
              <label className="block text-base mt-2 ml-2 font-bold">Preferences:</label>
              <Textarea
                placeholder="(e.g., museums, outdoor activities)"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
              />
              <label className="block text-base mt-2 ml-2 font-bold">Budget:</label>
              <Select value={budget} onValueChange={setBudget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="mid-range">Mid-range</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
              <label className="block text-base mt-2 ml-2 font-bold">Travel Style:</label>
              <Select value={travelStyle} onValueChange={setTravelStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select travel style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relaxed">Relaxed</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleGenerateItinerary}
                disabled={isLoading}
                className="bg-[#166F5B] hover:bg-[#0d4d3d] transition-colors duration-300 w-full"
              >
                {isLoading ? "Generating..." : "Generate Itinerary"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full md:w-1/2 mt-4 md:mt-0 h-full"
      >
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-center bg-blue-50 p-2 rounded-md">
              Generated Itinerary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-black overflow-y-auto h-[calc(100vh-200px)] md:h-[calc(100vh-240px)] p-4 bg-gray-50 rounded-md shadow-inner">
              {generatedItinerary ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {generatedItinerary.split("\n").map((line, index) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="mb-2"
                    >
                      {line}
                    </motion.p>
                  ))}
                </motion.div>
              ) : (
                <p className="text-gray-500 italic">
                  No itinerary generated yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TripPlanner;
