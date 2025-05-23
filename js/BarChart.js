import { loadBar } from './LoadData.js';

document.addEventListener('DOMContentLoaded', function () {
    const margin = { top: 40, right: 30, bottom: 100, left: 60 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;  // bigger height (700 instead of 500)


      const svg = d3.select("#BarChart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);  // set svg height to full
  

    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x0 = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);
    const x1 = d3.scaleBand().padding(0.05);
    const y = d3.scaleLinear().rangeRound([height, 0]);
    const color = d3.scaleOrdinal()
    .domain(["fines", "arrests", "charges"])
    .range(["#6b486b", "#ff8c00", "#a05d56"]);

    const maxValue = d3.max(dataset, d => d3.max(keys, key => d[key]));
    console.log("Max value:", maxValue);

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
    
        // Filter data by selected month
        const filtered = data.filter(d => d.month === selectedMonth);
    
        // Group data by ageGroup and aggregate sums of keys
        const grouped = d3.rollup(
            filtered,
            v => ({
                fines: d3.sum(v, d => d.fines),
                arrests: d3.sum(v, d => d.arrests),
                charges: d3.sum(v, d => d.charges)
            }),
            d => d.ageGroup
        );
    
        // Convert Map to array for D3 data join
        const dataset = Array.from(grouped, ([ageGroup, values]) => ({ ageGroup, ...values }));
    
        // Set domains:
        // x0 for age groups
        x0.domain(dataset.map(d => d.ageGroup));
    
        // x1 for keys (fines, arrests, charges) within each age group
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
    
        // y from 0 to max value among all bars
        y.domain([0, d3.max(dataset, d => d3.max(keys, key => d[key])) || 1]).nice();
    
        // Draw x-axis with age groups at the bottom
        xAxis.transition()
            .duration(500)
            .call(d3.axisBottom(x0))
            .selectAll("text")  // Rotate labels for readability if needed
            .attr("transform", "rotate(-40)")
            .style("text-anchor", "end");
    
        // Draw y-axis on the left
        yAxis.transition()
            .duration(500)
            .call(d3.axisLeft(y));
    
        // Bind groups for each ageGroup
        const bars = chart.selectAll(".barGroup")
            .data(dataset, d => d.ageGroup);
    
        // Enter groups
        const barsEnter = bars.enter().append("g")
            .attr("class", "barGroup")
            .attr("transform", d => `translate(${x0(d.ageGroup)},0)`);
    
        // Merge groups and update position
        barsEnter.merge(bars)
            .transition()
            .duration(500)
            .attr("transform", d => `translate(${x0(d.ageGroup)},0)`);
    
        // Remove old groups
        bars.exit().remove();
    
        // For each group, bind rects for each key (fines, arrests, charges)
        const rects = barsEnter.merge(bars)
            .selectAll("rect")
            .data(d => keys.map(key => ({ key, value: d[key] })));
    
        // Enter new rects
        rects.enter().append("rect")
            .attr("x", d => x1(d.key))
            .attr("y", y(0))
            .attr("width", x1.bandwidth())
            .attr("height", 0)
            .attr("fill", d => color(d.key))
          .merge(rects)
            .transition()
            .duration(500)
            .attr("x", d => x1(d.key))
            .attr("y", d => y(d.value))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.value))
            .attr("fill", d => color(d.key));
    
        // Remove old rects
        rects.exit().remove();
    }
    
    

    // Load the data and setup slider
    loadBar().then(data => {
        console.log("Loaded Data:", data);
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
