const API_KEY = "40e7ee4a6de50f10ca31c0283e5c0132";

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

//şehir ismine göre hava durumu verisini getir
export const getWeatherData = async (city, unit = "metric") => {
    // istek atılacak url
    const url = `${BASE_URL}?q=${city}&units=${unit}&appid=${API_KEY}&lang=tr`;

    const res = await fetch(url);
    
    //responsu json a çevir
    const data = await res.json();

    //data yı döndür
    return data;
}



// koordinatlara göre hava durumu verisini getir
export const getWeatherByCoords = async (lat, lon, units = "metric") => {
    
    const url = `${BASE_URL}?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}&lang=tr`;


    const res = await fetch(url);

    return res.json();
}



//ülke koduna göre bayrak url sini döndür
export const getFlagUrl = (countryCode) => {
    return `https://flagcdn.com/108x81/${countryCode.toLowerCase()}.png`;
}