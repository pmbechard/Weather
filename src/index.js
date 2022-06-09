import './style.css';
import searchIcon from './img/search.png';

// TODO: Fix desktop view
// FIXME: Catch and handle connection error

const currentWeatherIcon = document.getElementById('weather-icon');
const cityName = document.getElementById('city');
const flag = document.getElementById('flag');
const currentDate = document.getElementById('date');
const currentTime = document.getElementById('time');
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

let today = new Date();
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY = DAYS[today.getDay()];
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
const MONTH = MONTHS[today.getMonth()];

const forecastBoxes = document.querySelectorAll('.day');
const forecastOrder = DAYS.slice(today.getDay() + 1).concat(
  DAYS.slice(0, today.getDay() + 1)
);

async function getWeatherData(city = 'Ottawa') {
  try {
    const request = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=d35c7255a79efc255f423d8ee7ce896b`,
      { mode: 'cors' }
    );
    if (!request.ok) {
      throw 'Invalid';
    }
    const data = await request.json();
    updateWeather(data);
    updateForecast(city);
    localStorage.setItem('city', city);
  } catch (err) {
    console.log('updateWeather : ' + err);
    searchInput.style.backgroundColor = 'rgba(153, 0, 0, 0.4)';
    searchInput.addEventListener('input', () => {
      searchInput.style.backgroundColor = 'white';
    });
    getWeatherData();
  }
}

function updateWeather(data) {
  //   console.log(data);

  try {
    flag.src = `https://countryflagsapi.com/png/${data.sys.country}`;
    today = new Date(data.dt * 1000);
    currentWeatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    cityName.textContent = data.name;
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

    const body = document.body;
    if (data.weather[0].main === 'Atmosphere') {
      body.classList = '';
      body.classList.add('atm-bg');
    } else if (data.weather[0].main === 'Clear') {
      body.classList = '';
      if (today.getHours() > 6 && today.getHours() < 20) {
        body.classList.add('clear-day-bg');
      } else {
        body.classList.add('clear-night-bg');
      }
    } else if (data.weather[0].main === 'Clouds') {
      body.classList = '';
      body.classList.add('cloud-bg');
    } else if (
      data.weather[0].main === 'Rain' ||
      data.weather[0].main === 'Drizzle'
    ) {
      body.classList = '';
      body.classList.add('rain-bg');
    } else if (data.weather[0].main === 'Snow') {
      body.classList = '';
      body.classList.add('snow-bg');
    } else if (data.weather[0].main === 'Thunderstorm') {
      body.classList = '';
      body.classList.add('storm-bg');
    }

    currentDescription.textContent = data.weather[0].description;
  } catch (err) {
    console.log('updateWeather : ' + err);
  }
}

async function updateForecast(city) {
  try {
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
    //   console.log(forecastData);
    let localDate = today.toLocaleString('en-US', {
      timeZone: forecastData.timezone,
    });
    localDate = localDate.split(' ');
    today.setDate(localDate[0].split('/')[1]);
    if (localDate[2] === 'AM') {
      today.setHours(localDate[1].split(':')[0]);
    } else {
      today.setHours(Number(localDate[1].split(':')[0]) + 12);
    }
    today.setMinutes(localDate[1].split(':')[1]);
    currentDate.textContent = `${
      DAYS[today.getDay()]
    }, ${today.getDate()} ${MONTH}`;
    let nowTime =
      String(today.getMinutes()).length == 2
        ? `As of ${today.getHours()}:${today.getMinutes()}`
        : `As of ${today.getHours()}:0${today.getMinutes()}`;
    nowTime = Number(today.getHours()) > 12 ? nowTime + 'pm' : nowTime + 'am';
    currentTime.textContent = nowTime;

    hourlyForecastArea.innerHTML = '';
    for (let i = today.getHours(); i < 24 + today.getHours(); i++) {
      const hourContainer = document.createElement('div');
      hourContainer.classList.add('hour');
      hourlyForecastArea.appendChild(hourContainer);
      const time = document.createElement('h3');
      hourContainer.appendChild(time);
      time.textContent = `${i % 24}:00`;
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
  } catch (err) {
    console.log('updateForecast : ' + err);
  }
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
  getWeatherData(`${cityName.textContent}, ${flag.src.slice(-2)}`);
});

if (localStorage.getItem('city')) {
  getWeatherData(localStorage.getItem('city'));
} else {
  getWeatherData();
}
