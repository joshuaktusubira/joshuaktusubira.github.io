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
const cupViewer = document.getElementById('cup-viewer');
if (cupViewer) {
    const toggleBtn = cupViewer.querySelector('.model-toggle-btn');
    const resetBtn = cupViewer.querySelector('.model-control-btn');

    toggleBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isActive = toggleBtn.classList.toggle('active');
        const label = toggleBtn.querySelector('span');
        const icon = toggleBtn.querySelector('i');

        if (isActive) {
            cupViewer.setAttribute('camera-controls', '');
            cupViewer.setAttribute('enable-pan', '');
            cupViewer.setAttribute('interaction-prompt', 'none');
            label.textContent = 'Interactive Mode';
            icon.className = 'fas fa-unlock';
        } else {
            cupViewer.removeAttribute('camera-controls');
            cupViewer.removeAttribute('enable-pan');
            cupViewer.removeAttribute('interaction-prompt');
            label.textContent = 'Explore 3D Design';
            icon.className = 'fas fa-play';
        }
    });

    resetBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        cupViewer.cameraOrbit = '0deg 75deg 105%';
        cupViewer.fieldOfView = '30deg';
        cupViewer.cameraTarget = 'auto auto auto';
    });
}

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
    const item = document.createElement('div');
    item.className = 'certification-item';

    const certTitle = document.createElement('h4');
    certTitle.className = 'cert-title';
    certTitle.textContent = cert.name;
    item.appendChild(certTitle);

    const certLink = document.createElement('a');
    certLink.className = 'cert-link';
    certLink.href = `${basePath}/${cert.file}`;
    certLink.target = '_blank';
    certLink.rel = 'noopener noreferrer';
    certLink.setAttribute('aria-label', `Open ${cert.name}`);

    const thumb = document.createElement('div');
    thumb.className = 'cert-thumb';

    const previewFrame = document.createElement('iframe');
    previewFrame.className = 'cert-thumb-frame';
    previewFrame.src = `${basePath}/${cert.file}#page=1&view=FitH`;
    previewFrame.title = cert.name;
    previewFrame.loading = 'lazy';
    previewFrame.setAttribute('scrolling', 'no');
    thumb.appendChild(previewFrame);

    const thumbLabel = document.createElement('span');
    thumbLabel.className = 'cert-thumb-label';
    thumbLabel.textContent = 'View certificate';
    thumb.appendChild(thumbLabel);

    certLink.appendChild(thumb);
    item.appendChild(certLink);

    if (cert.tags && cert.tags.length) {
        const tagsRow = document.createElement('div');
        tagsRow.className = 'cert-tags';
        cert.tags.forEach((tag) => {
            const tagChip = document.createElement('span');
            tagChip.className = 'cert-tag';
            tagChip.textContent = tag;
            tagsRow.appendChild(tagChip);
        });
        item.appendChild(tagsRow);
    }

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
