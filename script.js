document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const wheelRadius = canvas.width / 2; // Assuming the canvas is a square
    let segments = ['Africa', 'America', 'Asia', 'Europe', 'Oceania'];
    let currentSegments = segments;
    const segmentColors = ['#FFD700', '#C0C0C0', '#CD7F32', '#FFDF00', '#D3D3D3']; // Example colors for differentiation
    let spinAngleStart = 10;
    let startAngle = 0;
    let spinTime = 0;
    let spinTimeTotal = 0;

    const continentCountries = {
        'Europe': ['Sweden', 'Germany', 'France', 'Italy', 'Spain', 'Poland', 'Romania', 'Netherlands', 'Belgium', 'Greece', 'Portugal', 'Czech Republic', 'Hungary', 'Sweden', 'Austria', 'Switzerland', 'Bulgaria', 'Denmark', 'Finland', 'Norway', 'Ireland', 'Croatia', 'Lithuania', 'Slovakia', 'Slovenia', 'Latvia', 'Estonia', 'Montenegro', 'Luxembourg', 'Malta', 'Iceland', 'Andorra', 'Monaco', 'Liechtenstein', 'San Marino', 'Vatican City'],
        // Define other continents with their countries here...
    };

    function drawWheel() {
        const anglePerSegment = 2 * Math.PI / currentSegments.length;
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas for redraw

        currentSegments.forEach((segment, index) => {
            ctx.fillStyle = segmentColors[index % segmentColors.length];
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, canvas.height / 2);
            ctx.arc(canvas.width / 2, canvas.height / 2, wheelRadius, startAngle + anglePerSegment * index, startAngle + anglePerSegment * (index + 1));
            ctx.lineTo(canvas.width / 2, canvas.height / 2);
            ctx.fill();

            // Draw segment text
            ctx.save();
            ctx.fillStyle = 'black';
            ctx.translate(canvas.width / 2 + Math.cos(startAngle + anglePerSegment * (index + 0.5)) * wheelRadius / 2, canvas.height / 2 + Math.sin(startAngle + anglePerSegment * (index + 0.5)) * wheelRadius / 2);
            ctx.rotate(startAngle + anglePerSegment * (index + 0.5) + Math.PI / 2);
            ctx.fillText(segment, -ctx.measureText(segment).width / 2, 0);
            ctx.restore();
        });
    }

    function spinWheel() {
        spinTime = 0;
        spinTimeTotal = Math.random() * 3 + 4 * 1000; // Random spin time between 4-7 seconds
        rotateWheel();
    }

    function rotateWheel() {
        spinTime += 30;
        if (spinTime >= spinTimeTotal) {
            stopRotateWheel();
            return;
        }
        const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
        startAngle += (spinAngle * Math.PI / 180);
        drawWheel();
        requestAnimationFrame(rotateWheel);
    }

    function stopRotateWheel() {
        let degrees = startAngle * 180 / Math.PI + 90;
        let arcd = 360 / currentSegments.length;
        let index = Math.floor((360 - degrees % 360) / arcd);
        ctx.save();
        alert(`You landed on: ${currentSegments[index]}`); // Placeholder for action after spin
        ctx.restore();

        // Update wheel to show countries if a continent is selected
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
