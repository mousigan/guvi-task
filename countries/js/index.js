let allCountries = [];
let filteredCountries = [];
let currentPage = 1;
const itemsPerPage = 16;
const searchInput = document.getElementById('search-input');

async function fetchData() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,capital,borders');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        allCountries = await response.json();
        filteredCountries = [...allCountries];
        displayPage(currentPage);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.querySelector('.card').innerHTML = 
            `<p class="error">Failed to load countries. Please try again later.</p>`;
    }
}

let debounceTimer;
searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const query = e.target.value.trim().toLowerCase();
        filterCountries(query);
    }, 300);
});

function filterCountries(query) {
    if (query === '') {
        filteredCountries = [...allCountries];
    } else {
        filteredCountries = allCountries.filter(country => 
            country.name.common.toLowerCase().includes(query)
        );
    }
    currentPage = 1;
    displayPage(currentPage);
}

function displayPage(page) {
    const container = document.querySelector('.card');
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedItems = filteredCountries.slice(startIndex, startIndex + itemsPerPage);

    if (paginatedItems.length === 0) {
        container.innerHTML = `<p class="no-results">No countries found matching your search.</p>`;
        renderPagination(0);
        return;
    }

container.innerHTML = paginatedItems.map((country, index) => `
    <div class="country-card"
         role="button"
         tabindex="0"
         data-index="${startIndex + index}"
         aria-label="${country.name.common}">
        <div class="img-box">
            <img src="${country.flags.png}"
                 alt="Flag of ${country.name.common}"
                 loading="lazy">
        </div>
        <h3>${country.name.common}</h3>
    </div>
`).join("");


    renderPagination(page);
}

function renderPagination(page) {
    const navContainer = document.getElementById('pagination-nav');
    const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);
    
    if (totalPages <= 1 || filteredCountries.length === 0) {
        navContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '';
    
    paginationHTML += `
        <button onclick="changePage(${page - 1})" ${page === 1 ? 'disabled aria-disabled="true"' : ''} 
        aria-label="Previous page">&laquo;</button>`;

    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="${i === page ? 'active' : ''}" 
        onclick="changePage(${i})" aria-label="Page ${i}" ${i === page ? 'aria-current="page"' : ''}> ${i}
        </button>`;
    }

    paginationHTML += `
        <button onclick="changePage(${page + 1})" ${page === totalPages ? 'disabled aria-disabled="true"' : ''} 
            aria-label="Next page"> &raquo;
        </button>`;

    navContainer.innerHTML = paginationHTML;
}

function changePage(newPage) {
    const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);
    if (newPage < 1 || newPage > totalPages) return;
    
    currentPage = newPage;
    displayPage(currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setTimeout(() => {
        document.querySelector('.country-card')?.focus();
    }, 300);
}


const modal = document.getElementById('country-modal');
const modalName = document.getElementById('modal-name');
const modalFlag = document.getElementById('modal-flag');
const closeBtn = document.querySelector('.modal-close');
const modalBorder = document.getElementById('modal-border');

function openModal(country) {
    modalName.textContent = country.name.common;
    modalBorder.textContent = country.borders ? country.borders.join(', ') : 'No bordering countries';
    modalFlag.src = country.flags.png;
    modalFlag.alt = `Flag of ${country.name.common}`;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
}

closeBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Use event delegation on the document to handle dynamically created cards
document.addEventListener('click', (e) => {
    const card = e.target.closest('.country-card');
    if (!card) return;

    const index = card.dataset.index;
    const country = filteredCountries[index];
    getWeather(country);
    openModal(country);
});



fetchData();


const YOURNAME = 'API_KEY'; // Replace with actual AccuWeather API key

async function getWeather(country) {
    try {
        // Check if country has a capital
        if (!country.capital || country.capital.length === 0) {
            document.getElementById('city-name').innerText = "No capital city available";
            document.getElementById('temp').innerText = "--°C";
            document.getElementById('condition').innerText = "Weather data not available";
            return;
        }

        const cityName = country.capital[0]; // Use first capital if multiple
        const locationUrl = `https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${apiKey}&q=${encodeURIComponent(cityName)}`;
        const locationResponse = await fetch(locationUrl);
        
        if (!locationResponse.ok) {
            throw new Error(`Location API error: ${locationResponse.status}`);
        }
        
        const locationData = await locationResponse.json();
        
        if (!locationData || locationData.length === 0) {
            document.getElementById('city-name').innerText = `${cityName} (Weather data not available)`;
            document.getElementById('temp').innerText = "--°C";
            document.getElementById('condition').innerText = "No weather data found";
            return;
        }

        const locationKey = locationData[0].Key;
        const localizedName = locationData[0].LocalizedName;

        const weatherUrl = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}`;
        const weatherResponse = await fetch(weatherUrl);
        
        if (!weatherResponse.ok) {
            throw new Error(`Weather API error: ${weatherResponse.status}`);
        }
        
        const weatherData = await weatherResponse.json();

        if (!weatherData || weatherData.length === 0) {
            document.getElementById('city-name').innerText = `${localizedName} (Weather data not available)`;
            document.getElementById('temp').innerText = "--°C";
            document.getElementById('condition').innerText = "No weather data found";
            return;
        }

        updateUI(localizedName, weatherData[0]);

    } catch (error) {
        console.error("Error fetching weather:", error);
        document.getElementById('city-name').innerText = "Error loading weather data";
        document.getElementById('temp').innerText = "--°C";
        document.getElementById('condition').innerText = "Please try again later";
    }
}

function updateUI(name, data) {
    document.getElementById('city-name').innerText = name;
    document.getElementById('temp').innerText = `${data.Temperature.Metric.Value}°C`;
    document.getElementById('condition').innerText = data.WeatherText;
}