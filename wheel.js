// Monday, March 31, 2025 at 11:39 PM WEST - Alcabideche, Lisbon, Portugal

// --- Global Elements & State ---
const canvas = document.getElementById('wheelCanvas');
const spinButton = document.getElementById('spinButton');
const resultDiv = document.getElementById('resultDisplay'); // Using the ID from your HTML
const sidebar = document.getElementById('cuisineSidebar');
const wikiFrame = document.getElementById('wikiFrame');
const closeSidebarButton = document.getElementById('closeSidebarButton');
const wheelLoader = document.getElementById('wheelLoader');
const sidebarLoader = document.getElementById('sidebarLoader');

let wheelInstance = null; // To hold the SpinningWheel object
let currentAppState = 'CONTINENT_SELECT'; // 'CONTINENT_SELECT' or 'COUNTRY_SELECT' or 'SHOWING_RESULT'
let allCountryData = []; // Store the raw country data list
let allContinentData = []; // Store the raw continent data list
let phaseMap = {}; // Store mapping from continent name -> country list {name, flagEmoji, isoCode}
let loadedFlagImages = {}; // Store preloaded flag Image objects

// --- Utility Functions ---

/**
 * Shuffles an array in place using the Fisher-Yates (Knuth) algorithm.
 * @param {Array<any>} array The array to shuffle.
 * @returns {Array<any>} The shuffled array (same instance).
 */
function shuffleArray(array) {
    if (!Array.isArray(array)) return array;
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- Flag Image Rendering Utility ---
// This replaces Twemoji with direct flag rendering using FlagCDN

/**
 * Creates a flag image element for a country
 * @param {string} isoCode - The ISO code of the country
 * @param {string} countryName - The name of the country (for alt text)
 * @returns {HTMLImageElement} - The created image element
 */
function createFlagImage(isoCode, countryName = 'flag') {
    if (!isoCode) return null;
    
    const img = new Image();
    img.src = `https://flagcdn.com/24x18/${isoCode.toLowerCase()}.png`;
    img.srcset = `https://flagcdn.com/48x36/${isoCode.toLowerCase()}.png 2x, https://flagcdn.com/72x54/${isoCode.toLowerCase()}.png 3x`;
    img.alt = `${countryName} flag`;
    img.width = 24;
    img.height = 18;
    img.className = 'flag-icon';
    img.style.verticalAlign = 'middle';
    img.style.marginRight = '5px';
    img.style.boxShadow = '0 1px 2px rgba(0,0,0,0.2)';
    img.crossOrigin = 'anonymous';
    
    return img;
}

/**
 * Replaces emoji flags in an element with flag images
 * @param {HTMLElement} element - The element containing text with emoji flags
 */
function renderFlagsInElement(element) {
    if (!element) return;
    
    const text = element.textContent;
    // Remove existing flag images to avoid duplication
    element.querySelectorAll('img.flag-icon').forEach(img => img.remove());
    
    // Find country data based on text content
    const countryMatch = allCountryData.find(c => text.includes(c.name));
    
    if (countryMatch && countryMatch.flag) {
        // Get ISO code
        const isoCode = getIsoCodeFromFlag(countryMatch.flag);
        if (isoCode) {
            // Create flag image
            const flagImg = createFlagImage(isoCode, countryMatch.name);
            if (flagImg) {
                // Replace flag emoji with actual image
                element.textContent = element.textContent.replace(countryMatch.flag, '').trim();
                element.insertBefore(flagImg, element.firstChild);
            }
        }
    }
}
// --- End Flag Rendering Utility ---

// --- Flag Image Preloading ---
let flagPreloadPromise = null;

function getIsoCodeFromFlag(flagEmoji) {
    // (Same as your provided code)
     if (!flagEmoji) return null;
     const codePoints = [...flagEmoji].slice(0, 2).map(char => char.codePointAt(0));
     if (codePoints.length !== 2) return null;
     if (codePoints.every(cp => cp >= 0x1F1E6 && cp <= 0x1F1FF)) {
         const char1 = String.fromCharCode(codePoints[0] - 0x1F1E6 + 'A'.charCodeAt(0));
         const char2 = String.fromCharCode(codePoints[1] - 0x1F1E6 + 'A'.charCodeAt(0));
         return (char1 + char2).toLowerCase();
     }
     return null;
}

function preloadFlagImages(countries) {
     if (!flagPreloadPromise) {
         const promises = [];
         console.log(`Preloading flag images...`);
         const uniqueIsoCodes = new Set();
         
         if (!Array.isArray(countries)) {
             console.warn("Expected array of countries for flag preloading, got:", typeof countries);
             countries = [];
         }
         
         countries.forEach(country => {
             // First try using the isoCode if directly provided
             let isoCode = country.isoCode;
             
             // Fallback to extracting from emoji flag if no direct isoCode
             if (!isoCode && country.flag) {
                 isoCode = getIsoCodeFromFlag(country.flag);
             }
             
             if (isoCode) { 
                 uniqueIsoCodes.add(isoCode.toLowerCase());
             } else { 
                 console.warn(`Could not get ISO code for flag: ${country.flag || 'N/A'} (${country.name || 'Unknown'})`); 
             }
         });
         
         console.log(`Found ${uniqueIsoCodes.size} unique ISO codes to preload.`);
         
         uniqueIsoCodes.forEach(isoCode => {
             const promise = new Promise((resolve) => {
                 const img = new Image();
                 
                 img.onload = () => { 
                     console.log(`Successfully loaded flag for ${isoCode}`);
                     loadedFlagImages[isoCode] = img; 
                     resolve(); 
                 };
                 
                 img.onerror = () => { 
                     console.warn(`Failed to load flag for ${isoCode}, trying fallback`); 
                     // Try alternate CDN as fallback
                     const fallbackImg = new Image();
                     fallbackImg.onload = () => {
                         console.log(`Successfully loaded fallback flag for ${isoCode}`);
                         loadedFlagImages[isoCode] = fallbackImg;
                         resolve();
                     };
                     fallbackImg.onerror = () => {
                         console.error(`All flag loading attempts failed for ${isoCode}`);
                         resolve(); // Resolve anyway to not block the promise chain
                     };
                     fallbackImg.src = `https://raw.githubusercontent.com/lipis/flag-icons/main/flags/4x3/${isoCode}.svg`;
                 };
                 
                 // Primary source
                 img.src = `https://flagcdn.com/w40/${isoCode}.png`;
                 // Ensure crossOrigin to avoid CORS issues
                 img.crossOrigin = "anonymous";
             });
             
             promises.push(promise);
         });
         
         flagPreloadPromise = Promise.all(promises).then(() => {
             const loadedCount = Object.keys(loadedFlagImages).length;
             console.log(`Flag image preloading complete. Success: ${loadedCount}/${uniqueIsoCodes.size}`);
         }).catch(err => console.error("Error during flag preloading:", err));
     }
     
     return flagPreloadPromise;
}
// --- End Flag Preloading ---


// --- SpinningWheel Class (from your code, assumed correct) ---
class SpinningWheel {
     // (Using the constructor and methods from the code you provided in proompting.txt)
     // Ensure the constructor accepts loadedFlagImages and drawWheel uses it.
     // Ensure updateLabels method exists and works.
     // Ensure spin method exists and calls the provided callback correctly.
     constructor(canvas, labels, nextPhases = {}, loadedFlagImages) {
         this.canvas = canvas;
         this.ctx = canvas.getContext('2d');
         this.labels = labels || [];
         this.nextPhases = nextPhases || {};
         this.numSlices = this.labels.length;
         this.currentRotation = 0;
         this.isSpinning = false;
         this.centerX = this.canvas.width / 2;
         this.centerY = this.canvas.height / 2;
         this.radius = Math.max(10, Math.min(this.centerX, this.centerY) - 20);
         this.flagImages = loadedFlagImages || {};
         this.colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FFCD56', '#C9CBCF', '#36A2EB'];
         this.sliceColors = [];
         this.updateSliceColors();
     }
     updateSliceColors() {
         this.sliceColors = [];
         for (let i = 0; i < this.numSlices; i++) {
             this.sliceColors.push(this.getColor(i));
         }
     }
     drawWheel() {
         // (Using the complex drawWheel logic from your proompting.txt file)
         // This includes the flag drawing and text shrinking logic
         const ctx = this.ctx;
         const width = this.canvas.width;
         const height = this.canvas.height;
         ctx.clearRect(0, 0, width, height);
          if (this.numSlices <= 0) { /* Draw placeholder */ return; }
         const sliceAngle = 2 * Math.PI / this.numSlices;
         const baseFontSize = 14;
         const baseFont = `bold ${baseFontSize}px 'Segoe UI Emoji', sans-serif`;

         for (let i = 0; i < this.numSlices; i++) {
             const labelData = this.labels[i];
             const startAngle = this.currentRotation + i * sliceAngle;
             const endAngle = startAngle + sliceAngle;
             /* Draw Slice */
             ctx.beginPath(); ctx.moveTo(this.centerX, this.centerY); ctx.arc(this.centerX, this.centerY, this.radius, startAngle, endAngle); ctx.closePath(); ctx.fillStyle = this.sliceColors[i] || '#cccccc'; ctx.fill(); ctx.strokeStyle = 'black'; ctx.lineWidth = 1; ctx.stroke();
             /* Draw Label/Flag */
             ctx.save(); ctx.translate(this.centerX, this.centerY); const textAngle = startAngle + sliceAngle / 2; ctx.rotate(textAngle); ctx.textAlign = "right"; ctx.fillStyle = "black"; ctx.font = baseFont; ctx.textBaseline = "middle";
             const drawBoundaryX = this.radius - 10; const commonY = 0; const flagWidth = 20; const flagHeight = 15; const gap = 5;
             const isCountryObject = typeof labelData === 'object' && labelData !== null && labelData.isoCode && labelData.name;

             if (isCountryObject) { /* Draw Country Flag+Text with shrinking */
                 const countryName = labelData.name; const isoCode = labelData.isoCode; const flagImg = this.flagImages[isoCode];
                 const flagX = drawBoundaryX - flagWidth; const flagY = commonY - flagHeight / 2;
                 if (flagImg && flagImg.complete && flagImg.naturalWidth > 0) { try { ctx.drawImage(flagImg, flagX, flagY, flagWidth, flagHeight); } catch (e) { console.error(`Error drawing flag ${isoCode}:`, e); } }
                 const textBlockEndX = flagX - gap; const nameLength = countryName.length; const lengthThreshold = 18;
                 if (nameLength > lengthThreshold) { /* Apply Word-by-Word Shrinking */
                      const words = countryName.split(' '); if (words.length > 0) { let charCount=0; let thresholdWordIndex=-1; for(let wIdx=0;wIdx<words.length;wIdx++){ const wordLength=words[wIdx].length; if(charCount<lengthThreshold&&(charCount+wordLength)>=lengthThreshold){thresholdWordIndex=wIdx;break;} charCount+=wordLength+(wIdx<words.length-1?1:0); } if(thresholdWordIndex===-1){thresholdWordIndex=0;} let currentWordEndX=textBlockEndX; const shrinkFactor=0.95; const minFontSize=9; for(let wIdx=words.length-1;wIdx>=0;wIdx--){ const word=words[wIdx]; let wordFontSize=baseFontSize; if(thresholdWordIndex!==-1&&wIdx>=thresholdWordIndex){ let steps=wIdx-thresholdWordIndex; wordFontSize=Math.max(minFontSize,baseFontSize*Math.pow(shrinkFactor,steps)); } ctx.font=`bold ${Math.round(wordFontSize)}px 'Segoe UI Emoji', sans-serif`; const wordWidth=ctx.measureText(word).width; ctx.fillText(word,currentWordEndX,commonY); currentWordEndX-=wordWidth; if(wIdx>0){const spaceWidth=ctx.measureText(' ').width;currentWordEndX-=spaceWidth; } } } ctx.font=baseFont;
                 } else { /* Draw Normal Text */ ctx.font=baseFont; ctx.fillText(countryName, textBlockEndX, commonY); }
             } else if (typeof labelData === 'string') { /* Draw Continent Label */
                 ctx.font = baseFont; ctx.fillText(labelData, drawBoundaryX, commonY);
             } else { /* Handle unexpected */ console.warn("Unexpected label data type:", labelData); ctx.font='italic 10px sans-serif'; ctx.fillStyle='#f00'; ctx.fillText("?", drawBoundaryX, commonY); }
             ctx.restore();
         }
     }
     getColor(index) { return this.colors[index % this.colors.length]; }
     spin(callback) {
        // (Using the complex spin logic from your proompting.txt file)
        // This includes the requestAnimationFrame animation loop
         if (this.isSpinning || this.numSlices <= 0) return;
         this.isSpinning = true;
         if(spinButton) spinButton.disabled = true;
         if (resultDiv) { resultDiv.innerHTML = 'Spinning...'; const imgs=resultDiv.querySelectorAll('img.emoji'); imgs.forEach(img=>img.remove()); }

         const totalSpins = Math.floor(Math.random() * 5) + 5; const extraRotation = Math.random() * 2 * Math.PI; const targetRotation = totalSpins * 2 * Math.PI + extraRotation; const duration = 5000; const startTime = performance.now(); const startRotation = this.currentRotation;

         const animate = (currentTime) => {
             let elapsed = currentTime - startTime; if (elapsed > duration) elapsed = duration; const t = elapsed / duration; const eased = 1 - Math.pow(1 - t, 4); this.currentRotation = startRotation + targetRotation * eased; this.drawWheel();
             if (elapsed < duration) { requestAnimationFrame(animate); } else { /* Animation End */ this.isSpinning = false; if(spinButton) spinButton.disabled = false; this.currentRotation %= (2 * Math.PI); this.drawWheel();
                 /* Determine Winner */ const pointerAngle = 3 * Math.PI / 2; let relativeAngle = pointerAngle - this.currentRotation; let normalizedAngle = (relativeAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI); const sliceAngle = 2 * Math.PI / this.numSlices; const sliceIndex = Math.floor(normalizedAngle / sliceAngle); const selectedLabelData = (this.labels && this.labels.length > 0) ? this.labels[sliceIndex % this.numSlices] : null;
                 if (selectedLabelData === null) { console.error("Spin finished but could not determine selection."); }
                 if (callback && typeof callback === 'function') { try { callback(selectedLabelData, resultDiv); } catch (e) { console.error("Error executing spin callback:", e); } }
             }
         };
         requestAnimationFrame(animate);
     }
     updateLabels(labels) {
         // (Using the updateLabels logic from your proompting.txt file)
         this.labels = labels || [];
         this.numSlices = this.labels.length;
         this.currentRotation = 0;
         this.isSpinning = false;
         this.updateSliceColors();
         this.drawWheel();
     }
}
// --- End SpinningWheel Class ---


// --- App State & Logic ---

/** Handles the result after a spin completes. Updates UI, loads next phase, or shows final result */
async function handleSpinResult(selectedLabelData, targetResultDiv) {
    const isCountry = typeof selectedLabelData === 'object' && selectedLabelData !== null && selectedLabelData.isoCode;
    const isContinent = typeof selectedLabelData === 'string';

    if (isCountry) {
        // --- RESULT: COUNTRY ---
        const country = selectedLabelData; // Data is {name, flagEmoji, isoCode}
        console.log(`Spin Result (Country): ${country.name} ${country.flagEmoji}`);
        currentAppState = 'SHOWING_RESULT'; // Update app state

        // Find full country data to get URL - try multiple matching strategies
        let fullCountryData = allCountryData.find(c => 
            // First try exact match on name
            c.name === country.name ||
            // Then try case-insensitive match
            c.name.toLowerCase() === country.name.toLowerCase() ||
            // Then try slug matching (convert spaces to dashes)
            c.id === country.name.toLowerCase().replace(/[\s'(),]/g, '-').replace(/--+/g, '-')
        );

        if (targetResultDiv) {
            // Set display to Name only first
            targetResultDiv.textContent = country.name;
            
            // Then add the flag image using our flag renderer
            if (country.isoCode) {
                const flagImg = createFlagImage(country.isoCode, country.name);
                if (flagImg) {
                    targetResultDiv.insertBefore(flagImg, targetResultDiv.firstChild);
                }
            }
            console.log(`Set result display to ${country.name} with flag ${country.isoCode}`);
        } else { 
            console.error("Result display element not found!"); 
        }

        // Open Sidebar
        if (fullCountryData && fullCountryData.cuisineWikiUrl) {
            openSidebar(fullCountryData.cuisineWikiUrl);
        } else {
            console.warn(`No cuisine URL found for ${country.name}`);
            // Optionally close sidebar if it was open from a previous spin
             closeSidebar();
        }

        // Change button text
        if (spinButton) spinButton.textContent = "Start over";

    } else if (isContinent) {
        // --- RESULT: CONTINENT ---
        const continentName = selectedLabelData;
        console.log("Spin Result (Continent):", continentName);
        currentAppState = 'COUNTRY_SELECT'; // Update app state

        if (phaseMap[continentName] && phaseMap[continentName].length > 0) {
            console.log("Loading next phase (countries) for:", continentName);
            const countryList = phaseMap[continentName];
            const shuffledCountryList = shuffleArray([...countryList]); // Shuffle countries
            console.log(`Shuffled ${shuffledCountryList.length} countries for ${continentName}.`);

            // Update wheel instance with shuffled countries
            if (wheelInstance) {
                wheelInstance.updateLabels(shuffledCountryList);
            } else { console.error("Wheel instance not available to update labels"); }

            if (targetResultDiv) {
                targetResultDiv.textContent = continentName;
            }
            if (spinButton) spinButton.textContent = "Spin for Country!"; // Update button prompt

        } else {
            console.warn(`Landed on continent ${continentName}, but no country data found.`);
            if (targetResultDiv) {
                targetResultDiv.textContent = `${continentName} (No countries listed)`;
            }
             // Decide what to do - maybe reset? For now, just display message.
             currentAppState = 'SHOWING_RESULT'; // Treat as end state for now
             if (spinButton) spinButton.textContent = "Start over";
        }

    } else {
        // --- UNEXPECTED RESULT ---
        console.error("Unknown selection type or null selection:", selectedLabelData);
        if (targetResultDiv) targetResultDiv.innerHTML = "Spin Error";
        // Reset to be safe
        resetApp();
    }
}

/** Opens the sidebar and loads the Wikipedia URL */
function openSidebar(wikiUrl) {
    if (!sidebar || !wikiFrame) {
        console.error("Sidebar or iframe element not found.");
        return;
    }
    if (!wikiUrl) {
        console.warn("No Wikipedia URL provided to openSidebar.");
        // Optionally close sidebar if URL is missing
        closeSidebar();
        return;
    }

    // First show the sidebar with loader visible
    sidebar.classList.add('open');
    if (sidebarLoader) {
        sidebarLoader.classList.remove('hidden');
    }
    
    // Reset iframe src
    wikiFrame.src = 'about:blank';
    
    // Append Minerva skin parameter
    let finalUrl = wikiUrl;
    try {
        const urlObj = new URL(wikiUrl);
        urlObj.searchParams.set('useskin', 'minerva');
        // Add mobile=1 to ensure mobile view
        urlObj.searchParams.set('mobile', '1');
        finalUrl = urlObj.toString();
    } catch (e) {
        console.error("Invalid URL provided for Wikipedia:", wikiUrl, e);
        // Try appending manually as a fallback, might break if # present
        finalUrl = wikiUrl.includes('?') ? 
            `${wikiUrl}&useskin=minerva&mobile=1` : 
            `${wikiUrl}?useskin=minerva&mobile=1`;
    }

    console.log("Loading URL in sidebar:", finalUrl);
    
    // Handle iframe load event to hide loader
    wikiFrame.onload = function() {
        console.log("Wikipedia content loaded successfully");
        if (sidebarLoader) {
            sidebarLoader.classList.add('hidden');
        }
    };
    
    // Handle iframe error
    wikiFrame.onerror = function(error) {
        console.error("Error loading Wikipedia iframe:", error);
        if (sidebarLoader) {
            sidebarLoader.classList.add('hidden');
        }
        wikiFrame.srcdoc = `<div style="padding:20px; font-family:sans-serif;">
            <h2>Error Loading Content</h2>
            <p>There was an error loading the cuisine information.</p>
            <p>Please try again later.</p>
        </div>`;
    };
    
    // Set the URL to load after a short delay to ensure sidebar animation is complete
    setTimeout(() => {
        wikiFrame.src = finalUrl;
    }, 300);
}

/** Closes the sidebar */
function closeSidebar() {
    if (!sidebar) return;
    
    // First trigger the transition
    sidebar.classList.remove('open');
    
    // Clear content after transition completes to prevent flickering
    setTimeout(() => {
        wikiFrame.src = 'about:blank';
        if (sidebarLoader) {
            sidebarLoader.classList.add('hidden');
        }
        console.log("Sidebar closed and content cleared.");
    }, 500); // Match the transition duration in CSS
}

/** Resets the application to the initial state */
function resetApp() {
    console.log("Resetting application...");
    closeSidebar(); // Close sidebar if open
    currentAppState = 'CONTINENT_SELECT'; // Reset state
    
    // Reset result display
    if (resultDiv) {
        // Remove any flag images first
        resultDiv.querySelectorAll('img.flag-icon').forEach(img => img.remove());
        resultDiv.textContent = 'Foodtrotting!';
    }
    
    if (spinButton) spinButton.textContent = 'Spin the Wheel!'; // Reset button text

    // Re-initialize the wheel with shuffled continents
    setupContinentWheelUI(); // Call the UI setup function which shuffles and draws

    console.log("Application reset complete.");
}

/** Sets up the continent wheel UI (shuffles, updates wheel instance) */
function setupContinentWheelUI() {
     if (!wheelInstance) {
         console.error("Cannot setup continent wheel: wheel instance is null.");
         return;
     }
     
     console.log("Setting up continent wheel with allContinentData:", allContinentData);
     console.log("Current phaseMap:", phaseMap);
     
     // Check if we have continent data
     if (!Array.isArray(allContinentData) || allContinentData.length === 0) {
         console.error("No continent data available for wheel setup.");
         if(resultDiv) resultDiv.textContent = "Error: No continent data found.";
         if(spinButton) spinButton.disabled = true;
         return;
     }
     
     // Get shuffled list of continent names that have countries
     const validContinentNames = allContinentData
         .filter(continent => {
             const hasCountries = phaseMap[continent.name] && phaseMap[continent.name].length > 0;
             console.log(`Continent ${continent.name}: has ${phaseMap[continent.name] ? phaseMap[continent.name].length : 0} countries, valid: ${hasCountries}`);
             return hasCountries;
         })
         .map(continent => continent.name);

     console.log(`Found ${validContinentNames.length} valid continent names out of ${allContinentData.length} total`);
     
     if(validContinentNames.length === 0) {
         console.error("No continents with valid countries found. Cannot set up wheel.");
         if(resultDiv) resultDiv.textContent = "Error: No valid continent data found.";
         if(spinButton) spinButton.disabled = true;
         return;
     }

     shuffleArray(validContinentNames); // Shuffle them each time
     console.log("Setting wheel labels to shuffled continents:", validContinentNames);
     wheelInstance.updateLabels(validContinentNames); // Update wheel visually
}

// --- Initialization ---
async function initializeApp() {
    console.log("Initializing Foodtrotter App...");
    try {
        // Show wheel loader
        if (wheelLoader) {
            wheelLoader.classList.remove('hidden');
        }
        // 1. Fetch Data
        console.log("Fetching data...");
        
        // Use Promise.all to fetch both continents and countries data in parallel
        const [continentsData, countriesData] = await Promise.all([
            fetch('data/continents.json').then(resp => {
                if (!resp.ok) throw new Error(`HTTP error fetching continents! status: ${resp.status}`);
                return resp.json();
            }),
            // Fetch all continent country data files
            Promise.all([
                fetch('data/africa.json').then(resp => resp.ok ? resp.json() : { countries: [] }),
                fetch('data/asia.json').then(resp => resp.ok ? resp.json() : { countries: [] }),
                fetch('data/europe.json').then(resp => resp.ok ? resp.json() : { countries: [] }),
                fetch('data/north-america.json').then(resp => resp.ok ? resp.json() : { countries: [] }),
                fetch('data/south-america.json').then(resp => resp.ok ? resp.json() : { countries: [] }),
                fetch('data/oceania.json').then(resp => resp.ok ? resp.json() : { countries: [] })
            ]).then(results => {
                // Combine all continent country arrays into a single array
                return results.reduce((allCountries, continentData) => {
                    // Extract the countries array from each continent data object
                    const countries = continentData.countries || [];
                    if (Array.isArray(countries)) {
                        return allCountries.concat(countries);
                    }
                    return allCountries;
                }, []);
            })
        ]);
        
        // Validate and process data
        console.log("Continents data:", continentsData);
        if (!continentsData || !Array.isArray(continentsData.continents)) {
            throw new Error("Invalid data structure in continents.json");
        }
        
        console.log("Countries data length:", countriesData.length);
        if (!Array.isArray(countriesData)) {
            throw new Error("Invalid data structure in country data files");
        }
        
        allContinentData = continentsData.continents;
        allCountryData = countriesData;
        console.log(`Data fetched: ${allContinentData.length} continents, ${allCountryData.length} countries.`);
        
        // Log continent names for debugging
        console.log("Continent names:", allContinentData.map(c => c.name));

        // 2. Start Preloading Flags (async, don't wait)
        preloadFlagImages(allCountryData);

        // 3. Process Data into Phase Map
        console.log("Processing data map...");
        console.log("Continent data:", allContinentData);
        
        const continentNameMap = {}; // Map ID to Name for lookup
        allContinentData.forEach(c => { 
            continentNameMap[c.id] = c.name;
            console.log(`Mapped continent id ${c.id} to name ${c.name}`);
        });

        phaseMap = {}; // Reset phase map
        
        // Initialize keys based on continent names - log each creation
        allContinentData.forEach(c => { 
            phaseMap[c.name] = [];
            console.log(`Created empty country array for continent ${c.name}`);
        });
        
        // Log first few countries for debugging
        console.log("First few countries:", allCountryData.slice(0, 3));
        
        // Count countries per continent
        const countryByContinentCount = {};
        allContinentData.forEach(c => { countryByContinentCount[c.id] = 0; });

        allCountryData.forEach(country => {
            // Increment continent counter
            if (country.continentId) {
                countryByContinentCount[country.continentId] = 
                    (countryByContinentCount[country.continentId] || 0) + 1;
            }
            
            const continentName = continentNameMap[country.continentId];
            const isoCode = getIsoCodeFromFlag(country.flag);
            
            // Log detailed information about country mapping
            console.log(`Mapping country ${country.name} (${country.continentId}) to continent "${continentName}"`);
            
            if (continentName && phaseMap.hasOwnProperty(continentName) && isoCode && country.name && country.flag) {
                phaseMap[continentName].push({ 
                    name: country.name, 
                    flagEmoji: country.flag, 
                    isoCode: isoCode 
                });
                console.log(`Successfully added ${country.name} to continent ${continentName}`);
            } else {
                console.warn(`Skipping country due to missing data: ${country.name || 'N/A'}, ContinentID: ${country.continentId}, ISO: ${isoCode}, Flag: ${country.flag}, Found continentName: ${continentName}, Has phaseMap key: ${phaseMap.hasOwnProperty(continentName)}`);
            }
        });
        
        // Log counts by continent
        console.log("Countries per continent:", countryByContinentCount);
        
        // Log the phase map to verify
        console.log("Final phaseMap:", Object.keys(phaseMap).map(key => `${key}: ${phaseMap[key].length} countries`));

        // 4. Create Wheel Instance
        if (!canvas) throw new Error('Canvas element not found!');
        // Initial labels will be set by setupContinentWheelUI right after this
        wheelInstance = new SpinningWheel(canvas, [], phaseMap, loadedFlagImages); // Start with empty labels initially


        // 5. Setup Initial Continent Wheel UI (will shuffle and draw)
        setupContinentWheelUI(); // This sets the initial labels and draws

        // 6. Setup Event Listeners
        if (!spinButton) throw new Error('Spin button not found!');
        spinButton.addEventListener('click', () => {
            if (currentAppState === 'SHOWING_RESULT' || spinButton.textContent === "Start over") {
                resetApp();
            } else if (!wheelInstance.isSpinning) {
                 // Pass the handleSpinResult function as the callback
                wheelInstance.spin(handleSpinResult);
            }
        });

        if (!closeSidebarButton) throw new Error('Close sidebar button not found!');
        closeSidebarButton.addEventListener('click', closeSidebar);

        // Hide wheel loader once everything is ready
        if (wheelLoader) {
            wheelLoader.classList.add('hidden');
        }
        console.log("App initialization complete.");

    } catch (error) {
        console.error("FATAL ERROR during app initialization:", error);
        if (resultDiv) {
             resultDiv.innerHTML = `<span style="color: red; font-weight: bold;">Error initializing: ${error.message}</span>`;
        } else {
            document.body.innerHTML = `<p style="color: red; font-weight: bold;">FATAL ERROR: ${error.message}</p>`;
        }
        if (spinButton) spinButton.disabled = true;
    }
}

// --- Run ---
document.addEventListener('DOMContentLoaded', initializeApp);