import './style.css';
import searchIcon from './img/search.png';

// TODO: use local time and other API to show hourly forecast data
// TODO: add date/time of selected city, maybe country name too?
// TODO: get list of possible descriptions and arrange matching BG photos (use .main for category of weather)
// TODO: optimize parsing input for city search
// TODO: loading animation

const currentWeatherIcon = document.getElementById('weather-icon');
const cityName = document.getElementById('city');
const currentDate = document.getElementById('date');
const currentTemp = document.getElementById('current-temp');
const currentFeelsLike = document.getElementById('current-feels-like');
const currentDescription = document.getElementById('current-description');

const hourlyForecastArea = document.querySelector('.hourly');
const hourlyForecastButton = document.getElementById('hourly');
const weeklyForecastButton = document.getElementById('weekly');
const hourlyDisplay = document.querySelector('.hourly');
const weeklyDisplay = document.querySelector('.weekly');
hourlyForecastButton.addEventListener('click', () => {
  hourlyForecastButton.classList.add('selected');
  weeklyForecastButton.classList.remove('selected');
  hourlyDisplay.style.display = 'grid';
  weeklyDisplay.style.display = 'none';
});
weeklyForecastButton.addEventListener('click', () => {
  weeklyForecastButton.classList.add('selected');
  hourlyForecastButton.classList.remove('selected');
  weeklyDisplay.style.display = 'inline';
  hourlyDisplay.style.display = 'none';
});

const searchInput = document.getElementById('city-name');
const searchButton = document.getElementById('search-btn');
const searchImg = new Image();
searchImg.src = searchIcon;
searchButton.appendChild(searchImg);

const tempConvButton = document.getElementById('temp-conv-btn');
let celsius;
if (
  localStorage.getItem('unit') === null ||
  localStorage.getItem('unit') === 'c'
) {
  celsius = true;
  localStorage.setItem('unit', 'c');
  tempConvButton.innerHTML = '&deg;F';
} else if (localStorage.getItem('unit') === 'f') {
  celsius = false;
  localStorage.setItem('unit', 'f');
  tempConvButton.innerHTML = '&deg;C';
}

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

async function getWeatherData(city = 'Ottawa') {
  localStorage.setItem('city', city);
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
    `https://api.openweathermap.org/data/2.5/onecall?lat=${geocodeData[0].lat}&lon=${geocodeData[0].lon}&exclude=current,alerts,minutely&appid=d35c7255a79efc255f423d8ee7ce896b`,
    { mode: 'cors' }
  );
  const forecastData = await forecastRequest.json();
  console.log(forecastData);

  hourlyForecastArea.innerHTML = '';
  for (let i = TODAY.getHours(); i < 24 + TODAY.getHours(); i++) {
    const hourContainer = document.createElement('div');
    hourContainer.classList.add('hour');
    hourlyForecastArea.appendChild(hourContainer);
    const time = document.createElement('h3');
    hourContainer.appendChild(time);
    time.textContent = `${i}:00`;
    const forecastImg = document.createElement('img');
    hourContainer.appendChild(forecastImg);
    forecastImg.classList.add('icon');
    forecastImg.src = `http://openweathermap.org/img/wn/${forecastData.hourly[i].weather[0].icon}@2x.png`;
    const temp = document.createElement('p');
    hourContainer.appendChild(temp);
    if (celsius) {
      temp.innerHTML = `${getTempC(forecastData.hourly[i].temp)}`;
    } else {
      temp.innerHTML = `${getTempF(forecastData.hourly[i].temp)}`;
    }
  }

  // TODO: refactor to create div elements here
  let dayCounter = 0;
  forecastBoxes.forEach((box) => {
    box.innerHTML = '';
    const forecastDay = document.createElement('h3');
    box.appendChild(forecastDay);
    forecastDay.textContent = forecastOrder[dayCounter++];
    const forecastImg = document.createElement('img');
    box.appendChild(forecastImg);
    forecastImg.classList.add('icon');
    forecastImg.src = `http://openweathermap.org/img/wn/${forecastData.daily[dayCounter].weather[0].icon}@2x.png`;
    const forecastHiLo = document.createElement('p');
    box.appendChild(forecastHiLo);
    if (celsius) {
      forecastHiLo.innerHTML = `L:${getTempC(
        forecastData.daily[dayCounter].temp.min
      )} | H:${getTempC(forecastData.daily[dayCounter].temp.max)}`;
    } else {
      forecastHiLo.innerHTML = `L:${getTempF(
        forecastData.daily[dayCounter].temp.min
      )} | H:${getTempF(forecastData.daily[dayCounter].temp.max)}`;
    }
  });
}

searchInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    searchButton.click();
  }
});

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
    tempConvButton.innerHTML = '&deg;C';
    localStorage.setItem('unit', 'f');
  } else {
    celsius = true;
    tempConvButton.innerHTML = '&deg;F';
    localStorage.setItem('unit', 'c');
  }
  getWeatherData(cityName.textContent);
});

if (localStorage.getItem('city')) {
  getWeatherData(localStorage.getItem('city'));
} else {
  getWeatherData();
}
