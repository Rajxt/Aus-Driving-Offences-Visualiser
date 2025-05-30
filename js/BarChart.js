import { loadBar } from './LoadData.js';

document.addEventListener('DOMContentLoaded', async function () {
  // Responsive dimensions with breakpoints
  function getResponsiveDimensions() {
    const containerWidth = document.getElementById("BarChart").clientWidth || 800;
    const screenWidth = window.innerWidth;
    
    let margin, width, height;
    
    if (screenWidth < 480) {
      // Mobile
      margin = { top: 100, right: 20, bottom: 80, left: 50 };
      width = Math.max(containerWidth - margin.left - margin.right, 280);
      height = 400 - margin.top - margin.bottom;
    } else if (screenWidth < 768) {
      // Tablet
      margin = { top: 110, right: 25, bottom: 75, left: 60 };
      width = Math.max(containerWidth - margin.left - margin.right, 400);
      height = 440 - margin.top - margin.bottom;
    } else {
      // Desktop
      margin = { top: 120, right: 30, bottom: 70, left: 75 };
      width = Math.max(containerWidth - margin.left - margin.right, 550);
      height = 480 - margin.top - margin.bottom;
    }
    
    return { margin, width, height };
  }

  let { margin, width, height } = getResponsiveDimensions();

  const svg = d3.select("#BarChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto")
    .style("max-width", "100%");

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Responsive KPI card positioning and sizing
  function getKpiCardPosition() {
    const screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      return {
        x: 10,
        y: 10,
        width: Math.min(150, width * 0.4),
        height: 70
      };
    } else {
      return {
        x: width + margin.left - 170,
        y: 20,
        width: 170,
        height: 80
      };
    }
  }

  let kpiPos = getKpiCardPosition();
  
  const kpiCard = svg.append("g")
    .attr("class", "kpi-card")
    .attr("transform", `translate(${kpiPos.x}, ${kpiPos.y})`);

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
    .attr("width", kpiPos.width)
    .attr("height", kpiPos.height)
    .attr("rx", 12)
    .attr("ry", 12)
    .attr("fill", "url(#kpiGradient)")
    .attr("stroke", "rgba(59, 130, 246, 0.3)")
    .attr("stroke-width", 1)
    .style("filter", "drop-shadow(0 4px 12px rgba(30, 58, 138, 0.3))");

  const kpiInnerBorder = kpiCard.append("rect")
    .attr("width", kpiPos.width - 2)
    .attr("height", kpiPos.height - 2)
    .attr("x", 1)
    .attr("y", 1)
    .attr("rx", 11)
    .attr("ry", 11)
    .attr("fill", "none")
    .attr("stroke", "rgba(147, 197, 253, 0.2)")
    .attr("stroke-width", 1);

  // Responsive font sizes
  function getResponsiveFontSizes() {
    const screenWidth = window.innerWidth;
    if (screenWidth < 480) {
      return {
        kpiLabel: "9px",
        kpiValue: "18px",
        kpiTrend: "8px",
        tooltipCategory: "10px",
        tooltipValue: "16px",
        tooltipContext: "11px"
      };
    } else if (screenWidth < 768) {
      return {
        kpiLabel: "10px",
        kpiValue: "20px",
        kpiTrend: "9px",
        tooltipCategory: "11px",
        tooltipValue: "17px",
        tooltipContext: "12px"
      };
    } else {
      return {
        kpiLabel: "11px",
        kpiValue: "24px",
        kpiTrend: "10px",
        tooltipCategory: "11px",
        tooltipValue: "18px",
        tooltipContext: "12px"
      };
    }
  }

  let fontSizes = getResponsiveFontSizes();

  const kpiLabel = kpiCard.append("text")
    .attr("x", 15)
    .attr("y", 18)
    .attr("fill", "rgba(147, 197, 253, 0.9)")
    .attr("font-size", fontSizes.kpiLabel)
    .attr("font-weight", "600")
    .style("font-family", "'Inter', 'Segoe UI', system-ui, sans-serif")
    .style("letter-spacing", "0.5px")
    .style("text-transform", "uppercase")
    .text("TOTAL FINES");

  const kpiValue = kpiCard.append("text")
    .attr("x", 15)
    .attr("y", window.innerWidth < 768 ? 38 : 45)
    .attr("fill", "white")
    .attr("font-size", fontSizes.kpiValue)
    .attr("font-weight", "700")
    .style("font-family", "'Inter', 'Segoe UI', system-ui, sans-serif")
    .text("0");

  const kpiIcon = kpiCard.append("text")
    .attr("x", kpiPos.width - 30)
    .attr("y", 22)
    .attr("fill", "#60a5fa")
    .attr("font-size", window.innerWidth < 768 ? "16px" : "20px")
    .text("🧾");

  const kpiTrend = kpiCard.append("text")
    .attr("x", 15)
    .attr("y", kpiPos.height - 10)
    .attr("fill", "rgba(147, 197, 253, 0.7)")
    .attr("font-size", fontSizes.kpiTrend)
    .attr("font-weight", "500")
    .style("font-family", "'Inter', 'Segoe UI', system-ui, sans-serif")
    .text("All age groups");

  // Tooltip with responsive sizing
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
    .attr("font-size", fontSizes.tooltipCategory)
    .attr("font-weight", "500")
    .attr("x", 20)
    .attr("y", 22)
    .style("font-family", "'Inter', 'Segoe UI', system-ui, sans-serif")
    .style("letter-spacing", "0.5px")
    .style("text-transform", "uppercase");

  const valueText = tooltipGroup.append("text")
    .attr("fill", "white")
    .attr("font-size", fontSizes.tooltipValue)
    .attr("font-weight", "700")
    .attr("x", 20)
    .attr("y", 46)
    .style("font-family", "'Inter', 'Segoe UI', system-ui, sans-serif");

  const contextText = tooltipGroup.append("text")
    .attr("fill", "rgba(255, 255, 255, 0.6)")
    .attr("font-size", fontSizes.tooltipContext)
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

  // Resize handler
  function handleResize() {
    const newDimensions = getResponsiveDimensions();
    const newKpiPos = getKpiCardPosition();
    const newFontSizes = getResponsiveFontSizes();
    
    // Update dimensions
    margin = newDimensions.margin;
    width = newDimensions.width;
    height = newDimensions.height;
    kpiPos = newKpiPos;
    fontSizes = newFontSizes;
    
    // Update SVG
    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);
    
    // Update chart transform
    chart.attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Update KPI card
    kpiCard.attr("transform", `translate(${kpiPos.x}, ${kpiPos.y})`);
    kpiBackground.attr("width", kpiPos.width).attr("height", kpiPos.height);
    kpiInnerBorder.attr("width", kpiPos.width - 2).attr("height", kpiPos.height - 2);
    kpiIcon.attr("x", kpiPos.width - 30).attr("font-size", window.innerWidth < 768 ? "16px" : "20px");
    kpiValue.attr("y", window.innerWidth < 768 ? 38 : 45).attr("font-size", fontSizes.kpiValue);
    kpiLabel.attr("font-size", fontSizes.kpiLabel);
    kpiTrend.attr("y", kpiPos.height - 10).attr("font-size", fontSizes.kpiTrend);
    
    // Update tooltip font sizes
    categoryLabel.attr("font-size", fontSizes.tooltipCategory);
    valueText.attr("font-size", fontSizes.tooltipValue);
    contextText.attr("font-size", fontSizes.tooltipContext);
    
    // Re-render chart if data exists
    if (allData.length > 0) {
      renderChart(currentKeys);
    }
  }

  // Debounced resize handler
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 150);
  });

  function animateKpiNumber(targetValue, duration = 1500) {
    const startValue = 0;
    const startTime = performance.now();
    
    kpiBackground
      .transition()
      .duration(duration)
      .style("filter", "drop-shadow(0 6px 16px rgba(30, 58, 138, 0.5))")
      .transition()
      .duration(300)
      .style("filter", "drop-shadow(0 4px 12px rgba(30, 58, 138, 0.3))");

    function updateNumber(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
      
      const formattedValue = currentValue.toLocaleString();
      kpiValue.text(formattedValue);
      
      const scale = 1 + (Math.sin(progress * Math.PI) * 0.05);
      kpiValue.attr("transform", `scale(${scale})`);
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        kpiValue.attr("transform", "scale(1)");
        kpiValue.text(targetValue.toLocaleString());
      }
    }
    
    requestAnimationFrame(updateNumber);
  }

  function showLoadingAnimation() {
    let dotCount = 0;
    const loadingInterval = setInterval(() => {
      const dots = '.'.repeat((dotCount % 3) + 1);
      kpiValue.text(`Loading${dots}`);
      dotCount++;
    }, 300);

    return loadingInterval;
  }

  async function initializeData() {
    try {
      const loadingInterval = showLoadingAnimation();
      
      const [rawData] = await loadBar();
      
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

      clearInterval(loadingInterval);
      
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

      console.log('Data loaded and processed:', allData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      kpiValue.text('Error');
    }
  }

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

  function updateToggleText(isCharges) {
    const toggleLabel = document.querySelector('label[for="toggleCharges"]');
    if (toggleLabel) {
      const textNodes = Array.from(toggleLabel.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
      if (textNodes.length > 0) {
        textNodes[0].textContent = isCharges ? 'Showing Fines' : 'Showing Charges';
      } else {
        const textSpan = toggleLabel.querySelector('span, .toggle-text');
        if (textSpan) {
          textSpan.textContent = isCharges ? 'Showing Charges' : 'Showing Fines' ;
        } else {
          toggleLabel.innerHTML = toggleLabel.innerHTML.replace(/Show (Fines|Charges)/, isCharges ? 'Showing Charges' : 'Showing Fines');
        }
      }
    }
    
    const toggleText = document.querySelector('.toggle-text, .toggle-label-text');
    if (toggleText) {
      toggleText.textContent = isCharges ? 'Show Fines' : 'Show Charges';
    }
  }

  function updateKpiCard(keys) {
    const currentKey = keys[0];
    const total = allData.reduce((sum, d) => sum + d[currentKey], 0);
    
    kpiLabel.transition()
      .duration(200)
      .style("opacity", 0)
      .transition()
      .duration(0)
      .text(`TOTAL ${currentKey}`)
      .transition()
      .duration(200)
      .style("opacity", 1);
    
    animateKpiNumber(total, 1200);

    const iconEmoji = currentKey === "FINES" ? "🧾" : "⚖️";
    kpiIcon.transition()
      .duration(200)
      .style("opacity", 0)
      .attr("transform", "scale(0.8)")
      .transition()
      .duration(0)
      .text(iconEmoji)
      .transition()
      .duration(200)
      .style("opacity", 1)
      .attr("transform", "scale(1)");

    const iconColor = currentKey === "FINES" ? "#60a5fa" : "#3b82f6";
    kpiIcon.attr("fill", iconColor);
    
    kpiBackground
      .transition()
      .duration(150)
      .style("filter", "drop-shadow(0 6px 20px rgba(30, 58, 138, 0.6))")
      .transition()
      .duration(300)
      .style("filter", "drop-shadow(0 4px 12px rgba(30, 58, 138, 0.3))");
  }

  function renderChart(keys) {
    const duration = 800;
  
    const x0 = d3.scaleBand()
      .domain(allData.map(d => d.ageGroup))
      .range([0, width])
      .paddingInner(window.innerWidth < 480 ? 0.2 : 0.1);
  
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
    chart.selectAll(".axis-label").remove();
  
    const xAxis = chart.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0));
    
    // Responsive x-axis labels
    xAxis.selectAll("text")
      .attr("transform", window.innerWidth < 768 ? "rotate(-45)" : "rotate(-40)")
      .style("text-anchor", "end")
      .style("font-size", window.innerWidth < 480 ? "10px" : "12px");
  
    chart.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y).ticks(window.innerWidth < 480 ? 4 : 5))
      .selectAll("text")
      .style("font-size", window.innerWidth < 480 ? "10px" : "12px");
  
    const yLabelText = keys.length === 1
      ? (keys[0] === "FINES" ? "Number of Fines" : "Number of Charges")
      : "Number of Fines / Charges";
  
    chart.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", 0 - (height / 2))
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .style("font-size", window.innerWidth < 480 ? "11px" : "12px")
      .text(yLabelText);
  
    chart.selectAll(".x-axis-label").remove();
    chart.append("text")
      .attr("class", "x-axis-label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 5)
      .attr("text-anchor", "middle")
      .style("font-size", window.innerWidth < 480 ? "11px" : "12px")
      .text("Age Group");
  
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
        // Skip tooltip on very small screens to avoid overlap
        if (window.innerWidth < 480) return;
        
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
        const tooltipWidth = Math.min(maxWidth + 48, width * 0.8);
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
        if (window.innerWidth < 480) return;
        
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

  await initializeData();
});