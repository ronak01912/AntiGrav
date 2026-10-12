// Visual Effects Engine: Ambient Particle Canvas & Win Confetti Fireworks

class EffectsEngine {
    constructor() {
        this.ambientCanvas = null;
        this.ambientCtx = null;
        this.confettiCanvas = null;
        this.confettiCtx = null;

        this.particles = [];
        this.confettiList = [];
        this.isConfettiRunning = false;
        this.ambientAnimId = null;
        this.confettiAnimId = null;
    }

    init(ambientCanvasId = 'ambient-canvas', confettiCanvasId = 'confetti-canvas') {
        this.ambientCanvas = document.getElementById(ambientCanvasId);
        this.confettiCanvas = document.getElementById(confettiCanvasId);

        if (this.ambientCanvas) {
            this.ambientCtx = this.ambientCanvas.getContext('2d');
            this.resizeCanvas(this.ambientCanvas);
            this.initAmbientParticles();
            this.startAmbientAnimation();
        }

        if (this.confettiCanvas) {
            this.confettiCtx = this.confettiCanvas.getContext('2d');
            this.resizeCanvas(this.confettiCanvas);
        }

        window.addEventListener('resize', () => {
            if (this.ambientCanvas) this.resizeCanvas(this.ambientCanvas);
            if (this.confettiCanvas) this.resizeCanvas(this.confettiCanvas);
        });
    }

    resizeCanvas(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // --- AMBIENT PARTICLES ---
    initAmbientParticles() {
        this.particles = [];
        const count = Math.min(45, Math.floor((window.innerWidth * window.innerHeight) / 25000));
        const colors = [
            'rgba(0, 240, 255, ',    // Cyan
            'rgba(255, 230, 0, ',    // Yellow / Amber
            'rgba(147, 51, 234, ',   // Violet
            'rgba(59, 130, 246, '    // Blue
        ];

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.ambientCanvas.width,
                y: Math.random() * this.ambientCanvas.height,
                radius: Math.random() * 2.2 + 0.6,
                colorPrefix: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.4 + 0.1,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                pulseSpeed: Math.random() * 0.02 + 0.005,
                pulseAngle: Math.random() * Math.PI * 2
            });
        }
    }

    startAmbientAnimation() {
        const render = () => {
            if (!this.ambientCtx) return;
            const w = this.ambientCanvas.width;
            const h = this.ambientCanvas.height;

            this.ambientCtx.clearRect(0, 0, w, h);

            for (const p of this.particles) {
                p.x += p.vx;
                p.y += p.vy;
                p.pulseAngle += p.pulseSpeed;

                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;

                const currentAlpha = p.alpha + Math.sin(p.pulseAngle) * 0.15;
                const safeAlpha = Math.max(0.05, Math.min(0.6, currentAlpha));

                this.ambientCtx.beginPath();
                this.ambientCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ambientCtx.fillStyle = `${p.colorPrefix}${safeAlpha})`;
                this.ambientCtx.shadowBlur = 12;
                this.ambientCtx.shadowColor = `${p.colorPrefix}0.6)`;
                this.ambientCtx.fill();
            }

            this.ambientAnimId = requestAnimationFrame(render);
        };
        render();
    }

    // --- VICTORY CONFETTI BURST ---
    fireConfetti(winnerSymbol) {
        if (!this.confettiCtx || !this.confettiCanvas) return;
        this.resizeCanvas(this.confettiCanvas);

        const colorPalettes = {
            'X': ['#00F0FF', '#38BDF8', '#818CF8', '#FFFFFF', '#67E8F9'],
            'O': ['#FFE600', '#FACC15', '#FDE047', '#FEF08A', '#FFFFFF'],
            'tie': ['#A855F7', '#C084FC', '#38BDF8', '#F472B6', '#E2E8F0']
        };

        const chosenPalette = colorPalettes[winnerSymbol] || colorPalettes['X'];
        const numPieces = 130;
        const cx = this.confettiCanvas.width / 2;
        const cy = this.confettiCanvas.height / 2;

        for (let i = 0; i < numPieces; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 12 + 5;
            this.confettiList.push({
                x: cx + (Math.random() - 0.5) * 80,
                y: cy + (Math.random() - 0.5) * 80,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 4,
                w: Math.random() * 8 + 5,
                h: Math.random() * 5 + 3,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                color: chosenPalette[Math.floor(Math.random() * chosenPalette.length)],
                alpha: 1,
                decay: Math.random() * 0.012 + 0.008,
                gravity: 0.28
            });
        }

        if (!this.isConfettiRunning) {
            this.isConfettiRunning = true;
            this.renderConfetti();
        }
    }

    renderConfetti() {
        if (!this.confettiCtx) return;

        const loop = () => {
            this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

            for (let i = this.confettiList.length - 1; i >= 0; i--) {
                const c = this.confettiList[i];
                c.x += c.vx;
                c.y += c.vy;
                c.vy += c.gravity;
                c.vx *= 0.985;
                c.rotation += c.rotationSpeed;
                c.alpha -= c.decay;

                if (c.alpha <= 0) {
                    this.confettiList.splice(i, 1);
                    continue;
                }

                this.confettiCtx.save();
                this.confettiCtx.translate(c.x, c.y);
                this.confettiCtx.rotate((c.rotation * Math.PI) / 180);
                this.confettiCtx.globalAlpha = Math.max(0, c.alpha);
                this.confettiCtx.fillStyle = c.color;
                this.confettiCtx.shadowColor = c.color;
                this.confettiCtx.shadowBlur = 6;
                this.confettiCtx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
                this.confettiCtx.restore();
            }

            if (this.confettiList.length > 0) {
                this.confettiAnimId = requestAnimationFrame(loop);
            } else {
                this.isConfettiRunning = false;
                this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
            }
        };
        loop();
    }

    clearConfetti() {
        this.confettiList = [];
        if (this.confettiCtx && this.confettiCanvas) {
            this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
        }
    }
}

window.effectsEngine = new EffectsEngine();
