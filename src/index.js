import './style.css';

const cityName = document.getElementById('city');
const currentTemp = document.getElementById('current-temp');
const currentFeelsLike = document.getElementById('current-feels-like');
const currentDescription = document.getElementById('current-description');
let celsius = true;
const tempConvButton = document.getElementById('temp-conv-btn');

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
});

getWeatherData();
