import { loadBar } from './LoadData.js';

document.addEventListener('DOMContentLoaded', function () {
    const margin = { top: 40, right: 30, bottom: 100, left: 60 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // Clear any existing content in the chart container
    d3.select("#BarChart").html("");
    
    const svg = d3.select("#BarChart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales
    const x0 = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);
    const x1 = d3.scaleBand().padding(0.05);
    const y = d3.scaleLinear().rangeRound([height, 0]);
    
    const color = d3.scaleOrdinal()
        .domain(["fines", "arrests", "charges"])
        .range(["#6b486b", "#ff8c00", "#a05d56"]);

    // Create axis groups
    const xAxis = chart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`);
        
    const yAxis = chart.append("g")
        .attr("class", "y-axis");

    // Month names for formatting
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
    
        // Group data by ageGroup and aggregate sums
        const grouped = d3.rollup(
            filtered,
            v => ({
                fines: d3.sum(v, d => +d.FINES),
                arrests: d3.sum(v, d => +d.ARRESTS),
                charges: d3.sum(v, d => +d.CHARGES)
            }),
            d => d.AGE_GROUP
        );
    
        // Convert Map to array for D3 data join
        const dataset = Array.from(grouped, ([ageGroup, values]) => ({ ageGroup, ...values }));
    
        // Set domains
        x0.domain(dataset.map(d => d.ageGroup));
        x1.domain(keys).rangeRound([0, x0.bandwidth()]);
        
        // Set y domain with some padding
        const maxValue = d3.max(dataset, d => d3.max(keys, key => d[key])) || 1;
        y.domain([0, maxValue * 1.1]).nice();
    
        // Update x-axis
        xAxis.transition()
            .duration(500)
            .call(d3.axisBottom(x0))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .attr("x", -10)
            .attr("y", 10)
            .style("text-anchor", "end");
    
        // Update y-axis
        yAxis.transition()
            .duration(500)
            .call(d3.axisLeft(y));
    
        // Add x-axis label
        svg.select(".x-axis-label").remove();
        svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", width / 2 + margin.left)
            .attr("y", height + margin.top + 60)
            .style("text-anchor", "middle")
            .text("Age Groups");
    
        // Add y-axis label
        svg.select(".y-axis-label").remove();
        svg.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -(height / 2) - margin.top)
            .attr("y", 20)
            .style("text-anchor", "middle")
            .text("Count");
    
        // Add chart title
        svg.select(".chart-title").remove();
        svg.append("text")
            .attr("class", "chart-title")
            .attr("x", width / 2 + margin.left)
            .attr("y", 30)
            .style("text-anchor", "middle")
            .style("font-size", "16px")
            .text(`Data for ${formatMonth(selectedMonth)}`);
    
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
    
        // For each group, bind rects for each key
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
            .on("mouseover", function(event, d) {
                // Show tooltip on hover
                d3.select(this).attr("opacity", 0.8);
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`${d.key}: ${d.value}`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                // Hide tooltip
                d3.select(this).attr("opacity", 1);
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
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
        
        // Add legend
        const legend = svg.select(".legend").empty() ? 
            svg.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width - 100},20)`) :
            svg.select(".legend");
            
        legend.selectAll("*").remove();
        
        keys.forEach((key, i) => {
            legend.append("rect")
                .attr("x", 0)
                .attr("y", i * 20)
                .attr("width", 15)
                .attr("height", 15)
                .attr("fill", color(key));
                
            legend.append("text")
                .attr("x", 20)
                .attr("y", i * 20 + 12)
                .text(key)
                .style("font-size", "12px");
        });
    }
    
    // Create tooltip div
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "#fff")
        .style("padding", "5px")
        .style("border", "1px solid #ccc")
        .style("border-radius", "5px");

    // Load the data and setup slider
    loadBar().then(data => {
        // Extract unique months from data
        const allMonths = Array.from(new Set(data.map(d => d.START_DATE.substring(0, 7)))).sort();
        
        const monthMap = allMonths.map(m => ({ 
            code: m, 
            label: formatMonth(m) 
        }));

        const slider = document.getElementById("monthSlider");
        const label = document.getElementById("monthLabel");

        if (slider && label) {
            slider.min = 0;
            slider.max = monthMap.length - 1;
            slider.value = 0;

            let currentMonth = monthMap[0].code;
            label.textContent = monthMap[0].label;

            slider.addEventListener("input", function() {
                currentMonth = monthMap[this.value].code;
                label.textContent = monthMap[this.value].label;
                updateBarChart(data, currentMonth);
            });

            // Initial render
            updateBarChart(data, currentMonth);
        }
    });
});