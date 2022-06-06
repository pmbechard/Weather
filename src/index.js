import './style.css';

// TODO: localStorage for city and temp unit
// TODO: use local time and other API to show forecast data
// use .main for category of weather
// TODO: get list of possible descriptions and arrange matching BG photos
// TODO: optimize parsing input for city search
// TODO: tabs for hourly forecast and weekly forecast

const currentWeatherIcon = document.getElementById('weather-icon');
const cityName = document.getElementById('city');
const currentDate = document.getElementById('date');
const currentTemp = document.getElementById('current-temp');
const currentFeelsLike = document.getElementById('current-feels-like');
const currentDescription = document.getElementById('current-description');
const searchInput = document.getElementById('city-name');
const searchButton = document.getElementById('search-btn');
let celsius = true;
const tempConvButton = document.getElementById('temp-conv-btn');

const TODAY = new Date();
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY = DAYS[TODAY.getDay()];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const MONTH = MONTHS[TODAY.getMonth()];

const forecastBoxes = document.querySelectorAll('.day');
const forecastOrder = DAYS.slice(TODAY.getDay() + 1).concat(
  DAYS.slice(0, TODAY.getDay() + 1)
);
let dayCounter = 0;
forecastBoxes.forEach((box) => {
  box.firstElementChild.textContent = forecastOrder[dayCounter++];
});

async function getWeatherData(city = 'Shenyang') {
  try {
    const request = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=d35c7255a79efc255f423d8ee7ce896b`,
      { mode: 'cors' }
    );
    const data = await request.json();
    updateWeather(data);
    updateForecast(city);
  } catch (err) {
    console.log(err);
  }
}

function updateWeather(data) {
  //   console.log(data);
  currentWeatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  cityName.textContent = data.name;
  currentDate.textContent = `${DAY}, ${TODAY.getDate()} ${MONTH}`;
  if (celsius) {
    currentTemp.innerHTML = `${getTempC(data.main.temp)}`;
    currentFeelsLike.innerHTML = `Feels like: ${getTempC(
      data.main.feels_like
    )}`;
  } else {
    currentTemp.innerHTML = `${getTempF(data.main.temp)}`;
    currentFeelsLike.innerHTML = `Feels like: ${getTempF(
      data.main.feels_like
    )}`;
  }
  currentDescription.textContent = data.weather[0].description;
}

async function updateForecast(city) {
  const geocode = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=d35c7255a79efc255f423d8ee7ce896b`,
    { mode: 'cors' }
  );
  const geocodeData = await geocode.json();
  const forecastRequest = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${geocodeData[0].lat}&lon=${geocodeData[0].lon}&appid=d35c7255a79efc255f423d8ee7ce896b`,
    { mode: 'cors' }
  );
  const forecastData = await forecastRequest.json();
  console.log(forecastData);
}

searchButton.addEventListener('click', () => {
  getWeatherData(searchInput.value);
});

function getTempC(k) {
  return `${Math.round(Number(k) - 273.15)}&deg;C`;
}

function getTempF(k) {
  return `${Math.round((Number(k) - 273.15) * (9 / 5) + 32)}&deg;F`;
}

tempConvButton.addEventListener('click', () => {
  if (celsius) {
    celsius = false;
  } else {
    celsius = true;
  }
  getWeatherData(cityName.textContent);
});

getWeatherData();
