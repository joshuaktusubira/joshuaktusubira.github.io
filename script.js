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
        const href = this.getAttribute('href');
        if (href === '#') return; // Do nothing for empty hash links
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// 3D Model Control Logic
function setupModelViewer(viewer) {
    if (!viewer) return;
    const toggleBtn = viewer.querySelector('.model-toggle-btn');
    const resetBtn = viewer.querySelector('.model-control-btn');

    toggleBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isActive = toggleBtn.classList.toggle('active');
        const label = toggleBtn.querySelector('span');
        const icon = toggleBtn.querySelector('i');

        if (isActive) {
            viewer.setAttribute('camera-controls', '');
            viewer.setAttribute('enable-pan', '');
            viewer.setAttribute('interaction-prompt', 'none');
            label.textContent = 'Interactive Mode';
            icon.className = 'fas fa-unlock';
        } else {
            viewer.removeAttribute('camera-controls');
            viewer.removeAttribute('enable-pan');
            viewer.removeAttribute('interaction-prompt');
            label.textContent = 'Explore 3D Design';
            icon.className = 'fas fa-play';
        }
    });

    resetBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        viewer.cameraOrbit = '0deg 75deg 105%';
        viewer.fieldOfView = '30deg';
        viewer.cameraTarget = 'auto auto auto';
    });
}

const existingViewers = document.querySelectorAll('model-viewer');
existingViewers.forEach(setupModelViewer);

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

function observeElements(elements) {
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Observe all sections and cards
observeElements(document.querySelectorAll('section, .project-card, .highlight-card, .skill-category, .certification-item, .research-card'));

function createCertificateItem(cert, basePath) {
    const item = document.createElement(cert.file ? 'a' : 'div');
    item.className = 'certification-item';
    
    if (cert.file) {
        item.href = `${basePath}/${cert.file}`;
        item.target = '_blank';
        item.rel = 'noopener noreferrer';
        item.setAttribute('aria-label', `Open ${cert.name}`);
    }

    if (cert.inProgress) {
        item.classList.add('in-progress');
    }

    const thumb = document.createElement('div');
    if (cert.logo) {
        thumb.className = 'cert-thumb cert-thumb-logo';
        const logoImg = document.createElement('img');
        logoImg.src = cert.logo;
        logoImg.alt = `${cert.name} logo`;
        logoImg.className = 'cert-logo-img';
        logoImg.loading = 'lazy';
        thumb.appendChild(logoImg);
    } else if (cert.file) {
        thumb.className = 'cert-thumb';
        const previewFrame = document.createElement('iframe');
        previewFrame.className = 'cert-thumb-frame';
        previewFrame.src = `${basePath}/${cert.file}#page=1&view=FitH`;
        previewFrame.title = cert.name;
        previewFrame.loading = 'lazy';
        previewFrame.setAttribute('scrolling', 'no');
        thumb.appendChild(previewFrame);
    } else {
        thumb.className = 'cert-thumb cert-thumb-pending';
        const icon = document.createElement('i');
        icon.className = 'fas fa-clock';
        thumb.appendChild(icon);
    }
    item.appendChild(thumb);

    const content = document.createElement('div');
    content.className = 'cert-content';

    const certTitle = document.createElement('h4');
    certTitle.className = 'cert-title';
    certTitle.textContent = cert.name;
    content.appendChild(certTitle);

    if (!cert.file) {
        const pendingLabel = document.createElement('span');
        pendingLabel.className = 'cert-pending-text';
        pendingLabel.textContent = 'Credential pending';
        content.appendChild(pendingLabel);
    }

    if (cert.tags && cert.tags.length) {
        const tagsRow = document.createElement('div');
        tagsRow.className = 'cert-tags';
        cert.tags.forEach((tag) => {
            const tagChip = document.createElement('span');
            tagChip.className = 'cert-tag';
            tagChip.textContent = tag;
            tagsRow.appendChild(tagChip);
        });
        content.appendChild(tagsRow);
    }

    item.appendChild(content);

    return item;
}

async function loadSkillsAndCertifications() {
    const skillsGrid = document.getElementById('skills-grid');
    if (!skillsGrid) return;

    try {
        const response = await fetch('skills_and_certifications.json');
        if (!response.ok) {
            throw new Error(`Failed to load certification data (${response.status})`);
        }

        const data = await response.json();
        skillsGrid.innerHTML = '';

        data.forEach((group) => {
            const card = document.createElement('article');
            card.className = 'skill-category';

            const headingRow = document.createElement('div');
            headingRow.className = 'skill-heading-row';

            const title = document.createElement('h3');
            title.textContent = group.category;
            headingRow.appendChild(title);

            if (group.relativePath) {
                const pill = document.createElement('span');
                pill.className = 'skill-pill';
                pill.textContent = 'Credential Track';
                headingRow.appendChild(pill);
            }

            card.appendChild(headingRow);

            if (group.certifications && group.certifications.length) {
                const skillList = document.createElement('div');
                skillList.className = 'skill-list';

                const tags = group.certifications.flatMap((cert) => cert.tags || []);
                const uniqueTags = [...new Set(tags)];

                uniqueTags.forEach((tag) => {
                    const tagChip = document.createElement('span');
                    tagChip.className = 'skill-item';
                    tagChip.textContent = tag;
                    skillList.appendChild(tagChip);
                });

                if (uniqueTags.length) {
                    card.appendChild(skillList);
                }

                const certificationsList = document.createElement('div');
                certificationsList.className = 'certifications-list';

                group.certifications.forEach((cert) => {
                    certificationsList.appendChild(createCertificateItem(cert, group.relativePath));
                });

                card.appendChild(certificationsList);
            }

            if (group.subcategories && group.subcategories.length) {
                const subcategoryWrap = document.createElement('div');
                subcategoryWrap.className = 'subcategory-wrap';

                group.subcategories.forEach((subcategory) => {
                    const subCard = document.createElement('div');
                    subCard.className = 'subcategory-group';

                    const subTitle = document.createElement('h4');
                    subTitle.className = 'subcategory-title';
                    subTitle.textContent = subcategory.name;
                    subCard.appendChild(subTitle);

                    const subCerts = document.createElement('div');
                    subCerts.className = 'certifications-list';

                    subcategory.certifications.forEach((cert) => {
                        subCerts.appendChild(createCertificateItem(cert, subcategory.relativePath));
                    });

                    subcategoryWrap.appendChild(subCard);
                    subCard.appendChild(subCerts);
                });

                card.appendChild(subcategoryWrap);
            }

            skillsGrid.appendChild(card);
        });

        observeElements(document.querySelectorAll('.skill-category, .certification-item, .subcategory-group'));
    } catch (error) {
        console.error('Unable to load skills and certifications', error);
        skillsGrid.innerHTML = '<p class="skills-error">Unable to load certification data right now.</p>';
    }
}

loadSkillsAndCertifications();

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

// Iteratively load CubeSat 3D Models
const cubeSatModels = [
    {
        id: "cubesat-2x3x4",
        title: "CubeSat Chassis 2x3x4",
        src: "assets/ProjectFiles/MinorEntries/CubeSAT frame designs/sat_chasis_2x3x4.glb",
        description: "A 2x3x4 CubeSat frame design ready for deployment.",
        tags: ["Engineering", "Space", "3D Model"]
    },
    {
        id: "cubesat-2x6x4",
        title: "CubeSat Chassis 2x6x4",
        src: "assets/ProjectFiles/MinorEntries/CubeSAT frame designs/sat_chasis_2x6x4.glb",
        description: "An extended 2x6x4 CubeSat frame designed for additional payload capacity.",
        tags: ["Engineering", "Space", "3D Model"]
    },
    {
        id: "cubesat-4x6",
        title: "CubeSat Chassis 4x6",
        src: "assets/ProjectFiles/MinorEntries/CubeSAT frame designs/sat_chasis_4x6.glb",
        description: "A robust 4x6 CubeSat frame architecture for versatile missions.",
        tags: ["Engineering", "Space", "3D Model"]
    }
];

const projectsContainer = document.querySelector('.projects-container');

if (projectsContainer) {
    cubeSatModels.forEach(model => {
        const card = document.createElement('div');
        card.className = 'project-card project-card-featured';
        
        const tagsHtml = model.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        card.innerHTML = `
            <div class="project-card-media">
                <div class="project-model">
                    <model-viewer
                        id="${model.id}"
                        src="${model.src}"
                        alt="Interactive 3D view of ${model.title}"
                        shadow-intensity="1.5"
                        interpolation-decay="200"
                        camera-orbit="0deg 75deg 105%"
                        field-of-view="30deg"
                        touch-action="none"
                        loading="eager"
                        reveal="auto"
                        style="background-color: #f8fafc;"
                    >
                        <div slot="poster" class="model-poster">
                            <div class="poster-overlay">
                                <i class="fas fa-cube"></i>
                                <span>Loading 3D model…</span>
                            </div>
                        </div>
                        <div class="model-controls">
                            <button class="model-toggle-btn" type="button" title="Toggle interactive controls">
                                <i class="fas fa-play"></i>
                                <span>Explore 3D Design</span>
                            </button>
                            <button class="model-control-btn" type="button" title="Reset View">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                    </model-viewer>
                </div>
            </div>
            <div class="project-card-content">
                <div class="project-card-copy">
                    <h3 class="project-title">${model.title}</h3>
                    <p class="project-description">${model.description}</p>
                    <div class="project-tags">
                        ${tagsHtml}
                    </div>
                    <a href="#" class="project-link">Rotate to inspect →</a>
                </div>
            </div>
        `;
        
        projectsContainer.appendChild(card);
        
        const viewer = card.querySelector('model-viewer');
        if (typeof setupModelViewer === 'function') {
            setupModelViewer(viewer);
        }
        
        if (typeof observeElements === 'function') {
            observeElements([card]);
        }
    });
}
