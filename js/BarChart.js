document.addEventListener('DOMContentLoaded', function () {
  const margin = { top: 40, right: 30, bottom: 70, left: 75 },
    width = 680 - margin.left - margin.right,
    height = 380 - margin.top - margin.bottom;

  const svg = d3.select("#BarChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Tooltip setup
  const tooltipGroup = svg.append("g")  // Append directly to SVG for top layer
    .style("pointer-events", "none")
    .style("display", "none");

  const tooltipRect = tooltipGroup.append("rect")
    .attr("fill", "black")
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("opacity", 0.75);

  const tooltipText = tooltipGroup.append("text")
    .attr("fill", "white")
    .attr("font-size", "12px")
    .attr("x", 5)
    .attr("y", 15);

  let allData = [];
  let currentKeys = ["FINES"]; // which key to show
  let ageOrder = ["0-16", "17-25", "26-39", "40-64", "65 and over"];

  d3.csv("data/age.csv").then(rawData => {
    // Aggregate data by AGE_GROUP
    const dataMap = d3.rollup(
      rawData,
      v => ({
        FINES: d3.sum(v, d => +d.FINES),
        CHARGES: d3.sum(v, d => +d.CHARGES),
      }),
      d => d.AGE_GROUP
    );

    allData = Array.from(dataMap, ([ageGroup, values]) => ({ ageGroup, ...values }));

    // Initial sort by ageOrder
    allData.sort((a, b) => ageOrder.indexOf(a.ageGroup) - ageOrder.indexOf(b.ageGroup));

    renderChart(currentKeys);

    // Toggle checkbox listener for FINES/CHARGES
    const toggleCheckbox = document.getElementById("toggleCharges");
    const toggleLabel = document.querySelector(".toggle-label");
    
    toggleCheckbox.addEventListener("change", function () {
      if (this.checked) {
        currentKeys = ["CHARGES"];
        toggleLabel.textContent = "Show Fines Chart";
      } else {
        currentKeys = ["FINES"];
        toggleLabel.textContent = "Show Charges Chart";
      }
    
      applySortingAndRender();
    });    
    

    // Sort dropdown listener for ascending/descending/no sort
    document.getElementById("sortOrder").addEventListener("change", function () {
      applySortingAndRender();
    });

    function applySortingAndRender() {
      const sortOrder = document.getElementById("sortOrder").value;

      if (sortOrder === "asc") {
        allData.sort((a, b) => a[currentKeys[0]] - b[currentKeys[0]]);
      } else if (sortOrder === "desc") {
        allData.sort((a, b) => b[currentKeys[0]] - a[currentKeys[0]]);
      } else {
        // no sort, keep age order
        allData.sort((a, b) => ageOrder.indexOf(a.ageGroup) - ageOrder.indexOf(b.ageGroup));
      }

      renderChart(currentKeys);
    }
  });

  function renderChart(keys) {
    const duration = 800;

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

    chart.selectAll(".x-axis").remove();
    chart.selectAll(".y-axis").remove();

    chart.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");

    chart.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).ticks(5));

    const barGroups = chart.selectAll(".barGroup")
      .data(allData, d => d.ageGroup);

    barGroups.exit()
      .transition()
      .duration(duration / 2)
      .attr("opacity", 0)
      .remove();

    const barGroupsEnter = barGroups.enter()
      .append("g")
      .attr("class", "barGroup")
      .attr("opacity", 0)
      .attr("transform", d => `translate(${x0(d.ageGroup)},0)`);

    const barGroupsMerge = barGroupsEnter.merge(barGroups);

    barGroupsMerge.transition()
      .duration(duration)
      .attr("transform", d => `translate(${x0(d.ageGroup)},0)`)
      .attr("opacity", 1);

    const bars = barGroupsMerge.selectAll("rect")
      .data(d => keys.map(key => ({ key, value: +d[key], ageGroup: d.ageGroup })), d => d.key);

    bars.exit()
      .transition()
      .duration(duration / 2)
      .attr("y", y(0))
      .attr("height", 0)
      .attr("opacity", 0)
      .remove();

    const barsEnter = bars.enter()
      .append("rect")
      .attr("x", d => x1(d.key))
      .attr("width", x1.bandwidth())
      .attr("y", y(0))
      .attr("height", 0)
      .attr("fill", d => color(d.key));

    barsEnter.merge(bars)
      .on("mouseover", function (event, d) {
        // Bring hovered bar to front
        this.parentNode.appendChild(this);
        // Bring tooltipGroup to top of SVG
        svg.node().appendChild(tooltipGroup.node());

        tooltipGroup.style("display", null);
        tooltipText.text(`${d.key}: ${d.value}`);

        const textBBox = tooltipText.node().getBBox();
        tooltipRect
          .attr("width", textBBox.width + 10)
          .attr("height", textBBox.height + 6);

        const barX = +d3.select(this).attr("x");
        const barY = +d3.select(this).attr("y");

        // Position tooltip above the bar, centered horizontally
        const tooltipX = margin.left + x0(d.ageGroup) + barX + x1.bandwidth() / 2 - (textBBox.width + 10) / 2;
        const tooltipY = margin.top + barY - textBBox.height - 12;

        tooltipGroup.attr("transform", `translate(${tooltipX},${tooltipY})`);

        // Highlight bar color (brighter)
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", d3.color(color(d.key)).brighter(1));
      })
      .on("mouseout", function () {
        tooltipGroup.style("display", "none");
        // Reset bar color to original
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", d => color(d.key));
      })
      .transition()
      .duration(duration)
      .attr("x", d => x1(d.key))
      .attr("width", x1.bandwidth())
      .attr("y", d => y(d.value))
      .attr("height", d => height - y(d.value))
      .attr("fill", d => color(d.key));
  }
});
