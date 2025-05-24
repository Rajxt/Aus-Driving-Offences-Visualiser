document.addEventListener('DOMContentLoaded', function () {
    const margin = { top: 40, right: 30, bottom: 70, left: 60 },
      width = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;
  
    const svg = d3.select("#BarChart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
  
    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const keys = ["FINES", "ARRESTS", "CHARGES"];  // Use uppercase to match CSV columns
  
    // Load CSV data
    d3.csv("data/AgewithMonth.csv").then(rawData => {
      // Aggregate data by age group
      const dataMap = d3.rollup(
        rawData,
        v => ({
          FINES: d3.sum(v, d => +d.FINES),
          ARRESTS: d3.sum(v, d => +d.ARRESTS),
          CHARGES: d3.sum(v, d => +d.CHARGES),
        }),
        d => d.AGE_GROUP
      );
  
      // Convert map to array
      const data = Array.from(dataMap, ([ageGroup, values]) => ({ ageGroup, ...values }));
  
      // Sort the age groups if needed (optional)
      const ageOrder = ["0-16", "17-25", "26-39", "40-64", "65 and over"];
      data.sort((a, b) => ageOrder.indexOf(a.ageGroup) - ageOrder.indexOf(b.ageGroup));
  
      // Scales
      const x0 = d3.scaleBand()
        .domain(data.map(d => d.ageGroup))
        .range([0, width])
        .paddingInner(0.1);
  
      const x1 = d3.scaleBand()
        .domain(keys)
        .range([0, x0.bandwidth()])
        .padding(0.05);
  
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.max(keys, key => d[key]))])
        .nice()
        .range([height, 0]);
  
      const color = d3.scaleOrdinal()
        .domain(keys)
        .range(["#6b486b", "#ff8c00", "#a05d56"]);
  
      // Axes
      chart.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .style("text-anchor", "end");
  
      chart.append("g")
        .call(d3.axisLeft(y).ticks(5));
  
      // Bars
      const barGroups = chart.selectAll(".barGroup")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "barGroup")
        .attr("transform", d => `translate(${x0(d.ageGroup)},0)`);
  
      barGroups.selectAll("rect")
        .data(d => keys.map(key => ({ key, value: d[key] })))
        .enter()
        .append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => color(d.key));
    }).catch(error => {
      console.error("Error loading the CSV file: ", error);
    });
  });
  