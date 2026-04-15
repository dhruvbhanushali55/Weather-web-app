const apiKey = ""// API; 
const btn = document.getElementById("getweather");

//Keeping this at the top so both functions can see it
const aqiLevels = {
    1: { label: "Good", color: "#00e400" },
    2: { label: "Moderate", color: "#ffff00" },
    3: { label: "Unhealthy for Sensitive Groups", color: "#ff7e00" },
    4: { label: "Unhealthy", color: "#ff0000" },
    5: { label: "Very Unhealthy", color: "#8f3f97" },
    6: { label: "Hazardous", color: "#7e0023" },
};

window.onload = () => {
    const savedData = localStorage.getItem("lastCityWeather");
    if (savedData) {
        const data = JSON.parse(savedData);
        displayWeather(data); // This now handles EVERYTHING
    }
};

// ALL UI logic here
function displayWeather(data) {
    //Current Weather Logic
    const epaIndex = data.current.air_quality["us-epa-index"];
    const status = aqiLevels[epaIndex] || { label: "N/A", color: "#fff" };

    document.getElementById("cityName").innerText = data.location.name;
    document.getElementById("weathericon").src = "https:" + data.current.condition.icon;
    document.getElementById("temp").innerText = data.current.temp_c + "°C";
    document.getElementById("desc").innerText = data.current.condition.text;
    document.getElementById("wind").innerText = data.current.wind_kph + "km/h";
    document.getElementById("windguest").innerText = data.current.gust_kph + "km/h";
    document.getElementById("realfeel").innerText = "Feels " + data.current.feelslike_c + "°C";
    document.getElementById("aqiText").innerText = status.label;
    document.getElementsByClassName("aqiCard")[0].style.color = status.color;

    //Hourly Forecast Logic 
    const currentHour = new Date().getHours();
    const allHours = data.forecast.forecastday[0].hour;
    
    const nextSixHours = allHours.filter((item) => {
        const itemHour = parseInt(item.time.split(" ")[1].split(":")[0]);
        return itemHour >= currentHour;
    }).slice(0, 6);

    //Added [0] here because getElementsByClassName returns a list!
    const container = document.getElementsByClassName("hourlysections")[0];
    container.innerHTML = ""; //Clears old cards

    nextSixHours.forEach((hour) => {
        const timeOnly = hour.time.split(" ")[1];
        const hourCard = `
            <div class="hour-card">
                <p>${timeOnly}</p>
                <img src="https:${hour.condition.icon}">
                <p>${hour.temp_c}°C</p>
                <div class="rain">
                <p>chance of rain</p>
                <p>${hour.chance_of_rain}%</p>
                </div>
                <div class="humi">
                  <p>humidity</p>
                  <p>${hour.humidity}%</p>
                </div>
                
            </div>
        `;
        container.innerHTML += hourCard;
    });
}

btn.addEventListener("click", async () => {
    const city = document.getElementById("cityinput").value;
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=1&aqi=yes&alerts=yes`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("City not found");

        const data = await response.json();
        
        //Save to storage
        localStorage.setItem("lastCityWeather", JSON.stringify(data));
        
        //Using our display function
        displayWeather(data);
        console.log(data)
        
        console.log("Data received and displayed!");

    } catch (err) {
        console.error(err);
        alert("City not found! Please check the spelling.");
    }
});