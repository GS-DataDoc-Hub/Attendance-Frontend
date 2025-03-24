import React, { useState } from "react";

const AttendanceApp = () => {
    const [employeeId, setEmployeeId] = useState(""); // ID is optional
    const [employeeName, setEmployeeName] = useState("");
    const [status, setStatus] = useState("");

    const getLocationAndSendData = (action) => {
        if (!employeeName) { // Only check for employee name now
            alert("Please enter your Name");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                console.log("GPS Coordinates:", latitude, longitude);
                fetchAddress(latitude, longitude, action);
            },
            (error) => {
                alert("Location access is required for attendance tracking.");
                console.error("Geolocation error:", error);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 } // 🔥 Max accuracy
        );
    };

    const fetchAddress = async (latitude, longitude, action) => {
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            alert("Google Maps API key is missing!");
            return;
        }

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&location_type=ROOFTOP`
            );

            const data = await response.json();
            console.log("Google API Response:", data);

            let address = data.results[0]?.formatted_address || "Unknown Location";

            if (!data.results.length) {
                console.warn("No ROOFTOP location found, trying alternative...");
                
                const altResponse = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&location_type=GEOMETRIC_CENTER`
                );
                const altData = await altResponse.json();
                console.log("Fallback API Response:", altData);

                address = altData.results[0]?.formatted_address || "Unknown Location (Fallback)";
            }

            console.log("Final Address:", address);
            sendData(action, latitude, longitude, address);

        } catch (error) {
            console.error("Failed to fetch address:", error);
        }
    };

    const sendData = async (action, latitude, longitude, address) => {
        try {
            const endpoint = action === "sign_in" ? "sign-in" : "sign-out";
            const response = await fetch(`http://localhost:5000/${endpoint}`, {  
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    employee_id: employeeId || "No ID", // 🔥 If empty, send "No ID"
                    employee_name: employeeName, 
                    latitude, 
                    longitude, 
                    address,
                    action  
                })
            });

            if (!response.ok) throw new Error("Network response was not OK");

            const data = await response.json();
            setStatus(data.message);
        } catch (error) {
            setStatus("Failed to send data. Server might be down.");
            console.error("Error:", error);
        }
    };

    return (
        <div className="flex flex-col items-center p-6">
            <img 
                src="/WEAM-removebg-preview.png" 
                alt="Company Logo" 
                style={{ width: "100px", height: "auto", display: "block", margin: "5px auto" }} 
            />

            <h1 className="text-xl font-bold">Office Attendance</h1>
            {/* Employee ID is optional */}
            <input 
                type="text" 
                placeholder="Employee ID (Optional)" 
                value={employeeId} 
                onChange={(e) => setEmployeeId(e.target.value)} 
                className="border p-2 m-2" 
            />
            <input 
                type="text" 
                placeholder="Employee Name" 
                value={employeeName} 
                onChange={(e) => setEmployeeName(e.target.value)} 
                className="border p-2 m-2" 
                required
            />
            <button onClick={() => getLocationAndSendData("sign_in")} className="bg-green-500 text-white p-2 m-2">
                Sign In
            </button>
            <button onClick={() => getLocationAndSendData("sign_out")} className="bg-red-500 text-white p-2 m-2">
                Sign Out
            </button>
            <p className="mt-4 text-sm text-gray-600">{status}</p>
        </div>
    );
};

export default AttendanceApp;
