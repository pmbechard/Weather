import './style.css';

// TODO: localStorage for city and temp unit
// TODO: use local time and other API to show forecast data
// TODO: get list of possible descriptions and arrange matching BG photos
// TODO: optimize parsing input for city search
// TODO: tabs for hourly forecast and weekly forecast

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

async function getWeatherData(city = 'Shenyang') {
  try {
    const request = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=d35c7255a79efc255f423d8ee7ce896b`,
      { mode: 'cors' }
    );
    const data = await request.json();
    updateWeather(data);
  } catch (err) {
    console.log(err);
  }
}

function updateWeather(data) {
  //   console.log(data);
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
