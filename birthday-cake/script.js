const canvas = document.getElementById('cakeCanvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

let particles = [];
let flameParticles = [];
let isCandleLit = true;

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initCake();
});

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.color = color;
        this.size = 2;
        this.density = (Math.random() * 20) + 2;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update(mouse) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = 100;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < maxDistance) {
            this.x -= directionX;
            this.y -= directionY;
        } else {
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 10;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 10;
            }
        }
    }
}

class FlameParticle {
    constructor(x, y) {
        this.x = x + (Math.random() - 0.5) * 6;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = -Math.random() * 2 - 1;
        this.alpha = 1;
        this.size = Math.random() * 4 + 2;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = '#ff7b00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 0.02;
    }
}

const mouse = { x: null, y: null };
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

function initCake() {
    particles = [];
    const centerX = width / 2;
    const centerY = height / 2 + 50;

    // Layer 1: Bottom Layer
    for (let i = -120; i <= 120; i += 6) {
        for (let j = 0; j <= 60; j += 6) {
            particles.push(new Particle(centerX + i, centerY + j, '#58a6ff'));
        }
    }

    // Layer 2: Top Layer
    for (let i = -80; i <= 80; i += 6) {
        for (let j = -50; j < 0; j += 6) {
            particles.push(new Particle(centerX + i, centerY + j, '#bc8cff'));
        }
    }

    // Candle Body
    for (let i = -5; i <= 5; i += 3) {
        for (let j = -90; j < -50; j += 4) {
            particles.push(new Particle(centerX + i, centerY + j, '#ffffff'));
        }
    }
}

function extinguishCandle() {
    if (isCandleLit) {
        isCandleLit = false;
        // Romantic code alert text
        const statusText = document.querySelector('.instruction');
        if (statusText) {
            statusText.innerHTML = `<span style="color:#7ee787;">> Candle Extinguished! <br>while(alive) { love++; } // Wish Granted! ❤️</span>`;
        }
    }
}

function initAudio() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            analyser.fftSize = 256;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            function checkBlow() {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                let average = sum / bufferLength;

                // Volume threshold for blowing
                if (average > 45 && isCandleLit) {
                    extinguishCandle();
                }
                requestAnimationFrame(checkBlow);
            }
            checkBlow();
        })
        .catch(err => {
            console.log("Microphone access denied or not supported.", err);
        });
}

window.addEventListener('click', () => {
    initAudio();
    extinguishCandle();
});

function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
        p.update(mouse);
        p.draw();
    });

    if (isCandleLit) {
        const candleTopX = width / 2;
        const candleTopY = height / 2 - 40;
        
        flameParticles.push(new FlameParticle(candleTopX, candleTopY));

        for (let i = flameParticles.length - 1; i >= 0; i--) {
            flameParticles[i].update();
            flameParticles[i].draw();
            if (flameParticles[i].alpha <= 0) {
                flameParticles.splice(i, 1);
            }
        }
    }

    requestAnimationFrame(animate);
}

initCake();
animate();