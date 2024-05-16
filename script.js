document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const wheelRadius = canvas.width / 2;
    let segments = ['Africa', 'North America', 'South America', 'Asia', 'Europe', 'Oceania'];
    let currentSegments = segments;
    let spinAngleStart = 10;
    let startAngle = 0;
    let spinTime = 0;
    let spinTimeTotal = 0;

    const continentCountries = {
        'Africa': [
            'Algeria 🇩🇿', 'Angola 🇦🇴', 'Benin 🇧🇯', 'Botswana 🇧🇼', 'Burkina Faso 🇧🇫', 'Burundi 🇧🇮', 'Cabo Verde 🇨🇻', 'Cameroon 🇨🇲',
            'Central African Republic 🇨🇫', 'Chad 🇹🇩', 'Comoros 🇰🇲', 'Congo, Democratic Republic of the 🇨🇩', 'Congo, Republic of the 🇨🇬',
            'Djibouti 🇩🇯', 'Egypt 🇪🇬', 'Equatorial Guinea 🇬🇶', 'Eritrea 🇪🇷', 'Eswatini 🇸🇿', 'Ethiopia 🇪🇹', 'Gabon 🇬🇦', 'Gambia 🇬🇲',
            'Ghana 🇬🇭', 'Guinea 🇬🇳', 'Guinea-Bissau 🇬🇼', 'Ivory Coast 🇨🇮', 'Kenya 🇰🇪', 'Lesotho 🇱🇸', 'Liberia 🇱🇷', 'Libya 🇱🇾',
            'Madagascar 🇲🇬', 'Malawi 🇲🇼', 'Mali 🇲🇱', 'Mauritania 🇲🇷', 'Mauritius 🇲🇺', 'Morocco 🇲🇦', 'Mozambique 🇲🇿', 'Namibia 🇳🇦',
            'Niger 🇳🇪', 'Nigeria 🇳🇬', 'Rwanda 🇷🇼', 'Sao Tome and Principe 🇸🇹', 'Senegal 🇸🇳', 'Seychelles 🇸🇨', 'Sierra Leone 🇸🇱',
            'Somalia 🇸🇴', 'South Africa 🇿🇦', 'South Sudan 🇸🇸', 'Sudan 🇸🇩', 'Tanzania 🇹🇿', 'Togo 🇹🇬', 'Tunisia 🇹🇳', 'Uganda 🇺🇬',
            'Zambia 🇿🇲', 'Zimbabwe 🇿🇼'
        ],
        'Asia': [
            'Afghanistan 🇦🇫', 'Bahrain 🇧🇭', 'Bangladesh 🇧🇩', 'Bhutan 🇧🇹', 'Brunei 🇧🇳', 'Burma (Myanmar) 🇲🇲', 'Cambodia 🇰🇭', 'China 🇨🇳',
            'East Timor 🇹🇱', 'India 🇮🇳', 'Indonesia 🇮🇩', 'Iran 🇮🇷', 'Iraq 🇮🇶', 'Israel 🇮🇱', 'Japan 🇯🇵', 'Jordan 🇯🇴', 'Kazakhstan 🇰🇿',
            'North Korea 🇰🇵', 'South Korea 🇰🇷', 'Kuwait 🇰🇼', 'Kyrgyzstan 🇰🇬', 'Laos 🇱🇦', 'Lebanon 🇱🇧', 'Malaysia 🇲🇾', 'Maldives 🇲🇻',
            'Mongolia 🇲🇳', 'Nepal 🇳🇵', 'Oman 🇴🇲', 'Pakistan 🇵🇰', 'Philippines 🇵🇭', 'Qatar 🇶🇦', 'Russia 🇷🇺', 'Saudi Arabia 🇸🇦', 'Singapore 🇸🇬',
            'Sri Lanka 🇱🇰', 'Syria 🇸🇾', 'Taiwan 🇹🇼', 'Tajikistan 🇹🇯', 'Thailand 🇹🇭', 'Turkey 🇹🇷', 'Turkmenistan 🇹🇲', 'United Arab Emirates 🇦🇪',
            'Uzbekistan 🇺🇿', 'Vietnam 🇻🇳', 'Yemen 🇾🇪'
        ],
        'Europe': [
            'Albania 🇦🇱', 'Andorra 🇦🇩', 'Armenia 🇦🇲', 'Austria 🇦🇹', 'Azerbaijan 🇦🇿', 'Belarus 🇧🇾', 'Belgium 🇧🇪', 'Bosnia and Herzegovina 🇧🇦',
            'Bulgaria 🇧🇬', 'Croatia 🇭🇷', 'Cyprus 🇨🇾', 'Czech Republic 🇨🇿', 'Denmark 🇩🇰', 'Estonia 🇪🇪', 'Finland 🇫🇮', 'France 🇫🇷',
            'Georgia 🇬🇪', 'Germany 🇩🇪', 'Greece 🇬🇷', 'Hungary 🇭🇺', 'Iceland 🇮🇸', 'Ireland 🇮🇪', 'Italy 🇮🇹', 'Kazakhstan 🇰🇿', 'Kosovo 🇽🇰',
            'Latvia 🇱🇻', 'Liechtenstein 🇱🇮', 'Lithuania 🇱🇹', 'Luxembourg 🇱🇺', 'Malta 🇲🇹', 'Moldova 🇲🇩', 'Monaco 🇲🇨', 'Montenegro 🇲🇪',
            'Netherlands 🇳🇱', 'North Macedonia 🇲🇰', 'Norway 🇳🇴', 'Poland 🇵🇱', 'Portugal 🇵🇹', 'Romania 🇷🇴', 'Russia 🇷🇺', 'San Marino 🇸🇲',
            'Serbia 🇷🇸', 'Slovakia 🇸🇰', 'Slovenia 🇸🇮', 'Spain 🇪🇸', 'Sweden 🇸🇪', 'Switzerland 🇨🇭', 'Turkey 🇹🇷', 'Ukraine 🇺🇦',
            'United Kingdom 🇬🇧', 'Vatican City 🇻🇦'
        ],
        'North America': [
            'Antigua and Barbuda 🇦🇬', 'Bahamas 🇧🇸', 'Barbados 🇧🇧', 'Belize 🇧🇿', 'Canada 🇨🇦', 'Costa Rica 🇨🇷', 'Cuba 🇨🇺', 'Dominica 🇩🇲',
            'Dominican Republic 🇩🇴', 'El Salvador 🇸🇻', 'Grenada 🇬🇩', 'Guatemala 🇬🇹', 'Haiti 🇭🇹', 'Honduras 🇭🇳', 'Jamaica 🇯🇲', 'Mexico 🇲🇽',
            'Nicaragua 🇳🇮', 'Panama 🇵🇦', 'Saint Kitts and Nevis 🇰🇳', 'Saint Lucia 🇱🇨', 'Saint Vincent and the Grenadines 🇻🇨',
            'Trinidad and Tobago 🇹🇹', 'United States 🇺🇸'
        ],
        'Oceania': [
            'Australia 🇦🇺', 'Fiji 🇫🇯', 'Kiribati 🇰🇮', 'Marshall Islands 🇲🇭', 'Micronesia 🇫🇲', 'Nauru 🇳🇷', 'New Zealand 🇳🇿', 'Palau 🇵🇼',
            'Papua New Guinea 🇵🇬', 'Samoa 🇼🇸', 'Solomon Islands 🇸🇧', 'Tonga 🇹🇴', 'Tuvalu 🇹🇻', 'Vanuatu 🇻🇺'
        ],
        'South America': [
            'Argentina 🇦🇷', 'Bolivia 🇧🇴', 'Brazil 🇧🇷', 'Chile 🇨🇱', 'Colombia 🇨🇴', 'Ecuador 🇪🇨', 'Guyana 🇬🇾', 'Paraguay 🇵🇾',
            'Peru 🇵🇪', 'Suriname 🇸🇷', 'Uruguay 🇺🇾', 'Venezuela 🇻🇪'
        ]
    };



    function drawSegmentLabel(ctx, text, angle, wheelRadius) {
        ctx.save();
        ctx.translate(wheelRadius, wheelRadius);
        ctx.rotate(angle);
        ctx.textAlign = "right";
        ctx.fillStyle = "#000";
        ctx.font = 'bold 14px "Helvetica Neue", Helvetica, Arial, sans-serif';
        ctx.fillText(text, wheelRadius - 10, 10);
        ctx.restore();
    }

    function drawWheel() {
        const anglePerSegment = 2 * Math.PI / currentSegments.length;
        let lastEndAngle = startAngle;

        // Clear the canvas for redraw
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < currentSegments.length; i++) {
            const segment = currentSegments[i];
            const angle = lastEndAngle + anglePerSegment;

            ctx.fillStyle = getSegmentColor(i, currentSegments.length);
            ctx.beginPath();
            ctx.moveTo(wheelRadius, wheelRadius);
            ctx.arc(wheelRadius, wheelRadius, wheelRadius, lastEndAngle, angle, false);
            ctx.lineTo(wheelRadius, wheelRadius);
            ctx.fill();

            drawSegmentLabel(ctx, segment, lastEndAngle + anglePerSegment / 2, wheelRadius);

            lastEndAngle = angle;
        }
    }

    function getSegmentColor(index, totalCount) {
        // Generate a random color with good contrast
        let hue = index * (360 / totalCount);
        hue = (hue + (index * 47)) % 360; // Shift the hue for each segment to ensure better contrast
        return `hsl(${hue}, 70%, 70%)`;
    }

    function spinWheel() {
        spinTime = 0;
        spinAngleStart = Math.random() * 10 + 20; // Make the start speed more variable
        spinTimeTotal = Math.random() * 3000 + 2000; // Vary the spin time more, between 2-5 seconds
        rotateWheel();
    }

    function rotateWheel() {
        spinTime += 30;
        if (spinTime >= spinTimeTotal) {
            stopRotateWheel();
            return;
        }
        // Use an easing function for a more dynamic deceleration curve
        const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
        startAngle += (spinAngle * Math.PI / 180);
        drawWheel();
        requestAnimationFrame(rotateWheel);
    }

    function stopRotateWheel() {
        let degrees = startAngle * 180 / Math.PI;
        let arcd = 360 / currentSegments.length;
        let index = Math.floor((360 - (degrees % 360)) / arcd);
        ctx.save();
        alert(`You landed on: ${currentSegments[index]}`);
        ctx.restore();

        // Load the next wheel with countries if a continent is selected
        if (continentCountries[currentSegments[index]]) {
            updateWheel(continentCountries[currentSegments[index]]);
        }
    }

    function easeOut(t, b, c, d) {
        const ts = (t /= d) * t;
        const tc = ts * t;
        return b + c * (tc + -3 * ts + 3 * t);
    }

    function updateWheel(newSegments) {
        currentSegments = newSegments;
        startAngle = 0; // Reset start angle for the new wheel
        drawWheel();
    }

    canvas.addEventListener('click', spinWheel);

    // Initial drawing of the wheel.
    drawWheel();
});
