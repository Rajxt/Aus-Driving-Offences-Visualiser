document.addEventListener('DOMContentLoaded', function () {
    const margin = { top: 40, right: 30, bottom: 70, left: 60 },
          width = 800 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#BarChart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const keys = ["fines", "arrests", "charges"];
    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(["#6b486b", "#ff8c00", "#a05d56"]);

    d3.csv("data/AgewithMonth.csv", d3.autoType).then(raw => {
      // Group by ageGroup and sum fines, arrests, charges (ignoring month)
      const groupedData = Array.from(
        d3.rollup(
          raw,
          v => ({
            fines: d3.sum(v, d => d.fines),
            arrests: d3.sum(v, d => d.arrests),
            charges: d3.sum(v, d => d.charges)
          }),
          d => d.ageGroup
        ),
        ([ageGroup, values]) => ({ ageGroup, ...values })
      );

      const x0 = d3.scaleBand()
          .domain(groupedData.map(d => d.ageGroup))
          .range([0, width])
          .paddingInner(0.1);

      const x1 = d3.scaleBand()
          .domain(keys)
          .range([0, x0.bandwidth()])
          .padding(0.05);

      const y = d3.scaleLinear()
          .domain([0, d3.max(groupedData, d => d3.max(keys, k => d[k]))])
          .nice()
          .range([height, 0]);

      chart.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x0))
          .selectAll("text")
          .attr("transform", "rotate(-40)")
          .style("text-anchor", "end");

      chart.append("g")
          .call(d3.axisLeft(y).ticks(5));

      const barGroups = chart.selectAll(".barGroup")
          .data(groupedData)
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
    });
  });