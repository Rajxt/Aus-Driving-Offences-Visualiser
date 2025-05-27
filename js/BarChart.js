document.addEventListener('DOMContentLoaded', function () {
  const margin = { top: 40, right: 30, bottom: 70, left: 75 },
    width = 680 - margin.left - margin.right,
    height = 380 - margin.top - margin.bottom;

  const svg = d3.select("#BarChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Enhanced tooltip setup with modern design
  const tooltipGroup = svg.append("g")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("filter", "drop-shadow(0 8px 25px rgba(0,0,0,0.15))");

  // Gradient definitions for modern look
  const defs = svg.append("defs");
  
  const gradient = defs.append("linearGradient")
    .attr("id", "tooltipGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");
  
  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "rgba(45, 55, 72, 0.98)")
    .attr("stop-opacity", 1);
  
  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "rgba(26, 32, 44, 0.98)")
    .attr("stop-opacity", 1);

  // Main tooltip background with modern styling
  const tooltipRect = tooltipGroup.append("rect")
    .attr("fill", "url(#tooltipGradient)")
    .attr("rx", 12)
    .attr("ry", 12)
    .attr("stroke", "rgba(255, 255, 255, 0.1)")
    .attr("stroke-width", 1);

  // Subtle inner glow effect
  const innerGlow = tooltipGroup.append("rect")
    .attr("fill", "none")
    .attr("stroke", "rgba(255, 255, 255, 0.05)")
    .attr("stroke-width", 1)
    .attr("rx", 11)
    .attr("ry", 11)
    .attr("x", 1)
    .attr("y", 1);

  // Category label (FINES/CHARGES)
  const categoryLabel = tooltipGroup.append("text")
    .attr("fill", "rgba(255, 255, 255, 0.7)")
    .attr("font-size", "11px")
    .attr("font-weight", "500")
    .attr("x", 20) // Increased from 16 to 20
    .attr("y", 22) // Increased from 18 to 22
    .style("font-family", "'Inter', 'Segoe UI', system-ui, sans-serif")
    .style("letter-spacing", "0.5px")
    .style("text-transform", "uppercase");

  // Main value text with larger, bold styling
  const valueText = tooltipGroup.append("text")
    .attr("fill", "white")
    .attr("font-size", "18px")
    .attr("font-weight", "700")
    .attr("x", 20) // Increased from 16 to 20
    .attr("y", 46) // Increased from 40 to 46
    .style("font-family", "'Inter', 'Segoe UI', system-ui, sans-serif");

  // Age group context text
  const contextText = tooltipGroup.append("text")
    .attr("fill", "rgba(255, 255, 255, 0.6)")
    .attr("font-size", "12px")
    .attr("font-weight", "400")
    .attr("x", 38) // Increased from 34 to 38
    .attr("y", 68) // Increased from 62 to 68
    .style("font-family", "'Inter', 'Segoe UI', system-ui, sans-serif");

  // Age group icon
  const ageIcon = tooltipGroup.append("text")
    .attr("font-size", "14px")
    .attr("x", 20) // Increased from 16 to 20
    .attr("y", 68) // Increased from 62 to 68
    .text("👥");

  let allData = [];
  let currentKeys = ["FINES"];
  let ageOrder = ["0-16", "17-25", "26-39", "40-64", "65 and over"];

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
    allData.sort((a, b) => ageOrder.indexOf(a.ageGroup) - ageOrder.indexOf(b.ageGroup));

    renderChart(currentKeys);

    document.getElementById("toggleCharges").addEventListener("change", function () {
      currentKeys = this.checked ? ["CHARGES"] : ["FINES"];
      applySortingAndRender();
    });

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
        // Bring elements to front
        this.parentNode.appendChild(this);
        svg.node().appendChild(tooltipGroup.node());

        // Format number with commas
        const formattedValue = d.value.toLocaleString();
        
        // Update tooltip content with enhanced styling
        categoryLabel.text(d.key);
        valueText.text(formattedValue);
        contextText.text(d.ageGroup);

        // Calculate dynamic tooltip size based on content
        const categoryBBox = categoryLabel.node().getBBox();
        const valueBBox = valueText.node().getBBox();
        const contextBBox = contextText.node().getBBox();
        
        const maxWidth = Math.max(categoryBBox.width, valueBBox.width, contextBBox.width);
        const tooltipWidth = maxWidth + 48; // Increased padding from 32 to 48
        const tooltipHeight = 90; // Increased height from 80 to 90

        // Update tooltip background sizes
        tooltipRect
          .attr("width", tooltipWidth)
          .attr("height", tooltipHeight);
        
        innerGlow
          .attr("width", tooltipWidth - 2)
          .attr("height", tooltipHeight - 2);

        // Update accent line width
        // (removed accent line)

        // Position tooltip always above the bar
        const barCenterX = margin.left + x0(d.ageGroup) + x1(d.key) + x1.bandwidth() / 2;
        const barTopY = margin.top + y(d.value);
        
        let tooltipX = barCenterX - tooltipWidth / 2;
        let tooltipY = barTopY - tooltipHeight - 15;

        // Keep tooltip within horizontal bounds
        if (tooltipX < 10) tooltipX = 10;
        if (tooltipX + tooltipWidth > width + margin.left + margin.right - 10) {
          tooltipX = width + margin.left + margin.right - tooltipWidth - 10;
        }
        
        // If tooltip would go above chart area, keep it above but closer to bar
        if (tooltipY < 10) tooltipY = 10;

        // Enhanced animation with scale and opacity
        tooltipGroup
          .attr("transform", `translate(${tooltipX},${tooltipY}) scale(0.8)`)
          .style("opacity", 0)
          .transition()
          .duration(200)
          .ease(d3.easeCubicOut)
          .attr("transform", `translate(${tooltipX},${tooltipY}) scale(1)`)
          .style("opacity", 1);

        // Enhanced bar highlight with glow effect
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", d3.color(color(d.key)).brighter(0.3))
          .style("filter", "drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))");
      })
      .on("mouseout", function () {
        // Smooth tooltip exit animation
        tooltipGroup
          .transition()
          .duration(150)
          .ease(d3.easeCubicIn)
          .attr("transform", function() {
            const currentTransform = d3.select(this).attr("transform");
            return currentTransform.replace("scale(1)", "scale(0.9)");
          })
          .style("opacity", 0);

        // Reset bar styling
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", d => color(d.key))
          .style("filter", "none");
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