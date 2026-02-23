// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {

    // 1. Sticky Navbar & Active Link Update on Scroll
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        // Navbar background toggle
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active link highlighting
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // 2. Mobile Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navLinksContainer = document.querySelector('.nav-links');
    // We'll add a simple inline style toggle for mobile menu for now
    // A better approach is usually a separate CSS class

    hamburger.addEventListener('click', () => {
        const isDisplayed = navLinksContainer.style.display === 'flex';
        if (isDisplayed) {
            navLinksContainer.style.display = 'none';
        } else {
            navLinksContainer.style.display = 'flex';
            navLinksContainer.style.flexDirection = 'column';
            navLinksContainer.style.position = 'absolute';
            navLinksContainer.style.top = '100%';
            navLinksContainer.style.left = '0';
            navLinksContainer.style.width = '100%';
            navLinksContainer.style.background = 'rgba(13, 13, 13, 0.95)';
            navLinksContainer.style.padding = '20px';
            navLinksContainer.style.borderBottom = '1px solid var(--glass-border)';
        }
    });

    // 3. Scroll Reveal Animations (Intersection Observer)
    function reveal() {
        var reveals = document.querySelectorAll(".reveal");
        for (var i = 0; i < reveals.length; i++) {
            var windowHeight = window.innerHeight;
            var elementTop = reveals[i].getBoundingClientRect().top;
            var elementVisible = 100;
            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add("active");
            }
        }
    }
    window.addEventListener("scroll", reveal);

    // Trigger once on load to show elements above the fold
    reveal();

    // 4. Intro Animation Sequence (Removed)

    // 5. 3D Tilt Effect on Cards (Disabled per user request)
    // if (typeof VanillaTilt !== 'undefined') {
    //     VanillaTilt.init(document.querySelectorAll(".glass-panel:not(.no-tilt)"), {
    //         max: 10,
    //         speed: 400,
    //         glare: true,
    //         "max-glare": 0.15,
    //         scale: 1.02
    //     });
    // }

    // 6. 3D Rotating Particle / Constellation Background
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let w, h;

        function resizeCanvas() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const nodes = [];
        const numNodes = window.innerWidth < 768 ? 30 : 70; // Particles for background

        for (let i = 0; i < numNodes; i++) {
            nodes.push({
                x: (Math.random() - 0.5) * 2000,
                y: (Math.random() - 0.5) * 2000,
                z: (Math.random() - 0.5) * 2000,
            });
        }

        let baseAngleX = 0;
        let baseAngleY = 0;
        let targetMouseX = 0;
        let targetMouseY = 0;
        let currentMouseX = 0;
        let currentMouseY = 0;

        // Interactive Mouse Tracking for Background
        window.addEventListener('mousemove', (e) => {
            // Normalize mouse position from -1 to 1
            targetMouseX = (e.clientX / w) * 2 - 1;
            targetMouseY = (e.clientY / h) * 2 - 1;
        });

        function drawBackground() {
            ctx.clearRect(0, 0, w, h);
            // Match main background colour
            ctx.fillStyle = '#0D0D0D';
            ctx.fillRect(0, 0, w, h);

            // Auto-rotate constantly in one direction
            baseAngleX += 0.001;
            baseAngleY += 0.0015;

            // Smoothly interpolate mouse movement for interactive parallax
            currentMouseX += (targetMouseX - currentMouseX) * 0.05;
            currentMouseY += (targetMouseY - currentMouseY) * 0.05;

            // Total rotation = base + mouse influence
            // Multiply mouse input to increase tracking sensitivity
            const angleX = baseAngleX + currentMouseY * 0.5;
            const angleY = baseAngleY + currentMouseX * 0.5;

            const cx = Math.cos(angleX), sx = Math.sin(angleX);
            const cy = Math.cos(angleY), sy = Math.sin(angleY);

            const projected = [];

            nodes.forEach(node => {
                // Y-axis rotation
                let x1 = node.x * cy - node.z * sy;
                let z1 = node.z * cy + node.x * sy;
                // X-axis rotation
                let y1 = node.y * cx - z1 * sx;
                let z2 = z1 * cx + node.y * sx;

                const fov = 800; // Field of View
                const z = z2 + 1500; // Camera distance

                if (z > 50) { // Limit z depth to fade out gently before hitting 0
                    const scale = fov / z;
                    projected.push({
                        x: w / 2 + x1 * scale,
                        y: h / 2 + y1 * scale,
                        z: z,
                        scale: scale
                    });
                }
            });

            // Draw Connections and Nodes
            ctx.lineWidth = 0.5;
            for (let i = 0; i < projected.length; i++) {
                let p1 = projected[i];

                // Smooth fade out based on Z index
                const alpha = Math.max(0, Math.min(1, (3000 - p1.z) / 2500));

                // Node Point
                ctx.beginPath();
                ctx.arc(p1.x, p1.y, 1.5 * p1.scale, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 191, 255, ${alpha})`;
                ctx.fill();

                // Form Constellations
                for (let j = i + 1; j < projected.length; j++) {
                    let p2 = projected[j];
                    let dx = p1.x - p2.x;
                    let dy = p1.y - p2.y;
                    let dist = dx * dx + dy * dy;

                    // Connect condition
                    if (dist < 15000) {
                        const lineAlpha = alpha * Math.max(0, 1 - dist / 15000);
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(138, 43, 226, ${lineAlpha})`;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(drawBackground);
        }

        drawBackground();
    }

});
