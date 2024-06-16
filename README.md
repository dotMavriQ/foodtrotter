# Foodtrotter

A fun, interactive web application that helps you discover global cuisines through chance. Spin the wheel to randomly select a continent, then spin again to select a country within that continent - perfect for culinary exploration and deciding what to eat next!

## How It Works

1. **First Spin**: The wheel displays all continents. Spin it to randomly select one.
2. **Second Spin**: After selecting a continent, the wheel updates to show countries from that continent only. Spin again to select a specific country.
3. **Result**: The application displays your selected country with its flag and opens a sidebar with information about the country's cuisine from Wikipedia.

## Features

- Interactive spinning wheel with smooth animation
- Two-stage selection process (continent → country)
- Visual display of country flags
- Wikipedia cuisine information in a convenient sidebar
- Responsive design that works on various screen sizes
- Randomized options on each spin for variety

## Technologies

- Pure JavaScript (no frameworks)
- HTML5 Canvas for wheel rendering
- CSS for styling
- JSON data structure for continent/country information
- Wikipedia API integration for cuisine information
- Twemoji and flagcdn for consistent flag emoji rendering

## Usage

Simply open `index.html` in any modern web browser to start exploring global cuisines!

---

## Performance Note

The application may experience slower loading times due to several resource-intensive operations:
1. Preloading of flag images for all countries
2. Complex canvas rendering with text shrinking for longer country names
3. Wikipedia API integration loading external content in an iframe
4. Dynamic Twemoji script loading for consistent emoji rendering across platforms

### Optimization Suggestions

To improve application performance:
1. **Lazy-load flags**: Only preload flags for the selected continent instead of all countries at once
2. **Simplify text rendering**: Replace complex word-by-word shrinking with simpler text truncation
3. **Optimize canvas redrawing**: Implement requestAnimationFrame throttling and avoid unnecessary redraws
4. **Cache Wikipedia content**: Store fetched Wikipedia content in localStorage to avoid repeated requests
5. **Load Twemoji earlier**: Include Twemoji script in the HTML instead of dynamically loading it
6. **Reduce animation complexity**: Simplify spinning animation or make duration configurable
7. **Implement code-splitting**: Load country data progressively based on selected continent
