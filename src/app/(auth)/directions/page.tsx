/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import debounce from "debounce";
import Suggestions from "@/components/SuggestionsList";
import { fetchSuggestions } from "@/lib/fetchSuggestions";
import { MapPin } from "lucide-react";


const DirectionsPage: React.FC = () => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [directions, setDirections] = useState<any>(null);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);
  const [fromCoords, setFromCoords] = useState<[number, number] | null>(null);
  const [toCoords, setToCoords] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fromMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const toMarkerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";
    const initializeMap = () => {
      const mapInstance = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        center: [12.971599, 77.594566],
        zoom: 3,
      });
      setMap(mapInstance);
    };

    if (!map) initializeMap();

    return () => {
      map?.remove();
      fromMarkerRef.current?.remove();
      toMarkerRef.current?.remove();
    };
  }, [map]);

  const createMarkerElement = (color: string) => {
    const el = document.createElement("div");
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    return el;
  };

  const addOrUpdateMarker = useCallback(
    (
      coords: [number, number],
      markerRef: React.MutableRefObject<mapboxgl.Marker | null>,
      color: string
    ) => {
      if (map) {
        if (markerRef.current) {
          markerRef.current.setLngLat(coords);
        } else {
          const marker = new mapboxgl.Marker({
            element: createMarkerElement(color),
          })
            .setLngLat(coords)
            .addTo(map);
          markerRef.current = marker;
        }
      }
    },
    [map]
  );

  const handleInputChange = useCallback(
    async (
      query: string,
      setQuery: React.Dispatch<React.SetStateAction<string>>,
      setSuggestions: React.Dispatch<React.SetStateAction<any[]>>
    ) => {
      setQuery(query);
      if (query) {
        const debouncedFetchAndSetSuggestions = debounce(async () => {
          try {
            const data = await fetchSuggestions(query);
            setSuggestions(data);
          } catch (error) {
            console.error("Error fetching suggestions:", error);
            setError("Failed to fetch suggestions. Please try again.");
          }
        }, 500);
        debouncedFetchAndSetSuggestions();
      } else {
        setSuggestions([]);
      }
    },
    []
  );

  const handleSuggestionSelect = useCallback(
    (
      suggestion: { display_name: string; lat: string; lon: string },
      setCoords: React.Dispatch<React.SetStateAction<[number, number] | null>>,
      setSuggestions: React.Dispatch<React.SetStateAction<any[]>>,
      setQuery: React.Dispatch<React.SetStateAction<string>>
    ) => {
      const coordinates: [number, number] = [
        parseFloat(suggestion.lon),
        parseFloat(suggestion.lat),
      ];
      setCoords(coordinates);
      setSuggestions([]);
      setQuery(suggestion.display_name);
    },
    []
  );

  const fetchDirections = useCallback(async () => {
    if (!fromCoords || !toCoords) {
      setError("Please select both 'from' and 'to' locations.");
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${fromCoords[0]},${fromCoords[1]};${toCoords[0]},${toCoords[1]}?geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();

      if (data.code !== "Ok") {
        throw new Error(data.message || "Failed to fetch directions");
      }

      setDirections(data);
      setError(null);

      // Add markers for 'from' and 'to' locations
      addOrUpdateMarker(fromCoords, fromMarkerRef, "#3b82f6"); // Blue for 'from'
      addOrUpdateMarker(toCoords, toMarkerRef, "#ef4444"); // Red for 'to'
    } catch (error) {
      console.error("Error fetching directions:", error);
      setError("Failed to fetch directions. Please try again.");
    }
  }, [fromCoords, toCoords, addOrUpdateMarker]);

  useEffect(() => {
    if (map && directions?.routes?.[0]) {
      const coordinates = directions.routes[0].geometry.coordinates;
      const bounds = coordinates.reduce(
        (bounds: mapboxgl.LngLatBounds, coord: number[]) => {
          return bounds.extend(coord as mapboxgl.LngLatLike);
        },
        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
      );

      map.fitBounds(bounds, { padding: 50 });

      if (map.getSource("route")) {
        (map.getSource("route") as mapboxgl.GeoJSONSource).setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates,
          },
        });
      } else {
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates,
            },
          },
        });

        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3b82f6",
            "line-width": 8,
          },
        });
      }
    }
  }, [map, directions]);

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-[#166F5B] p-4 shadow-md flex flex-row gap-4 relative">
        <div className="relative flex-grow">
          <input
            className="border p-2 rounded w-full pl-10"
            type="text"
            placeholder="From (e.g. San Francisco)"
            value={from}
            onChange={(e) =>
              handleInputChange(e.target.value, setFrom, setFromSuggestions)
            }
          />
          <MapPin
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500"
            size={20}
          />
          {fromSuggestions.length > 0 && (
            <Suggestions
              suggestions={fromSuggestions}
              onSelect={(suggestion) =>
                handleSuggestionSelect(
                  suggestion,
                  setFromCoords,
                  setFromSuggestions,
                  setFrom
                )
              }
            />
          )}
        </div>
        <div className="relative flex-grow">
          <input
            className="border p-2 rounded w-full pl-10"
            type="text"
            placeholder="To (e.g. Washington, D.C.)"
            value={to}
            onChange={(e) =>
              handleInputChange(e.target.value, setTo, setToSuggestions)
            }
          />
          <MapPin
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500"
            size={20}
          />
          {toSuggestions.length > 0 && (
            <Suggestions
              suggestions={toSuggestions}
              onSelect={(suggestion) =>
                handleSuggestionSelect(
                  suggestion,
                  setToCoords,
                  setToSuggestions,
                  setTo
                )
              }
            />
          )}
        </div>
        <button
          className="bg-[#F3F7F6] hover:bg-[#88ffe1] text-black font-bold py-2 px-4 rounded"
          onClick={fetchDirections}
        >
          Get Directions
        </button>
      </div>
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          {error}
        </div>
      )}
      <div id="map" className="flex-grow"></div>
    </div>
  );
};

export default DirectionsPage;
