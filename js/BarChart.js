import { loadBar } from './LoadData.js';

document.addEventListener('DOMContentLoaded', function () {
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

    const xAxis = chart.append("g").attr("transform", `translate(0,${height})`);
    const yAxis = chart.append("g");

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    function formatMonth(iso) {
        const [year, month] = iso.split("-");
        return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
    }

    function updateBarChart(data, selectedMonth) {
        const keys = ["fines", "arrests", "charges"];

        const filtered = data.filter(d => d.month === selectedMonth);
        const grouped = d3.rollup(
            filtered,
            v => ({
                fines: d3.sum(v, d => d.fines),
                arrests: d3.sum(v, d => d.arrests),
                charges: d3.sum(v, d => d.charges)
            }),
            d => d.ageGroup
        );

        const dataset = Array.from(grouped, ([ageGroup, values]) => ({ ageGroup, ...values }));

        x0.domain(dataset.map(d => d.ageGroup));
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(dataset, d => d3.max(keys, k => d[k])) || 1]).nice();

        xAxis.transition().call(d3.axisBottom(x0));
        yAxis.transition().call(d3.axisLeft(y));

        const bars = chart.selectAll(".barGroup")
            .data(dataset, d => d.ageGroup);

        const barsEnter = bars.enter().append("g")
            .attr("class", "barGroup")
            .attr("transform", d => `translate(${x0(d.ageGroup)},0)`);

        barsEnter.merge(bars)
            .transition()
            .attr("transform", d => `translate(${x0(d.ageGroup)},0)`);

        bars.exit().remove();

        const rects = barsEnter.merge(bars)
            .selectAll("rect")
            .data(d => keys.map(k => ({ key: k, value: d[k] })));

        rects.enter().append("rect")
            .merge(rects)
            .transition()
            .attr("x", d => x1(d.key))
            .attr("y", d => y(d.value))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.value))
            .attr("fill", d => color(d.key));

        rects.exit().remove();
    }

    // Load the data and setup slider
    loadBar().then(data => {
        const allMonths = Array.from(new Set(data.map(d => d.month))).sort();
        const monthMap = allMonths.map(m => ({ code: m, label: formatMonth(m) }));

        const slider = document.getElementById("monthSlider");
        const label = document.getElementById("monthLabel");

        if (slider && label) {
            slider.min = 0;
            slider.max = monthMap.length - 1;
            slider.value = 0;

            let currentMonth = monthMap[0].code;
            label.textContent = monthMap[0].label;

            slider.addEventListener("input", function () {
                currentMonth = monthMap[this.value].code;
                label.textContent = monthMap[this.value].label;
                updateBarChart(data, currentMonth);
            });

            updateBarChart(data, currentMonth);
        }
    });
});
