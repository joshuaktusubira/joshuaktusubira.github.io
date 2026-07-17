// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections and cards
document.querySelectorAll('section, .project-card, .highlight-card, .certification-item, .research-card, .webgl-demo-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add active state to navigation links based on scroll position
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Add active class styling
const style = document.createElement('style');
style.textContent = `
    .nav-link.active {
        color: var(--primary-color);
    }
    .nav-link.active::after {
        width: 100%;
    }
`;
document.head.appendChild(style);

function initWebGLDemo() {
    const canvas = document.getElementById('webgl-canvas');
    const status = document.getElementById('webgl-status');
    if (!canvas || !status) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        status.textContent = 'WebGL is not supported in this browser.';
        return;
    }

    const vertexShaderSource = `
        attribute vec2 a_position;
        attribute vec3 a_color;
        uniform float u_angle;
        varying vec3 v_color;
        void main() {
            float c = cos(u_angle);
            float s = sin(u_angle);
            vec2 rotated = vec2(
                a_position.x * c - a_position.y * s,
                a_position.x * s + a_position.y * c
            );
            gl_Position = vec4(rotated, 0.0, 1.0);
            v_color = a_color;
        }
    `;

    const fragmentShaderSource = `
        precision mediump float;
        varying vec3 v_color;
        void main() {
            gl_FragColor = vec4(v_color, 1.0);
        }
    `;

    function createShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            console.error('Shader compilation failed:', error);
            status.textContent = 'Shader compilation failed. Check the developer console for details.';
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(program);
        console.error('Program linking failed:', error);
        status.textContent = 'WebGL program failed to link. Check the developer console for details.';
        return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.6,
        -0.55, -0.3,
        0.55, -0.3
    ]), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.95, 0.55, 0.15,
        0.20, 0.65, 0.95,
        0.35, 0.80, 0.60
    ]), gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'a_position');
    const aColor = gl.getAttribLocation(program, 'a_color');
    const uAngle = gl.getUniformLocation(program, 'u_angle');

    function resizeCanvasToDisplaySize(canvasElement) {
        const displayWidth = Math.floor(canvasElement.clientWidth * window.devicePixelRatio);
        const displayHeight = Math.floor(canvasElement.clientHeight * window.devicePixelRatio);
        if (canvasElement.width !== displayWidth || canvasElement.height !== displayHeight) {
            canvasElement.width = displayWidth;
            canvasElement.height = displayHeight;
        }
    }

    function render(angle) {
        resizeCanvasToDisplaySize(canvas);
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(0.08, 0.10, 0.18, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);

        gl.enableVertexAttribArray(aPosition);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(aColor);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);

        gl.uniform1f(uAngle, angle);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        requestAnimationFrame((timestamp) => render(timestamp * 0.001));
    }

    status.textContent = 'WebGL demo loaded successfully.';
    requestAnimationFrame((timestamp) => render(timestamp * 0.001));
}

if (document.readyState !== 'loading') {
    initWebGLDemo();
} else {
    document.addEventListener('DOMContentLoaded', initWebGLDemo);
}
