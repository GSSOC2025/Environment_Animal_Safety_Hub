/**
 * Water Runoff Simulation Dashboard
 * Interactive hydrological modeling tool for environmental monitoring
 */

// Global variables
let runoffMap = null;
let runoffChart = null;
let infiltrationChart = null;
let currentSimulation = null;
let isRunning = false;

// Simulation parameters
const SIMULATION_PARAMS = {
    slope: 5,           // degrees
    soilType: 'loam',   // soil type
    vegetation: 60,     // percentage
    rainfall: 25,       // mm/hour
    duration: 60,       // minutes
    area: 1000          // square meters
};

// Soil properties database
const SOIL_PROPERTIES = {
    sand: {
        infiltration: 15,    // mm/hour
        runoff: 85,          // percentage
        retention: 0.1,      // capacity
        name: 'Sandy Soil'
    },
    loam: {
        infiltration: 8,     // mm/hour
        runoff: 75,          // percentage
        retention: 0.2,      // capacity
        name: 'Loam Soil'
    },
    clay: {
        infiltration: 3,     // mm/hour
        runoff: 90,          // percentage
        retention: 0.3,      // capacity
        name: 'Clay Soil'
    },
    silt: {
        infiltration: 5,     // mm/hour
        runoff: 80,          // percentage
        retention: 0.25,     // capacity
        name: 'Silt Soil'
    }
};

// Vegetation impact factors
const VEGETATION_FACTORS = {
    0: { runoff: 1.0, infiltration: 0.5, name: 'Bare Soil' },
    20: { runoff: 0.9, infiltration: 0.6, name: 'Sparse Vegetation' },
    40: { runoff: 0.7, infiltration: 0.8, name: 'Moderate Vegetation' },
    60: { runoff: 0.5, infiltration: 1.0, name: 'Dense Vegetation' },
    80: { runoff: 0.3, infiltration: 1.2, name: 'Very Dense Vegetation' },
    100: { runoff: 0.1, infiltration: 1.5, name: 'Forest Cover' }
};

// Slope impact factors
const SLOPE_FACTORS = {
    0: { runoff: 0.5, infiltration: 1.2 },
    5: { runoff: 0.7, infiltration: 1.0 },
    10: { runoff: 0.9, infiltration: 0.8 },
    15: { runoff: 1.0, infiltration: 0.7 },
    20: { runoff: 1.2, infiltration: 0.6 },
    25: { runoff: 1.4, infiltration: 0.5 },
    30: { runoff: 1.6, infiltration: 0.4 }
};

/**
 * Initialize the dashboard when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    initializeCharts();
    initializeMap();
    loadDefaultScenario();
});

/**
 * Initialize dashboard components
 */
function initializeDashboard() {
    console.log('Initializing Water Runoff Simulation Dashboard...');

    // Set initial values for controls
    document.getElementById('slope-control').value = SIMULATION_PARAMS.slope;
    document.getElementById('soil-control').value = SIMULATION_PARAMS.soilType;
    document.getElementById('vegetation-control').value = SIMULATION_PARAMS.vegetation;
    document.getElementById('rainfall-control').value = SIMULATION_PARAMS.rainfall;
    document.getElementById('duration-control').value = SIMULATION_PARAMS.duration;

    updateControlValues();
}

/**
 * Setup event listeners for interactive elements
 */
function setupEventListeners() {
    // Control inputs
    const controls = ['slope-control', 'vegetation-control', 'rainfall-control', 'duration-control'];
    controls.forEach(id => {
        document.getElementById(id).addEventListener('input', handleControlChange);
    });

    // Soil type selector
    document.getElementById('soil-control').addEventListener('change', handleControlChange);

    // Run simulation button
    document.getElementById('run-simulation').addEventListener('click', runSimulation);

    // Map layer buttons
    document.querySelectorAll('.layer-btn').forEach(btn => {
        btn.addEventListener('click', handleLayerToggle);
    });

    // Map tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', handleToolClick);
    });

    // Scenario buttons
    document.querySelectorAll('.scenario-btn').forEach(btn => {
        btn.addEventListener('click', handleScenarioSelect);
    });

    // Custom scenario controls
    document.querySelectorAll('.custom-control input, .custom-control select').forEach(control => {
        control.addEventListener('input', handleCustomScenarioChange);
        control.addEventListener('change', handleCustomScenarioChange);
    });

    // Calculate custom scenario button
    document.getElementById('calculate-custom')?.addEventListener('click', calculateCustomScenario);

    // Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
}

/**
 * Initialize Chart.js charts
 */
function initializeCharts() {
    // Runoff chart
    const runoffCtx = document.getElementById('runoff-chart');
    if (runoffCtx) {
        runoffChart = new Chart(runoffCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Runoff Rate (mm/hour)',
                    data: [],
                    borderColor: '#D32F2F',
                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Runoff Rate Over Time'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time (minutes)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Runoff Rate (mm/hour)'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Infiltration chart
    const infiltrationCtx = document.getElementById('infiltration-chart');
    if (infiltrationCtx) {
        infiltrationChart = new Chart(infiltrationCtx, {
            type: 'bar',
            data: {
                labels: ['Infiltration', 'Runoff', 'Ponding'],
                datasets: [{
                    label: 'Water Distribution (mm)',
                    data: [0, 0, 0],
                    backgroundColor: [
                        '#388E3C',
                        '#D32F2F',
                        '#FBC02D'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Water Distribution'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Volume (mm)'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

/**
 * Initialize Leaflet map
 */
function initializeMap() {
    const mapContainer = document.getElementById('runoff-map');
    if (!mapContainer) return;

    // Initialize map centered on a sample location
    runoffMap = L.map('runoff-map').setView([40.7128, -74.0060], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(runoffMap);

    // Add sample runoff overlay
    addRunoffOverlay();

    // Add click handler for point analysis
    runoffMap.on('click', handleMapClick);
}

/**
 * Add runoff visualization overlay to map
 */
function addRunoffOverlay() {
    if (!runoffMap) return;

    // Create sample runoff data (normally this would come from simulation)
    const runoffData = [
        [40.7128, -74.0060, 0.8], // High runoff area
        [40.7138, -74.0070, 0.3], // Medium runoff area
        [40.7148, -74.0080, 0.1]  // Low runoff area
    ];

    // Add markers with runoff information
    runoffData.forEach(([lat, lng, runoff]) => {
        const color = runoff > 0.6 ? 'red' : runoff > 0.3 ? 'orange' : 'green';
        const marker = L.circleMarker([lat, lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.6,
            radius: runoff * 20
        }).addTo(runoffMap);

        marker.bindPopup(`<strong>Runoff Risk: ${Math.round(runoff * 100)}%</strong><br>High runoff potential area`);
    });
}

/**
 * Handle control input changes
 */
function handleControlChange(event) {
    const controlId = event.target.id;
    const value = event.target.value;

    // Update simulation parameters
    switch (controlId) {
        case 'slope-control':
            SIMULATION_PARAMS.slope = parseInt(value);
            break;
        case 'soil-control':
            SIMULATION_PARAMS.soilType = value;
            break;
        case 'vegetation-control':
            SIMULATION_PARAMS.vegetation = parseInt(value);
            break;
        case 'rainfall-control':
            SIMULATION_PARAMS.rainfall = parseInt(value);
            break;
        case 'duration-control':
            SIMULATION_PARAMS.duration = parseInt(value);
            break;
    }

    updateControlValues();
}

/**
 * Update control display values
 */
function updateControlValues() {
    document.getElementById('slope-value').textContent = `${SIMULATION_PARAMS.slope}°`;
    document.getElementById('vegetation-value').textContent = `${SIMULATION_PARAMS.vegetation}%`;
    document.getElementById('rainfall-value').textContent = `${SIMULATION_PARAMS.rainfall} mm/h`;
    document.getElementById('duration-value').textContent = `${SIMULATION_PARAMS.duration} min`;

    // Update soil type display
    const soilType = SOIL_PROPERTIES[SIMULATION_PARAMS.soilType];
    document.getElementById('soil-value').textContent = soilType.name;
}

/**
 * Run the runoff simulation
 */
function runSimulation() {
    if (isRunning) return;

    isRunning = true;
    const runBtn = document.getElementById('run-simulation');
    runBtn.textContent = 'Running Simulation...';
    runBtn.disabled = true;

    // Show loading state
    showSimulationLoading();

    // Run simulation in background
    setTimeout(() => {
        try {
            currentSimulation = performSimulation();
            updateSimulationResults(currentSimulation);
            updateCharts(currentSimulation);
            updateMapVisualization(currentSimulation);

            // Hide loading state
            hideSimulationLoading();

            runBtn.textContent = 'Run Simulation';
            runBtn.disabled = false;
            isRunning = false;

        } catch (error) {
            console.error('Simulation error:', error);
            showSimulationError('Simulation failed. Please check your parameters.');
            runBtn.textContent = 'Run Simulation';
            runBtn.disabled = false;
            isRunning = false;
        }
    }, 2000); // Simulate processing time
}

/**
 * Perform the hydrological simulation
 */
function performSimulation() {
    const params = SIMULATION_PARAMS;
    const soilProps = SOIL_PROPERTIES[params.soilType];

    // Calculate impact factors
    const slopeFactor = getSlopeFactor(params.slope);
    const vegFactor = getVegetationFactor(params.vegetation);

    // Calculate infiltration capacity
    const infiltrationCapacity = soilProps.infiltration * vegFactor.infiltration / slopeFactor.infiltration;

    // Calculate runoff rate
    const runoffRate = Math.max(0, params.rainfall - infiltrationCapacity);

    // Calculate volumes
    const totalRainfall = (params.rainfall * params.duration) / 60; // Convert to mm
    const infiltrationVolume = Math.min(totalRainfall, infiltrationCapacity * params.duration / 60);
    const runoffVolume = totalRainfall - infiltrationVolume;
    const pondingVolume = Math.max(0, runoffVolume - (soilProps.retention * params.area / 1000));

    // Generate time series data
    const timeSeries = generateTimeSeries(params.duration, infiltrationCapacity, params.rainfall);

    return {
        parameters: { ...params },
        results: {
            infiltrationCapacity,
            runoffRate,
            totalRainfall,
            infiltrationVolume,
            runoffVolume,
            pondingVolume,
            runoffCoefficient: runoffVolume / totalRainfall
        },
        timeSeries,
        riskLevel: calculateRiskLevel(runoffRate, pondingVolume),
        recommendations: generateRecommendations(runoffRate, pondingVolume, params)
    };
}

/**
 * Get slope impact factor
 */
function getSlopeFactor(slope) {
    const slopes = Object.keys(SLOPE_FACTORS).map(Number).sort((a, b) => a - b);
    const closest = slopes.reduce((prev, curr) =>
        Math.abs(curr - slope) < Math.abs(prev - slope) ? curr : prev
    );
    return SLOPE_FACTORS[closest];
}

/**
 * Get vegetation impact factor
 */
function getVegetationFactor(vegetation) {
    const vegLevels = Object.keys(VEGETATION_FACTORS).map(Number).sort((a, b) => a - b);
    const closest = vegLevels.reduce((prev, curr) =>
        Math.abs(curr - vegetation) < Math.abs(prev - vegetation) ? curr : prev
    );
    return VEGETATION_FACTORS[closest];
}

/**
 * Generate time series data for simulation
 */
function generateTimeSeries(duration, infiltrationCapacity, rainfall) {
    const data = [];
    const timeStep = 5; // 5-minute intervals

    for (let time = 0; time <= duration; time += timeStep) {
        const cumulativeRainfall = (rainfall * time) / 60;
        const infiltration = Math.min(cumulativeRainfall, infiltrationCapacity * time / 60);
        const runoff = Math.max(0, cumulativeRainfall - infiltration);

        data.push({
            time,
            rainfall: cumulativeRainfall,
            infiltration,
            runoff
        });
    }

    return data;
}

/**
 * Calculate risk level based on simulation results
 */
function calculateRiskLevel(runoffRate, pondingVolume) {
    if (runoffRate > 15 || pondingVolume > 50) return 'high';
    if (runoffRate > 8 || pondingVolume > 25) return 'medium';
    return 'low';
}

/**
 * Generate recommendations based on simulation results
 */
function generateRecommendations(runoffRate, pondingVolume, params) {
    const recommendations = [];

    if (runoffRate > 10) {
        recommendations.push({
            priority: 'high',
            title: 'Implement Contour Farming',
            description: 'Create contour lines perpendicular to the slope to slow water movement and increase infiltration.',
            benefits: { runoff: -25, erosion: -30, soil: 15 },
            timeline: '2-4 weeks'
        });
    }

    if (params.vegetation < 40) {
        recommendations.push({
            priority: 'high',
            title: 'Increase Vegetation Cover',
            description: 'Plant cover crops or establish buffer strips to improve water retention.',
            benefits: { runoff: -20, infiltration: 35, biodiversity: 40 },
            timeline: '1-2 growing seasons'
        });
    }

    if (params.slope > 10) {
        recommendations.push({
            priority: 'medium',
            title: 'Install Terraces',
            description: 'Construct level terraces to reduce slope length and water velocity.',
            benefits: { runoff: -40, erosion: -50, water: 25 },
            timeline: '4-8 weeks'
        });
    }

    recommendations.push({
        priority: 'medium',
        title: 'Improve Soil Structure',
        description: 'Add organic matter and implement no-till practices to enhance soil infiltration.',
        benefits: { infiltration: 30, runoff: -15, fertility: 25 },
        timeline: 'Ongoing'
    });

    return recommendations;
}

/**
 * Update simulation results display
 */
function updateSimulationResults(simulation) {
    const results = simulation.results;

    // Update metric cards
    document.getElementById('runoff-rate').textContent = `${results.runoffRate.toFixed(1)} mm/h`;
    document.getElementById('infiltration-rate').textContent = `${results.infiltrationCapacity.toFixed(1)} mm/h`;
    document.getElementById('total-runoff').textContent = `${results.runoffVolume.toFixed(1)} mm`;
    document.getElementById('runoff-coefficient').textContent = `${(results.runoffCoefficient * 100).toFixed(1)}%`;

    // Update risk level
    const riskElement = document.getElementById('risk-level');
    riskElement.textContent = simulation.riskLevel.toUpperCase();
    riskElement.className = `result-status ${simulation.riskLevel}`;

    // Update flow visualization
    updateFlowVisualization(results);

    // Update analysis section
    updateAnalysisSection(simulation);

    // Update recommendations
    updateRecommendations(simulation.recommendations);
}

/**
 * Update flow visualization
 */
function updateFlowVisualization(results) {
    const canvas = document.getElementById('flow-canvas');
    if (!canvas) return;

    // Simple visualization - in a real implementation, this would use Canvas API or SVG
    canvas.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%; justify-content: center; align-items: center; color: var(--text-muted);">
            <div style="font-size: 2rem; margin-bottom: 1rem;">💧</div>
            <div style="text-align: center;">
                <div>Rainfall: ${results.totalRainfall.toFixed(1)} mm</div>
                <div>Infiltration: ${results.infiltrationVolume.toFixed(1)} mm</div>
                <div>Runoff: ${results.runoffVolume.toFixed(1)} mm</div>
                <div>Ponding: ${results.pondingVolume.toFixed(1)} mm</div>
            </div>
        </div>
    `;
}

/**
 * Update charts with simulation data
 */
function updateCharts(simulation) {
    if (runoffChart && simulation.timeSeries) {
        const labels = simulation.timeSeries.map(point => point.time);
        const runoffData = simulation.timeSeries.map(point => point.runoff);

        runoffChart.data.labels = labels;
        runoffChart.data.datasets[0].data = runoffData;
        runoffChart.update();
    }

    if (infiltrationChart) {
        const results = simulation.results;
        infiltrationChart.data.datasets[0].data = [
            results.infiltrationVolume,
            results.runoffVolume,
            results.pondingVolume
        ];
        infiltrationChart.update();
    }
}

/**
 * Update map visualization
 */
function updateMapVisualization(simulation) {
    // Clear existing markers
    runoffMap.eachLayer(layer => {
        if (layer instanceof L.CircleMarker) {
            runoffMap.removeLayer(layer);
        }
    });

    // Add new markers based on simulation results
    const riskLevel = simulation.riskLevel;
    const color = riskLevel === 'high' ? 'red' : riskLevel === 'medium' ? 'orange' : 'green';

    // Add sample risk zones
    const riskZones = [
        [40.7128, -74.0060, 'High Risk Zone'],
        [40.7138, -74.0070, 'Medium Risk Zone'],
        [40.7148, -74.0080, 'Low Risk Zone']
    ];

    riskZones.forEach(([lat, lng, zone]) => {
        L.circleMarker([lat, lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.6,
            radius: 15
        }).addTo(runoffMap).bindPopup(`<strong>${zone}</strong><br>Runoff Risk: ${riskLevel}`);
    });
}

/**
 * Update analysis section
 */
function updateAnalysisSection(simulation) {
    const params = simulation.parameters;
    const results = simulation.results;

    // Update property indicators
    updatePropertyIndicators(params, results);

    // Update vegetation stats
    updateVegetationStats(params.vegetation);

    // Update rainfall stats
    updateRainfallStats(params.rainfall, params.duration);

    // Update management factors
    updateManagementFactors(params);
}

/**
 * Update property indicators
 */
function updatePropertyIndicators(params, results) {
    const indicators = [
        { id: 'slope-indicator', value: params.slope, max: 30, label: 'Slope' },
        { id: 'soil-indicator', value: SOIL_PROPERTIES[params.soilType].infiltration, max: 20, label: 'Soil Infiltration' },
        { id: 'veg-indicator', value: params.vegetation, max: 100, label: 'Vegetation Cover' },
        { id: 'runoff-indicator', value: results.runoffRate, max: 25, label: 'Runoff Rate' }
    ];

    indicators.forEach(indicator => {
        const element = document.getElementById(indicator.id);
        if (element) {
            const percentage = (indicator.value / indicator.max) * 100;
            element.style.width = `${Math.min(percentage, 100)}%`;
            element.nextElementSibling.textContent = `${indicator.value}${indicator.label.includes('Slope') ? '°' : indicator.label.includes('Rate') ? ' mm/h' : '%'}`;
        }
    });
}

/**
 * Update vegetation statistics
 */
function updateVegetationStats(vegetation) {
    const vegFactor = getVegetationFactor(vegetation);

    document.getElementById('veg-cover').textContent = `${vegetation}%`;
    document.getElementById('veg-type').textContent = vegFactor.name;
    document.getElementById('veg-impact').textContent = `${Math.round((1 - vegFactor.runoff) * 100)}%`;
    document.getElementById('veg-benefit').textContent = `${Math.round(vegFactor.infiltration * 100)}%`;
}

/**
 * Update rainfall statistics
 */
function updateRainfallStats(rainfall, duration) {
    const totalRainfall = (rainfall * duration) / 60;

    document.getElementById('rain-intensity').textContent = `${rainfall} mm/h`;
    document.getElementById('rain-duration').textContent = `${duration} min`;
    document.getElementById('rain-total').textContent = `${totalRainfall.toFixed(1)} mm`;
}

/**
 * Update management factors
 */
function updateManagementFactors(params) {
    const factors = [
        { factor: 'Slope', impact: params.slope > 15 ? 'High runoff potential' : params.slope > 5 ? 'Moderate runoff potential' : 'Low runoff potential', class: params.slope > 15 ? 'negative' : params.slope > 5 ? 'neutral' : 'positive' },
        { factor: 'Soil Type', impact: SOIL_PROPERTIES[params.soilType].runoff > 80 ? 'High runoff risk' : SOIL_PROPERTIES[params.soilType].runoff > 70 ? 'Moderate runoff risk' : 'Low runoff risk', class: SOIL_PROPERTIES[params.soilType].runoff > 80 ? 'negative' : SOIL_PROPERTIES[params.soilType].runoff > 70 ? 'neutral' : 'positive' },
        { factor: 'Vegetation', impact: params.vegetation > 60 ? 'Excellent water retention' : params.vegetation > 30 ? 'Good water retention' : 'Poor water retention', class: params.vegetation > 60 ? 'positive' : params.vegetation > 30 ? 'neutral' : 'negative' },
        { factor: 'Rainfall', impact: params.rainfall > 20 ? 'High intensity event' : params.rainfall > 10 ? 'Moderate intensity event' : 'Low intensity event', class: params.rainfall > 20 ? 'negative' : params.rainfall > 10 ? 'neutral' : 'positive' }
    ];

    const container = document.getElementById('management-factors');
    if (container) {
        container.innerHTML = factors.map(factor => `
            <div class="management-item">
                <span class="management-factor">${factor.factor}</span>
                <span class="management-impact ${factor.class}">${factor.impact}</span>
            </div>
        `).join('');
    }
}

/**
 * Update recommendations section
 */
function updateRecommendations(recommendations) {
    const container = document.getElementById('recommendations-grid');
    if (!container) return;

    container.innerHTML = recommendations.map(rec => `
        <div class="recommendation-card">
            <div class="recommendation-header">
                <div class="priority-badge ${rec.priority}">${rec.priority.toUpperCase()}</div>
                <h3>${rec.title}</h3>
            </div>
            <div class="recommendation-content">
                <p>${rec.description}</p>
                <div class="recommendation-benefits">
                    <div class="benefit-item">
                        <div class="benefit-label">Runoff</div>
                        <div class="benefit-value">${rec.benefits.runoff > 0 ? '+' : ''}${rec.benefits.runoff}%</div>
                    </div>
                    <div class="benefit-item">
                        <div class="benefit-label">Infiltration</div>
                        <div class="benefit-value">+${rec.benefits.infiltration || 0}%</div>
                    </div>
                    <div class="benefit-item">
                        <div class="benefit-label">Timeline</div>
                        <div class="benefit-value">${rec.timeline}</div>
                    </div>
                </div>
                <button class="recommendation-btn">Learn More</button>
            </div>
        </div>
    `).join('');
}

/**
 * Handle map layer toggle
 */
function handleLayerToggle(event) {
    const button = event.target;
    const layer = button.dataset.layer;

    // Toggle active state
    button.classList.toggle('active');

    // In a real implementation, this would show/hide map layers
    console.log(`Toggling layer: ${layer}`);
}

/**
 * Handle map tool click
 */
function handleToolClick(event) {
    const button = event.target;
    const tool = button.dataset.tool;

    // In a real implementation, this would activate map tools
    console.log(`Activating tool: ${tool}`);
}

/**
 * Handle map click for point analysis
 */
function handleMapClick(event) {
    const { lat, lng } = event.latlng;

    // In a real implementation, this would analyze the clicked location
    console.log(`Analyzing point: ${lat}, ${lng}`);
}

/**
 * Handle scenario selection
 */
function handleScenarioSelect(event) {
    const button = event.target;
    const scenario = button.dataset.scenario;

    // Remove active class from all buttons
    document.querySelectorAll('.scenario-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Load scenario parameters
    loadScenario(scenario);
}

/**
 * Load scenario parameters
 */
function loadScenario(scenario) {
    const scenarios = {
        baseline: { slope: 5, soilType: 'loam', vegetation: 30, rainfall: 15, duration: 60 },
        improved: { slope: 5, soilType: 'loam', vegetation: 70, rainfall: 15, duration: 60 },
        optimal: { slope: 3, soilType: 'loam', vegetation: 90, rainfall: 15, duration: 60 }
    };

    if (scenarios[scenario]) {
        Object.assign(SIMULATION_PARAMS, scenarios[scenario]);
        updateControlsFromParams();
        runSimulation();
    }
}

/**
 * Load default scenario
 */
function loadDefaultScenario() {
    loadScenario('baseline');
}

/**
 * Update controls from parameters
 */
function updateControlsFromParams() {
    document.getElementById('slope-control').value = SIMULATION_PARAMS.slope;
    document.getElementById('soil-control').value = SIMULATION_PARAMS.soilType;
    document.getElementById('vegetation-control').value = SIMULATION_PARAMS.vegetation;
    document.getElementById('rainfall-control').value = SIMULATION_PARAMS.rainfall;
    document.getElementById('duration-control').value = SIMULATION_PARAMS.duration;

    updateControlValues();
}

/**
 * Handle custom scenario changes
 */
function handleCustomScenarioChange() {
    // Update custom scenario parameters
    const customSlope = document.getElementById('custom-slope')?.value || SIMULATION_PARAMS.slope;
    const customSoil = document.getElementById('custom-soil')?.value || SIMULATION_PARAMS.soilType;
    const customVeg = document.getElementById('custom-vegetation')?.value || SIMULATION_PARAMS.vegetation;
    const customRain = document.getElementById('custom-rainfall')?.value || SIMULATION_PARAMS.rainfall;

    // Update display values
    document.getElementById('custom-slope-value').textContent = `${customSlope}°`;
    document.getElementById('custom-veg-value').textContent = `${customVeg}%`;
    document.getElementById('custom-rain-value').textContent = `${customRain} mm/h`;
}

/**
 * Calculate custom scenario
 */
function calculateCustomScenario() {
    const customParams = {
        slope: parseInt(document.getElementById('custom-slope').value),
        soilType: document.getElementById('custom-soil').value,
        vegetation: parseInt(document.getElementById('custom-vegetation').value),
        rainfall: parseInt(document.getElementById('custom-rainfall').value),
        duration: SIMULATION_PARAMS.duration,
        area: SIMULATION_PARAMS.area
    };

    const simulation = performSimulation.call({ SIMULATION_PARAMS: customParams });

    // Update custom results display
    document.getElementById('custom-runoff').textContent = `${simulation.results.runoffRate.toFixed(1)} mm/h`;
    document.getElementById('custom-infiltration').textContent = `${simulation.results.infiltrationCapacity.toFixed(1)} mm/h`;
    document.getElementById('custom-coefficient').textContent = `${(simulation.results.runoffCoefficient * 100).toFixed(1)}%`;

    // Show results
    document.getElementById('custom-results').style.display = 'block';
}

/**
 * Show simulation loading state
 */
function showSimulationLoading() {
    document.querySelectorAll('.result-card').forEach(card => {
        card.classList.add('loading');
    });
}

/**
 * Hide simulation loading state
 */
function hideSimulationLoading() {
    document.querySelectorAll('.result-card').forEach(card => {
        card.classList.remove('loading');
    });
}

/**
 * Show simulation error
 */
function showSimulationError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        background-color: #ffebee;
        color: #c62828;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        border-left: 4px solid #c62828;
    `;

    const container = document.querySelector('.simulation-results');
    if (container) {
        container.insertBefore(errorDiv, container.firstChild);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

/**
 * Toggle theme
 */
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update theme toggle icon
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
}

/**
 * Load saved theme
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);

    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Load theme on initialization
loadTheme();

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        performSimulation,
        calculateRiskLevel,
        generateRecommendations,
        SOIL_PROPERTIES,
        VEGETATION_FACTORS,
        SLOPE_FACTORS
    };
}