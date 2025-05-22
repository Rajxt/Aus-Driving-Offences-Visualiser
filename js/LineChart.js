import { loadLine } from './LoadData.js';

document.addEventListener('DOMContentLoaded', function () {
    const width = 800;
    const height = 520;
    const margin = { top: 50, right: 30, bottom: 50, left: 60 };

    const svg = d3.select("#line")
        .attr("width", width)
        .attr("height", height);

    loadLine().then(([natOver]) => {
        
        const finesByYear = d3.rollup(
            natOver,
            v => d3.sum(v, d => +d.FINES),
            d => +d.YEAR
        );

        const data = Array.from(finesByYear, ([year, total]) => ({ year, total }))
            .sort((a, b) => a.year - b.year); 

        // 2. Set up scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.year))
            .range([margin.left, width - margin.right]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.total)])
            .nice()
            .range([height - margin.bottom, margin.top]);

        // 3. Draw axes
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale));

        // 4. Draw line
        const line = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.total));

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

        // 5. Add circles on points
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.year))
            .attr("cy", d => yScale(d.total))
            .attr("r", 4)
            .attr("fill", "steelblue")
            .append("title")
            .text(d => `${d.year}: ${d.total}`);
    });
});
