// Choropleth.js
import { loadData } from './LoadData.js';

document.addEventListener('DOMContentLoaded', function () {
    const width = 800;
    const height = 600;
    const svg = d3.select("#choropleth")
        .attr("width", width)
        .attr("height", height);

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, 200000]);

    loadData().then(([geoData, data]) => {
        const valueByState = d3.rollup(
            data,
            v => d3.sum(v, d => +d.FINES),
            d => d.STATE_NAME
        );

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
                const val = valueByState.get(d.properties.STATE_NAME);
                return val != null ? colorScale(val) : "#ccc";
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .append("title")
            .text(d => {
                const name = d.properties.STATE_NAME;
                const val = valueByState.get(name);
                return `${name}: ${val ?? "No data"}`;
            });
    });
});
