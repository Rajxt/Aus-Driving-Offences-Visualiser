import { loadBar } from './LoadData.js';

const margin = { top: 40, right: 30, bottom: 100, left: 60 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

const svg = d3.select("#BarChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const x0 = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);
const x1 = d3.scaleBand().padding(0.05);
const y = d3.scaleLinear().rangeRound([height, 0]);
const color = d3.scaleOrdinal().range(["#6b486b", "#ff8c00", "#a05d56"]);

const xAxis = chart.append("g")
    .attr("transform", `translate(0,${height})`);

const yAxis = chart.append("g");

loadBar().then(data => {
    const allMonths = Array.from(new Set(data.map(d => d.month))).sort();
    let currentMonth = allMonths[0];

    d3.select("#monthLabel").text(currentMonth);

    const slider = d3.select("#monthSlider")
        .attr("min", 0)
        .attr("max", allMonths.length - 1)
        .attr("value", 0)
        .on("input", function () {
            currentMonth = allMonths[this.value];
            updateChart(currentMonth);
            d3.select("#monthLabel").text(currentMonth);
        });

    function updateChart(month) {
        const filtered = data.filter(d => d.month === month);
        const grouped = d3.rollup(
            filtered,
            v => ({
                fines: d3.sum(v, d => d.fines),
                arrests: d3.sum(v, d => d.arrests),
                charges: d3.sum(v, d => d.charges)
            }),
            d => d.ageGroup
        );

        const keys = ["fines", "arrests", "charges"];
        const ageGroups = Array.from(grouped.keys());

        const dataset = ageGroups.map(age => {
            const values = grouped.get(age);
            return {
                ageGroup: age,
                ...values
            };
        });

        x0.domain(ageGroups);
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(dataset, d => d3.max(keys, k => d[k]))]).nice();

        xAxis.transition().call(d3.axisBottom(x0));
        yAxis.transition().call(d3.axisLeft(y));

        const barGroups = chart.selectAll(".barGroup")
            .data(dataset, d => d.ageGroup);

        barGroups.exit().remove();

        const barEnter = barGroups.enter().append("g")
            .attr("class", "barGroup")
            .attr("transform", d => `translate(${x0(d.ageGroup)},0)`);

        barEnter.merge(barGroups)
            .transition()
            .attr("transform", d => `translate(${x0(d.ageGroup)},0)`);

        const bars = barEnter.merge(barGroups)
            .selectAll("rect")
            .data(d => keys.map(k => ({ key: k, value: d[k] })));

        bars.enter().append("rect")
            .merge(bars)
            .transition()
            .attr("x", d => x1(d.key))
            .attr("y", d => y(d.value))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.value))
            .attr("fill", d => color(d.key));

        bars.exit().remove();
    }

    updateChart(currentMonth);
});
