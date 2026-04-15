const apiKey = "4f147a4864454397921112510261004";
const btn = document.getElementById("getweather");

window.onload = () => {
  const savedData = localStorage.getItem("lastCityWeather");

  if (savedData) {
    const data = JSON.parse(savedData); // Turn the text back into an object
    displayWeather(data); // Run your UI update logic
  }
};

function displayWeather(data) {
  const aqiLevels = {
    1: { label: "Good", color: "#00e400" },
    2: { label: "Moderate", color: "#ffff00" },
    3: { label: "Unhealthy for Sensitive Groups", color: "#ff7e00" },
    4: { label: "Unhealthy", color: "#ff0000" },
    5: { label: "Very Unhealthy", color: "#8f3f97" },
    6: { label: "Hazardous", color: "#7e0023" },
  };

  const epaIndex = data.current.air_quality["us-epa-index"];

  const status = aqiLevels[epaIndex];

  document.getElementById("cityName").innerText = data.location.name;
  document.getElementById("weathericon").src =
    "https:" + data.current.condition.icon;
  document.getElementById("temp").innerText = data.current.temp_c + "°C";
  document.getElementById("desc").innerText = data.current.condition.text;
  document.getElementById("wind").innerText = data.current.wind_kph + "km/h";
  document.getElementById("windguest").innerText =
    data.current.gust_kph + "km/h";
  document.getElementById("realfeel").innerText =
    "Feels " + data.current.feelslike_c + "°C";
  document.getElementById("aqiText").innerText = status.label;

  document.getElementsByClassName("aqiCard")[0].style.color = status.color;
}

const aqiLevels = {
  1: { label: "Good", color: "#00e400" },
  2: { label: "Moderate", color: "#ffff00" },
  3: { label: "Unhealthy for Sensitive Groups", color: "#ff7e00" },
  4: { label: "Unhealthy", color: "#ff0000" },
  5: { label: "Very Unhealthy", color: "#8f3f97" },
  6: { label: "Hazardous", color: "#7e0023" },
};

btn.addEventListener("click", async () => {
  const city = document.getElementById("cityinput").value;
  // const days = document.getElementById("daysinput").value;
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=1&aqi=yes&alerts=yes`;

  try {
    const response = await fetch(url);

    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    const epaIndex = data.current.air_quality["us-epa-index"];
    const status = aqiLevels[epaIndex];
    const currentHour = new Date().getHours(); // Returns a number like 14 (for 2 PM)
    const allHours = data.forecast.forecastday[0].hour;
    const nextSixHours = allHours
      .filter((item) => {
        // API time format is "YYYY-MM-DD HH:mm"
        // We split it to get the "HH" part and turn it into a Number
        const itemHour = parseInt(item.time.split(" ")[1].split(":")[0]);

        return itemHour >= currentHour; // Only keep hours that haven't passed
      })
      .slice(0, 6); // Only take the first 6 from the "future" list

    const container = document.getElementsByClassName("hourlysections");
    container.innerHTML = "";

    nextSixHours.forEach((hour) => {
      const timeOnly = hour.time.split(" ")[1];

      const hourCard = `
        <div class="hour-card">
            <p>${timeOnly}</p>
            <img src="https:${hour.condition.icon}">
            <p>${hour.temp_c}°C</p>
        </div>
    `;
      container.innerHTML += hourCard;
    });

    localStorage.setItem("lastCityWeather", JSON.stringify(data));
    console.log(data);

    // 1. Update City Name
    document.getElementById("cityName").innerText = data.location.name;

    document.getElementById("weathericon").src =
      "https:" + data.current.condition.icon;

    // 2. Update Temperature
    document.getElementById("temp").innerText = data.current.temp_c + "°C";

    document.getElementById("realfeel").innerText =
      "Feels " + data.current.feelslike_c + "°C";

    // 3. Update Condition (Text)
    // Note: Make sure you have an element with id="desc" in your HTML!
    document.getElementById("desc").innerText = data.current.condition.text;

    document.getElementById("wind").innerText = data.current.wind_kph + "km/h";

    document.getElementById("windguest").innerText =
      data.current.gust_kph + "km/h";

    document.getElementById("aqiText").innerText = status.label;

    document.getElementsByClassName("aqiCard")[0].style.color = status.color;

    // EXTRA: Update the icon if you have an <img> tag with id="weatherIcon"
    // document.getElementById("weatherIcon").src = "https:" + data.current.condition.icon;
  } catch (err) {
    console.error(err);
    alert("City not found! Please check the spelling.");
  }
});
