function drawBonusChart() {
    const widthBonus = 1000;
    const heightBonus = 1100;
    const marginBonus = { top: 60, right: 100, bottom: 120, left: 70 };
    const chartWidth = 400;
    const chartHeight = 250;
    const paddingX = 80;
    const paddingY = 120;

    const svgBonus = d3.select("#bonus-chart")
      .attr("width", widthBonus)
      .attr("height", heightBonus)
      .html("");

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("border", "1px solid #ccc")
      .style("padding", "6px 10px")
      .style("border-radius", "6px")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    d3.csv("project_heart_disease.csv").then(data => {
      data = data.filter(d =>
        d["BMI"] && d["Blood Pressure"] && d["Stress Level"] && d["Heart Disease Status"]
      ).map(d => ({
        bmi: +d["BMI"],
        bp: +d["Blood Pressure"],
        stress: d["Stress Level"].trim(),
        status: d["Heart Disease Status"].trim()
      }));

      const stressLevels = ["Low", "Medium", "High"];
      const statusLevels = ["No", "Yes"];
      const binSizeX = 1.5;
      const binSizeY = 5;

      const xScale = d3.scaleLinear().domain([15, 40]).range([0, chartWidth]);
      const yScale = d3.scaleLinear().domain([80, 180]).range([chartHeight, 0]);
      const color = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 20]);

      stressLevels.forEach((stress, row) => {
        statusLevels.forEach((status, col) => {
          const subset = data.filter(d => d.stress === stress && d.status === status);

          const bins = {};
          subset.forEach(d => {
            const xBin = Math.floor((d.bmi - 15) / binSizeX);
            const yBin = Math.floor((d.bp - 80) / binSizeY);
            const key = `${xBin}-${yBin}`;
            if (!bins[key]) bins[key] = { count: 0, xBin, yBin };
            bins[key].count++;
          });

          const binData = Object.values(bins);

          const offsetX = marginBonus.left + col * (chartWidth + paddingX);
          const offsetY = marginBonus.top + row * (chartHeight + paddingY);

          const g = svgBonus.append("g")
            .attr("transform", "translate(" + offsetX + "," + offsetY + ")");

          // X Axis
          g.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(xScale).ticks(5));

          g.append("text")
            .attr("x", chartWidth / 2)
            .attr("y", chartHeight + 40)
            .attr("text-anchor", "middle")
            .text("BMI");

          // Y Axis
          g.append("g").call(d3.axisLeft(yScale).ticks(5));

          if (col === 0) {
            g.append("text")
              .attr("transform", "rotate(-90)")
              .attr("x", -chartHeight / 2)
              .attr("y", -50)
              .attr("text-anchor", "middle")
              .text("Blood Pressure");
          }

          // Chart Title
          svgBonus.append("text")
            .attr("x", offsetX + chartWidth / 2)
            .attr("y", offsetY - 15)
            .attr("text-anchor", "middle")
            .style("font-weight", "bold")
            .style("font-size", "14px")
            .text(`Stress: ${stress} | Heart Disease: ${status}`);

          // Draw heatmap
          g.selectAll("rect")
            .data(binData)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.xBin * binSizeX + 15))
            .attr("y", d => yScale((d.yBin + 1) * binSizeY + 80))
            .attr("width", xScale(binSizeX + 15) - xScale(15))
            .attr("height", yScale(80) - yScale(binSizeY + 80))
            .attr("fill", d => color(d.count))
            .on("mouseover", (e, d) => {
              tooltip
                .style("left", `${e.pageX + 10}px`)
                .style("top", `${e.pageY - 30}px`)
                .style("opacity", 1)
                .html(`Số người: <strong>${d.count}</strong>`);
            })
            .on("mouseout", () => tooltip.style("opacity", 0));
        });
      });

      // Legend position bottom left
      const defs = svgBonus.append("defs");
      const gradient = defs.append("linearGradient").attr("id", "heatmap-gradient");
      gradient.append("stop").attr("offset", "0%").attr("stop-color", d3.interpolateYlOrRd(0));
      gradient.append("stop").attr("offset", "100%").attr("stop-color", d3.interpolateYlOrRd(1));

      const legend = svgBonus.append("g").attr("transform", `translate(${marginBonus.left}, ${heightBonus - 80})`);
      legend.append("rect").attr("width", 180).attr("height", 50).attr("fill", "#fff").attr("stroke", "#ccc").attr("rx", 6);
      legend.append("rect").attr("x", 10).attr("y", 20).attr("width", 160).attr("height", 15).style("fill", "url(#heatmap-gradient)");
      legend.append("text").attr("x", 10).attr("y", 15).text("Ít người").style("font-size", "12px");
      legend.append("text").attr("x", 170).attr("y", 15).text("Nhiều người").style("font-size", "12px").attr("text-anchor", "end");
    });
}