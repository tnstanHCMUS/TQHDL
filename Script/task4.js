const widthT4 = 700;
const heightT4 = 550;
const marginT4 = { top: 40, right: 160, bottom: 100, left: 70 };

const svgT4 = d3.select("#chart-task4")
    .attr("width", widthT4)
    .attr("height", heightT4);

const tooltipT4 = d3.select("body")
    .append("div")
    .attr("class", "tooltipT4")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "5px")
    .style("font-size", "12px");

d3.csv("project_heart_disease.csv").then(data => {
    data = data.filter(d => {
        const val = d["Exercise Habits"]?.trim();
        return val === "Low" || val === "Medium" || val === "High";
    });

    const groupedDataT4 = d3.rollup(
        data,
        v => v.length,
        d => d["Exercise Habits"],
        d => d["Heart Disease Status"]
    );

    const processedDataT4 = Array.from(groupedDataT4, ([exerciseHabitT4, statusMap]) => {
        return {
            exerciseHabitT4: exerciseHabitT4,
            No: statusMap.get("No") || 0,
            Yes: statusMap.get("Yes") || 0
        };
    });

    const exerciseHabitsT4 = processedDataT4.map(d => d.exerciseHabitT4);
    const heartDiseaseStatuses = ["No", "Yes"];

    const xScaleT4 = d3.scaleBand()
        .domain(exerciseHabitsT4)
        .range([marginT4.left, widthT4 - marginT4.right])
        .padding(0.1);

    const xSubgroupT4 = d3.scaleBand()
        .domain(heartDiseaseStatuses)
        .range([0, xScaleT4.bandwidth()])
        .padding(0.05);

    const yScaleT4 = d3.scaleLinear()
        .domain([0, d3.max(processedDataT4, d => Math.max(d.No, d.Yes)) * 1.1])
        .range([heightT4 - marginT4.bottom, marginT4.top]);

    const colorT4 = d3.scaleOrdinal()
        .domain(heartDiseaseStatuses)
        .range(["#4e79a7", "#f28e2b"]);

    svgT4.append("g")
        .attr("transform", `translate(0, ${heightT4 - marginT4.bottom})`)
        .call(d3.axisBottom(xScaleT4));

    svgT4.append("text")
        .attr("x", widthT4 / 2)
        .attr("y", heightT4 - 45)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Exercise Habits / Heart Disease Status");

    svgT4.append("g")
        .attr("transform", `translate(${marginT4.left}, 0)`)
        .call(d3.axisLeft(yScaleT4).tickFormat(d3.format(".0f")));

    svgT4.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -heightT4 / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Count of Heart Disease Status");

    const groupsT4 = svgT4.selectAll("g.group")
        .data(processedDataT4)
        .enter().append("g")
        .attr("transform", d => `translate(${xScaleT4(d.exerciseHabitT4)}, 0)`);

    groupsT4.selectAll("rect")
        .data(d => heartDiseaseStatuses.map(key => ({ exerciseHabitT4: d.exerciseHabitT4, status: key, value: d[key] })))
        .enter().append("rect")
        .attr("x", d => xSubgroupT4(d.status))
        .attr("y", d => yScaleT4(d.value))
        .attr("width", xSubgroupT4.bandwidth())
        .attr("height", d => heightT4 - marginT4.bottom - yScaleT4(d.value))
        .attr("fill", d => colorT4(d.status))
        .on("mouseover", (event, d) => {
            tooltipT4
                .html(`<strong>Exercise: ${d.exerciseHabitT4}</strong><br/>${d.status}: ${d.value}`)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`)
                .transition()
                .duration(200)
                .style("opacity", 1);
        })
        .on("mouseout", () => {
            tooltipT4.transition().duration(300).style("opacity", 0);
        });

    groupsT4.selectAll("text.label")
        .data(d => heartDiseaseStatuses.map(key => ({ exerciseHabitT4: d.exerciseHabitT4, status: key, value: d[key] })))
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => xSubgroupT4(d.status) + xSubgroupT4.bandwidth() / 2)
        .attr("y", d => yScaleT4(d.value) - 5)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .style("fill", "black")
        .style("font-size", "12px")
        .text(d => d.value);

    const legendBoxT4 = svgT4.append("g")
        .attr("transform", `translate(${widthT4 - 190}, ${marginT4.top})`)
        .attr("class", "legend-box");

    legendBoxT4.append("rect")
        .attr("width", 160)
        .attr("height", 70)
        .attr("fill", "#fefefe")
        .attr("stroke", "#ccc")
        .attr("rx", 6)
        .attr("ry", 6);

    legendBoxT4.append("text")
        .attr("x", 10)
        .attr("y", 18)
        .text("Heart Disease Status")
        .style("font-size", "14px")
        .style("font-weight", "bold");

    heartDiseaseStatuses.forEach((key, i) => {
        legendBoxT4.append("rect")
            .attr("x", 10)
            .attr("y", 25 + i * 20)
            .attr("width", 30)
            .attr("height", 12)
            .attr("fill", colorT4(key));

        legendBoxT4.append("text")
            .attr("x", 45)
            .attr("y", 35 + i * 20)
            .text(key)
            .style("font-size", "13px");
    });
});
