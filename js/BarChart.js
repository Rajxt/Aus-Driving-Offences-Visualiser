document.addEventListener('DOMContentLoaded', function () {
  const margin = { top: 40, right: 30, bottom: 70, left: 50 },
    width = 680 - margin.left - margin.right,
    height = 380 - margin.top - margin.bottom;

  const svg = d3.select("#BarChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  let allData = [];

  // Load CSV and prepare data
  d3.csv("data/age.csv").then(rawData => {
    const dataMap = d3.rollup(
      rawData,
      v => ({
        FINES: d3.sum(v, d => +d.FINES),
        CHARGES: d3.sum(v, d => +d.CHARGES),
      }),
      d => d.AGE_GROUP
    );

    const ageOrder = ["0-16", "17-25", "26-39", "40-64", "65 and over"];
    allData = Array.from(dataMap, ([ageGroup, values]) => ({ ageGroup, ...values }));
    allData.sort((a, b) => ageOrder.indexOf(a.ageGroup) - ageOrder.indexOf(b.ageGroup));

    renderChart(["FINES"]); // default

    // Toggle listener
    document.getElementById("toggleCharges").addEventListener("change", function () {
      const keys = this.checked ? ["CHARGES"] : ["FINES"];
      renderChart(keys);
    });
  });

  function renderChart(keys) {
    chart.selectAll("*").remove(); // Clear chart

    const x0 = d3.scaleBand()
      .domain(allData.map(d => d.ageGroup))
      .range([0, width])
      .paddingInner(0.1);

    const x1 = d3.scaleBand()
      .domain(keys)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear()
      .domain([0, d3.max(allData, d => d3.max(keys, key => +d[key]))])
      .nice()
      .range([height, 0]);

    const color = d3.scaleOrdinal()
      .domain(["FINES", "CHARGES"])
      .range(["#6b486b", "#4682b4"]);

    // X Axis
    chart.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");

    // Y Axis
    chart.append("g")
      .call(d3.axisLeft(y).ticks(5));

    // Bar groups
    const barGroups = chart.selectAll(".barGroup")
      .data(allData)
      .enter()
      .append("g")
      .attr("class", "barGroup")
      .attr("transform", d => `translate(${x0(d.ageGroup)},0)`);

    barGroups.selectAll("rect")
      .data(d => keys.map(key => ({ key, value: +d[key] })))
      .enter()
      .append("rect")
      .attr("x", d => x1(d.key))
      .attr("y", d => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => color(d.key));
  }
});
