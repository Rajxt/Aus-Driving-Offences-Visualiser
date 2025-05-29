import { loadChoropleth } from './LoadData.js';

document.addEventListener('DOMContentLoaded', function () {
    const width = 500;
    const height = 500;
    const svg = d3.select("#choropleth")
        .attr("width", width)
        .attr("height", height);

    let geoData, data;
    let isPlaying = false;
    let playInterval = null;
    const playSpeed = 700; // milliseconds between year changes

    const projection = d3.geoMercator()
        .center([134, -28])
        .scale(500)
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

    function updateChoropleth(metric = 'FINES', year) {
        const filteredData = data.filter(d => +d.YEAR === +year);
        const valueByState = d3.rollup(
            filteredData,
            v => d3.sum(v, d => +d[metric]),
            d => d.STATE_NAME
        );

        const maxVal = d3.max(Array.from(valueByState.values()));
        const minVal = d3.min(Array.from(valueByState.values()));
        
        const intensityScale = d3.scaleLinear()
            .domain([minVal || 0, maxVal || 1])
            .range([0.4, 1.0]);  
        
        svg.selectAll("path")
            .data(geoData.features)
            .join("path")
            .attr("class", "state")
            .attr("d", path)
            .attr("fill", d => {
                const state = d.properties.STATE_NAME;
                const baseColor = stateColors[state] || '#90a4ae';
                const val = valueByState.get(state);
                
                if (val == null) return "#e3f2fd"; 
                
                const intensity = intensityScale(val);
                const color = d3.color(baseColor);
                
                return color.copy({ opacity: intensity }).formatRgb();
            })
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 1.5)
            .style("filter", "drop-shadow(0px 1px 2px rgba(0,0,0,0.1))")
            .style("transition", "all 0.3s ease")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .style("filter", "drop-shadow(0px 2px 4px rgba(0,0,0,0.8))")
                    .style("transform","scale(1.01)");
            })
            .on("click", function(event, d) {
                const state = d.properties.STATE_NAME;
                if (typeof window.updateLineChartFromMap === 'function') {
                    window.updateLineChartFromMap(state);  
                    document.getElementById("state").value = state; 

                    svg.selectAll(".state")
                        .attr("stroke", "#ffffff")
                        .attr("stroke-width", 1.1);

                    d3.select(this)
                        .attr("stroke", "#000")
                        .attr("stroke-width", 1);
                }
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .attr("stroke", "#ffffff")
                    .attr("stroke-width", 1.5)
                    .style("filter", "drop-shadow(0px 1px 2px rgba(0,0,0,0.1))")
                    .style("transform","scale(1)");
            });

        updateLegend(valueByState, year);
        
        svg.selectAll("path").select("title").remove();
         
        svg.selectAll("path")
            .append("title")
            .text(d => {
                const name = d.properties.STATE_NAME;
                const val = valueByState.get(name);
                const formattedVal = val ? val.toLocaleString() : "No data";
                return `${name}\n${metric}: ${formattedVal}\nYear: ${year}`;
            });
    }

    function updateLegend(valueByState, year) {
        const legendContainer = d3.select("#legend");
        legendContainer.html(""); 
    
        legendContainer.append("h4")
            .text(`Fines by State - ${year}`)
            .style("font-size", "20px");
    
        const entries = Array.from(valueByState.entries())
            .sort((a, b) => d3.descending(a[1], b[1]));
    
        const legendItems = legendContainer
            .selectAll(".legend-item")
            .data(entries)
            .join("div")
            .attr("class", "legend-item")
            .style("margin-bottom", "6px")
            .style("font-size", "14px");
    
        legendItems.append("span")
            .style("display", "inline-block")
            .style("width", "16px")
            .style("height", "16px")
            .style("margin-right", "6px")
            .style("vertical-align", "middle")
            .style("background-color", d => stateColors[d[0]] || '#90a4ae')
            .style("opacity", d => {
                const maxVal = d3.max(entries.map(d => d[1]));
                const minVal = d3.min(entries.map(d => d[1]));
                return d3.scaleLinear().domain([minVal, maxVal]).range([0.4, 1])(d[1]);
            });
    
        legendItems.append("span")
            .text(d => `${d[0]}: ${d[1] ? d[1].toLocaleString() : "No data"}`);
    }

    function startAutoPlay() {
        if (isPlaying) return;
        
        isPlaying = true;
        const playButton = document.getElementById('playButton');
        if (playButton) {
            playButton.textContent = '⏸ Pause Map';
            playButton.classList.add('playing');
        }

        playInterval = setInterval(() => {
            const yearSlider = document.getElementById('yearSlider');
            const yearLabel = document.getElementById('yearLabel');
            
            if (yearSlider) {
                let currentYear = parseInt(yearSlider.value);
                const maxYear = parseInt(yearSlider.max);
                const minYear = parseInt(yearSlider.min);
                
                currentYear = currentYear >= maxYear ? minYear : currentYear + 1;
                
                yearSlider.value = currentYear;
                if (yearLabel) {
                    yearLabel.textContent = currentYear;
                }
                
                updateChoropleth('FINES', currentYear);
            }
        }, playSpeed);
    }

    function stopAutoPlay() {
        if (!isPlaying) return;
        
        isPlaying = false;
        const playButton = document.getElementById('playButton');
        if (playButton) {
            playButton.textContent = '▶ Play Map';
            playButton.classList.remove('playing');
        }
        
        if (playInterval) {
            clearInterval(playInterval);
            playInterval = null;
        }
    }

    function toggleAutoPlay() {
        if (isPlaying) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }
    }

   
    function createPlayButton() {
        const yearSliderContainer = document.querySelector('.year-slider-container');
        if (yearSliderContainer && !document.getElementById('playButton')) {
            const playButton = document.createElement('button');
            playButton.id = 'playButton';
            playButton.textContent = '▶ Play Map';
            playButton.className = 'play-button';
            playButton.style.cssText = `
                margin-left: 15px;
                padding: 8px 16px;
                background-color: #1976d2;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.3s ease;
            `;
            
            playButton.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#1565c0';
                this.style.transform = 'translateY(-1px)';
            });
            
            playButton.addEventListener('mouseleave', function() {
                this.style.backgroundColor = this.classList.contains('playing') ? '#d32f2f' : '#1976d2';
                this.style.transform = 'translateY(0)';
            });
            
            playButton.addEventListener('click', toggleAutoPlay);
            
           
            const slider = document.getElementById('yearSlider');
            if (slider) {
                slider.parentNode.appendChild(playButton);
            }
        }
    }
    
    loadChoropleth().then(([geo, d]) => {
        geoData = geo;
        data = d;

       
        createPlayButton();

        const yearSlider = document.getElementById('yearSlider');
        const yearLabel = document.getElementById('yearLabel');
        
        if (yearSlider && yearLabel) {
            yearLabel.textContent = yearSlider.value;
            
            yearSlider.addEventListener('input', function () {
                const selectedYear = +this.value;
                yearLabel.textContent = selectedYear;
                updateChoropleth('FINES', selectedYear);
                
                
                if (isPlaying) {
                    stopAutoPlay();
                }
            });
            
            updateChoropleth('FINES', +yearSlider.value);
        } else {
            updateChoropleth('FINES', 2023);
        }
    });

   
    window.addEventListener('beforeunload', () => {
        if (playInterval) {
            clearInterval(playInterval);
        }
    });
});