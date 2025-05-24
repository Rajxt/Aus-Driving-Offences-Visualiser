document.addEventListener('DOMContentLoaded', function () {
    const margin = { top: 40, right: 30, bottom: 70, left: 60 },
      width = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;
  
    const svg = d3.select("#BarChart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
  
    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const keys = ["FINES", "ARRESTS", "CHARGES"];
  
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
  
    // Select slider and label elements
    const monthSlider = document.getElementById("monthSlider");
    const monthLabel = document.getElementById("monthLabel");
  
    // Load CSV data once
    d3.csv("data/AgewithMonth.csv").then(rawData => {
      // Parse month as integer (0-11) assuming data has a MONTH column as 1-12 or 0-11
      rawData.forEach(d => {
        // Assuming MONTH column values are 1-12, convert to 0-11 for indexing
        d.MONTH = +d.MONTH - 1; 
        d.FINES = +d.FINES;
        d.ARRESTS = +d.ARRESTS;
        d.CHARGES = +d.CHARGES;
      });
  
      // Setup scales (domains will be updated on redraw)
      const x0 = d3.scaleBand()
        .domain(["0-16", "17-25", "26-39", "40-64", "65 and over"])
        .range([0, width])
        .paddingInner(0.1);
  
      const x1 = d3.scaleBand()
        .domain(keys)
        .range([0, x0.bandwidth()])
        .padding(0.05);
  
      const y = d3.scaleLinear()
        .range([height, 0]);
  
      const color = d3.scaleOrdinal()
        .domain(keys)
        .range(["#6b486b", "#ff8c00", "#a05d56"]);
  
      // Axes groups
      const xAxisGroup = chart.append("g")
        .attr("transform", `translate(0,${height})`);
  
      const yAxisGroup = chart.append("g");
  
      // Rotate x axis labels
      xAxisGroup.append("text")
        .attr("class", "x-axis-label");
  
      // Function to update chart by month index
      function updateChart(monthIndex) {
        // Update label text
        monthLabel.textContent = monthNames[monthIndex];
  
        // Filter data by selected month
        const monthData = rawData.filter(d => d.MONTH === monthIndex);
  
        // Aggregate by age group
        const dataMap = d3.rollup(
          monthData,
          v => ({
            FINES: d3.sum(v, d => d.FINES),
            ARRESTS: d3.sum(v, d => d.ARRESTS),
            CHARGES: d3.sum(v, d => d.CHARGES),
          }),
          d => d.AGE_GROUP
        );
  
        // Convert map to array and sort age groups
        const ageOrder = ["0-16", "17-25", "26-39", "40-64", "65 and over"];
        const data = Array.from(dataMap, ([ageGroup, values]) => ({ ageGroup, ...values }));
        data.sort((a, b) => ageOrder.indexOf(a.ageGroup) - ageOrder.indexOf(b.ageGroup));
  
        // Update y domain
        y.domain([0, d3.max(data, d => d3.max(keys, key => d[key]))]).nice();
  
        // Update axes
        xAxisGroup.call(d3.axisBottom(x0))
          .selectAll("text")
          .attr("transform", "rotate(-40)")
          .style("text-anchor", "end");
  
        yAxisGroup.transition().duration(500).call(d3.axisLeft(y).ticks(5));
  
        // Data join for groups
        const barGroups = chart.selectAll(".barGroup")
          .data(data, d => d.ageGroup);
  
        // Remove old groups
        barGroups.exit().remove();
  
        // Add new groups
        const barGroupsEnter = barGroups.enter()
          .append("g")
          .attr("class", "barGroup")
          .attr("transform", d => `translate(${x0(d.ageGroup)},0)`);
  
        // Merge enter + update groups
        const barGroupsMerge = barGroupsEnter.merge(barGroups)
          .attr("transform", d => `translate(${x0(d.ageGroup)},0)`);
  
        // Bars within groups
        const bars = barGroupsMerge.selectAll("rect")
          .data(d => keys.map(key => ({ key, value: d[key] })));
  
        bars.exit().remove();
  
        const barsEnter = bars.enter()
          .append("rect")
          .attr("x", d => x1(d.key))
          .attr("width", x1.bandwidth())
          .attr("y", y(0))
          .attr("height", 0)
          .attr("fill", d => color(d.key));
  
        // Merge enter + update bars with transition
        barsEnter.merge(bars)
          .transition()
          .duration(500)
          .attr("x", d => x1(d.key))
          .attr("y", d => y(d.value))
          .attr("height", d => height - y(d.value))
          .attr("width", x1.bandwidth())
          .attr("fill", d => color(d.key));
      }
  
      // Initial chart render
      updateChart(+monthSlider.value);
  
      // Update on slider input
      monthSlider.addEventListener("input", function () {
        updateChart(+this.value);
      });
    }).catch(error => {
      console.error("Error loading the CSV file: ", error);
    });
  });
  