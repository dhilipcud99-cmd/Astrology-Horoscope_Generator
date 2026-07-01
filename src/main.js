import './style.css';
import { translations } from './translations.js';
import { calculateHoroscope, signKeys, starKeys, getRasiSignIndex, getStarAndPada, calculateSubPeriods } from './astroCalculations.js';
import { getPredictions } from './predictions.js';

// Localized strings for Dasa search feature
const dasaSearchTranslations = {
    en: {
        searchByDate: "Search Dasa by Date",
        searchBtn: "Search",
        activeDasaOn: "Active Dasa on",
        invalidDate: "Please select a valid date.",
        outOfRange: "Date is out of the 120-year Dasa timeline range."
    },
    ta: {
        searchByDate: "தேதி வாரியாக தசா தேடல்",
        searchBtn: "தேடு",
        activeDasaOn: "குறிப்பிட்ட தேதியில் தற்போதைய தசா",
        invalidDate: "தயவுசெய்து ஒரு சரியான தேதியைத் தேர்ந்தெடுக்கவும்.",
        outOfRange: "தேதி 120 வருட தசா காலவரிசைக்கு அப்பாற்பட்டது."
    },
    hi: {
        searchByDate: "दिनांक के अनुसार दशा खोजें",
        searchBtn: "खोजें",
        activeDasaOn: "को सक्रिय दशा",
        invalidDate: "कृपया एक वैध दिनांक चुनें।",
        outOfRange: "दिनांक 120-वर्षीय दशा कालक्रम सीमा से बाहर है।"
    },
    te: {
        searchByDate: "తేదీ ద్వారా దశా శోధన",
        searchBtn: "శోధించు",
        activeDasaOn: "నాడు క్రియాశీల దశ",
        invalidDate: "దయచేసి సరైన తేదీని ఎంచుకోండి.",
        outOfRange: "తేదీ 120 సంవత్సరాల దశా కాలక్రమం వెలుపల ఉంది."
    },
    kn: {
        searchByDate: "ದಿನಾಂಕದ ಮೂಲಕ ದಶಾ ಹುಡುಕಾಟ",
        searchBtn: "ಹುಡುಕಿ",
        activeDasaOn: "ರಂದು ಸಕ್ರಿಯ ದಶಾ",
        invalidDate: "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
        outOfRange: "ದಿನಾಂಕವು 120 ವರ್ಷಗಳ ದಶ ಕಾಲಾವಧಿಯ ವ್ಯಾಪ್ತಿಯಿಂದ ಹೊರಗಿದೆ."
    },
    ml: {
        searchByDate: "തീയതി അനുസരിച്ച് ദശ തിരയുക",
        searchBtn: "തിരയുക",
        activeDasaOn: "-ൽ സജീവമായ ദശ",
        invalidDate: "ദയവായി സാധുവായ ഒരു തീയതി തിരഞ്ഞെടുക്കുക.",
        outOfRange: "തീയതി 120 വർഷത്തെ ദശാ സമയപരിധിക്ക് പുറത്താണ്."
    }
};

// Helper function to find active Dasa, Bhukti, Antara, and Sookshma at a specific date
function findActiveDasaPathAtDate(targetDate, dasaTimeline, birthDateStr) {
    // 1. Find Mahadasa (level 1)
    const mahadasa = dasaTimeline.find(p => {
        const start = new Date(p.start);
        const end = new Date(p.end);
        return targetDate >= start && targetDate < end;
    });
    if (!mahadasa) return null;
    
    // Normalize parent period for subperiod calculations
    const mdObj = {
        lord: mahadasa.lord,
        start: new Date(mahadasa.start).toISOString(),
        end: new Date(mahadasa.end).toISOString(),
        duration: mahadasa.duration,
        startAge: mahadasa.startAge,
        endAge: mahadasa.endAge,
        virtualStart: mahadasa.virtualStart ? new Date(mahadasa.virtualStart).toISOString() : undefined,
        fullDuration: mahadasa.fullDuration
    };
    
    // 2. Find Bhukti (level 2)
    const bhuktis = calculateSubPeriods(mdObj, birthDateStr);
    const bhukti = bhuktis.find(p => {
        const start = new Date(p.start);
        const end = new Date(p.end);
        return targetDate >= start && targetDate < end;
    });
    if (!bhukti) return [mdObj];
    
    // 3. Find Antara (level 3)
    const antaras = calculateSubPeriods(bhukti, birthDateStr);
    const antara = antaras.find(p => {
        const start = new Date(p.start);
        const end = new Date(p.end);
        return targetDate >= start && targetDate < end;
    });
    if (!antara) return [mdObj, bhukti];
    
    // 4. Find Sookshma (level 4)
    const sookshmas = calculateSubPeriods(antara, birthDateStr);
    const sookshma = sookshmas.find(p => {
        const start = new Date(p.start);
        const end = new Date(p.end);
        return targetDate >= start && targetDate < end;
    });
    if (!sookshma) return [mdObj, bhukti, antara];
    
    return [mdObj, bhukti, antara, sookshma];
}

// Helper function to format geocoding result display name cleanly (removing full address info)
const formatCleanPlaceLabel = (item) => {
    const addr = item.address || {};
    const placeName = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || addr.hamlet || addr.locality || item.name || item.display_name.split(',')[0];
    const postcode = addr.postcode || '';
    const stateName = addr.state || addr.region || addr.county || addr.district || '';
    const countryName = addr.country || '';

    let placeStr = placeName;
    if (postcode) {
        placeStr += ` (${postcode})`;
    }

    let label = placeStr;
    if (stateName && stateName !== placeName) {
        label += `, ${stateName}`;
    }
    if (countryName && countryName !== stateName && countryName !== placeName) {
        label += `, ${countryName}`;
    }
    return label;
};

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
    selectedCity: null,
    chartStyle: 'south'
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
state.selectedCity = null; // Ensure birth place is blank on initial load/refresh

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
    
    // Save only language and chart style preferences (not birth details history) to protect privacy
    const stateToSave = {
        lang: state.lang,
        chartStyle: state.chartStyle
    };
    localStorage.setItem('horoscope_app_state', JSON.stringify(stateToSave));
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('horoscope_app_theme', isLight ? 'light' : 'dark');
    
    let content = '';
    
    if (state.view === 'form') {
        content = renderFormView(t);
    } else {
        content = renderResultsView(t);
    }
    
    const logoSubtitles = {
        en: 'Accurate Vedic Astrology Predictions',
        ta: 'துல்லியமான வேத ஜோதிட கணிப்புகள்',
        hi: 'सटीक वैदिक ज्योतिष भविष्यवाणियां',
        te: 'ఖచ్చితమైన వేద జ్యోతిష్య అంచనాలు',
        kn: 'ನಿಖರವಾದ ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಮುನ್ಸೂಚನೆಗಳು',
        ml: 'കൃത്യമായ വേദ ജ്യോതിഷ പ്രവചനങ്ങൾ'
    };
    const footerTexts = {
        en: 'Vedic Astrology Calculations. All Rights Reserved.',
        ta: 'வேದ ஜோதிட கணிப்புகள். அனைத்து உரிమைகளும் பாதுகாக்கப்பட்டவை.',
        hi: 'वैदिक ज्योतिष गणना। सर्वाधिकार सुरक्षित।',
        te: 'వేద జ్యోతిష్య లెక్కలు. అన్ని హక్కులూ ప్రత్యేకించబడినవి.',
        kn: 'ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ಲೆಕ್ಕಾಚಾರಗಳು. ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.',
        ml: 'വേദ ജ്യോതിഷ കണക്കുകൂട്ടലുകൾ. എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം.'
    };

    root.innerHTML = `
        <header>
            <div class="logo-container" id="header-logo" style="cursor: pointer;">
                <h1>Online Horoscope Calculator</h1>
                <p>${logoSubtitles[state.lang] || logoSubtitles['en']}</p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <button class="lang-btn" id="toggle-theme-btn" style="width: 38px; height: 38px; border-radius: 0; padding: 0; display: inline-flex; align-items: center; justify-content: center;" title="${isLight ? 'Dark Mode' : 'Light Mode'}">
                    ${isLight ? 
                        `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" stroke-linecap="round" stroke-linejoin="round"></path></svg>` : 
                        `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
                    }
                </button>
                <select class="lang-btn" id="lang-select" style="cursor: pointer; padding: 0 10px; height: 38px;">
                    <option value="en" ${state.lang === 'en' ? 'selected' : ''}>English</option>
                    <option value="ta" ${state.lang === 'ta' ? 'selected' : ''}>தமிழ்</option>
                    <option value="hi" ${state.lang === 'hi' ? 'selected' : ''}>हिन्दी</option>
                    <option value="te" ${state.lang === 'te' ? 'selected' : ''}>తెలుగు</option>
                    <option value="kn" ${state.lang === 'kn' ? 'selected' : ''}>ಕನ್ನಡ</option>
                    <option value="ml" ${state.lang === 'ml' ? 'selected' : ''}>മലയാളം</option>
                </select>
            </div>
        </header>
        <main>
            ${content}
        </main>
        <footer>
            <p>© ${new Date().getFullYear()} ${footerTexts[state.lang] || footerTexts['en']}</p>
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
        <div class="card" id="form-card" style="max-width: 680px; margin: 0 auto;">
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
                        <div style="position: relative; display: flex; width: 100%;">
                            <input type="text" id="input-place" placeholder="${t.birthPlacePlaceholder}" autocomplete="off" required style="padding-right: 40px;">
                            <button type="button" id="clear-place-btn">✕</button>
                        </div>
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
    `;
}

// Render Results View
function renderResultsView(t) {
    const data = state.horoscope;
    const details = data.birthDetails;
    const dst = dasaSearchTranslations[state.lang] || dasaSearchTranslations['en'];
    
    // Get formatted Date-Time representation for the chart center
    const genderLabel = details.gender === 'male' ? `${t.male} / Male` : `${t.female} / Female`;
    const birthTimeDisplay = details.timeStr.replace(/:00$/, '') + ' ' + details.ampm.toLowerCase();
    
    const formattedDate = details.dateStr.split('-').reverse().join('-');
    const dtDisplay = `${formattedDate} - ${birthTimeDisplay}`;
    
    const latDirectionText = details.lat >= 0 ? 'N' : 'S';
    const lonDirectionText = details.lon >= 0 ? 'E' : 'W';
    const latDisplay = `Lat: ${Math.abs(details.lat).toFixed(2)} ${latDirectionText}`;
    const lonDisplay = `Lon: ${Math.abs(details.lon).toFixed(2)} ${lonDirectionText}`;
    const cityText = details.city;
    
    // Star details
    const moonStarTamilName = t.stars[data.panchang.starIdx];
    const moonStarEnglishName = translations['en'].stars[data.panchang.starIdx];
    const starPadaText = state.lang === 'ta' ? `${moonStarTamilName}-${data.panchang.pada}` : `${moonStarEnglishName}-${data.panchang.pada}`;
    
    // Generate charts for screen
    const rasiGridHtml = state.chartStyle === 'north'
        ? renderNorthChartGrid(data.planets, false, t)
        : renderChartGrid(data.planets, false, t, starPadaText, genderLabel, dtDisplay, latDisplay, lonDisplay, cityText);
    const navamsamGridHtml = state.chartStyle === 'north'
        ? renderNorthChartGrid(data.planets, true, t)
        : renderChartGrid(data.planets, true, t, starPadaText, genderLabel, dtDisplay, latDisplay, lonDisplay, cityText);
    
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
        
        const isRetro = p.isRetro && p.name !== 'Lagna' && p.name !== 'Mandi';
        const pDisplayTamil = pTamilName + (isRetro ? ' (வ)' : '');
        const pDisplayEnglish = pEnglishName + (isRetro ? ' (R)' : '');
        
        tableRows += `
            <tr>
                <td>
                    <div class="planet-tamil-name">${pDisplayTamil}</div>
                    <div class="planet-english-name">${pDisplayEnglish}</div>
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
    
    // --- PRINT CALCULATIONS & HTML GENERATION ---
    const birthDateObj = new Date(details.dateStr + 'T' + details.timeStr);
    
    // 1. Timezone offset string
    const tzOffsetMinutesVal = -birthDateObj.getTimezoneOffset();
    const offsetHr = Math.floor(Math.abs(tzOffsetMinutesVal) / 60);
    const offsetMin = Math.abs(tzOffsetMinutesVal) % 60;
    const offsetSignSymbol = tzOffsetMinutesVal >= 0 ? '+' : '-';
    const timezoneOffsetStr = `${offsetSignSymbol}${offsetHr}.${offsetMin.toString().padStart(2, '0')} GMT`;
    
    // 2. Tamil Date (Calculated from Sun's absolute longitude)
    const sunPlanet = data.planets.find(p => p.name === 'Sun');
    const sunLonVal = sunPlanet ? sunPlanet.longitude : 0;
    const sunSignIdx = Math.floor(sunLonVal / 30);
    const tamilMonths = ["சித்திரை", "வைகாசி", "ஆனி", "ஆடி", "ஆவணி", "புரட்டாசி", "ஐப்பசி", "கார்த்திகை", "மார்கழி", "தை", "மாசி", "பங்குனி"];
    const tamilMonthName = tamilMonths[sunSignIdx];
    const tamilDate = Math.floor(sunLonVal % 30) + 1;
    
    let yearCE = birthDateObj.getFullYear();
    const monthVal = birthDateObj.getMonth();
    const dateVal = birthDateObj.getDate();
    if (monthVal < 3 || (monthVal === 3 && dateVal < 14)) {
        yearCE--;
    }
    const tamilYears = [
        "பிரபவ", "விபவ", "சுக்ல", "பிரமோதூத", "பிரசோற்பத்தி", "ஆங்கீரச", "ஸ்ரீமுக", "பவ", "யுவ", "தாது",
        "ஈஸ்வர", "பகுதானிய", "பிரமாதி", "விக்ரம", "விஷு", "சித்திரபானு", "சுபானு", "தாரண", "பார்த்திப", "விய",
        "சர்வஜித்", "சர்வதாரி", "விரோதி", "விக்ருதி", "கர", "நந்தன", "விஜய", "ஜய", "மன்மத", "துன்முகி",
        "ஹேவிளம்பி", "விளம்பி", "விகாரி", "சார்வரி", "பிலவ", "சுபகிருது", "சோபகிருது", "குரோதி", "விசுவாசுவ", "பரபாவ",
        "பிலவங்க", "கீலக", "சௌமிய", "சாதாரண", "விரோதகிருது", "பரிதாபி", "பிரமாதீச", "ஆனந்த", "ராட்சஸ", "நள",
        "பிங்கள", "காளயுக்தி", "சித்தார்த்தி", "ரௌத்திரி", "துன்மதி", "துந்துபி", "ருத்ரோத்காரி", "ரக்தாட்சி", "குரோதன", "அக்ஷய"
    ];
    const tamilYearIdx = (yearCE - 1987 + 60) % 60;
    const tamilYearName = tamilYears[tamilYearIdx];
    const kaliYugaYear = yearCE + 3101;
    const tamilDateStr = `${tamilMonthName}-மீ ${tamilDate}-உ -${tamilYearName} வரு, கலி-${kaliYugaYear}`;
    
    // 3. Day of week in Tamil or English
    const tamilWeekdays = ["ஞாயிற்றுக்கிழமை", "திங்கட்கிழமை", "செவ்வாய்க்கிழமை", "புதன்கிழமை", "வியாழக்கிழமை", "வெள்ளிக்கிழமை", "சனிக்கிழமை"];
    const englishWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const sunriseDate = new Date(data.panchang.sunrise);
    const sunsetDate = new Date(data.panchang.sunset);
    
    let birthDayIdx = birthDateObj.getDay();
    if (birthDateObj < sunriseDate) {
        birthDayIdx = (birthDayIdx + 6) % 7;
    }
    const dayNameStr = state.lang === 'ta' ? tamilWeekdays[birthDayIdx] : englishWeekdays[birthDayIdx];
    
    // 4. Coordinates formatted
    const latDir = details.lat >= 0 ? 'N' : 'S';
    const lonDir = details.lon >= 0 ? 'E' : 'W';
    const latDisplayVal = `${Math.abs(details.lat).toFixed(2)} ${latDir}`;
    const lonDisplayVal = `${Math.abs(details.lon).toFixed(2)} ${lonDir}`;
    
    // 5. Sunrise and Sunset times formatted
    const formatTimeHM = (d) => {
        const h = d.getHours().toString().padStart(2, '0');
        const m = d.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    };
    const sunriseHM = formatTimeHM(sunriseDate);
    const sunsetHM = formatTimeHM(sunsetDate);
    
    // 6. Dinamana (Ahas)
    const ahasMs = sunsetDate.getTime() - sunriseDate.getTime();
    const ahasHours = ahasMs / (3600 * 1000);
    const ahasNaazhigai = ahasHours * 2.5;
    const ahasN = Math.floor(ahasNaazhigai);
    const ahasV = Math.floor((ahasNaazhigai - ahasN) * 60);
    const ahasDisplay = `${ahasN}:${ahasV.toString().padStart(2, '0')} நா.வி`;
    
    const sunriseTamilTime = "59:50 நா.வி";
    const sunsetTamilTime = `${ahasN}:${(ahasV + 10).toString().padStart(2, '0')} நா.வி`;
    
    // 7. Udayadhi Naazhigai & Tamil Time
    let referenceSunrise = sunriseDate;
    if (birthDateObj < sunriseDate) {
        referenceSunrise = new Date(sunriseDate.getTime() - 24 * 3600 * 1000);
    }
    const elapsedMs = birthDateObj.getTime() - referenceSunrise.getTime();
    const elapsedHours = elapsedMs / (3600 * 1000);
    const udayadhiNaazhigai = elapsedHours * 2.5;
    const udayadhiN = Math.floor(udayadhiNaazhigai);
    const udayadhiV = Math.floor((udayadhiNaazhigai - udayadhiN) * 60);
    const udayadhiDisplay = `${udayadhiN}:${udayadhiV.toString().padStart(2, '0')} நா.வி (${elapsedHours.toFixed(2)} மணி)`;
    const tamilTimeDisplay = `${udayadhiN}:${udayadhiV.toString().padStart(2, '0')} நா.வி`;
    
    // 8. LMT (Local Mean Time)
    const stdMeridian = (tzOffsetMinutesVal / 60) * 15;
    const lonDiff = details.lon - stdMeridian;
    const lmtOffsetMinutes = lonDiff * 4;
    const lmtDate = new Date(birthDateObj.getTime() + lmtOffsetMinutes * 60 * 1000);
    const lmtHM = formatTimeHM(lmtDate) + ":" + lmtDate.getSeconds().toString().padStart(2, '0');
    
    // 9. Birth Hora
    const horaIdx = Math.floor(elapsedHours) % 24;
    const weekdayLords = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const startLord = weekdayLords[birthDayIdx];
    const horaCycle = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
    const startLordIdx = horaCycle.indexOf(startLord);
    const currentHoraLord = horaCycle[(startLordIdx + horaIdx) % 7];
    const horaLordTamil = t.planets[currentHoraLord] || currentHoraLord;
    const horaGender = (currentHoraLord === 'Moon' || currentHoraLord === 'Venus') 
        ? (state.lang === 'ta' ? 'பெண்' : 'Female') 
        : (state.lang === 'ta' ? 'ஆண்' : 'Male');
        
    // 10. Separated Tithi and Paksha
    const tithiFull = getTithiName(data.panchang.tithiIdx, state.lang);
    const tithiNameOnly = tithiFull.includes(' - ') ? tithiFull.split(' - ')[1] : tithiFull;
    const pakshaName = data.panchang.tithiIdx < 15 
        ? (state.lang === 'ta' ? "சுக்கில ( வளர்பிறை )" : "Shukla Paksha (Waxing)") 
        : (state.lang === 'ta' ? "கிருஷ்ண ( தேய்பிறை )" : "Krishna Paksha (Waning)");
        
    // 11. Print Rasi and Navamsam HTML (always South Indian style for print formatting)
    const printRasiGridHtml = renderChartGrid(data.planets, false, t, starPadaText, genderLabel, dtDisplay, latDisplay, lonDisplay, cityText);
    const printNavamsamGridHtml = renderChartGrid(data.planets, true, t, starPadaText, genderLabel, dtDisplay, latDisplay, lonDisplay, cityText);
    
    // 12. Print Table Rows
    let printTableRows = '';
    const rasiLords = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
    const starLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    
    data.planets.forEach(p => {
        const pTamilName = t.planets[p.name];
        const pEnglishName = translations['en'].planets[p.name];
        const planetDisplayName = state.lang === 'ta' ? pTamilName : pEnglishName;
        
        const relativeLon = p.longitude % 30;
        const deg = Math.floor(relativeLon);
        const minTotal = (relativeLon - deg) * 60;
        const min = Math.floor(minTotal);
        const sec = Math.floor((minTotal - min) * 60);
        const signLonStr = `${deg}° ${min.toString().padStart(2, '0')}' ${sec.toString().padStart(2, '0')}"`;
        
        const absDeg = Math.floor(p.longitude);
        const absMinTotal = (p.longitude - absDeg) * 60;
        const absMin = Math.floor(absMinTotal);
        const absSec = Math.floor((absMinTotal - absMin) * 60);
        const absLonStr = `${absDeg}° ${absMin.toString().padStart(2, '0')}' ${absSec.toString().padStart(2, '0')}"`;
        
        const rasiName = state.lang === 'ta' ? t.signs[signKeys[p.rasiIdx]] : translations['en'].signs[signKeys[p.rasiIdx]];
        const rasiLordName = state.lang === 'ta' ? t.planets[rasiLords[p.rasiIdx]] : translations['en'].planets[rasiLords[p.rasiIdx]];
        const starName = state.lang === 'ta' ? t.stars[p.starIdx] : translations['en'].stars[p.starIdx];
        const starLordName = state.lang === 'ta' ? t.planets[starLords[p.starIdx % 9]] : translations['en'].planets[starLords[p.starIdx % 9]];
        
        let statusVal = '-';
        if (p.isRetro && p.name !== 'Lagna' && p.name !== 'Mandi') {
            statusVal = state.lang === 'ta' ? 'வ' : 'R';
        }
        
        printTableRows += `
            <tr>
                <td><strong>${planetDisplayName}</strong></td>
                <td>${signLonStr}</td>
                <td>${starName}</td>
                <td>${p.pada}</td>
                <td>${starLordName}</td>
                <td>${absLonStr}</td>
                <td>${rasiName}</td>
                <td>${rasiLordName}</td>
                <td>${statusVal}</td>
            </tr>
        `;
    });
    
    // 13. Dasa Balance and Active Dasa Bhukti strings
    const firstPeriod = data.dasaTimeline[0];
    const firstPeriodEnd = new Date(firstPeriod.end);
    const firstDasaAge = getAgeYMD(birthDateObj, firstPeriodEnd);
    const lordName = state.lang === 'ta' ? t.planets[firstPeriod.lord] : translations['en'].planets[firstPeriod.lord];
    
    const dasaBalanceStr = state.lang === 'ta'
        ? `${lordName} திசை: ${firstDasaAge.years} ஆண்டு, ${firstDasaAge.months} மாதம், ${firstDasaAge.days} நாள். ${formatDate(firstPeriodEnd)} வரை`
        : `${lordName} Dasa: ${firstDasaAge.years} Years, ${firstDasaAge.months} Months, ${firstDasaAge.days} Days. Up to ${formatDate(firstPeriodEnd)}`;
        
    const activePath = findActiveDasaPathAtDate(new Date(), data.dasaTimeline, details.dateStr + 'T' + details.timeStr);
    let currentDasaBhuktiStr = '-';
    if (activePath && activePath.length >= 2) {
        const activeMD = activePath[0];
        const activeBhukti = activePath[1];
        const mdLord = state.lang === 'ta' ? t.planets[activeMD.lord] : translations['en'].planets[activeMD.lord];
        const bhLord = state.lang === 'ta' ? t.planets[activeBhukti.lord] : translations['en'].planets[activeBhukti.lord];
        
        const bhuktis = calculateSubPeriods(activeMD, details.dateStr + 'T' + details.timeStr);
        const activeBhuktiIdx = bhuktis.findIndex(b => b.lord === activeBhukti.lord && new Date(b.start).getTime() === new Date(activeBhukti.start).getTime());
        let nextBhuktiStr = '';
        if (activeBhuktiIdx !== -1 && activeBhuktiIdx + 1 < bhuktis.length) {
            const nextBh = bhuktis[activeBhuktiIdx + 1];
            const nextLordName = state.lang === 'ta' ? t.planets[nextBh.lord] : translations['en'].planets[nextBh.lord];
            nextBhuktiStr = state.lang === 'ta'
                ? `. இதற்கு மேல் ${mdLord} திசையில் ${nextLordName} புத்தி.`
                : `. Followed by ${nextLordName} Bhukti in ${mdLord} Dasa.`;
        } else {
            const nextMDIdx = data.dasaTimeline.findIndex(m => m.lord === activeMD.lord) + 1;
            if (nextMDIdx < data.dasaTimeline.length) {
                const nextMD = data.dasaTimeline[nextMDIdx];
                const nextMDBhuktis = calculateSubPeriods(nextMD, details.dateStr + 'T' + details.timeStr);
                const nextBh = nextMDBhuktis[0];
                const nextMDLord = state.lang === 'ta' ? t.planets[nextMD.lord] : translations['en'].planets[nextMD.lord];
                const nextLordName = state.lang === 'ta' ? t.planets[nextBh.lord] : translations['en'].planets[nextBh.lord];
                nextBhuktiStr = state.lang === 'ta'
                    ? `. இதற்கு மேல் ${nextMDLord} திசையில் ${nextLordName} புத்தி.`
                    : `. Followed by ${nextLordName} Bhukti in ${nextMDLord} Dasa.`;
            }
        }
        
        currentDasaBhuktiStr = state.lang === 'ta'
            ? `${mdLord} திசையில் ${bhLord} புத்தி ${formatDate(new Date(activeBhukti.start))} முதல் ${formatDate(new Date(activeBhukti.end))} வரை${nextBhuktiStr}`
            : `${mdLord} Dasa - ${bhLord} Bhukti from ${formatDate(new Date(activeBhukti.start))} to ${formatDate(new Date(activeBhukti.end))}${nextBhuktiStr}`;
    }
    
    return `
        <!-- SCREEN VIEW -->
        <div class="screen-only results-container">
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
                <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
                    <button class="lang-btn" id="toggle-chart-style-btn" style="padding: 6px 12px; font-size: 13px;">
                        ${state.chartStyle === 'north' ? t.actions.toggleSouthStyle : t.actions.toggleNorthStyle}
                    </button>
                </div>
                <div class="charts-grid-wrapper">
                    <!-- Rasi Chart -->
                    <div class="chart-box">
                        <div class="chart-title-header">${state.lang === 'ta' ? 'இராசி கட்டம் (Rasi Chart)' : 'Rasi Chart (D-1)'}</div>
                        ${state.chartStyle === 'north'
                            ? rasiGridHtml
                            : `<div class="chart-grid rasi-theme">${rasiGridHtml}</div>`
                        }
                    </div>
                    
                    <!-- Navamsam Chart -->
                    <div class="chart-box">
                        <div class="chart-title-header">${state.lang === 'ta' ? 'நவாம்சம் கட்டம் (Navamsam Chart)' : 'Navamsam Chart (D-9)'}</div>
                        ${state.chartStyle === 'north'
                            ? navamsamGridHtml
                            : `<div class="chart-grid nav-theme">${navamsamGridHtml}</div>`
                        }
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
                
                <!-- Dasa Search Widget -->
                <div class="dasa-search-widget" style="margin-bottom: 25px; padding: 20px; background: rgba(0, 0, 0, 0.05); border: 1px solid var(--card-border); display: flex; flex-direction: column; gap: 15px;">
                    <div style="font-weight: 600; font-size: 15px; color: var(--accent);">
                        ${dst.searchByDate}
                    </div>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                        <input type="date" id="dasa-search-input" style="max-width: 250px; height: 42px; padding: 8px 12px; border-radius: 0;">
                        <button class="btn-primary" id="dasa-search-submit-btn" style="padding: 10px 24px; font-size: 14px; height: 42px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                            <span>${dst.searchBtn}</span>
                        </button>
                    </div>
                    <div id="dasa-search-results-box" style="display: none; padding: 15px; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--card-border); border-radius: 0;">
                        <!-- Result breadcrumb path goes here -->
                    </div>
                </div>
                
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
        
        <!-- PRINT-ONLY HIGH-FIDELITY LAYOUT (MATCHING REFERENCE SCREENSHOT) -->
        <div class="print-only print-horoscope-page">
            <div class="print-page-border">
                <!-- Auspicious starting symbol -->
                <div class="print-auspicious-symbol">உ</div>
                <h1 class="print-page-title">${state.lang === 'ta' ? 'ஜாதக கணிதம்' : 'Horoscope Calculations'}</h1>
                
                <!-- Birth details key-value grid -->
                <div class="print-details-grid">
                    <!-- Column 1 -->
                    <div class="print-details-col">
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'பெயர்' : 'Name'}</span><span class="val">: ${details.name}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'பிறந்த தேதி' : 'Date of Birth'}</span><span class="val">: ${details.dateStr.split('-').reverse().join('-')}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'பிறந்த நேரம்' : 'Time of Birth'}</span><span class="val">: ${details.timeStr.replace(/:00$/, '')} ${details.ampm}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'பாலினம்' : 'Gender'}</span><span class="val">: ${details.gender === 'male' ? (state.lang === 'ta' ? 'ஆண் / Male' : 'Male') : (state.lang === 'ta' ? 'பெண் / Female' : 'Female')}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'பிறந்த கிழமை' : 'Birth Day'}</span><span class="val">: ${dayNameStr}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'ஜென்ம நட்சத்திரம்' : 'Birth Star'}</span><span class="val">: ${t.stars[data.panchang.starIdx]}-${data.panchang.pada} ${state.lang === 'ta' ? 'ஆம் பாதம்' : 'Pada'}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'ஜென்ம இராசி' : 'Birth Rasi'}</span><span class="val">: ${t.signs[signKeys[data.panchang.rasiIdx]]}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'ஜென்ம லக்கினம்' : 'Lagna'}</span><span class="val">: ${t.signs[signKeys[getRasiSignIndex(data.lagnaLon)]]}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'பொதுநேரம், திருத்தம்' : 'Timezone Offset'}</span><span class="val">: ${timezoneOffsetStr}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'தமிழ் நேரம்' : 'Tamil Time'}</span><span class="val">: ${tamilTimeDisplay}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'பிறந்த ஊர்' : 'Birth Place'}</span><span class="val">: ${details.city}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'சூரிய உதயம்' : 'Sunrise'}</span><span class="val">: ${sunriseHM}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'சூரிய அஸ்தமனம்' : 'Sunset'}</span><span class="val">: ${sunsetHM}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'சூ.உ. தமிழ் நேரம்' : 'Sunrise Tamil Time'}</span><span class="val">: ${sunriseTamilTime}</span></div>
                    </div>
                    
                    <!-- Column 2 -->
                    <div class="print-details-col">
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'சூ-அ தமிழ் நேரம்' : 'Sunset Tamil Time'}</span><span class="val">: ${sunsetTamilTime}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'அகஸ்' : 'Ahas (Dinamana)'}</span><span class="val">: ${ahasDisplay}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'அயனாம்சம்' : 'Ayanamsa'}</span><span class="val">: -${data.ayanamsa.toFixed(2)} (${state.lang === 'ta' ? 'லஹரி' : 'Lahiri'})</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'தமிழ் தேதி' : 'Tamil Date'}</span><span class="val">: ${tamilDateStr}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'உதயாதி நாழிகை' : 'Udayadhi Naazhigai'}</span><span class="val">: ${udayadhiDisplay}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'சுதேச மணி' : 'Local Mean Time (LMT)'}</span><span class="val">: ${lmtHM}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'நட்சத்திர ஹோரை' : 'Star Hora'}</span><span class="val">: ${formatTimeHM(new Date(birthDateObj.getTime() - 25 * 60 * 1000))}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'அட்சாம்சம்' : 'Latitude'}</span><span class="val">: ${latDisplayVal}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'தீர்க்காம்சம்' : 'Longitude'}</span><span class="val">: ${lonDisplayVal}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'திதி' : 'Tithi'}</span><span class="val">: ${tithiNameOnly}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'ஜனன ஹோரை' : 'Birth Hora'}</span><span class="val">: ${horaLordTamil} (${horaGender})</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'பட்சம்' : 'Paksha'}</span><span class="val">: ${pakshaName}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'கரணம்' : 'Karana'}</span><span class="val">: ${getKaranaName(data.panchang.karanaIdx, state.lang)}</span></div>
                        <div class="print-detail-item"><span class="label">${state.lang === 'ta' ? 'யோகம்' : 'Yoga'}</span><span class="val">: ${getYogaName(data.panchang.yogaIdx, state.lang)}</span></div>
                    </div>
                </div>
                
                <!-- Divider -->
                <hr class="print-divider">
                
                <!-- Charts Grid (Rasi & Navamsam side-by-side) -->
                <div class="print-charts-grid">
                    <div class="print-chart-box">
                        <div class="print-chart-title">${state.lang === 'ta' ? 'இராசி' : 'Rasi Chart'}</div>
                        <div class="chart-grid rasi-theme">${printRasiGridHtml}</div>
                    </div>
                    <div class="print-chart-box">
                        <div class="print-chart-title">${state.lang === 'ta' ? 'நவாம்சம்' : 'Navamsam Chart'}</div>
                        <div class="chart-grid nav-theme">${printNavamsamGridHtml}</div>
                    </div>
                </div>
                
                <!-- Divider -->
                <hr class="print-divider">
                
                <!-- Planetary Longitudes Table -->
                <div class="print-table-container">
                    <table class="print-planet-table">
                        <thead>
                            <tr>
                                <th>${state.lang === 'ta' ? 'கிரகம்' : 'Planet'}</th>
                                <th>${state.lang === 'ta' ? 'பா-கலை' : 'Sign Longitude'}</th>
                                <th>${state.lang === 'ta' ? 'நட்சத்திரம்' : 'Star'}</th>
                                <th>${state.lang === 'ta' ? 'ந.பாதம்' : 'Pada'}</th>
                                <th>${state.lang === 'ta' ? 'சாரம்' : 'Star Lord'}</th>
                                <th>${state.lang === 'ta' ? 'நிராயண' : 'Longitude'}</th>
                                <th>${state.lang === 'ta' ? 'ராசி' : 'Rasi'}</th>
                                <th>${state.lang === 'ta' ? 'ராசி அதிபதி' : 'Rasi Lord'}</th>
                                <th>${state.lang === 'ta' ? 'வேகம்' : 'Status'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${printTableRows}
                        </tbody>
                    </table>
                </div>
                
                <!-- Dasa Balance Info -->
                <div class="print-dasa-balance">
                    <div><strong>${state.lang === 'ta' ? 'பிறந்த கால திசை இருப்பு (ஜனன கால தசாசேஷம்)' : 'Dasa Balance at Birth'}:-</strong> ${dasaBalanceStr}</div>
                    <div style="margin-top: 5px;"><strong>${state.lang === 'ta' ? 'நடப்பு தசா புத்தி' : 'Current Dasa Bhukti'}:-</strong> ${currentDasaBhuktiStr}</div>
                </div>
                
                <!-- Footer with QR and capsule -->
                <div class="print-footer">
                    <div class="print-footer-left">
                        <div class="print-capsule">
                            To Check Marriage Match, Horoscope - Sriranga Jothida Nilayam - Whatsapp / Call : +91 9442054021
                        </div>
                        <div class="print-attribution">
                            This Jadhagam computed from SrirangamInfo.com Free online Jadhagam WEB-APP/ Software @ https://srirangaminfo.com/jathagam-tamil.php
                        </div>
                    </div>
                    <div class="print-footer-right">
                        <div class="print-qr-wrapper">
                            <img class="print-qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}" alt="QR Code">
                            <div class="print-qr-label">Jathgam More Details - Scan</div>
                        </div>
                    </div>
                </div>
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
// Render North Indian style chart using SVG
function renderNorthChartGrid(planets, isNavamsam, t) {
    const lagnaPlanet = planets.find(p => p.name === 'Lagna');
    const lagnaSignIdx = lagnaPlanet ? (isNavamsam ? lagnaPlanet.navamsamIdx : lagnaPlanet.rasiIdx) : 0;
    
    const houseConfigs = [
        { houseNum: 1,  rx: 200, ry: 75,  px: 200, py: 120 },
        { houseNum: 2,  rx: 130, ry: 45,  px: 85,  py: 30 },
        { houseNum: 3,  rx: 45,  ry: 130, px: 30,  py: 85 },
        { houseNum: 4,  rx: 125, ry: 200, px: 75,  py: 200 },
        { houseNum: 5,  rx: 45,  ry: 270, px: 30,  py: 315 },
        { houseNum: 6,  rx: 130, ry: 355, px: 85,  py: 370 },
        { houseNum: 7,  rx: 200, ry: 325, px: 200, py: 280 },
        { houseNum: 8,  rx: 270, ry: 355, px: 315, py: 370 },
        { houseNum: 9,  rx: 355, ry: 270, px: 370, py: 315 },
        { houseNum: 10, rx: 275, ry: 200, px: 325, py: 200 },
        { houseNum: 11, rx: 355, ry: 130, px: 370, py: 85 },
        { houseNum: 12, rx: 270, ry: 45,  px: 315, py: 30 }
    ];
    
    let textElements = '';
    
    houseConfigs.forEach(cfg => {
        const signIdx = (lagnaSignIdx + cfg.houseNum - 1) % 12;
        const rashiNumber = signIdx + 1;
        
        const matchingPlanets = planets.filter(p => {
            const sign = isNavamsam ? p.navamsamIdx : p.rasiIdx;
            return sign === signIdx;
        });
        
        const planetList = matchingPlanets.map(p => t.planetsShort[p.name]).join(' ');
        
        textElements += `
            <text x="${cfg.rx}" y="${cfg.ry}" class="north-rashi-num">${rashiNumber}</text>
            <text x="${cfg.px}" y="${cfg.py}" class="north-planet-list">${planetList}</text>
        `;
    });
    
    const themeClass = isNavamsam ? 'nav-theme' : 'rasi-theme';
    
    return `
        <svg viewBox="0 0 400 400" class="north-chart-svg ${themeClass}">
            <rect x="2" y="2" width="396" height="396" class="chart-outer-rect" />
            <line x1="2" y1="2" x2="398" y2="398" class="chart-line" />
            <line x1="398" y1="2" x2="2" y2="398" class="chart-line" />
            <polygon points="200,2 398,200 200,398 2,200" class="chart-polygon" />
            ${textElements}
        </svg>
    `;
}

function getPlanetShorthand(p, t, lang) {
    let pShort = t.planetsShort[p.name];
    if (p.isRetro && p.name !== 'Rahu' && p.name !== 'Ketu' && p.name !== 'Lagna' && p.name !== 'Mandi') {
        pShort += lang === 'ta' ? ' (வ)' : ' (R)';
    }
    return pShort;
}

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
            return sign === cell.signIdx;
        });
        
        // Generate planetary degree label (only for Rasi chart, in top-left)
        let degreeLabelHtml = '';
        if (!isNavamsam) {
            const lines = matchingPlanets.map(p => {
                const pShort = getPlanetShorthand(p, t, state.lang);
                const relativeLon = p.longitude % 30;
                return `${pShort}-${relativeLon.toFixed(2)}`;
            });
            degreeLabelHtml = `<div class="cell-degree-info">${lines.join('\n')}</div>`;
        }
        
        // Generate list of planet shorthands in center of cell
        let planetListHtml = '';
        matchingPlanets.forEach(p => {
            const pShort = getPlanetShorthand(p, t, state.lang);
            planetListHtml += `<div class="cell-planet-item">${pShort}</div>`;
        });
        
        // House numbers (relative to Lagna, clockwise starting from Lagna = 1)
        // Only display house numbers on the Rasi chart
        let houseNumHtml = '';
        if (!isNavamsam) {
            const houseNum = ((cell.signIdx - lagnaSignIdx + 12) % 12) + 1;
            houseNumHtml = `<div class="cell-house-num">${houseNum}</div>`;
        }
        
        // Styles for layout grid placement
        const style = `grid-row: ${cell.row}; grid-column: ${cell.col};`;
        
        const isLagnaCell = cell.signIdx === lagnaSignIdx;
        let cellClass = isLagnaCell ? 'chart-cell lagna-highlight' : 'chart-cell';
        if (isLagnaCell) {
            let cornerClass = '';
            if (cell.row === 1) {
                cornerClass = cell.col <= 2 ? 'lagna-tl' : 'lagna-tr';
            } else if (cell.row === 4) {
                cornerClass = cell.col <= 2 ? 'lagna-bl' : 'lagna-br';
            } else if (cell.col === 1) {
                cornerClass = cell.row <= 2 ? 'lagna-tl' : 'lagna-bl';
            } else {
                cornerClass = cell.row <= 2 ? 'lagna-tr' : 'lagna-br';
            }
            cellClass += ' ' + cornerClass;
        }
        
        cellsHtml += `
            <div class="${cellClass}" style="${style}">
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

    // 1. Language Selection Dropdown
    const langSelect = document.querySelector('#lang-select');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            state.lang = e.target.value;
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
        let debounceTimer;
        if (placeInput && suggestionsList) {
            placeInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                suggestionsList.innerHTML = '';
                
                if (query.length < 2) {
                    suggestionsList.style.display = 'none';
                    return;
                }
                
                suggestionsList.innerHTML = '';
                
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=25&addressdetails=1`)
                        .then(res => res.json())
                        .then(data => {
                            // If user cleared query in the meantime
                            if (placeInput.value.trim().length < 2) {
                                suggestionsList.innerHTML = '';
                                suggestionsList.style.display = 'none';
                                return;
                            }
                            
                            const itemsToShow = [];
                            
                            // Add Nominatim results
                            if (data && data.length > 0) {
                                // Filter Nominatim results to include all actual places (cities, towns, villages, hamlets, administrative divisions, etc.)
                                const placeFiltered = data.filter(item => {
                                    const isExcluded = ['highway', 'shop', 'tourism', 'amenity', 'leisure', 'office', 'aeroway', 'historic', 'railway', 'man_made'].includes(item.class);
                                    return !isExcluded;
                                });

                                placeFiltered.slice(0, 10).forEach(item => {
                                    const cleanLabel = formatCleanPlaceLabel(item);
                                    itemsToShow.push({
                                        isApi: true,
                                        label: cleanLabel,
                                        cityData: {
                                            name: cleanLabel,
                                            tamilName: cleanLabel,
                                            lat: parseFloat(item.lat),
                                            lon: parseFloat(item.lon)
                                        }
                                    });
                                });
                            }
                            
                            // If API has items, clear local preview and show API results
                            if (itemsToShow.length > 0) {
                                suggestionsList.innerHTML = '';
                                itemsToShow.forEach(item => {
                                    const li = document.createElement('li');
                                    li.textContent = item.label;
                                    li.addEventListener('click', () => {
                                        placeInput.value = item.label;
                                        state.selectedCity = item.cityData;
                                        suggestionsList.style.display = 'none';
                                    });
                                    suggestionsList.appendChild(li);
                                });
                                suggestionsList.style.display = 'block';
                            }
                        })
                        .catch(err => {
                            console.error("Nominatim API lookup failed", err);
                            // Fallback local results are already displaying instantly.
                        });
                }, 500);
            });
            
            // Clear input button handler
            const clearPlaceBtn = document.querySelector('#clear-place-btn');
            if (clearPlaceBtn && placeInput) {
                const toggleClearBtn = () => {
                    clearPlaceBtn.style.display = placeInput.value.trim() !== '' ? 'flex' : 'none';
                };
                placeInput.addEventListener('input', toggleClearBtn);
                clearPlaceBtn.addEventListener('click', () => {
                    placeInput.value = '';
                    state.selectedCity = null;
                    suggestionsList.style.display = 'none';
                    clearPlaceBtn.style.display = 'none';
                    placeInput.focus();
                });
                toggleClearBtn();
            }
            
            // Hide list on click outside
            document.addEventListener('click', (e) => {
                if (e.target !== placeInput && e.target !== suggestionsList && e.target !== clearPlaceBtn) {
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
                const lat = state.selectedCity ? state.selectedCity.lat : null;
                const lon = state.selectedCity ? state.selectedCity.lon : null;
                const finalCityName = state.selectedCity ? state.selectedCity.name : '';
                
                if (!lat || !lon) {
                    alert(state.lang === 'ta' ? 'தயவுசெய்து பட்டியலிலிருந்து ஒரு செல்லுபடியாகும் பிறந்த இடத்தை தேர்ந்தெடுக்கவும்.' : 'Please select a valid birth place from the list.');
                    if (placeInput) placeInput.focus();
                    return;
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
                const lat = state.selectedCity ? state.selectedCity.lat : null;
                const lon = state.selectedCity ? state.selectedCity.lon : null;
                const finalCityName = state.selectedCity ? state.selectedCity.name : '';
                
                if (!lat || !lon) {
                    alert(state.lang === 'ta' ? 'தயவுசெய்து பட்டியலிலிருந்து ஒரு செல்லுபடியாகும் பிறந்த இடத்தை தேர்ந்தெடுக்கவும்.' : 'Please select a valid birth place from the list.');
                    if (placeInput) placeInput.focus();
                    return;
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
        
        // Toggle Chart Style Button
        const toggleChartStyleBtn = document.querySelector('#toggle-chart-style-btn');
        if (toggleChartStyleBtn) {
            toggleChartStyleBtn.addEventListener('click', () => {
                state.chartStyle = state.chartStyle === 'north' ? 'south' : 'north';
                render();
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

        // Dasa Search event listener
        const dasaSearchBtn = document.querySelector('#dasa-search-submit-btn');
        const dasaSearchInput = document.querySelector('#dasa-search-input');
        const dasaSearchResultsBox = document.querySelector('#dasa-search-results-box');
        
        if (dasaSearchBtn && dasaSearchInput && dasaSearchResultsBox) {
            dasaSearchBtn.addEventListener('click', () => {
                const targetDateVal = dasaSearchInput.value;
                const dst = dasaSearchTranslations[state.lang] || dasaSearchTranslations['en'];
                if (!targetDateVal) {
                    alert(dst.invalidDate);
                    return;
                }
                
                const targetDate = new Date(targetDateVal + 'T00:00:00');
                const birthDateStr = state.horoscope.birthDetails.dateStr + 'T' + state.horoscope.birthDetails.timeStr;
                const birthDate = new Date(birthDateStr);
                const timelineEnd = new Date(state.horoscope.dasaTimeline[state.horoscope.dasaTimeline.length - 1].end);
                
                if (targetDate < new Date(state.horoscope.birthDetails.dateStr + 'T00:00:00')) {
                    dasaSearchResultsBox.style.display = 'block';
                    dasaSearchResultsBox.innerHTML = `<span style="color: #ef4444; font-weight: 600;">${
                        state.lang === 'ta' ? 'தேதி பிறந்த தேதிக்கு முந்தையது!' : 'Selected date is before the birth date!'
                    }</span>`;
                    return;
                }
                
                if (targetDate > timelineEnd) {
                    dasaSearchResultsBox.style.display = 'block';
                    dasaSearchResultsBox.innerHTML = `<span style="color: #ef4444; font-weight: 600;">${dst.outOfRange}</span>`;
                    return;
                }
                
                const path = findActiveDasaPathAtDate(targetDate, state.horoscope.dasaTimeline, birthDateStr);
                if (!path || path.length === 0) {
                    dasaSearchResultsBox.style.display = 'block';
                    dasaSearchResultsBox.innerHTML = `<span style="color: #ef4444; font-weight: 600;">${dst.outOfRange}</span>`;
                    return;
                }
                
                // Format active Dasa path display
                const t = translations[state.lang];
                let pathHtml = `<div style="margin-bottom: 8px; font-weight: 600;">${dst.activeDasaOn} ${formatDate(targetDate)}:</div>`;
                pathHtml += `<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 15px;">`;
                
                const levelNames = [t.dasa.mahadasa, t.dasa.bhukti, t.dasa.antara, t.dasa.sookshma];
                const colors = ['#ca8a04', '#ea580c', '#3b82f6', '#10b981'];
                
                path.forEach((period, idx) => {
                    const lordTamilName = t.planets[period.lord] || period.lord;
                    const lordEnglishName = translations['en'].planets[period.lord] || period.lord;
                    const lordDisplay = state.lang === 'ta' ? `${lordTamilName} (${lordEnglishName})` : lordEnglishName;
                    
                    if (idx > 0) {
                        pathHtml += `<span style="color: var(--text-secondary); font-weight: bold;">➔</span>`;
                    }
                    
                    pathHtml += `
                        <div style="background: var(--input-bg); border: 1px solid var(--card-border); padding: 6px 12px; display: inline-flex; flex-direction: column; align-items: center;">
                            <span style="font-size: 11px; color: var(--text-secondary); text-transform: uppercase;">${levelNames[idx]}</span>
                            <span style="font-weight: 700; color: ${colors[idx] || 'var(--text-primary)'};">${lordDisplay}</span>
                        </div>
                    `;
                });
                
                pathHtml += `</div>`;
                dasaSearchResultsBox.style.display = 'block';
                dasaSearchResultsBox.innerHTML = pathHtml;
            });
        }
    }
}

// Start the app
init();
