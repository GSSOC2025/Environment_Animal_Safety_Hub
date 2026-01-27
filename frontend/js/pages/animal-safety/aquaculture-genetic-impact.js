/**
 * Aquaculture Genetic Impact Page - Interactive Functionality
 * Handles data visualization, case studies, and user engagement
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: "ease-in-out",
            once: true,
            offset: 100
        });
    }

    // Initialize interactive elements
    initializeCaseStudyInteractions();
    initializeImpactVisualization();
    initializeRegulationAccordion();
    initializeScrollProgress();

    // Add data visualization for key statistics
    initializeDataVisualization();
});

/**
 * Initialize case study interactions
 */
function initializeCaseStudyInteractions() {
    const caseStudies = document.querySelectorAll('.case-study');

    caseStudies.forEach(study => {
        // Add click to expand/collapse
        study.addEventListener('click', function() {
            this.classList.toggle('expanded');

            // Animate expansion
            if (this.classList.contains('expanded')) {
                this.style.transform = 'scale(1.02)';
                this.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
            } else {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 3px 15px rgba(0,0,0,0.08)';
            }
        });

        // Add hover effects
        study.addEventListener('mouseenter', function() {
            if (!this.classList.contains('expanded')) {
                this.style.transform = 'translateY(-2px)';
            }
        });

        study.addEventListener('mouseleave', function() {
            if (!this.classList.contains('expanded')) {
                this.style.transform = 'translateY(0)';
            }
        });
    });
}

/**
 * Initialize impact visualization
 */
function initializeImpactVisualization() {
    const impactCards = document.querySelectorAll('.impact-card');

    impactCards.forEach((card, index) => {
        // Add staggered animation on scroll
        card.style.animationDelay = `${index * 0.1}s`;

        // Add click interaction
        card.addEventListener('click', function() {
            // Create ripple effect
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(46, 125, 50, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;

            this.style.position = 'relative';
            this.appendChild(ripple);

            // Remove ripple after animation
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add ripple animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize regulation accordion
 */
function initializeRegulationAccordion() {
    const regulationItems = document.querySelectorAll('.regulation-item');

    regulationItems.forEach(item => {
        const header = item.querySelector('h3');
        const list = item.querySelector('ul');

        // Initially collapse lists
        list.style.maxHeight = '0';
        list.style.overflow = 'hidden';
        list.style.transition = 'max-height 0.3s ease';

        header.addEventListener('click', function() {
            const isExpanded = list.style.maxHeight !== '0px';

            if (isExpanded) {
                list.style.maxHeight = '0';
                this.style.color = 'var(--primary-color, #2e7d32)';
            } else {
                list.style.maxHeight = list.scrollHeight + 'px';
                this.style.color = '#1e5a2f';
            }
        });

        // Add hover effect
        header.style.cursor = 'pointer';
        header.style.transition = 'color 0.3s ease';
        header.addEventListener('mouseenter', function() {
            this.style.color = '#1e5a2f';
        });
        header.addEventListener('mouseleave', function() {
            if (list.style.maxHeight === '0px') {
                this.style.color = 'var(--primary-color, #2e7d32)';
            }
        });
    });
}

/**
 * Initialize scroll progress indicator
 */
function initializeScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 4px;
        background: linear-gradient(90deg, #1e40af, #3b82f6, #60a5fa);
        z-index: 1001;
        transition: width 0.3s ease;
    `;

    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;

        progressBar.style.width = scrollPercent + '%';
    });
}

/**
 * Initialize data visualization for key statistics
 */
function initializeDataVisualization() {
    // Create a simple chart for aquaculture growth statistics
    const statsSection = document.querySelector('.intro-section');

    if (statsSection) {
        // Add a simple visualization container
        const vizContainer = document.createElement('div');
        vizContainer.className = 'data-visualization';
        vizContainer.style.cssText = `
            margin-top: 40px;
            padding: 30px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            text-align: center;
        `;

        vizContainer.innerHTML = `
            <h3 style="color: var(--primary-color, #2e7d32); margin-bottom: 20px;">Aquaculture Growth Trends</h3>
            <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 20px;">
                <div class="stat-viz">
                    <div class="stat-circle" style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #1e40af, #3b82f6); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin: 0 auto 10px;">527M</div>
                    <p style="margin: 0; color: var(--text-secondary, #666);">Tons of aquaculture production (2022)</p>
                </div>
                <div class="stat-viz">
                    <div class="stat-circle" style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #dc2626, #ef4444); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin: 0 auto 10px;">25%</div>
                    <p style="margin: 0; color: var(--text-secondary, #666);">Of global fish consumption from aquaculture</p>
                </div>
                <div class="stat-viz">
                    <div class="stat-circle" style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #2e7d32, #10b981); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin: 0 auto 10px;">8.2%</div>
                    <p style="margin: 0; color: var(--text-secondary, #666);">Annual growth rate</p>
                </div>
            </div>
        `;

        statsSection.appendChild(vizContainer);
    }
}

// Add interactive tooltips for technical terms
function initializeTooltips() {
    const terms = {
        'genetic contamination': 'The introduction of foreign genetic material into wild populations through interbreeding with escaped farmed fish.',
        'transgenic': 'Organisms that have had genes from other species artificially introduced into their genome.',
        'selective breeding': 'The process of breeding plants or animals for particular genetic traits over successive generations.',
        'pathogen': 'A microorganism that causes disease.',
        'eutrophication': 'The enrichment of water bodies with nutrients, leading to excessive algae growth and oxygen depletion.',
        'biocontainment': 'Methods to prevent genetically modified organisms from reproducing or spreading in the environment.'
    };

    // Find and add tooltips to technical terms
    Object.keys(terms).forEach(term => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        const elements = document.querySelectorAll('p, li');

        elements.forEach(element => {
            if (regex.test(element.textContent)) {
                element.innerHTML = element.innerHTML.replace(regex, `<span class="tooltip-term" title="${terms[term]}">$&</span>`);
            }
        });
    });

    // Style tooltips
    const tooltipStyle = document.createElement('style');
    tooltipStyle.textContent = `
        .tooltip-term {
            border-bottom: 1px dotted var(--primary-color, #2e7d32);
            cursor: help;
            position: relative;
        }

        .tooltip-term:hover::after {
            content: attr(title);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.9rem;
            white-space: nowrap;
            z-index: 1000;
            max-width: 300px;
            text-align: center;
        }
    `;
    document.head.appendChild(tooltipStyle);
}

// Initialize tooltips
initializeTooltips();

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation for images (if any)
function initializeImageLoading() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    });
}

initializeImageLoading();