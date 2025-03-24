const API_URL = "http://localhost:5000"; // Ensure this matches your backend port

// Sign In function
const signIn = async (employeeId, employeeName, latitude, longitude, address) => {
  try {
    const response = await fetch(`${API_URL}/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        employee_id: employeeId, 
        employee_name: employeeName,
        latitude, 
        longitude, 
        address 
      }),
    });

    if (!response.ok) throw new Error("Failed to sign in");

    const data = await response.json();
    console.log("Signed in:", data);
    return data;
  } catch (error) {
    console.error("Error signing in:", error);
    return null;
  }
};

// Sign Out function
const signOut = async (employeeId, employeeName, latitude, longitude, address) => {
  try {
    const response = await fetch(`${API_URL}/sign-out`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        employee_id: employeeId, 
        employee_name: employeeName,
        latitude, 
        longitude, 
        address 
      }),
    });

    if (!response.ok) throw new Error("Failed to sign out");

    const data = await response.json();
    console.log("Signed out:", data);
    return data;
  } catch (error) {
    console.error("Error signing out:", error);
    return null;
  }
};

// Fetch Address function (Updated)
const fetchAddress = async (latitude, longitude) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    alert("Google Maps API key is missing!");
    return null;
  }

  try {
    // First attempt: Rooftop accuracy
    let response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&location_type=ROOFTOP`
    );
    let data = await response.json();

    if (data.status !== "OK" || !data.results.length) {
      console.warn("ROOFTOP location not found, trying alternative methods...");

      // Second attempt: GEOMETRIC_CENTER
      response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&location_type=GEOMETRIC_CENTER`
      );
      data = await response.json();
    }

    const address = data.results[0]?.formatted_address || "Unknown Location";
    console.log("Location Address:", address);
    return address;
    
  } catch (error) {
    console.error("Failed to fetch address:", error);
    return "Unknown Location";
  }
};

export { signIn, signOut, fetchAddress };
