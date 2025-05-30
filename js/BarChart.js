document.addEventListener('DOMContentLoaded', function () {
  const margin = { top: 120, right: 30, bottom: 70, left: 75 },
    width = 680 - margin.left - margin.right,
    height = 480 - margin.top - margin.bottom;

  const svg = d3.select("#BarChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  
  const kpiCard = svg.append("g")
    .attr("class", "kpi-card")
    .attr("transform", `translate(${width + margin.left - 150}, 20)`);

  
  const kpiGradient = svg.select("defs").empty() ? svg.append("defs") : svg.select("defs");
  
  const kpiCardGradient = kpiGradient.append("linearGradient")
    .attr("id", "kpiGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%");
  
  kpiCardGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#1e3a8a")
    .attr("stop-opacity", 0.9);
  
  kpiCardGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#1e40af")
    .attr("stop-opacity", 0.95);
 
  const kpiBackground = kpiCard.append("rect")
    .attr("width", 170)
    .attr("height", 80)
    .attr("rx", 12)
    .attr("ry", 12)
    .attr("fill", "url(#kpiGradient)")
    .attr("stroke", "rgba(59, 130, 246, 0.3)")
    .attr("stroke-width", 1)
    .style("filter", "drop-shadow(0 4px 12px rgba(30, 58, 138, 0.3))");
 
  const kpiInnerBorder = kpiCard.append("rect")
    .attr("width", 168)
    .attr("height", 78)
    .attr("x", 1)
    .attr("y", 1)
    .attr("rx", 11)
    .attr("ry", 11)
    .attr("fill", "none")
    .attr("stroke", "rgba(147, 197, 253, 0.2)")
    .attr("stroke-width", 1);
 
  const kpiLabel = kpiCard.append("text")
    .attr("x", 15)
    .attr("y", 22)
    .attr("fill", "rgba(147, 197, 253, 0.9)")
    .attr("font-size", "11px")
    .attr("font-weight", "600")
    .style("font-family", "'Inter', 'Segoe UI', system-ui, sans-serif")
    .style("letter-spacing", "0.5px")
    .style("text-transform", "uppercase")
    .text("TOTAL FINES");
 
  const kpiValue = kpiCard.append("text")
    .attr("x", 15)
    .attr("y", 45)
    .attr("fill", "white")
    .attr("font-size", "24px")
    .attr("font-weight", "700")
    .style("font-family", "'Inter', 'Segoe UI', system-ui, sans-serif")
    .text("0");
 
  const kpiIcon = kpiCard.append("text")
    .attr("x", 140)
    .attr("y", 25)
    .attr("fill", "#60a5fa")
    .attr("font-size", "20px")
    .text("🧾");
 
  const kpiTrend = kpiCard.append("text")
    .attr("x", 15)
    .attr("y", 65)
    .attr("fill", "rgba(147, 197, 253, 0.7)")
    .attr("font-size", "10px")
    .attr("font-weight", "500")
    .style("font-family", "'Inter', 'Segoe UI', system-ui, sans-serif")
    .text("All age groups");

 
  const tooltipGroup = svg.append("g")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("filter", "drop-shadow(0 8px 25px rgba(0,0,0,0.15))");

 
  const defs = svg.select("defs").empty() ? svg.append("defs") : svg.select("defs");
  
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

 
  const tooltipRect = tooltipGroup.append("rect")
    .attr("fill", "url(#tooltipGradient)")
    .attr("rx", 12)
    .attr("ry", 12)
    .attr("stroke", "rgba(255, 255, 255, 0.1)")
    .attr("stroke-width", 1);

 
  const innerGlow = tooltipGroup.append("rect")
    .attr("fill", "none")
    .attr("stroke", "rgba(255, 255, 255, 0.05)")
    .attr("stroke-width", 1)
    .attr("rx", 11)
    .attr("ry", 11)
    .attr("x", 1)
    .attr("y", 1);

 
  const categoryLabel = tooltipGroup.append("text")
    .attr("fill", "rgba(255, 255, 255, 0.7)")
    .attr("font-size", "11px")
    .attr("font-weight", "500")
    .attr("x", 20)
    .attr("y", 22)
    .style("font-family", "'Inter', 'Segoe UI', system-ui, sans-serif")
    .style("letter-spacing", "0.5px")
    .style("text-transform", "uppercase");
 
  const valueText = tooltipGroup.append("text")
    .attr("fill", "white")
    .attr("font-size", "18px")
    .attr("font-weight", "700")
    .attr("x", 20)
    .attr("y", 46)
    .style("font-family", "'Inter', 'Segoe UI', system-ui, sans-serif");

  
  const contextText = tooltipGroup.append("text")
    .attr("fill", "rgba(255, 255, 255, 0.6)")
    .attr("font-size", "12px")
    .attr("font-weight", "400")
    .attr("x", 38)
    .attr("y", 68)
    .style("font-family", "'Inter', 'Segoe UI', system-ui, sans-serif");
 
  const ageIcon = tooltipGroup.append("text")
    .attr("font-size", "14px")
    .attr("x", 20)
    .attr("y", 68)
    .text("👥");

  let allData = [];
  let currentKeys = ["FINES"];
  let ageOrder = ["0-16", "17-25", "26-39", "40-64", "65 and over"];

 
  function updateToggleText(isCharges) {
    const toggleLabel = document.querySelector('label[for="toggleCharges"]');
    if (toggleLabel) {

      const textNodes = Array.from(toggleLabel.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
      if (textNodes.length > 0) {
        textNodes[0].textContent = isCharges ?   'Showing Fines' : 'Showing Charges';
      } else {
        
        const textSpan = toggleLabel.querySelector('span, .toggle-text');
        if (textSpan) {
          textSpan.textContent = isCharges ? 'Showing Fines' : 'Showing Charges' ;
        } else {
        
          toggleLabel.innerHTML = toggleLabel.innerHTML.replace(/Show (Fines|Charges)/, isCharges ? 'Showing Charges' : 'Showing Fines');
        }
      }
    }
    
   
    const toggleText = document.querySelector('.toggle-text, .toggle-label-text');
    if (toggleText) {
      toggleText.textContent = isCharges ?  'Show Fines' : 'Show Charges';
    }
  }

 
  function updateKpiCard(keys) {
    const currentKey = keys[0];
    const total = allData.reduce((sum, d) => sum + d[currentKey], 0);
    const formattedTotal = total.toLocaleString();
    
     
    kpiLabel.transition()
      .duration(300)
      .style("opacity", 0)
      .transition()
      .duration(0)
      .text(`TOTAL ${currentKey}`)
      .transition()
      .duration(300)
      .style("opacity", 1);
    
    kpiValue.transition()
      .duration(300)
      .style("opacity", 0)
      .transition()
      .duration(0)
      .text(formattedTotal)
      .transition()
      .duration(300)
      .style("opacity", 1);

   
    const iconEmoji = currentKey === "FINES" ? "🧾" : "⚖️";
    kpiIcon.transition()
      .duration(300)
      .style("opacity", 0)
      .transition()
      .duration(0)
      .text(iconEmoji)
      .transition()
      .duration(300)
      .style("opacity", 1);

    
    const iconColor = currentKey === "FINES" ? "#60a5fa" : "#3b82f6";
    kpiIcon.attr("fill", iconColor);
    
    
    kpiBackground
      .transition()
      .duration(200)
      .style("filter", "drop-shadow(0 4px 12px rgba(30, 58, 138, 0.4))")
      .transition()
      .duration(200)
      .style("filter", "drop-shadow(0 4px 12px rgba(30, 58, 138, 0.3))");
  }

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
    updateKpiCard(currentKeys); 
    updateToggleText(false); 
    document.getElementById("toggleCharges").addEventListener("change", function () {
      const isCharges = this.checked;
      currentKeys = isCharges ? ["CHARGES"] : ["FINES"];
      updateToggleText(isCharges); 
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
      updateKpiCard(currentKeys); 
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
    chart.selectAll(".axis-label").remove(); // ✅ remove previous label to prevent duplicates
  
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
  
    // ✅ Add dynamic Y-axis label
    const yLabelText = keys.length === 1
      ? (keys[0] === "FINES" ? "Number of Fines" : "Number of Charges")
      : "Number of Fines / Charges";
  
    chart.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", 0 - (height / 2))
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .text(yLabelText);
  
    // ✅ Optional: Add X-axis label (only once if needed)
    chart.selectAll(".x-axis-label").remove();
    chart.append("text")
      .attr("class", "x-axis-label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 5)
      .attr("text-anchor", "middle")
      .text("Age Group");
  
    // --- rest of your bar chart logic (unchanged) ---
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
        this.parentNode.appendChild(this);
        svg.node().appendChild(tooltipGroup.node());
  
        const formattedValue = d.value.toLocaleString();
  
        categoryLabel.text(d.key);
        valueText.text(formattedValue);
        contextText.text(d.ageGroup);
  
        const categoryBBox = categoryLabel.node().getBBox();
        const valueBBox = valueText.node().getBBox();
        const contextBBox = contextText.node().getBBox();
  
        const maxWidth = Math.max(categoryBBox.width, valueBBox.width, contextBBox.width);
        const tooltipWidth = maxWidth + 48;
        const tooltipHeight = 90;
  
        tooltipRect
          .attr("width", tooltipWidth)
          .attr("height", tooltipHeight);
  
        innerGlow
          .attr("width", tooltipWidth - 2)
          .attr("height", tooltipHeight - 2);
  
        const barCenterX = margin.left + x0(d.ageGroup) + x1(d.key) + x1.bandwidth() / 2;
        const barTopY = margin.top + y(d.value);
  
        let tooltipX = barCenterX - tooltipWidth / 2;
        let tooltipY = barTopY - tooltipHeight - 15;
  
        if (tooltipX < 10) tooltipX = 10;
        if (tooltipX + tooltipWidth > width + margin.left + margin.right - 10) {
          tooltipX = width + margin.left + margin.right - tooltipWidth - 10;
        }
        if (tooltipY < 10) tooltipY = 10;
  
        tooltipGroup
          .attr("transform", `translate(${tooltipX},${tooltipY}) scale(0.8)`)
          .style("opacity", 0)
          .transition()
          .duration(200)
          .ease(d3.easeCubicOut)
          .attr("transform", `translate(${tooltipX},${tooltipY}) scale(1)`)
          .style("opacity", 1);
  
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", d3.color(color(d.key)).brighter(0.3))
          .style("filter", "drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))");
      })
      .on("mouseout", function () {
        tooltipGroup
          .transition()
          .duration(150)
          .ease(d3.easeCubicIn)
          .attr("transform", function () {
            const currentTransform = d3.select(this).attr("transform");
            return currentTransform.replace("scale(1)", "scale(0.9)");
          })
          .style("opacity", 0);
  
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