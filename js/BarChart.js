document.addEventListener('DOMContentLoaded', function () {
  const margin = { top: 40, right: 30, bottom: 70, left: 75 },
    width = 680 - margin.left - margin.right,
    height = 380 - margin.top - margin.bottom;

  const svg = d3.select("#BarChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const tooltip = d3.select("#tooltip")
    .style("position", "absolute")
    .style("background", "#fff")
    .style("padding", "8px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("opacity", 0);

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
      .attr("fill", d => color(d.key))
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`
          <strong>Age Group:</strong> ${d.ageGroup}<br/>
          <strong>${d.key}:</strong> ${d.value.toLocaleString()}
        `)
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 28) + "px");
        d3.select(this).attr("opacity", 0.8);
      })
      .on("mousemove", function (event) {
        tooltip.style("left", (event.pageX + 15) + "px")
               .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function () {
        tooltip.transition().duration(300).style("opacity", 0);
        d3.select(this).attr("opacity", 1);
      });

    barsEnter.merge(bars)
      .transition()
      .duration(duration)
      .attr("x", d => x1(d.key))
      .attr("width", x1.bandwidth())
      .attr("y", d => y(d.value))
      .attr("height", d => height - y(d.value))
      .attr("fill", d => color(d.key));
  }
});
