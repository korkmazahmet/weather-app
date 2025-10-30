import { getWeatherData, getFlagUrl, getWeatherByCoords } from "./api.js";
import { cities } from "./constants.js";
import { uiElement,
         updateThemeIcon,
         renderCityList,
         renderRecentChips,
         renderError,
         clearError,
         setLoader,
         renderWeatherData,
         updateUnitToggle
    } from "./ui.js";






//! projede tutulan veriler


const STATE = {
    theme: localStorage.getItem("theme") || "light",  // light veya dark
    recent: JSON.parse(localStorage.getItem("recent") || "[]"),
    units: localStorage.getItem("units") || "metric" // metric veya imperial
}



//! Proje yüklendiği anda çalışacak kodlar
// body elementine eriştik
const body = document.body;
// body e tema değerini attribute olarak ekliyoruz
body.setAttribute("data-theme", STATE.theme);
// sayfa ilk yüklendiğinde doğru ikonumuz gelecek
updateThemeIcon(STATE.theme);


//! fonsiyonlar 
//mevcut değerleri localstorage a kaydet
const persist = () => {
    localStorage.setItem("theme", STATE.theme);
    localStorage.setItem("recent", JSON.stringify(STATE.recent));
    localStorage.setItem("units", STATE.units);
}

//son aranan şehirleri localstorage a kaydet
const pushRecent = (city) => {
    //son aratılanı diziye ekle
    const updated = [city, ...STATE.recent.filter((c) => c.toLowerCase() !== city.toLowerCase())].slice(0, 6); //son 6 aratılanı tut
    //state nesnesini güncelle
    STATE.recent = updated;

    renderRecentChips(STATE.recent, (city) => {
        uiElement.searchInput.value = city;
        handleSearch(city);
    });
    //son güncellemeleri localstorage a kaydet

    persist();

}

const handleSearch = async (city) => {
    const name = city.trim();

    //şehir ismi girilmediyse ekrana hatayı bas

    if (!name) {
        renderError("Şehir ismi zorunludur");
        return;
    }

    //önceden hata varsa temizle
    clearError();


    //ekrana loader bas

    setLoader(true);

    //api çağrısı yap
    try {
        const data = await getWeatherData(city, STATE.units);

        // şehir bulunamazsa hata mesajı göster
        if (data.cod === "404") {
            return renderError("Şehir bulunamadı");
        }

        //ülke koduna göre bayrak url sini al
        const flagUrl = getFlagUrl(data.sys.country);



        // son aratılanları güncellemek amacıyla
        pushRecent(name);

        renderWeatherData(data, flagUrl, STATE.units);
    } catch (error) {
        renderError(error.message || "Bir hata oluştu");
    } finally {
        setLoader(false);
    }
};



const handleGeoSearch = () => {
    window.navigator.geolocation.getCurrentPosition(
        async (position) => {
            // kullanıcının enlem ve boylam bilgisine eriş
            const { latitude, longitude } = position.coords;
             

            //EKRANA LOADER BAS
            setLoader(true);


            // api a hava durumu için istek at
            const data = await getWeatherByCoords(latitude, longitude, STATE.units);
            

            //loaderı gizle
            setLoader(false);

            //ülke koduna göre bayrak url sini al
            const flagUrl = getFlagUrl(data.sys.country);
            
            
            
            renderWeatherData(data, flagUrl, STATE.units);
            pushRecent(data.name);

        },
        () => {
            renderError("Konum bilgisine erişilemedi");
        })
};



//! events 

//sayfa yüklendiğinde 
document.addEventListener("DOMContentLoaded", () => {
    // kullanıcının konumuna göre ara
    handleGeoSearch();

    //şehir listesini yükle 
    renderCityList();

    //son aratılanları yükle
    renderRecentChips(STATE.recent, (city) => {
        uiElement.searchInput.value = city;
        handleSearch(city);
    })

    //son seçilen birime aktif class ı ver 
    updateUnitToggle(STATE.units);
});


// form göndedrildiğinde


uiElement.searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const city = uiElement.searchInput.value;
    handleSearch(city);
})


uiElement.themeBtn.addEventListener("click", () => {
    // mevcut tema değerine eriş



    // erişilen tema değerinin tersini almam lazım

    STATE.theme = STATE.theme === "light" ? "dark" : "light";

    // tema değerini body e attribute olarak ekliyorum

    body.setAttribute("data-theme", STATE.theme);

    // son temayı localstorage a kaydet



    persist();

    updateThemeIcon(STATE.theme);

})

uiElement.locateBtn.addEventListener("click", handleGeoSearch);

// birim alanına tıklanma olayını izle
uiElement.unitToggle.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", async () => {
        //hangi birim seçildi
        const nextUnits = btn.value;

        //aynı birim seçilirse fonsiyonu durdur
        if (STATE.units === nextUnits) return;

        //seçili birimi tuttuğumuz değişkeni güncelle
        STATE.units = nextUnits;

        //locale storage a son güncellemeleri kaydet
        persist();


        //seçili birimi güncelle
        updateUnitToggle(nextUnits);


        //son yapılan aratmayı yeni seçilen birime göre tekrarla
        handleSearch(STATE.recent[0]);
    });
});
