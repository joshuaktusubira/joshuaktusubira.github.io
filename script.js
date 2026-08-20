/* ============================================================
   NAVIGATION — Mobile toggle
   ============================================================ */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

/* ============================================================
   SMOOTH SCROLLING
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        }
    });
});

/* ============================================================
   NAVBAR — shadow on scroll
   ============================================================ */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    navbar.style.boxShadow = window.pageYOffset > 100
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        : '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
});

/* ============================================================
   NAV ACTIVE LINK — scroll spy
   ============================================================ */
const sections = document.querySelectorAll('section[id]');

// Inject active-link CSS once
const activeStyle = document.createElement('style');
activeStyle.textContent = `
    .nav-link.active { color: var(--primary-color); }
    .nav-link.active::after { width: 100%; }
`;
document.head.appendChild(activeStyle);

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const top    = section.offsetTop - 100;
        const height = section.clientHeight;
        if (window.pageYOffset >= top && window.pageYOffset < top + height) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        // Map the merged "Skills & Certs" nav item to both #skills and #certifications anchors
        const href = link.getAttribute('href').replace('#', '');
        if (href === current || (href === 'skills' && current === 'certifications')) {
            link.classList.add('active');
        }
    });
});

/* ============================================================
   INTERSECTION OBSERVER — fade-in on scroll
   ============================================================ */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity    = '1';
            entry.target.style.transform  = 'translateY(0)';
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

function observeElements(elements) {
    elements.forEach(el => {
        el.style.opacity   = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Observe static elements immediately
observeElements(document.querySelectorAll('section, .highlight-card'));

/* ============================================================
   3D MODEL VIEWER CONTROLS
   ============================================================ */
function setupModelViewer(modelViewerEl) {
    if (!modelViewerEl) return;

    const toggleBtn = modelViewerEl.querySelector('.model-toggle-btn');
    const resetBtn  = modelViewerEl.querySelector('.model-control-btn');

    toggleBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isActive = toggleBtn.classList.toggle('active');
        const label    = toggleBtn.querySelector('span');
        const icon     = toggleBtn.querySelector('i');

        if (isActive) {
            modelViewerEl.setAttribute('camera-controls', '');
            modelViewerEl.setAttribute('enable-pan', '');
            modelViewerEl.setAttribute('interaction-prompt', 'none');
            label.textContent  = 'Interactive Mode';
            icon.className     = 'fas fa-unlock';
        } else {
            modelViewerEl.removeAttribute('camera-controls');
            modelViewerEl.removeAttribute('enable-pan');
            modelViewerEl.removeAttribute('interaction-prompt');
            label.textContent  = 'Explore 3D Design';
            icon.className     = 'fas fa-play';
        }
    });

    resetBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        modelViewerEl.cameraOrbit  = modelViewerEl.dataset.defaultOrbit || '0deg 75deg 105%';
        modelViewerEl.fieldOfView  = modelViewerEl.dataset.defaultFov   || '30deg';
        modelViewerEl.cameraTarget = 'auto auto auto';
    });
}

/* ============================================================
   PROJECTS — load from projects.json
   ============================================================ */
function buildProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card project-card-featured';

    const tagsHtml = (project.tags || [])
        .map(tag => `<span class="tag">${tag}</span>`)
        .join('');

    const linkHtml = project.link
        ? `<a href="${project.link}" target="_blank" rel="noopener noreferrer" class="project-link">View project →</a>`
        : `<a href="#${project.id}" class="project-link">Rotate to inspect →</a>`;

    card.innerHTML = `
        <div class="project-card-media">
            <div class="project-model">
                <model-viewer
                    id="${project.id}"
                    src="${project.model}"
                    alt="Interactive 3D view of ${project.title}"
                    shadow-intensity="1.5"
                    interpolation-decay="200"
                    camera-orbit="${project.cameraOrbit || '0deg 75deg 105%'}"
                    field-of-view="${project.fieldOfView || '30deg'}"
                    data-default-orbit="${project.cameraOrbit || '0deg 75deg 105%'}"
                    data-default-fov="${project.fieldOfView || '30deg'}"
                    touch-action="none"
                    loading="lazy"
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
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tags">${tagsHtml}</div>
                ${linkHtml}
            </div>
        </div>
    `;

    return card;
}

async function loadProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    try {
        const res  = await fetch('projects.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        container.innerHTML = '';
        data.forEach(project => {
            const card = buildProjectCard(project);
            container.appendChild(card);

            const viewer = card.querySelector('model-viewer');
            setupModelViewer(viewer);
        });

        observeElements(container.querySelectorAll('.project-card'));
    } catch (err) {
        console.error('Could not load projects:', err);
        container.innerHTML = '<p class="skills-error">Unable to load projects right now.</p>';
    }
}

/* ============================================================
   RESEARCH — load from research.json
   ============================================================ */
function buildResearchCard(item) {
    const card = document.createElement('div');
    card.className = 'research-card';

    const iconValue = item.icon || item.favicon;
    const tags = Array.isArray(item.tags)
        ? item.tags
        : typeof item.tags === 'string'
            ? item.tags.split(',').map(tag => tag.trim()).filter(Boolean)
            : [];
    const tagsHtml = tags
        .map(tag => `<span class="tag">${tag}</span>`)
        .join('');
    const icon = document.createElement('div');
    icon.className = 'research-card-icon';

    if (iconValue && (/^https?:\/\//i.test(iconValue) || /\.(png|jpe?g|gif|svg|webp|ico)(\?.*)?$/i.test(iconValue))) {
        const image = document.createElement('img');
        image.src = iconValue;
        image.alt = `${item.title} favicon`;
        image.loading = 'lazy';
        icon.appendChild(image);
    } else {
        icon.textContent = iconValue || '🔬';
    }

    const linkOpen  = item.link ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer" class="research-card-link">` : '';
    const linkClose = item.link ? '</a>' : '';

    card.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        ${tagsHtml ? `<div class="project-tags research-card-tags">${tagsHtml}</div>` : ''}
        ${linkOpen}<span class="status-badge">${item.status || 'In Progress'}</span>${linkClose}
    `;
    card.prepend(icon);

    return card;
}

async function loadResearch() {
    const grid = document.getElementById('research-grid');
    if (!grid) return;

    try {
        const res  = await fetch('research.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        grid.innerHTML = '';
        data.forEach(item => {
            grid.appendChild(buildResearchCard(item));
        });

        observeElements(grid.querySelectorAll('.research-card'));
    } catch (err) {
        console.error('Could not load research:', err);
        grid.innerHTML = '<p class="skills-error">Unable to load research right now.</p>';
    }
}

/* ============================================================
   CERTIFICATIONS — grouped accordion + individual items
   ============================================================ */
function resolveCertificationFile(file, basePath) {
    if (/^https?:\/\//i.test(file)) return file;
    return `${basePath}/${file}`;
}

function buildCertGroupAccordion(groupName, certs, basePath, logo) {
    const wrapper = document.createElement('div');
    wrapper.className = 'cert-group';

    /* Header */
    const header = document.createElement('button');
    header.className    = 'cert-group-header';
    header.type         = 'button';
    header.setAttribute('aria-expanded', 'false');

    const logoHtml = logo
        ? `<img src="${logo}" alt="${groupName} logo" class="cert-group-logo" loading="lazy">`
        : `<div class="cert-group-logo" style="background:#f1f5f9;display:flex;align-items:center;justify-content:center;"><i class="fas fa-certificate" style="color:#94a3b8;font-size:1.2rem;"></i></div>`;

    const issuer = certs[0]?.issuer || '';

    header.innerHTML = `
        ${logoHtml}
        <div class="cert-group-info">
            <div class="cert-group-name">${groupName}</div>
            ${issuer ? `<div class="cert-group-issuer">${issuer}</div>` : ''}
        </div>
        <div class="cert-group-meta">
            <span class="cert-group-count">${certs.length}</span>
            <i class="fas fa-chevron-down cert-group-chevron"></i>
        </div>
    `;

    /* Body */
    const body = document.createElement('div');
    body.className = 'cert-group-body';
    body.setAttribute('aria-hidden', 'true');

    const list = document.createElement('div');
    list.className = 'cert-group-list';

    certs.forEach(cert => {
        if (cert.inProgress || !cert.file) {
            const item = document.createElement('div');
            item.className = 'cert-group-item cert-group-item--pending';
            item.innerHTML = `
                <span class="cert-group-item-name">${cert.name} <em style="font-size:0.78rem;opacity:0.7;">(pending)</em></span>
            `;
            list.appendChild(item);
        } else {
            const item = document.createElement('a');
            item.className  = 'cert-group-item';
            item.href       = resolveCertificationFile(cert.file, basePath);
            item.target     = '_blank';
            item.rel        = 'noopener noreferrer';
            item.setAttribute('aria-label', `Open ${cert.name}`);
            item.innerHTML  = `
                <span class="cert-group-item-name">${cert.name}</span>
                <i class="fas fa-external-link-alt cert-group-item-icon"></i>
            `;
            list.appendChild(item);
        }
    });

    body.appendChild(list);

    header.addEventListener('click', () => {
        const isOpen = wrapper.classList.toggle('open');
        header.setAttribute('aria-expanded', String(isOpen));
        body.setAttribute('aria-hidden',     String(!isOpen));
    });

    wrapper.appendChild(header);
    wrapper.appendChild(body);
    return wrapper;
}

function buildCertItem(cert, basePath) {
    const item = document.createElement(cert.file ? 'a' : 'div');
    item.className = 'certification-item';

    if (cert.file) {
        item.href   = resolveCertificationFile(cert.file, basePath);
        item.target = '_blank';
        item.rel    = 'noopener noreferrer';
        item.setAttribute('aria-label', `Open ${cert.name}`);
    }

    if (cert.inProgress) item.classList.add('in-progress');

    /* Thumbnail */
    const thumb = document.createElement('div');
    if (cert.logo) {
        thumb.className = 'cert-thumb cert-thumb-logo';
        const img = document.createElement('img');
        img.src       = cert.logo;
        img.alt       = `${cert.name} logo`;
        img.className = 'cert-logo-img';
        img.loading   = 'lazy';
        thumb.appendChild(img);
    } else if (cert.file) {
        thumb.className = 'cert-thumb';
        const frame = document.createElement('iframe');
        frame.className = 'cert-thumb-frame';
        frame.src       = `${resolveCertificationFile(cert.file, basePath)}#page=1&view=FitH`;
        frame.title     = cert.name;
        frame.loading   = 'lazy';
        frame.setAttribute('scrolling', 'no');
        thumb.appendChild(frame);
    } else {
        thumb.className = 'cert-thumb cert-thumb-pending';
        const icon = document.createElement('i');
        icon.className = 'fas fa-clock';
        thumb.appendChild(icon);
    }
    item.appendChild(thumb);

    /* Content */
    const content = document.createElement('div');
    content.className = 'cert-content';

    const title = document.createElement('h4');
    title.className   = 'cert-title';
    title.textContent = cert.name;
    content.appendChild(title);

    if (!cert.file) {
        const pending = document.createElement('span');
        pending.className   = 'cert-pending-text';
        pending.textContent = 'Credential pending';
        content.appendChild(pending);
    }

    item.appendChild(content);
    return item;
}

async function loadSkillsAndCertifications() {
    const skillsGrid = document.getElementById('skills-grid');
    if (!skillsGrid) return;

    try {
        const res  = await fetch('skills_and_certifications.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        skillsGrid.innerHTML = '';

        data.forEach(group => {
            const card = document.createElement('article');
            card.className = 'skill-category';

            /* Heading row */
            const headingRow = document.createElement('div');
            headingRow.className = 'skill-heading-row';

            const title = document.createElement('h3');
            title.textContent = group.category;
            headingRow.appendChild(title);

            card.appendChild(headingRow);

            /* Group certs by their "group" key */
            if (group.certifications?.length) {
                const grouped    = {};   // group key → [{cert}, ...]
                const ungrouped  = [];   // certs with no group (or singleton group)

                group.certifications.forEach(cert => {
                    if (cert.group) {
                        (grouped[cert.group] = grouped[cert.group] || []).push(cert);
                    } else {
                        ungrouped.push(cert);
                    }
                });

                // Singleton groups → treat as ungrouped
                Object.entries(grouped).forEach(([key, certs]) => {
                    if (certs.length === 1) {
                        ungrouped.push(certs[0]);
                        delete grouped[key];
                    }
                });

                const certsList = document.createElement('div');
                certsList.className = 'certifications-list';

                /* Render accordions first */
                Object.entries(grouped).forEach(([groupName, certs]) => {
                    const logo = certs[0]?.logo || null;
                    certsList.appendChild(
                        buildCertGroupAccordion(groupName, certs, group.relativePath, logo)
                    );
                });

                /* Render ungrouped individual items */
                ungrouped.forEach(cert => {
                    certsList.appendChild(buildCertItem(cert, group.relativePath));
                });

                card.appendChild(certsList);
            }

            /* Subcategories (if any) */
            if (group.subcategories?.length) {
                const subWrap = document.createElement('div');
                subWrap.className = 'subcategory-wrap';

                group.subcategories.forEach(sub => {
                    const subCard  = document.createElement('div');
                    subCard.className = 'subcategory-group';

                    const subTitle = document.createElement('h4');
                    subTitle.className   = 'subcategory-title';
                    subTitle.textContent = sub.name;
                    subCard.appendChild(subTitle);

                    const subCerts = document.createElement('div');
                    subCerts.className = 'certifications-list';
                    sub.certifications.forEach(cert => {
                        subCerts.appendChild(buildCertItem(cert, sub.relativePath));
                    });

                    subCard.appendChild(subCerts);
                    subWrap.appendChild(subCard);
                });

                card.appendChild(subWrap);
            }

            skillsGrid.appendChild(card);
        });

        observeElements(skillsGrid.querySelectorAll('.skill-category, .certification-item, .cert-group, .subcategory-group'));
    } catch (err) {
        console.error('Unable to load skills and certifications:', err);
        skillsGrid.innerHTML = '<p class="skills-error">Unable to load certification data right now.</p>';
    }
}

/* ============================================================
   BOOT — kick off all async loaders
   ============================================================ */
loadProjects();
loadResearch();
loadSkillsAndCertifications();
