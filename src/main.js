import './style.css';
import { translations } from './translations.js';
import { calculateHoroscope, cities, signKeys, starKeys, getRasiSignIndex, getStarAndPada, calculateSubPeriods } from './astroCalculations.js';
import { getPredictions } from './predictions.js';
import heroImageUrl from './assets/hero.png';

// Helper function for local date formatting
const formatDate = (date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
};

// Helper function to calculate calendar difference in years, months, and days
const getAgeYMD = (birthDate, targetDate) => {
    const bDate = new Date(birthDate);
    const tDate = new Date(targetDate);
    
    if (tDate < bDate) {
        return { years: 0, months: 0, days: 0 };
    }
    
    let years = tDate.getFullYear() - bDate.getFullYear();
    let months = tDate.getMonth() - bDate.getMonth();
    let days = tDate.getDate() - bDate.getDate();
    
    if (days < 0) {
        // Borrow days from the previous month of targetDate
        const prevMonth = new Date(tDate.getFullYear(), tDate.getMonth(), 0);
        days += prevMonth.getDate();
        months--;
    }
    
    if (months < 0) {
        months += 12;
        years--;
    }
    
    return { years, months, days };
};

// Helper function to format Age YMD based on current language tags
const formatAgeYMD = (ageObj, t) => {
    return `${ageObj.years}${t.dasa.y} ${ageObj.months}${t.dasa.m} ${ageObj.days}${t.dasa.d}`;
};

// Application State Loader
const savedState = localStorage.getItem('horoscope_app_state');
let state = {
    lang: 'ta', // 'ta' or 'en'
    view: 'form', // 'form' or 'results'
    horoscope: null,
    selectedCity: { name: "Cuddalore", tamilName: "கடலூர்", lat: 11.7562, lon: 79.7669 }
};

if (savedState) {
    try {
        const parsed = JSON.parse(savedState);
        if (parsed && typeof parsed === 'object') {
            state = { ...state, ...parsed };
        }
    } catch (e) {
        console.error("Failed to parse saved state", e);
    }
}

// Persist Theme Preference
const savedTheme = localStorage.getItem('horoscope_app_theme');
if (savedTheme === 'dark') {
    document.body.classList.remove('light-mode');
} else if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
}

// Main DOM mounting element
const root = document.querySelector('#app');

// App Initialization
function init() {
    render();
}

// Render the application based on state
function render() {
    const t = translations[state.lang];
    
    // Save state and theme on each render
    localStorage.setItem('horoscope_app_state', JSON.stringify(state));
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('horoscope_app_theme', isLight ? 'light' : 'dark');
    
    let content = '';
    
    if (state.view === 'form') {
        content = renderFormView(t);
    } else {
        content = renderResultsView(t);
    }
    
    root.innerHTML = `
        <header>
            <div class="logo-container" id="header-logo" style="cursor: pointer;">
                <h1>Online Horoscope Calculator</h1>
                <p>${state.lang === 'ta' ? 'துல்லியமான வேத ஜோதிட கணிப்புகள்' : 'Accurate Vedic Astrology Predictions'}</p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <button class="lang-btn" id="toggle-theme-btn" style="width: 38px; height: 38px; border-radius: 0; padding: 0; display: inline-flex; align-items: center; justify-content: center;" title="${isLight ? 'Dark Mode' : 'Light Mode'}">
                    ${isLight ? 
                        `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" stroke-linecap="round" stroke-linejoin="round"></path></svg>` : 
                        `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
                    }
                </button>
                <button class="lang-btn" id="toggle-lang-btn">
                    ${state.lang === 'ta' ? t.viewInEnglish : t.viewInTamil}
                </button>
            </div>
        </header>
        <main>
            ${content}
        </main>
        <footer>
            <p>© ${new Date().getFullYear()} ${state.lang === 'ta' ? 'தமிழ் ஜாதகம் - வேத ஜோதிட கணிப்புகள். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.' : 'Tamil Horoscope - Vedic Astrology Calculations. All Rights Reserved.'}</p>
        </footer>
    `;
    
    bindEvents();
}

// Render the Input Form
function renderFormView(t) {
    const currentYear = new Date().getFullYear();
    
    // Day options (1-31)
    let daysHtml = `<option value="">${t.day}</option>`;
    for (let i = 1; i <= 31; i++) {
        daysHtml += `<option value="${i.toString().padStart(2, '0')}">${i}</option>`;
    }
    
    // Month options
    let monthsHtml = `<option value="">${t.month}</option>`;
    t.months.forEach((m, idx) => {
        monthsHtml += `<option value="${(idx + 1).toString().padStart(2, '0')}">${m}</option>`;
    });
    
    // Year options (1940 to currentYear + 5)
    let yearsHtml = `<option value="">${t.year}</option>`;
    for (let i = currentYear + 4; i >= 1940; i--) {
        yearsHtml += `<option value="${i}">${i}</option>`;
    }
    
    // Hour options (1-12)
    let hoursHtml = `<option value="">${t.hour}</option>`;
    for (let i = 1; i <= 12; i++) {
        hoursHtml += `<option value="${i.toString().padStart(2, '0')}">${i}</option>`;
    }
    
    // Minute options (0-59)
    let minutesHtml = `<option value="">${t.minute}</option>`;
    for (let i = 0; i < 60; i++) {
        minutesHtml += `<option value="${i.toString().padStart(2, '0')}">${i.toString().padStart(2, '0')}</option>`;
    }
    
    return `
        <div class="card card-split" id="form-card">
            <div class="card-form-side">
                <h2 class="card-title">${t.title}</h2>
                <p class="card-subtitle">${t.subtitle}</p>
                
                <form id="horoscope-form" onsubmit="return false;">
                    <div class="form-grid">
                        <!-- Name -->
                        <div class="form-group">
                            <label for="input-name">${t.name} <span class="label-highlight">*</span></label>
                            <input type="text" id="input-name" placeholder="${t.namePlaceholder}" required>
                        </div>
                        
                        <!-- Gender -->
                        <div class="form-group">
                            <label for="input-gender">${t.gender} <span class="label-highlight">*</span></label>
                            <select id="input-gender" required>
                                <option value="male" selected>${t.male}</option>
                                <option value="female">${t.female}</option>
                            </select>
                        </div>
                        
                        <!-- Birth Place -->
                        <div class="form-group full-width autocomplete-container">
                            <label for="input-place">${t.birthPlace} <span class="label-highlight">*</span></label>
                            <input type="text" id="input-place" placeholder="${t.birthPlacePlaceholder}" autocomplete="off" required value="Cuddalore">
                            <ul class="suggestions-list" id="city-suggestions" style="display: none;"></ul>
                        </div>
                        
                        <!-- Birth Date -->
                        <div class="form-group full-width">
                            <label>${t.birthDate} <span class="label-highlight">*</span></label>
                            <div class="multi-select-grid">
                                <select id="select-day" required>
                                    ${daysHtml}
                                </select>
                                <select id="select-month" required>
                                    ${monthsHtml}
                                </select>
                                <select id="select-year" required>
                                    ${yearsHtml}
                                </select>
                            </div>
                        </div>
                        
                        <!-- Birth Time -->
                        <div class="form-group full-width">
                            <label>${t.birthTime} <span class="label-highlight">*</span></label>
                            <div class="multi-select-grid">
                                <select id="select-hour" required>
                                    ${hoursHtml}
                                </select>
                                <select id="select-minute" required>
                                    ${minutesHtml}
                                </select>
                                <select id="select-ampm" required>
                                    <option value="AM">AM</option>
                                    <option value="PM" selected>PM</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Submit Button -->
                        <div class="submit-btn-container">
                            <button type="submit" class="submit-btn" id="submit-btn">
                                <span>${t.calculateBtn}</span>
                                <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                                </svg>
                            </button>
                            <button type="button" class="btn-secondary" id="live-btn">
                                <span>${state.lang === 'ta' ? 'இப்போதைய ஜாதகம் (Live)' : 'Live Horoscope'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <div class="card-image-side">
                <img src="${heroImageUrl}" alt="Aesthetic Cosmic Still Life" class="hero-image">
            </div>
        </div>
    `;
}

// Render Results View
function renderResultsView(t) {
    const data = state.horoscope;
    const details = data.birthDetails;
    
    // Get formatted Date-Time representation for the chart center
    const genderLabel = details.gender === 'male' ? `${t.male} / Male` : `${t.female} / Female`;
    const birthTimeDisplay = details.timeStr.replace(/:00$/, '') + ' ' + details.ampm.toLowerCase();
    
    const formattedDate = details.dateStr.split('-').reverse().join('-');
    const dtDisplay = `${formattedDate} - ${birthTimeDisplay}`;
    
    const latDisplay = `Lat: ${details.lat.toFixed(4)} N`;
    const lonDisplay = `Lon: ${details.lon.toFixed(4)} E`;
    const cityText = `${details.city}, Tamil Nadu, India`;
    
    // Star details
    const moonStarTamilName = t.stars[data.panchang.starIdx];
    const moonStarEnglishName = translations['en'].stars[data.panchang.starIdx];
    const starPadaText = state.lang === 'ta' ? `${moonStarTamilName}-${data.panchang.pada}` : `${moonStarEnglishName}-${data.panchang.pada}`;
    
    // Generate charts
    const rasiGridHtml = renderChartGrid(data.planets, false, t, starPadaText, genderLabel, dtDisplay, latDisplay, lonDisplay, cityText);
    const navamsamGridHtml = renderChartGrid(data.planets, true, t, starPadaText, genderLabel, dtDisplay, latDisplay, lonDisplay, cityText);
    
    // Planet detail rows
    let tableRows = '';
    data.planets.forEach(p => {
        if (p.name === 'Lagna' && state.lang === 'en') return; // Skip duplicate Lagna display in table if it's already shown as Lagna
        const pTamilName = t.planets[p.name];
        const pEnglishName = translations['en'].planets[p.name];
        
        const rasiTamilName = t.signs[signKeys[p.rasiIdx]];
        const rasiEnglishName = translations['en'].signs[signKeys[p.rasiIdx]];
        
        const starTamil = t.stars[p.starIdx];
        const starEnglish = translations['en'].stars[p.starIdx];
        
        tableRows += `
            <tr>
                <td>
                    <div class="planet-tamil-name">${pTamilName}</div>
                    <div class="planet-english-name">${pEnglishName}</div>
                </td>
                <td>
                    <div style="font-weight: 600;">${(p.longitude % 30).toFixed(2)}°</div>
                    <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">(Total: ${p.longitude.toFixed(2)}°)</div>
                </td>
                <td>${state.lang === 'ta' ? rasiTamilName : rasiEnglishName}</td>
                <td>${state.lang === 'ta' ? starTamil : starEnglish}</td>
                <td>${p.pada}</td>
                <td>${p.house}</td>
            </tr>
        `;
    });
    
    // Panchang items
    const panchangItems = [
        { label: t.panchang.star, value: state.lang === 'ta' ? `${moonStarTamilName} (பாதம்: ${data.panchang.pada})` : `${moonStarEnglishName} (Pada: ${data.panchang.pada})` },
        { label: t.panchang.rasi, value: state.lang === 'ta' ? t.signs[signKeys[data.panchang.rasiIdx]] : translations['en'].signs[signKeys[data.panchang.rasiIdx]] },
        { label: t.panchang.lagna, value: state.lang === 'ta' ? t.signs[signKeys[getRasiSignIndex(data.lagnaLon)]] : translations['en'].signs[signKeys[getRasiSignIndex(data.lagnaLon)]] },
        { label: t.panchang.tithi, value: getTithiName(data.panchang.tithiIdx, state.lang) },
        { label: t.panchang.yoga, value: getYogaName(data.panchang.yogaIdx, state.lang) },
        { label: t.panchang.karana, value: getKaranaName(data.panchang.karanaIdx, state.lang) }
    ];
    
    let panchangHtml = '';
    panchangItems.forEach(item => {
        panchangHtml += `
            <div class="summary-item">
                <span class="summary-label">${item.label}</span>
                <span class="summary-value">${item.value}</span>
            </div>
        `;
    });
    
    // Dasa rows calculation
    let dasaRowsHtml = '';
    const lordColors = {
        Sun: '#f59e0b',
        Moon: '#a1a1aa',
        Mars: '#ef4444',
        Mercury: '#10b981',
        Jupiter: '#fbbf24',
        Venus: '#ec4899',
        Saturn: '#3b82f6',
        Rahu: '#6b7280',
        Ketu: '#78350f'
    };
    
    data.dasaTimeline.forEach(period => {
        const lordTamilName = t.planets[period.lord] || period.lord;
        const lordEnglishName = translations['en'].planets[period.lord] || period.lord;
        const lordDisplay = state.lang === 'ta' ? `${lordTamilName} (${lordEnglishName})` : lordEnglishName;
        
        const startStr = formatDate(new Date(period.start));
        const endStr = formatDate(new Date(period.end));
        
        const birthDate = new Date(data.birthDetails.dateStr + 'T' + data.birthDetails.timeStr);
        const startAgeObj = getAgeYMD(birthDate, period.start);
        const endAgeObj = getAgeYMD(birthDate, period.end);
        const ageRange = `${formatAgeYMD(startAgeObj, t)} - ${formatAgeYMD(endAgeObj, t)}`;
        
        let badgeClass = 'badge-future';
        let statusText = t.dasa.future;
        if (period.status === 'active') {
            badgeClass = 'badge-active';
            statusText = t.dasa.active;
        } else if (period.status === 'past') {
            badgeClass = 'badge-past';
            statusText = t.dasa.past;
        }
        
        const bulletColor = lordColors[period.lord] || '#8b5cf6';
        
        dasaRowsHtml += `
            <tr class="dasa-row ${period.status === 'active' ? 'dasa-active' : ''}"
                data-level="1"
                data-lord="${period.lord}"
                data-start="${new Date(period.start).toISOString()}"
                data-end="${new Date(period.end).toISOString()}"
                data-duration="${period.duration}"
                data-start-age="${period.startAge}"
                data-end-age="${period.endAge}"
                ${period.virtualStart ? `data-virtual-start="${new Date(period.virtualStart).toISOString()}"` : ''}
                ${period.fullDuration !== undefined ? `data-full-duration="${period.fullDuration}"` : ''}
                data-expanded="false"
                style="cursor: pointer;"
            >
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="dasa-toggle-icon" style="font-size: 10px; width: 12px; display: inline-block; color: var(--text-secondary); transition: transform 0.2s;">&#9656;</span>
                        <span class="dasa-bullet" style="background-color: ${bulletColor};"></span>
                        <span style="font-weight: 600;">${lordDisplay}<span style="font-size: 12px; color: var(--text-secondary); font-weight: normal;"> - ${t.dasa.mahadasa}</span></span>
                    </div>
                </td>
                <td>${startStr}</td>
                <td>${endStr}</td>
                <td>${ageRange}</td>
                <td>
                    <span class="dasa-badge ${badgeClass}">${statusText}</span>
                </td>
            </tr>
        `;
    });
    
    return `
        <div class="results-container">
            <!-- Top Back Button -->
            <div style="display: flex; justify-content: flex-start; margin-bottom: -10px;">
                <button class="btn-secondary" id="top-back-btn" style="width: 40px; height: 40px; border-radius: 0; padding: 0; display: inline-flex; align-items: center; justify-content: center;" title="${t.actions.back}">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                </button>
            </div>
            <!-- Charts Grid (Rasi & Navamsam side-by-side) -->
            <div class="card">
                <div class="charts-grid-wrapper">
                    <!-- Rasi Chart -->
                    <div class="chart-box">
                        <div class="chart-title-header">${state.lang === 'ta' ? 'இராசி கட்டம் (Rasi Chart)' : 'Rasi Chart (D-1)'}</div>
                        <div class="chart-grid rasi-theme">
                            ${rasiGridHtml}
                        </div>
                    </div>
                    
                    <!-- Navamsam Chart -->
                    <div class="chart-box">
                        <div class="chart-title-header">${state.lang === 'ta' ? 'நவாம்சம் கட்டம் (Navamsam Chart)' : 'Navamsam Chart (D-9)'}</div>
                        <div class="chart-grid nav-theme">
                            ${navamsamGridHtml}
                        </div>
                    </div>
                </div>
                <div class="kocharam-label">
                    Kocharam : ${new Date().toLocaleTimeString()} GMT+5:30 *Planet Degree in Decimal
                </div>
            </div>
            
            <!-- Panchang Summary & Details -->
            <div class="panchang-grid">
                <div class="card">
                    <h2 class="card-title" style="text-align: left; margin-bottom: 20px;">${t.panchang.title}</h2>
                    <div class="summary-list">
                        ${panchangHtml}
                    </div>
                </div>
                
                <div class="card">
                    <h2 class="card-title" style="text-align: left; margin-bottom: 20px;">${state.lang === 'ta' ? 'கிரக நிலைகள்' : 'Planetary Placements'}</h2>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>${t.planetTable.planet}</th>
                                    <th>${t.planetTable.degree}</th>
                                    <th>${t.planetTable.rasi}</th>
                                    <th>${t.planetTable.star}</th>
                                    <th>${t.planetTable.pada}</th>
                                    <th>${t.planetTable.house}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Vimshottari Dasa Timeline -->
            <div class="card">
                <h2 class="card-title" style="text-align: left; margin-bottom: 20px;">${t.dasa.title}</h2>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>${t.dasa.lord}</th>
                                <th>${t.dasa.start}</th>
                                <th>${t.dasa.end}</th>
                                <th>${t.dasa.age}</th>
                                <th>${t.dasa.status}</th>
                            </tr>
                        </thead>
                        <tbody id="dasa-tbody">
                            ${dasaRowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Actions -->
            <div class="actions-container">
                <button class="btn-secondary" id="back-btn">${t.actions.back}</button>
                <button class="btn-primary" id="print-btn">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                    </svg>
                    <span>${t.actions.print}</span>
                </button>
            </div>
        </div>
    `;
}

// Helper to generate Rasi/Navamsam cells
// Grid cells indexes clockwise:
// Row 1: Pisces(11), Aries(0), Taurus(1), Gemini(2)
// Row 2: Aquarius(10), Center, Center, Cancer(3)
// Row 3: Capricorn(9), Center, Center, Leo(4)
// Row 4: Sagittarius(8), Scorpio(7), Libra(6), Virgo(5)
function renderChartGrid(planets, isNavamsam, t, starPada, gender, datetime, lat, lon, city) {
    const layout = [
        { signIdx: 11, row: 1, col: 1 }, // Pisces
        { signIdx: 0,  row: 1, col: 2 }, // Aries
        { signIdx: 1,  row: 1, col: 3 }, // Taurus
        { signIdx: 2,  row: 1, col: 4 }, // Gemini
        { signIdx: 3,  row: 2, col: 4 }, // Cancer
        { signIdx: 4,  row: 3, col: 4 }, // Leo
        { signIdx: 5,  row: 4, col: 4 }, // Virgo
        { signIdx: 6,  row: 4, col: 3 }, // Libra
        { signIdx: 7,  row: 4, col: 2 }, // Scorpio
        { signIdx: 8,  row: 4, col: 1 }, // Sagittarius
        { signIdx: 9,  row: 3, col: 1 }, // Capricorn
        { signIdx: 10, row: 2, col: 1 }  // Aquarius
    ];
    
    // Find Lagna sign
    const lagnaPlanet = planets.find(p => p.name === 'Lagna');
    const lagnaSignIdx = lagnaPlanet ? (isNavamsam ? lagnaPlanet.navamsamIdx : lagnaPlanet.rasiIdx) : 0;
    
    let cellsHtml = '';
    
    layout.forEach(cell => {
        const matchingPlanets = planets.filter(p => {
            const sign = isNavamsam ? p.navamsamIdx : p.rasiIdx;
            // In Navamsam, we don't display the Lagna text item "ல" in the box listing, we just draw the orange triangle in that box!
            // Wait, the reference screenshot has "ல" in the Scorpio box of the Navamsam chart! Yes, it does have "ல" inside the cell, as well as the orange triangle.
            // But wait, the Lagna planet name is 'Lagna'. We want to display the shorthand (e.g. "ல" or "As").
            return sign === cell.signIdx && (p.name !== 'Lagna' || !isNavamsam || p.name === 'Lagna');
        });
        
        // Generate planetary degree label (only for Rasi chart, in top-left)
        let degreeLabelHtml = '';
        if (!isNavamsam) {
            const lines = matchingPlanets.map(p => {
                const pShort = t.planetsShort[p.name];
                const relativeLon = p.longitude % 30;
                return `${pShort}-${relativeLon.toFixed(2)}`;
            });
            degreeLabelHtml = `<div class="cell-degree-info">${lines.join('\n')}</div>`;
        }
        
        // Generate list of planet shorthands in center of cell
        let planetListHtml = '';
        matchingPlanets.forEach(p => {
            const pShort = t.planetsShort[p.name];
            planetListHtml += `<div class="cell-planet-item">${pShort}</div>`;
        });
        
        // Lagna indicator (orange triangle in top-left corner)
        // Draw if this cell matches the Lagna sign
        const isLagnaCell = cell.signIdx === lagnaSignIdx;
        const lagnaIndicatorHtml = isLagnaCell ? `<div class="cell-lagna-indicator"></div>` : '';
        
        // House numbers (relative to Lagna, clockwise starting from Lagna = 1)
        // Only display house numbers on the Rasi chart
        let houseNumHtml = '';
        if (!isNavamsam) {
            const houseNum = ((cell.signIdx - lagnaSignIdx + 12) % 12) + 1;
            houseNumHtml = `<div class="cell-house-num">${houseNum}</div>`;
        }
        
        // Styles for layout grid placement
        const style = `grid-row: ${cell.row}; grid-column: ${cell.col};`;
        
        cellsHtml += `
            <div class="chart-cell" style="${style}">
                ${lagnaIndicatorHtml}
                ${houseNumHtml}
                ${degreeLabelHtml}
                <div class="cell-planets-list">
                    ${planetListHtml}
                </div>
            </div>
        `;
    });
    
    // Add center cell
    const centerTitle = isNavamsam ? t.navamsamTitle : t.rasiTitle;
    cellsHtml += `
        <div class="chart-center-cell">
            <h3 class="center-title">${centerTitle}</h3>
            <div class="center-star">${starPada}</div>
            <div class="center-info-row bold">${gender}</div>
            <div class="center-info-row">${datetime}</div>
            <div class="center-info-row">${lat} - ${lon}</div>
            <div class="center-info-row">${city}</div>
        </div>
    `;
    
    return cellsHtml;
}

// Get Tithi name based on index (0 to 29)
function getTithiName(idx, lang) {
    const paksha = idx < 15 ? (lang === 'ta' ? 'வளர்பிறை' : 'Shukla Paksha') : (lang === 'ta' ? 'தேய்பிறை' : 'Krishna Paksha');
    const tithisTa = [
        "பிரதமை", "துவிதியை", "திருதியை", "சதுர்த்தி", "பஞ்சமி", "சஷ்டி", "சப்தமி", "அஷ்டமி", "நவமி", "தசமி",
        "ஏகாதசி", "துவாதசி", "திரயோதசி", "சதுர்தசி", "பௌர்ணமி / அமாவாசை"
    ];
    const tithisEn = [
        "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
        "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Full Moon / New Moon"
    ];
    
    let tithiName = '';
    const rem = idx % 15;
    if (rem === 14) {
        tithiName = idx < 15 ? (lang === 'ta' ? 'பௌர்ணமி' : 'Purnima') : (lang === 'ta' ? 'அமாவாசை' : 'Amavasya');
    } else {
        tithiName = lang === 'ta' ? tithisTa[rem] : tithisEn[rem];
    }
    
    return `${paksha} - ${tithiName}`;
}

// Get Yoga Name
function getYogaName(idx, lang) {
    const yogasTa = [
        "விஷ்கம்பம்", "பிரீதி", "ஆயுஷ்மான்", "சௌபாக்கியம்", "சோபனம்", "அதிகண்டம்", "சுகர்மம்", "திருதி", "சூலம்",
        "கண்டம்", "விருத்தி", "துருவம்", "வியாதீபாதம்", "ஹர்ஷணம்", "வஜ்ரம்", "சித்தி", "வியதீபாதம்", "வரியான்",
        "பரிகம்", "சிவம்", "சித்தம்", "சாத்தியம்", "சுபம்", "சுப்ரம்", "பிராமியம்", "ஐந்திரம்", "வைதிருதி"
    ];
    const yogasEn = [
        "Vishkumbha", "Preeti", "Ayushman", "Saubhagya", "Sobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola",
        "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan",
        "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
    ];
    return lang === 'ta' ? yogasTa[idx] : yogasEn[idx];
}

// Get Karana Name
function getKaranaName(idx, lang) {
    const karanasTa = [
        "சிம்மம் (பவ)", "புலி (பாலவ)", "பன்றி (கௌலவ)", "கழுதை (தைதிலை)", "யானை (கரசை)", "பசு (வணிசை)", "பத்திரி (பத்திரை)",
        "சகுனி", "சதுஷ்பாதம்", "நாகவம்", "கிம்ஸ்துக்னம்"
    ];
    const karanasEn = [
        "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti",
        "Shakuni", "Chatushpada", "Naga", "Kimstughna"
    ];
    
    let kIdx = 0;
    if (idx === 0) kIdx = 10; // Kimstughna
    else if (idx >= 57) kIdx = 7 + (idx - 57); // Shakuni, Chatushpada, Naga
    else {
        kIdx = ((idx - 1) % 7); // Repeating 7 karanas
    }
    
    return lang === 'ta' ? karanasTa[kIdx] : karanasEn[kIdx];
}

// Bind event listeners to UI components
function bindEvents() {
    // Logo Click (Go to home/form view)
    const headerLogo = document.querySelector('#header-logo');
    if (headerLogo) {
        headerLogo.addEventListener('click', () => {
            state.view = 'form';
            render();
        });
    }

    // 1. Language Toggle
    const toggleLangBtn = document.querySelector('#toggle-lang-btn');
    if (toggleLangBtn) {
        toggleLangBtn.addEventListener('click', () => {
            state.lang = state.lang === 'ta' ? 'en' : 'ta';
            render();
        });
    }
    
    // Theme Toggle
    const toggleThemeBtn = document.querySelector('#toggle-theme-btn');
    if (toggleThemeBtn) {
        toggleThemeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            render();
        });
    }
    
    // Form view events
    if (state.view === 'form') {
        const form = document.querySelector('#horoscope-form');
        const placeInput = document.querySelector('#input-place');
        const suggestionsList = document.querySelector('#city-suggestions');
        
        // Autocomplete search
        if (placeInput && suggestionsList) {
            placeInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                suggestionsList.innerHTML = '';
                
                if (query.length < 2) {
                    suggestionsList.style.display = 'none';
                    return;
                }
                
                const filtered = cities.filter(c => 
                    c.name.toLowerCase().includes(query) || 
                    c.tamilName.includes(query)
                );
                
                if (filtered.length > 0) {
                    filtered.forEach(city => {
                        const li = document.createElement('li');
                        li.textContent = state.lang === 'ta' ? `${city.tamilName} (${city.name})` : `${city.name} (${city.tamilName})`;
                        li.addEventListener('click', () => {
                            placeInput.value = state.lang === 'ta' ? city.tamilName : city.name;
                            state.selectedCity = city;
                            suggestionsList.style.display = 'none';
                        });
                        suggestionsList.appendChild(li);
                    });
                    suggestionsList.style.display = 'block';
                } else {
                    suggestionsList.style.display = 'none';
                }
            });
            
            // Hide list on click outside
            document.addEventListener('click', (e) => {
                if (e.target !== placeInput && e.target !== suggestionsList) {
                    suggestionsList.style.display = 'none';
                }
            });
        }
        
        // Live Horoscope button click
        const liveBtn = document.querySelector('#live-btn');
        if (liveBtn) {
            liveBtn.addEventListener('click', () => {
                const now = new Date();
                
                // Formulate YYYY-MM-DD
                const year = now.getFullYear();
                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                const day = now.getDate().toString().padStart(2, '0');
                const dateIsoStr = `${year}-${month}-${day}`;
                
                // Formulate HH:MM:SS
                const hour = now.getHours();
                const minute = now.getMinutes().toString().padStart(2, '0');
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const time24Str = `${hour.toString().padStart(2, '0')}:${minute}:00`;
                
                const place = placeInput ? placeInput.value : '';
                let lat = state.selectedCity.lat;
                let lon = state.selectedCity.lon;
                let finalCityName = state.selectedCity.name;
                
                const matchedCity = cities.find(c => 
                    c.name.toLowerCase() === place.toLowerCase() || 
                    c.tamilName === place
                );
                if (matchedCity) {
                    lat = matchedCity.lat;
                    lon = matchedCity.lon;
                    finalCityName = matchedCity.name;
                }
                
                const name = state.lang === 'ta' ? 'இப்போதைய ஜாதகம் (Live)' : 'Live Horoscope';
                const gender = 'male';
                
                const horoscope = calculateHoroscope({
                    name,
                    gender,
                    dateStr: dateIsoStr,
                    timeStr: time24Str,
                    lat,
                    lon,
                    fatherName: '',
                    motherName: '',
                    ampm,
                    city: finalCityName
                });
                
                state.horoscope = horoscope;
                state.view = 'results';
                render();
            });
        }
        
        // Form submit
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const name = document.querySelector('#input-name').value;
                const gender = document.querySelector('#input-gender').value;
                const place = placeInput.value;
                
                const day = document.querySelector('#select-day').value;
                const month = document.querySelector('#select-month').value;
                const year = document.querySelector('#select-year').value;
                
                const hour = document.querySelector('#select-hour').value;
                const minute = document.querySelector('#select-minute').value;
                const ampm = document.querySelector('#select-ampm').value;
                

                
                // Formulate 24h ISO time
                let hr24 = parseInt(hour);
                if (ampm === 'PM' && hr24 < 12) hr24 += 12;
                if (ampm === 'AM' && hr24 === 12) hr24 = 0;
                const hr24Str = hr24.toString().padStart(2, '0');
                const time24Str = `${hr24Str}:${minute}:00`;
                const dateIsoStr = `${year}-${month}-${day}`;
                
                // Retrieve coordinates: check if typed name matches preloaded city, otherwise fallback to selectedCity
                let lat = state.selectedCity.lat;
                let lon = state.selectedCity.lon;
                let finalCityName = state.selectedCity.name;
                
                const matchedCity = cities.find(c => 
                    c.name.toLowerCase() === place.toLowerCase() || 
                    c.tamilName === place
                );
                if (matchedCity) {
                    lat = matchedCity.lat;
                    lon = matchedCity.lon;
                    finalCityName = matchedCity.name;
                }
                
                // Calculate
                const horoscope = calculateHoroscope({
                    name,
                    gender,
                    dateStr: dateIsoStr,
                    timeStr: time24Str,
                    lat,
                    lon,
                    fatherName: '',
                    motherName: '',
                    ampm,
                    city: finalCityName
                });
                
                state.horoscope = horoscope;
                state.view = 'results';
                render();
            });
        }
    }
    
    // Results view events
    if (state.view === 'results') {
        // Top Back button
        const topBackBtn = document.querySelector('#top-back-btn');
        if (topBackBtn) {
            topBackBtn.addEventListener('click', () => {
                state.view = 'form';
                render();
            });
        }
        
        // Back button
        const backBtn = document.querySelector('#back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                state.view = 'form';
                render();
            });
        }
        
        // Print button
        const printBtn = document.querySelector('#print-btn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }

        // Dasa sub-period expand/collapse click handler (Event Delegation)
        const dasaTbody = document.querySelector('#dasa-tbody');
        if (dasaTbody) {
            dasaTbody.addEventListener('click', (e) => {
                const row = e.target.closest('.dasa-row');
                if (!row) return;
                
                const level = parseInt(row.getAttribute('data-level'));
                if (level >= 4) return; // Sookshma cannot be expanded further
                
                const isExpanded = row.getAttribute('data-expanded') === 'true';
                const t = translations[state.lang];
                
                if (isExpanded) {
                    // Collapse all descendant rows recursively
                    let next = row.nextElementSibling;
                    while (next && parseInt(next.getAttribute('data-level')) > level) {
                        const toRemove = next;
                        next = next.nextElementSibling;
                        toRemove.remove();
                    }
                    row.setAttribute('data-expanded', 'false');
                    const toggleIcon = row.querySelector('.dasa-toggle-icon');
                    if (toggleIcon) {
                        toggleIcon.innerHTML = '&#9656;'; // ▸
                    }
                } else {
                    // Expand: calculate sub-periods
                    const parentPeriod = {
                        lord: row.getAttribute('data-lord'),
                        start: row.getAttribute('data-start'),
                        end: row.getAttribute('data-end'),
                        duration: parseFloat(row.getAttribute('data-duration')),
                        startAge: parseFloat(row.getAttribute('data-start-age')),
                        endAge: parseFloat(row.getAttribute('data-end-age')),
                        virtualStart: row.getAttribute('data-virtual-start') || undefined,
                        fullDuration: row.getAttribute('data-full-duration') ? parseFloat(row.getAttribute('data-full-duration')) : undefined
                    };
                    
                    const birthDateStr = state.horoscope.birthDetails.dateStr + 'T' + state.horoscope.birthDetails.timeStr;
                    const subPeriods = calculateSubPeriods(parentPeriod, birthDateStr);
                    
                    let newRowsHtml = '';
                    const nextLevel = level + 1;
                    
                    const lordColors = {
                        Sun: '#f59e0b',
                        Moon: '#a1a1aa',
                        Mars: '#ef4444',
                        Mercury: '#10b981',
                        Jupiter: '#fbbf24',
                        Venus: '#ec4899',
                        Saturn: '#3b82f6',
                        Rahu: '#6b7280',
                        Ketu: '#78350f'
                    };
                    
                    subPeriods.forEach(sp => {
                        const lordTamilName = t.planets[sp.lord] || sp.lord;
                        const lordEnglishName = translations['en'].planets[sp.lord] || sp.lord;
                        const lordDisplay = state.lang === 'ta' ? `${lordTamilName} (${lordEnglishName})` : lordEnglishName;
                        
                        let levelLabel = '';
                        if (nextLevel === 2) levelLabel = ` - ${t.dasa.bhukti}`;
                        else if (nextLevel === 3) levelLabel = ` - ${t.dasa.antara}`;
                        else if (nextLevel === 4) levelLabel = ` - ${t.dasa.sookshma}`;
                        
                        const startStr = formatDate(new Date(sp.start));
                        const endStr = formatDate(new Date(sp.end));
                        
                        const birthDate = new Date(state.horoscope.birthDetails.dateStr + 'T' + state.horoscope.birthDetails.timeStr);
                        const startAgeObj = getAgeYMD(birthDate, sp.start);
                        const endAgeObj = getAgeYMD(birthDate, sp.end);
                        const ageRange = `${formatAgeYMD(startAgeObj, t)} - ${formatAgeYMD(endAgeObj, t)}`;
                        
                        let badgeClass = 'badge-future';
                        let statusText = t.dasa.future;
                        if (sp.status === 'active') {
                            badgeClass = 'badge-active';
                            statusText = t.dasa.active;
                        } else if (sp.status === 'past') {
                            badgeClass = 'badge-past';
                            statusText = t.dasa.past;
                        }
                        
                        const bulletColor = lordColors[sp.lord] || '#8b5cf6';
                        const toggleChevron = nextLevel < 4 ? `<span class="dasa-toggle-icon" style="font-size: 10px; width: 12px; display: inline-block; color: var(--text-secondary); transition: transform 0.2s;">&#9656;</span>` : '<span style="width: 12px; display: inline-block;"></span>';
                        
                        const levelClass = `dasa-row-l${nextLevel}`;
                        
                        newRowsHtml += `
                            <tr class="dasa-row ${levelClass} ${sp.status === 'active' ? 'dasa-active' : ''}"
                                data-level="${nextLevel}"
                                data-lord="${sp.lord}"
                                data-start="${new Date(sp.start).toISOString()}"
                                data-end="${new Date(sp.end).toISOString()}"
                                data-duration="${sp.duration}"
                                data-start-age="${sp.startAge}"
                                data-end-age="${sp.endAge}"
                                ${sp.virtualStart ? `data-virtual-start="${new Date(sp.virtualStart).toISOString()}"` : ''}
                                ${sp.fullDuration !== undefined ? `data-full-duration="${sp.fullDuration}"` : ''}
                                data-expanded="false"
                                style="cursor: pointer;"
                            >
                                <td>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        ${toggleChevron}
                                        <span class="dasa-bullet" style="background-color: ${bulletColor};"></span>
                                        <span style="font-weight: 500;">${lordDisplay}<span style="font-size: 12px; color: var(--text-secondary); font-weight: normal;">${levelLabel}</span></span>
                                    </div>
                                </td>
                                <td>${startStr}</td>
                                <td>${endStr}</td>
                                <td>${ageRange}</td>
                                <td>
                                    <span class="dasa-badge ${badgeClass}">${statusText}</span>
                                </td>
                            </tr>
                        `;
                    });
                    
                    row.insertAdjacentHTML('afterend', newRowsHtml);
                    row.setAttribute('data-expanded', 'true');
                    const toggleIcon = row.querySelector('.dasa-toggle-icon');
                    if (toggleIcon) {
                        toggleIcon.innerHTML = '&#9662;'; // ▾
                    }
                }
            });
        }
    }
}

// Start the app
init();
