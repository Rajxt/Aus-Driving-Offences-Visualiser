document.addEventListener('DOMContentLoaded', function () {
    const width = 800;
    const height = 600;
    const svg = d3.select("#choropleth")
        .attr("width", width)
        .attr("height", height);

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, 200000]); 
    Promise.all([
        d3.json("data/aus.geojson"), 
        d3.csv("data/geographic.csv")
    ]).then(([geoData, data]) => {  
        const valueByState = d3.rollup(
            data,
            v => d3.sum(v, d => +d.FINES),
            d => d.STATE_NAME
        );

        console.log("GeoJSON STATE_NAMEs:", geoData.features.map(d => d.properties.STATE_NAME));
        console.log("CSV STATE_NAMEs:", Array.from(valueByState.keys()));
        

        const projection = d3.geoMercator()
            .center([134, -28])
            .scale(800)
            .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        svg.selectAll("path")
            .data(geoData.features)
            .enter().append("path")
            .attr("class", "state")
            .attr("d", path)
            .attr("fill", d => {
                const val = valueByState.get(d.properties.STATE_NAME || d.properties.FINES);
                return val != null ? colorScale(val) : "#ccc";
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .append("title")
            .text(d => {
                const name = d.properties.STATE_NAME || d.properties.name;
                const val = valueByState.get(name);
                return `${name}: ${val ?? "No data"}`;
            });
    });
});


document.addEventListener('DOMContentLoaded', function() {
   
    const navLinks = document.querySelectorAll('.navtab a');
    const pill = document.querySelector('.pill');
    
    function initPill() {
        const activeTab = document.querySelector('.navtab a.active');
        positionPill(activeTab);
    }
    
    function positionPill(activeTab) {
        if (!activeTab || !pill) return;
        const tabRect = activeTab.getBoundingClientRect();
        const navRect = document.querySelector('.navtab').getBoundingClientRect();
        pill.style.width = `${tabRect.width}px`;
        pill.style.left = `${tabRect.left - navRect.left}px`;
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            positionPill(this);
        });
    });
    
    // Scrollspy functionality
})