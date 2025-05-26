document.addEventListener('DOMContentLoaded', function () {
  const margin = { top: 60, right: 40, bottom: 80, left: 80 },
    container = d3.select("#BarChartContainer"),
    width = 800 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

  // Append SVG and make responsive
  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Tooltip group appended directly to SVG for top layering
  const tooltipGroup = svg.append("g")
    .style("pointer-events", "none")
    .style("display", "none")
    .attr("class", "tooltip-group")
    .attr("aria-hidden", "true");

  const tooltipRect = tooltipGroup.append("rect")
    .attr("fill", "rgba(0,0,0,0.75)")
    .attr("rx", 6)
    .attr("ry", 6);

  const tooltipText = tooltipGroup.append("text")
    .attr("fill", "white")
    .attr("font-size", "13px")
    .attr("font-family", "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif")
    .attr("x", 8)
    .attr("y", 18);

  // Chart title
  svg.append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", 28)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .attr("font-weight", "700")
    .text("Age Group Fines and Charges");

  // Axis labels
  svg.append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", height + margin.top + margin.bottom - 10)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Age Group");

  svg.append("text")
    .attr("transform", `translate(18,${(height + margin.top + margin.bottom) / 2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Count");

  // Color scheme - colorblind safe palette
  const color = d3.scaleOrdinal()
    .domain(["FINES", "CHARGES"])
    .range(["#0072B2", "#D55E00"]);

  let allData = [];
  let selectedKeys = new Set(["FINES", "CHARGES"]); // support multi keys toggle
  const ageOrder = ["0-16", "17-25", "26-39", "40-64", "65 and over"];

  // Sorting state
  let sortOrder = "none"; // none | asc | desc
  let sortByKey = "FINES";

  // Load and process CSV
  d3.csv("data/age.csv").then(rawData => {
    const dataMap = d3.rollup(
      rawData,
      v => ({
        FINES: d3.sum(v, d => +d.FINES),
        CHARGES: d3.sum(v, d => +d.CHARGES),
      }),
      d => d.AGE_GROUP
    );

    allData = Array.from(dataMap, ([ageGroup, values]) => ({ ageGroup, ...values }));

    // Sort initially by ageOrder
    sortOrder = "none";
    applySortAndRender();

    // Add multi-key toggle checkboxes dynamically
    createKeyToggles(["FINES", "CHARGES"]);

    // Setup sorting dropdown
    setupSortDropdown();
  });

  // Create toggles dynamically
  function createKeyToggles(keys) {
    const togglesContainer = d3.select("#keyToggles");
    togglesContainer.html(""); // clear existing

    keys.forEach(key => {
      const id = `toggle-${key}`;
      const label = togglesContainer.append("label")
        .attr("for", id)
        .style("margin-right", "20px")
        .style("cursor", "pointer")
        .text(key);

      label.insert("input", ":first-child")
        .attr("type", "checkbox")
        .attr("id", id)
        .attr("checked", true)
        .style("margin-right", "5px")
        .on("change", function () {
          if (this.checked) selectedKeys.add(key);
          else selectedKeys.delete(key);

          // If none selected, keep at least one
          if (selectedKeys.size === 0) {
            selectedKeys.add(key);
            this.checked = true;
            return;
          }

          // Update sorting key to one of selected keys
          if (!selectedKeys.has(sortByKey)) {
            sortByKey = Array.from(selectedKeys)[0];
          }

          applySortAndRender();
        });
    });
  }

  // Setup sorting dropdown with multi options
  function setupSortDropdown() {
    const sortSelect = d3.select("#sortOrder");
    sortSelect.html("");
    sortSelect.append("option").attr("value", "none").text("Sort: Age Group (default)");
    sortSelect.append("option").attr("value", "asc").text("Sort: Ascending");
    sortSelect.append("option").attr("value", "desc").text("Sort: Descending");

    sortSelect.on("change", () => {
      sortOrder = sortSelect.node().value;
      applySortAndRender();
    });
  }

  // Apply sort based on current settings
  function applySortAndRender() {
    if (sortOrder === "asc") {
      allData.sort((a, b) => a[sortByKey] - b[sortByKey]);
    } else if (sortOrder === "desc") {
      allData.sort((a, b) => b[sortByKey] - a[sortByKey]);
    } else {
      allData.sort((a, b) => ageOrder.indexOf(a.ageGroup) - ageOrder.indexOf(b.ageGroup));
    }

    renderChart(Array.from(selectedKeys));
  }

  function renderChart(keys) {
    const duration = 900;

    // Scales
    const x0 = d3.scaleBand()
      .domain(allData.map(d => d.ageGroup))
      .range([0, width])
      .paddingInner(0.15);

    const x1 = d3.scaleBand()
      .domain(keys)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const yMax = d3.max(allData, d => d3.max(keys, k => +d[k]));
    const y = d3.scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([height, 0]);

    // Axes
    chart.selectAll(".x-axis").remove();
    chart.selectAll(".y-axis").remove();
    chart.selectAll(".grid").remove();

    // Add Y gridlines
    chart.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .ticks(6)
        .tickSize(-width)
        .tickFormat(""))
      .attr("stroke-opacity", 0.15);

    chart.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-weight", "600");

    chart.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).ticks(6))
      .selectAll("text")
      .style("font-weight", "600");

    // Data join for groups
    const groups = chart.selectAll(".barGroup")
      .data(allData, d => d.ageGroup);

    groups.exit()
      .transition()
      .duration(duration / 2)
      .attr("opacity", 0)
      .remove();

    const groupsEnter = groups.enter()
      .append("g")
      .attr("class", "barGroup")
      .attr("opacity", 0)
      .attr("transform", d => `translate(${x0(d.ageGroup)},0)`);

    const groupsMerge = groupsEnter.merge(groups);

    groupsMerge.transition()
      .duration(duration)
      .attr("transform", d => `translate(${x0(d.ageGroup)},0)`)
      .attr("opacity", 1);

    // Bars join inside groups
    const bars = groupsMerge.selectAll("rect")
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
      .attr("fill", d => color(d.key))
      .attr("tabindex", 0) // keyboard accessible
      .attr("role", "graphics-symbol")
      .attr("aria-label", d => `${d.key} for age group ${d.ageGroup} is ${d.value}`);

    barsEnter.merge(bars)
      .on("mouseover", function (event, d) {
        this.parentNode.appendChild(this);
        svg.node().appendChild(tooltipGroup.node());

        tooltipGroup.style("display", null)
          .attr("aria-hidden", "false");

        tooltipText.text(`${d.key}: ${d.value.toLocaleString()}`);

        const padding = 12;
        const textBBox = tooltipText.node().getBBox();
        tooltipRect
          .attr("width", textBBox.width + padding)
          .attr("height", textBBox.height + padding / 2);

        // Get mouse coords relative to svg
        const [mouseX, mouseY] = d3.pointer(event, svg.node());

        let tooltipX = mouseX + 15;
        let tooltipY = mouseY - textBBox.height - 18;

        // Keep tooltip inside svg bounds
        if (tooltipX + textBBox.width + padding > width + margin.left + margin.right) {
          tooltipX = mouseX - textBBox.width - padding - 20;
        }
        if (tooltipY < margin.top) {
          tooltipY = mouseY + 15;
        }

        tooltipGroup.attr("transform", `translate(${tooltipX},${tooltipY})`);

        // Highlight bar color brighter
        d3.select(this)
          .transition

        .duration(200)
        .attr("fill", d3.color(color(d.key)).brighter(1));
        })
        .on("mousemove", function (event, d) {
        const [mouseX, mouseY] = d3.pointer(event, svg.node());

    const padding = 12;
    const textBBox = tooltipText.node().getBBox();
    let tooltipX = mouseX + 15;
    let tooltipY = mouseY - textBBox.height - 18;

    if (tooltipX + textBBox.width + padding > width + margin.left + margin.right) {
      tooltipX = mouseX - textBBox.width - padding - 20;
    }
    if (tooltipY < margin.top) {
      tooltipY = mouseY + 15;
    }
    tooltipGroup.attr("transform", `translate(${tooltipX},${tooltipY})`);
  })
  .on("mouseout", function (event, d) {
    tooltipGroup.style("display", "none").attr("aria-hidden", "true");

    d3.select(this)
      .transition()
      .duration(300)
      .attr("fill", color(d.key));
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