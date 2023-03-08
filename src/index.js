import "./open-weather-icons.scss"
import "./style.scss"

const apiKey = '536059d11628b629f7ff59475571c725';


async function getLocation (city, state = "", country = "") {
    let lat = 0, lon = 0;
    let locationName = "";
    let stateName = "";
    let countryName = "";

    try {
        let urlStr;
        // if state is defined, assume country is America
        if (state !== "") {
            urlStr = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&limit=1&appid=${apiKey}`;
        // detect if country is defined
        } else if ( country !== "") {
            urlStr = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&limit=1&appid=${apiKey}`;
        } else {
            urlStr = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
        }
        const response = await fetch(urlStr, {mode: 'cors'});
        const location = await response.json();
        locationName = location[0].name;
        lat = location[0].lat;
        lon = location[0].lon;  
        countryName = location[0].country;
        if (countryName === "US") {
            stateName = location[0].state;
        } else {
            stateName = "";
        }

    } catch (err) {
        console.log(err);
    }
    return {lat, lon, locationName, stateName, countryName};
}

async function getWeather(lat, lon) {
    let urlStr;
    urlStr = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const response = await fetch(urlStr, {mode: 'cors'});
    const weatherData = await response.json();
    return weatherData;
}
async function getFiveDay(lat, lon) {
    let urlStr;
    urlStr = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const response = await fetch(urlStr, {mode: 'cors'});
    const weatherData = await response.json();
    return weatherData;
}
function kelvinToFarenheit(temp) {
    //(K − 273.15) × 9/5 + 32
    const farenheitTemp = (Number(temp) - 273.15) * (9/5) +32;
    return Math.round(farenheitTemp);
}

const displayController = (() => {
    const changeLocationHeader = (location, state, country) => {
        const locationHeader = document.querySelector('.locationHeader');
        if (state !== "") {
            locationHeader.textContent = `${location}, ${state}, ${country}`;
        } else if (country !== "") {
            locationHeader.textContent = `${location}, ${country}`;
        } else {
            locationHeader.textContent = `${location}`;
        }
    }
    const changeWeather = (iconID, main, description) => {
        const iconElement = document.querySelector('.weather > .owi');
        const mainElement = document.querySelector('.main');
        const descriptionElement = document.querySelector('.description');
    
        iconElement.classList.add(`owi-${iconID}`);
        mainElement.textContent = main;
        descriptionElement.textContent = description;
    }
    const changeWeatherDetails = (temp, feelsLike, tempMin, tempMax, pressure, humidity, rain, clouds) => {
        const tempElement = document.querySelector('.temp');
        const feelsLikeElement = document.querySelector('.feelsLike');
        const tempMinElement = document.querySelector('.tempMin');
        const tempMaxElement = document.querySelector('.tempMax');
        const pressureElement = document.querySelector('.pressure');
        const humidityElement = document.querySelector('.humidity');
        const rainElement = document.querySelector('.rain');
        const cloudsElement = document.querySelector('.clouds');


        tempElement.textContent = `Temperature: ${temp}`;
        feelsLikeElement.textContent = `Feels Like: ${feelsLike}`;
        tempMinElement.textContent = `Low: ${tempMin}`;
        tempMaxElement.textContent = `High: ${tempMax}`;
        pressureElement.textContent = `Air Pressure: ${pressure}`;
        humidityElement.textContent = `Humidity: ${humidity}`;
        rainElement.textContent = `Rain: ${rain}`;
        cloudsElement.textContent = `Cloud: ${clouds}`;
    }
    const changeWind = (speed, deg, gust) => {
        const windSpeed = document.querySelector('.speed');
        const windDeg = document.querySelector('.windDeg');
        const windGust = document.querySelector('.gust');

        if (!gust) {
            gust = "none";
        }

        windSpeed.textContent = `Wind Speed: ${speed} m/s`;
        windDeg.textContent = `Wind Degree: ${deg} degress`;
        windGust.textContent = `Wind Gust: ${gust}`;
    }
    const changeFiveDay = (object) => {
        const forecastArray = object.list;
        for (let i = 0; i <= 5; i++) {
            const date = document.querySelector(`.day${i}date`);
            const icon = document.querySelector(`#day${i}`);
            const main = document.querySelector(`.day${i}main`);
            const description = document.querySelector(`.day${i}description`);
            const temp = document.querySelector(`.day${i}temp`);
            const feelsLike = document.querySelector(`.day${i}feelsLike`);
            const rain = document.querySelector(`.day${i}rain`);
            const clouds = document.querySelector(`.day${i}clouds`);

            let rainValue, cloudsValue;
            if (!forecastArray[i].hasOwnProperty("rain")) {
                rainValue = "none";
            } else {
                rainValue = forecastArray[i]["rain"]["1h"];
            }
            if (!forecastArray[i].hasOwnProperty("clouds")) {
                cloudsValue = "none";
            } else {
                cloudsValue = forecastArray[i].clouds.all;
            }

            const newTemp = kelvinToFarenheit(forecastArray[i].main.temp);
            const newFeelsLike = kelvinToFarenheit(forecastArray[i].main.feels_like);
            // calc Day of the Week
            const tempDate = new Date();
            let dayOfWeekInt = tempDate.getDay() + i + 1;
            if (dayOfWeekInt > 6) {
                dayOfWeekInt -= 6;
            }
            let dayOfWeek = "";
            switch (dayOfWeekInt) {
                case 0:
                    dayOfWeek = "Sunday";
                    break;
                case 1:
                    dayOfWeek = "Monday";
                    break;
                case 2:
                    dayOfWeek = "Tuesday";
                    break;
                case 3:
                    dayOfWeek = "Wednesday";
                    break;
                case 4:
                    dayOfWeek = "Thursday";
                    break;
                case 5:
                    dayOfWeek = "Friday";
                    break;
                case 6:
                    dayOfWeek = "Saturday";
                    break;
                default:
                    dayOfWeek = "";
            }

            date.textContent = dayOfWeek;
            icon.classList.add(`owi-${forecastArray[i].weather[0].icon}`);
            main.textContent = forecastArray[i].weather[0].main;
            description.textContent = forecastArray[i].weather[0].description;
            temp.textContent = `Temperature: ${newTemp}`;
            feelsLike.textContent = `Feels Like: ${newFeelsLike}`;
            rain.textContent = `Rain: ${rainValue}`;
            clouds.textContent = `Clouds: ${cloudsValue}`;


        }
    }
    return {changeWeather, changeWeatherDetails, changeWind, changeLocationHeader, changeFiveDay};
})();

async function updateEverything (city, state, country) {
    const location = await getLocation(city, state, country);
    displayController.changeLocationHeader(location.locationName, location.stateName, location.countryName);
    const weather = await getWeather(location.lat, location.lon);
    displayController.changeWeather(weather.weather[0].icon, weather.weather[0].main, weather.weather[0].description);
    // check to see if rain or clouds are present
    let rain, clouds;
    if (!weather.hasOwnProperty("rain")) {
        rain = "none";
    } else {
        rain = weather["rain"]["1h"];
    }
    if (!weather.hasOwnProperty("clouds")) {
        clouds = "none";
    } else {
        clouds = weather.clouds.all;
    }
    // convert temp to F
    const temp = kelvinToFarenheit(weather.main.temp);
    const minTemp = kelvinToFarenheit(weather.main.temp_min);
    const maxTemp = kelvinToFarenheit(weather.main.temp_max);
    const feelsLike = kelvinToFarenheit(weather.main.feels_like);

    displayController.changeWeatherDetails(temp, feelsLike, minTemp, maxTemp, weather.main.pressure, weather.main.humidity, rain, clouds);
    // speed, deg, gust
    displayController.changeWind(weather.wind.speed, weather.wind.deg, weather.wind.gust);
    const fiveDay = await getFiveDay(location.lat, location.lon);
    displayController.changeFiveDay(fiveDay);
}

function initButtons() {
    const submitBtn = document.querySelector('.submitBtn');
    submitBtn.addEventListener('click', async function(evt) {
        const cityField = document.querySelector('#city');
        const stateField = document.querySelector('#state');
        const countryField = document.querySelector('#country');

        const city = cityField.value;
        const state = stateField.value;
        const country = countryField.value;

        updateEverything(city, state, country);
    });
}
initButtons();
updateEverything("Atlanta", "Ga", "US");