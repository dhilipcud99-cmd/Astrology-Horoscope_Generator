import { Body, Ecliptic, GeoVector, AstroTime, SiderealTime, e_tilt, DEG2RAD, RAD2DEG, SearchRiseSet, Observer } from 'astronomy-engine';

// Autocomplete database of major cities in Tamil Nadu and India
export const cities = [
    { name: "Chennai", tamilName: "சென்னை", lat: 13.0827, lon: 80.2707 },
    { name: "Coimbatore", tamilName: "கோயம்புத்தூர்", lat: 11.0168, lon: 76.9558 },
    { name: "Madurai", tamilName: "மதுரை", lat: 9.9252, lon: 78.1198 },
    { name: "Tiruchirappalli", tamilName: "திருச்சிராப்பள்ளி", lat: 10.7905, lon: 78.7047 },
    { name: "Salem", tamilName: "சேலம்", lat: 11.6643, lon: 78.1460 },
    { name: "Tirunelveli", tamilName: "திருநெல்வேலி", lat: 8.7139, lon: 77.7567 },
    { name: "Thoothukudi", tamilName: "தூத்துக்குடி", lat: 8.7973, lon: 78.1348 },
    { name: "Vellore", tamilName: "வேலூர்", lat: 12.9165, lon: 79.1325 },
    { name: "Erode", tamilName: "ஈரோடு", lat: 11.3410, lon: 77.7172 },
    { name: "Thanjavur", tamilName: "தஞ்சாவூர்", lat: 10.7870, lon: 79.1378 },
    { name: "Cuddalore", tamilName: "கடலூர்", lat: 11.7562, lon: 79.7669 },
    { name: "Kanchipuram", tamilName: "காஞ்சிபுரம்", lat: 12.8342, lon: 79.7036 },
    { name: "Nagercoil", tamilName: "நாகர்கோவில்", lat: 8.1833, lon: 77.4119 },
    { name: "Dindigul", tamilName: "திண்டுக்கல்", lat: 10.3673, lon: 77.9803 },
    { name: "Hosur", tamilName: "ஓசூர்", lat: 12.7409, lon: 77.8253 },
    { name: "Tiruppur", tamilName: "திருப்பூர்", lat: 11.1085, lon: 77.3411 },
    { name: "Kumbakonam", tamilName: "கும்பகோணம்", lat: 10.9602, lon: 79.3845 },
    { name: "Karaikudi", tamilName: "காரைக்குடி", lat: 10.0734, lon: 78.7729 },
    { name: "Neyveli", tamilName: "நெய்வேலி", lat: 11.6016, lon: 79.4862 },
    { name: "Puducherry", tamilName: "புதுச்சேரி", lat: 11.9416, lon: 79.8083 },
    { name: "Nagapattinam", tamilName: "நாகப்பட்டினம்", lat: 10.7656, lon: 79.8424 },
    { name: "Karur", tamilName: "கரூர்", lat: 10.9601, lon: 78.0816 },
    { name: "Namakkal", tamilName: "நாமக்கல்", lat: 11.2189, lon: 78.1673 },
    { name: "Sivakasi", tamilName: "சிவகாசி", lat: 9.4532, lon: 77.8024 },
    { name: "Rajapalayam", tamilName: "ராஜபாளையம்", lat: 9.4503, lon: 77.5583 },
    { name: "Pollachi", tamilName: "பொள்ளாச்சி", lat: 10.6589, lon: 77.0102 },
    { name: "Ooty", tamilName: "ஊட்டி", lat: 11.4102, lon: 76.6950 },
    { name: "Kanyakumari", tamilName: "கன்னியாகுமரி", lat: 8.0883, lon: 77.5385 },
    { name: "Rameswaram", tamilName: "ராமேஸ்வரம்", lat: 9.2876, lon: 79.3129 },
    { name: "Bengaluru", tamilName: "பெங்களூரு", lat: 12.9716, lon: 77.5946 },
    { name: "Mumbai", tamilName: "மும்பை", lat: 19.0760, lon: 72.8777 },
    { name: "New Delhi", tamilName: "புது தில்லி", lat: 28.6139, lon: 77.2090 },
    { name: "Kolkata", tamilName: "கொல்கத்தா", lat: 22.5726, lon: 88.3639 },
    { name: "Hyderabad", tamilName: "ஹைதராபாத்", lat: 17.3850, lon: 78.4867 }
];

// Delaunay variables and Ayanamsa
export function getAyanamsa(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    // Lahiri Ayanamsa:
    return 23.8585 + 1.3963 * T;
}

// Map absolute longitude (0-360) to Rasi Sign (0-11)
export function getRasiSignIndex(lon) {
    return Math.floor(lon / 30) % 12;
}

// 12 Zodiac signs in order starting from Aries
export const signKeys = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// 27 Nakshatras names
export const starKeys = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha",
    "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
    "Poorva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
    "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Poorvashadha",
    "Uttarashadha", "Shravana", "Dhanishta", "Shatabhisha", "Poorva Bhadrapada",
    "Uttara Bhadrapada", "Revati"
];

// Return Star Index and Pada for a given longitude
export function getStarAndPada(lon) {
    const starLength = 360 / 27; // 13.3333 degrees
    const padaLength = starLength / 4; // 3.3333 degrees
    
    const starIdx = Math.floor(lon / starLength) % 27;
    const rem = lon % starLength;
    const pada = Math.floor(rem / padaLength) + 1; // 1, 2, 3, or 4
    
    return { starIdx, pada };
}

// Get Navamsam Sign Index (0-11)
export function getNavamsamSignIndex(lon) {
    const rasiIdx = getRasiSignIndex(lon);
    const rem = lon % 30;
    const padaIdx = Math.floor(rem / (30 / 9)); // 0 to 8
    
    let startSign = 0;
    const element = rasiIdx % 4;
    if (element === 0) { // Fire: Aries, Leo, Sagittarius
        startSign = 0; // Aries
    } else if (element === 1) { // Earth: Taurus, Virgo, Capricorn
        startSign = 9; // Capricorn
    } else if (element === 2) { // Air: Gemini, Libra, Aquarius
        startSign = 6; // Libra
    } else { // Water: Cancer, Scorpio, Pisces
        startSign = 3; // Cancer
    }
    
    return (startSign + padaIdx) % 12;
}

// Calculate Mandi position
export function calculateMandiLongitude(birthDate, lat, lon) {
    const observer = new Observer(lat, lon, 0);
    
    // We search sunrise and sunset for the birth day
    // Start search 12 hours before birth date to capture sunrise of the day
    const searchStart = new AstroTime(new Date(birthDate.getTime() - 12 * 3600 * 1000));
    const sunrise = SearchRiseSet(Body.Sun, observer, 1, searchStart, 1);
    const sunset = SearchRiseSet(Body.Sun, observer, -1, searchStart, 1);
    const nextSunrise = SearchRiseSet(Body.Sun, observer, 1, new AstroTime(sunset.date), 1);
    
    const isNight = birthDate < sunrise.date || birthDate > sunset.date;
    
    let periodStart, periodEnd;
    if (isNight) {
        if (birthDate < sunrise.date) {
            // Born before sunrise, so part of previous night
            const prevSunset = SearchRiseSet(Body.Sun, observer, -1, new AstroTime(new Date(sunrise.date.getTime() - 24 * 3600 * 1000)), 1);
            periodStart = prevSunset.date;
            periodEnd = sunrise.date;
        } else {
            periodStart = sunset.date;
            periodEnd = nextSunrise.date;
        }
    } else {
        periodStart = sunrise.date;
        periodEnd = sunset.date;
    }
    
    const duration = periodEnd.getTime() - periodStart.getTime();
    const P = duration / 8;
    
    // Day of the week (0=Sunday, 1=Monday, 2=Tuesday, etc.)
    // Note: In Vedic astrology, the day starts at sunrise.
    // If born before sunrise, the weekday is the previous day.
    let birthDayOfWeek = birthDate.getDay();
    if (birthDate < sunrise.date) {
        birthDayOfWeek = (birthDayOfWeek + 6) % 7;
    }
    
    let partIndex = 0;
    if (isNight) {
        // Night segments: Sun: 3rd, Mon: 2nd, Tue: 1st, Wed: 7th, Thu: 6th, Fri: 5th, Sat: 4th
        const nightSaturnParts = [4, 3, 2, 1, 0, 6, 5]; // Note: 0-indexed part (1st part = index 0)
        partIndex = nightSaturnParts[birthDayOfWeek];
    } else {
        // Day segments: Sun: 7th, Mon: 6th, Tue: 5th, Wed: 4th, Thu: 3rd, Fri: 2nd, Sat: 1st
        const daySaturnParts = [6, 5, 4, 3, 2, 1, 0];
        partIndex = daySaturnParts[birthDayOfWeek];
    }
    
    // Mandi is at the middle of Saturn's part
    const mandiTimeMs = periodStart.getTime() + partIndex * P + 0.5 * P;
    const mandiAstroTime = new AstroTime(new Date(mandiTimeMs));
    
    // Calculate Lagna at Mandi Time
    const gast = SiderealTime(mandiAstroTime);
    const lst = (gast * 15 + lon + 360) % 360;
    const tilt = e_tilt(mandiAstroTime);
    const eps = tilt.tobl;
    
    const lstRad = lst * DEG2RAD;
    const epsRad = eps * DEG2RAD;
    const latRad = lat * DEG2RAD;
    
    const y = Math.cos(lstRad);
    const x = -(Math.sin(lstRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad));
    let ascTropical = Math.atan2(y, x) * RAD2DEG;
    ascTropical = (ascTropical + 360) % 360;
    
    const jd = 2451545.0 + mandiAstroTime.ut;
    const ayanamsa = getAyanamsa(jd);
    
    return (ascTropical - ayanamsa + 360) % 360;
}

// Calculate the full horoscope data
export function calculateHoroscope({ name, gender, dateStr, timeStr, lat, lon, fatherName, motherName, ampm, city }) {
    const dateTimeStr = `${dateStr}T${timeStr}`;
    const birthDate = new Date(dateTimeStr);
    const astroTime = new AstroTime(birthDate);
    const jd = 2451545.0 + astroTime.ut;
    const T = (jd - 2451545.0) / 36525.0;
    const ayanamsa = getAyanamsa(jd);
    
    // Obliquity of date
    const tilt = e_tilt(astroTime);
    const eps = tilt.tobl;
    
    // 1. Calculate Lagna (Ascendant)
    const gast = SiderealTime(astroTime);
    const lst = (gast * 15 + lon + 360) % 360;
    const lstRad = lst * DEG2RAD;
    const epsRad = eps * DEG2RAD;
    const latRad = lat * DEG2RAD;
    
    const yLagna = Math.cos(lstRad);
    const xLagna = -(Math.sin(lstRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad));
    let lagnaTropical = Math.atan2(yLagna, xLagna) * RAD2DEG;
    lagnaTropical = (lagnaTropical + 360) % 360;
    const lagnaSidereal = (lagnaTropical - ayanamsa + 360) % 360;
    
    // 2. Calculate Planets (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn)
    const bodies = {
        Sun: Body.Sun,
        Moon: Body.Moon,
        Mercury: Body.Mercury,
        Venus: Body.Venus,
        Mars: Body.Mars,
        Jupiter: Body.Jupiter,
        Saturn: Body.Saturn
    };
    
    const planetLongitudes = {};
    for (const [pName, pBody] of Object.entries(bodies)) {
        const vector = GeoVector(pBody, astroTime, true);
        const ecl = Ecliptic(vector);
        planetLongitudes[pName] = (ecl.elon - ayanamsa + 360) % 360;
    }
    
    // 3. Calculate Rahu and Ketu
    // Delaunay arguments for Mean Node calculation
    const L = (218.3164477 + 481267.88123421 * T - 0.0015786 * T * T) % 360;
    const L_S = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360;
    const M_prime = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360;
    const O = (125.044522 - 1934.136261 * T + 0.0020708 * T * T) % 360;
    const F = (L - O + 360) % 360;
    const D = (L - L_S + 360) % 360;
    
    // Standard True Node perturbation term
    const delta_O = 1.4979 * Math.sin(2 * (L_S - O) * DEG2RAD) - 0.1500 * Math.sin(M_prime * DEG2RAD) - 0.1200 * Math.sin(2 * F * DEG2RAD) + 0.1000 * Math.sin(2 * D * DEG2RAD);
    const rahuTropical = (O - delta_O + 360) % 360;
    const rahuSidereal = (rahuTropical - ayanamsa + 360) % 360;
    const ketuSidereal = (rahuSidereal + 180) % 360;
    
    planetLongitudes["Rahu"] = rahuSidereal;
    planetLongitudes["Ketu"] = ketuSidereal;
    planetLongitudes["Lagna"] = lagnaSidereal;
    
    // 4. Calculate Mandi
    const mandiSidereal = calculateMandiLongitude(birthDate, lat, lon);
    planetLongitudes["Mandi"] = mandiSidereal;
    
    // 5. Gather all positions details
    const planetsDetails = [];
    const allPlanetNames = ["Lagna", "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu", "Mandi"];
    
    const lagnaSign = getRasiSignIndex(lagnaSidereal);
    
    for (const pName of allPlanetNames) {
        const lon = planetLongitudes[pName];
        const rasiIdx = getRasiSignIndex(lon);
        const { starIdx, pada } = getStarAndPada(lon);
        const navamsamIdx = getNavamsamSignIndex(lon);
        // House number (1-12) starting from Lagna
        const house = ((rasiIdx - lagnaSign + 12) % 12) + 1;
        
        planetsDetails.push({
            name: pName,
            longitude: lon,
            rasiIdx,
            starIdx,
            pada,
            navamsamIdx,
            house
        });
    }
    
    // 6. Panchang calculations
    const sunLon = planetLongitudes["Sun"];
    const moonLon = planetLongitudes["Moon"];
    
    // Tithi
    const tithiDiff = (moonLon - sunLon + 360) % 360;
    const tithiIdx = Math.floor(tithiDiff / 12) % 30; // 0 to 29
    
    // Yoga
    const yogaSum = (sunLon + moonLon) % 360;
    const yogaIdx = Math.floor(yogaSum / (360 / 27)) % 27;
    
    // Karana
    const karanaIdx = Math.floor(tithiDiff / 6) % 60;
    
    const dasaTimeline = calculateVimshottariDasa(moonLon, birthDate);
    
    return {
        birthDetails: { name, gender, dateStr, timeStr, lat, lon, fatherName, motherName, ampm, city },
        ayanamsa,
        lagnaLon: lagnaSidereal,
        planets: planetsDetails,
        dasaTimeline,
        panchang: {
            tithiIdx,
            yogaIdx,
            karanaIdx,
            starIdx: getStarAndPada(moonLon).starIdx,
            pada: getStarAndPada(moonLon).pada,
            rasiIdx: getRasiSignIndex(moonLon)
        }
    };
}

// Calculate Vimshottari Dasa timeline (120 years total)
export function calculateVimshottariDasa(moonLon, birthDate) {
    const dasaPeriods = {
        Ketu: 7,
        Venus: 20,
        Sun: 6,
        Moon: 10,
        Mars: 7,
        Rahu: 18,
        Jupiter: 16,
        Saturn: 19,
        Mercury: 17
    };
    
    const dasaOrder = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    
    // 27 stars
    const starLength = 360 / 27; // 13.333333333333334
    const starIdx = Math.floor(moonLon / starLength) % 27;
    const startLordIdx = starIdx % 9;
    
    // Moon's relative position in Nakshatra
    const remDegrees = moonLon % starLength;
    const fractionTraversed = remDegrees / starLength;
    const remainingFraction = 1.0 - fractionTraversed;
    
    // Balance of Dasa at birth in years
    const startLord = dasaOrder[startLordIdx];
    const fullDuration = dasaPeriods[startLord];
    const firstDasaPeriod = remainingFraction * fullDuration;
    const elapsed = fractionTraversed * fullDuration;
    
    // Virtual start date of first Dasa
    const virtualStart = new Date(birthDate);
    const elapsedDays = Math.round(elapsed * 365.25);
    virtualStart.setDate(virtualStart.getDate() - elapsedDays);
    
    const timeline = [];
    let prevEndDate = new Date(birthDate);
    let prevAge = 0;
    
    const now = new Date();
    
    function addYears(date, years) {
        const result = new Date(date);
        const yearsInt = Math.floor(years);
        const fraction = years - yearsInt;
        result.setFullYear(result.getFullYear() + yearsInt);
        if (fraction > 0) {
            const days = Math.round(fraction * 365.25);
            result.setDate(result.getDate() + days);
        }
        return result;
    }
    
    // Generate all 9 dasas in the cycle
    for (let i = 0; i < 9; i++) {
        const currentLordIdx = (startLordIdx + i) % 9;
        const lord = dasaOrder[currentLordIdx];
        const duration = (i === 0) ? firstDasaPeriod : dasaPeriods[lord];
        
        const startDate = new Date(prevEndDate);
        const endDate = addYears(startDate, duration);
        
        const startAge = prevAge;
        const endAge = prevAge + duration;
        
        let status = 'future';
        if (now >= startDate && now < endDate) {
            status = 'active';
        } else if (now >= endDate) {
            status = 'past';
        }
        
        timeline.push({
            lord,
            start: startDate,
            end: endDate,
            startAge,
            endAge,
            duration,
            status,
            // Virtual start and duration context for child periods calculations
            virtualStart: (i === 0) ? virtualStart : startDate,
            fullDuration: (i === 0) ? fullDuration : duration
        });
        
        prevEndDate = new Date(endDate);
        prevAge = endAge;
    }
    
    return timeline;
}

// Calculate sub-periods (Bhukti, Antara, Sookshma) proportionally
export function calculateSubPeriods(parentPeriod, birthDateStr) {
    const dasaPeriods = {
        Ketu: 7,
        Venus: 20,
        Sun: 6,
        Moon: 10,
        Mars: 7,
        Rahu: 18,
        Jupiter: 16,
        Saturn: 19,
        Mercury: 17
    };
    
    const dasaOrder = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    
    function addYears(date, years) {
        const result = new Date(date);
        const yearsInt = Math.floor(years);
        const fraction = years - yearsInt;
        result.setFullYear(result.getFullYear() + yearsInt);
        if (fraction > 0) {
            const days = Math.round(fraction * 365.25);
            result.setDate(result.getDate() + days);
        }
        return result;
    }
    
    const parentLord = parentPeriod.lord;
    const parentStart = parentPeriod.virtualStart ? new Date(parentPeriod.virtualStart) : new Date(parentPeriod.start);
    const parentDuration = parentPeriod.fullDuration !== undefined ? parentPeriod.fullDuration : parentPeriod.duration;
    
    const birthDate = birthDateStr ? new Date(birthDateStr) : new Date(parentPeriod.start);
    
    // Elapsed years of the parent's virtual start in the user's timeline
    const elapsedMs = birthDate.getTime() - parentStart.getTime();
    const elapsedYears = elapsedMs / (365.25 * 24 * 60 * 60 * 1000);
    const parentVirtualStartAge = parentPeriod.virtualStart ? -elapsedYears : parentPeriod.startAge;
    
    const startIdx = dasaOrder.indexOf(parentLord);
    const subPeriods = [];
    let prevEndDate = new Date(parentStart);
    let prevAge = parentVirtualStartAge;
    
    const now = new Date();
    
    for (let i = 0; i < 9; i++) {
        const lordIdx = (startIdx + i) % 9;
        const lord = dasaOrder[lordIdx];
        
        // Sub-period duration is parentDuration * (lord's period / 120)
        const duration = parentDuration * (dasaPeriods[lord] / 120);
        
        const startDate = new Date(prevEndDate);
        const endDate = addYears(startDate, duration);
        
        const startAge = prevAge;
        const endAge = prevAge + duration;
        
        let status = 'future';
        if (now >= startDate && now < endDate) {
            status = 'active';
        } else if (now >= endDate) {
            status = 'past';
        }
        
        subPeriods.push({
            lord,
            start: startDate,
            end: endDate,
            startAge,
            endAge,
            duration,
            status,
            virtualStart: startDate,
            fullDuration: duration
        });
        
        prevEndDate = new Date(endDate);
        prevAge = endAge;
    }
    
    // Filter out periods that ended before birth
    const filteredSubPeriods = subPeriods.filter(sp => sp.end > birthDate);
    
    // Truncate the first active period that spans birth
    if (filteredSubPeriods.length > 0 && filteredSubPeriods[0].start < birthDate) {
        const firstActive = filteredSubPeriods[0];
        firstActive.start = new Date(birthDate);
        firstActive.startAge = 0;
        
        const remMs = firstActive.end.getTime() - birthDate.getTime();
        firstActive.duration = remMs / (365.25 * 24 * 60 * 60 * 1000);
        
        if (now >= firstActive.start && now < firstActive.end) {
            firstActive.status = 'active';
        } else if (now >= firstActive.end) {
            firstActive.status = 'past';
        }
    }
    
    return filteredSubPeriods;
}
