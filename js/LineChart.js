import { loadChoropleth } from './LoadData.js';

document.addEventListener('DOMContentLoaded', function () {
    const width = 560;
    const height = 450;
    const margin = { top: 50, right: 30, bottom: 50, left: 60 };

    const svg = d3.select("#line")
        .attr("width", width)
        .attr("height", height);

    const chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    let tooltip = d3.select(".line-chart-tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
            .attr("class", "line-chart-tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "rgba(0, 0, 0, 0.9)")
            .style("color", "white")
            .style("padding", "12px")
            .style("border-radius", "8px")
            .style("font-size", "13px")
            .style("pointer-events", "none")
            .style("z-index", "1000")
            .style("box-shadow", "0 2px 10px rgba(0,0,0,0.3)")
            .style("border", "1px solid rgba(255,255,255,0.2)");
    }

    loadChoropleth().then(([geoData, csvData]) => {
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const xScale = d3.scaleLinear().range([0, innerWidth]);
        const yScale = d3.scaleLinear().range([innerHeight, 0]);

        const xAxisGroup = chartGroup.append("g")
            .attr("transform", `translate(0,${innerHeight})`);
        const yAxisGroup = chartGroup.append("g");

       

        const linePathGroup = chartGroup.append("g");
        const circleGroup = chartGroup.append("g");

        const stateSelect = document.getElementById("state");
        const states = Array.from(new Set(csvData.map(d => d.STATE_NAME))).sort();

        states.forEach(state => {
            const option = document.createElement("option");
            option.value = state;
            option.textContent = state;
            stateSelect.appendChild(option);
        });

        function updateChart(selectedState) {
            linePathGroup.selectAll("*").remove();
            circleGroup.selectAll("*").remove();

            const filtered = csvData.filter(d => d.STATE_NAME === selectedState);
            const grouped = d3.rollup(
                filtered,
                v => d3.sum(v, d => +d.FINES),
                d => +d.YEAR
            );

            const data = Array.from(grouped, ([year, total]) => ({ year, total }))
                .sort((a, b) => a.year - b.year);

            xScale.domain(d3.extent(data, d => d.year));
            yScale.domain([0, d3.max(data, d => d.total)]).nice();

            xAxisGroup.call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
            yAxisGroup.call(d3.axisLeft(yScale));

            const line = d3.line()
                .x(d => xScale(d.year))
                .y(d => yScale(d.total))
                .curve(d3.curveMonotoneX);

            const path = linePathGroup.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 3)
                .attr("d", line);

            const totalLength = path.node().getTotalLength();
            path
                .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                .duration(1500)
                .attr("stroke-dashoffset", 0);


            chartGroup.append("text")
                .attr("class", "x axis-label")
                .attr("text-anchor", "middle")
                .attr("x", (width - margin.left - margin.right) / 2)
                .attr("y", height - margin.top - 10) // 10px above bottom margin
                .text("Years");

            // Y Axis Label
            chartGroup.append("text")
                .attr("class", "y axis-label")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("x", -(height - margin.top - margin.bottom) / 2)
                .attr("y", -margin.left + 13) 
                .text("Fines");


            const circles = circleGroup.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", d => xScale(d.year))
                .attr("cy", d => yScale(d.total))
                .attr("r", 0)
                .attr("fill", "steelblue")
                .attr("stroke", "white")
                .attr("stroke-width", 2)
                .style("cursor", "pointer")
                .style("opacity", 0);

            circles.transition()
                .delay((d, i) => i * 100)
                .duration(500)
                .attr("r", 5)
                .style("opacity", 1);

            circles
                .on("mouseover", function (event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("r", 8)
                        .attr("fill", "#ff6b35");

                    tooltip
                        .style("visibility", "visible")
                        .html(`
                            <div style="font-weight: bold; margin-bottom: 5px;">Year: ${d.year}</div>
                            <div>Total FINES: ${d.total.toLocaleString()}</div>
                        `)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                })
                .on("mousemove", function (event) {
                    tooltip
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                })
                .on("mouseout", function () {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("r", 5)
                        .attr("fill", "steelblue");

                    tooltip.style("visibility", "hidden");
                });
        }

        updateChart(states[0]);

        stateSelect.addEventListener("change", () => {
            updateChart(stateSelect.value);
        });
    });
});
