import React, { useState } from "react";

const AttendanceApp = () => {
    const [employeeId, setEmployeeId] = useState("");
    const [employeeName, setEmployeeName] = useState("");
    const [status, setStatus] = useState("");

    const getLocationAndSendData = (action) => {
        if (!employeeName) {
            alert("Please enter your Name");
            return;
        }
    
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude = position.coords.latitude.toFixed(6);  // 🔥 Ensure precision
                const longitude = position.coords.longitude.toFixed(6);
                console.log("GPS Coordinates:", latitude, longitude);
    
                if (!latitude || !longitude) {
                    alert("Failed to fetch location. Please try again.");
                    return;
                }
    
                const address = await fetchAddress(latitude, longitude);
                sendData(action, latitude, longitude, address);
            },
            (error) => {
                alert("Location access is required for attendance tracking.");
                console.error("Geolocation error:", error);
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 } // 🔥 Increase timeout & accuracy
        );
    };
    

    const fetchAddress = async (latitude, longitude) => {
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            alert("Google Maps API key is missing!");
            return "Unknown Location";
        }
    
        try {
            // 🔥 First, try getting an accurate address (ROOFTOP or STREET_ADDRESS)
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&result_type=street_address|premise`
            );
    
            const data = await response.json();
            console.log("Google API Response:", data);
    
            // ✅ Extract the correct address
            let address = data.results[0]?.formatted_address || "Unknown Location";
    
            if (!data.results.length) {
                console.warn("No high-accuracy address found, trying neighborhood...");
                
                // 🔥 Try "neighborhood" instead of Plus Codes
                const altResponse = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&result_type=neighborhood`
                );
                const altData = await altResponse.json();
                console.log("Fallback API Response:", altData);
    
                address = altData.results[0]?.formatted_address || "Unknown Location (Fallback)";
            }
    
            console.log("Final Address:", address);
            return address; // ✅ Return the fixed address
    
        } catch (error) {
            console.error("Failed to fetch address:", error);
            return "Unknown Location";
        }    
    };

    const sendData = async (action, latitude, longitude, address) => {
        try {
            const endpoint = action === "sign_in" ? "sign-in" : "sign-out";
            const API_URL = "https://attendance-wgd9.onrender.com"; // Replace with your actual Render URL

            const response = await fetch(`${API_URL}/${endpoint}`, {  
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    employee_id: employeeId || "No ID",
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
