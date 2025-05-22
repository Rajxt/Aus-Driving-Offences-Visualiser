import { loadChoropleth } from './LoadData.js';

document.addEventListener('DOMContentLoaded', function () {
    const width = 800;
    const height = 600;
    const svg = d3.select("#choropleth")
        .attr("width", width)
        .attr("height", height);

    let geoData, data;

    const projection = d3.geoMercator()
        .center([134, -28])
        .scale(800)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    const stateColors = {
        'NSW': '#0d47a1',    
        'VIC': '#1565c0',    
        'QLD': '#1976d2',    
        'WA': '#1e88e5',     
        'SA': '#2196f3',     
        'TAS': '#42a5f5',    
        'NT': '#64b5f6',    
        'ACT': '#90caf9'    
    };

    function updateChoropleth(metric = 'FINES', year = 2023) {
        const filteredData = data.filter(d => +d.YEAR === +year);
        const valueByState = d3.rollup(
            filteredData,
            v => d3.sum(v, d => +d[metric]),
            d => d.STATE_NAME
        );

        const maxVal = d3.max(Array.from(valueByState.values()));
        const minVal = d3.min(Array.from(valueByState.values()));

        // Create intensity scale for opacity/saturation adjustments
        const intensityScale = d3.scaleLinear()
            .domain([minVal || 0, maxVal || 1])
            .range([0.4, 1.0]); // More pronounced range for better distinction

        // Update paths with enhanced styling
        svg.selectAll("path")
            .data(geoData.features)
            .join("path")
            .attr("class", "state")
            .attr("d", path)
            .attr("fill", d => {
                const state = d.properties.STATE_NAME;
                const baseColor = stateColors[state] || '#90a4ae';
                const val = valueByState.get(state);
                
                if (val == null) return "#e3f2fd"; // Very light blue for no data
                
                const intensity = intensityScale(val);
                const color = d3.color(baseColor);
                
                // Adjust opacity based on value intensity
                return color.copy({ opacity: intensity }).formatRgb();
            })
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 1.5)
            .style("filter", "drop-shadow(0px 1px 2px rgba(0,0,0,0.1))")
            .style("transition", "all 0.3s ease")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .attr("stroke", "#0d47a1")
                    .attr("stroke-width", 1)
                    .style("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.8))");
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .attr("stroke", "#ffffff")
                    .attr("stroke-width", 1.5)
                    .style("filter", "drop-shadow(0px 1px 2px rgba(0,0,0,0.1))");
            });

        // Remove existing tooltips
        svg.selectAll("path").select("title").remove();

        // Add enhanced tooltips
        svg.selectAll("path")
            .append("title")
            .text(d => {
                const name = d.properties.STATE_NAME;
                const val = valueByState.get(name);
                const formattedVal = val ? val.toLocaleString() : "No data";
                return `${name}\n${metric}: ${formattedVal}\nYear: ${year}`;
            });

        // Update or create legend
        updateLegend(valueByState, metric);
    }

    

     


    // Load data and initialize
    loadChoropleth().then(([geo, d]) => {
        geoData = geo;
        data = d;

        const yearSlider = document.getElementById('yearSlider');
        const yearLabel = document.getElementById('yearLabel');
        
        if (yearSlider && yearLabel) {
            yearLabel.textContent = yearSlider.value;
            
            yearSlider.addEventListener('input', function () {
                const selectedYear = +this.value;
                yearLabel.textContent = selectedYear;
                updateChoropleth('FINES', selectedYear);
            });
            
            updateChoropleth('FINES', +yearSlider.value);
        } else {
            
            updateChoropleth('FINES', 2023);
        }
    });
});