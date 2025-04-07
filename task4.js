const width = 700;
const height = 550;
const margin = { top: 40, right: 160, bottom: 100, left: 70 };

const svg = d3.select("#chart-task4")
    .attr("width", width)
    .attr("height", height);

// Tooltip hiển thị khi hover
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "10px")
    .style("border-radius", "5px")
    .style("font-size", "12px");

// Filter loại Null
d3.csv("project_heart_disease.csv").then(data => {
    data = data.filter(d => {
        const val = d["Exercise Habits"]?.trim();
        return val === "Low" || val === "Medium" || val === "High";
    });

    // Gom nhóm theo Exercise Habits và Heart Disease Status để đếm
    const groupedData = d3.rollup(
        data,
        v => v.length,
        d => d["Exercise Habits"],
        d => d["Heart Disease Status"]
    );

    // Chuyển đổi dữ liệu đã gom nhóm thành định dạng phù hợp cho biểu đồ cột nhóm
    const processedData = Array.from(groupedData, ([exerciseHabit, statusMap]) => {
        return {
            exerciseHabit: exerciseHabit,
            No: statusMap.get("No") || 0,
            Yes: statusMap.get("Yes") || 0
        };
    });

    const exerciseHabits = processedData.map(d => d.exerciseHabit);
    const heartDiseaseStatuses = ["No", "Yes"];

    // Tạo scale cho trục X (cho các nhóm Exercise Habits)
    const xScale = d3.scaleBand()
        .domain(exerciseHabits)
        .range([margin.left, width - margin.right])
        .padding(0.1);

    // Tạo scale cho trục x con (cho các cột No/Yes trong mỗi nhóm)
    const xSubgroup = d3.scaleBand()
        .domain(heartDiseaseStatuses)
        .range([0, xScale.bandwidth()])
        .padding(0.05);

    // Tạo scale cho trục Y (số lượng)
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => Math.max(d.No, d.Yes)) * 1.1])
        .range([height - margin.bottom, margin.top]);

    // Tạo scale màu
    const color = d3.scaleOrdinal()
        .domain(heartDiseaseStatuses)
        .range(["#4e79a7", "#f28e2b"]); // xanh và cam

    // Trục X
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 45)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Exercise Habits / Heart Disease Status");

    // Trục Y
    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale).tickFormat(d3.format(".0f")));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Count of Heart Disease Status");

    // Nhóm cột
    const groups = svg.selectAll("g.group")
        .data(processedData)
        .enter().append("g")
        .attr("transform", d => `translate(${xScale(d.exerciseHabit)}, 0)`);

    // Các cột mỗi nhóm
    groups.selectAll("rect")
        .data(d => heartDiseaseStatuses.map(key => ({ exerciseHabit: d.exerciseHabit, status: key, value: d[key] })))
        .enter().append("rect")
        .attr("x", d => xSubgroup(d.status))
        .attr("y", d => yScale(d.value))
        .attr("width", xSubgroup.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d.value))
        .attr("fill", d => color(d.status))
        .on("mouseover", (event, d) => {
            tooltip
                .html(`<strong>Exercise: ${d.exerciseHabit}</strong><br/>${d.status}: ${d.value}`)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`)
                .transition()
                .duration(200)
                .style("opacity", 1);
        })
        .on("mouseout", () => {
            tooltip.transition().duration(300).style("opacity", 0);
        });

    // Nhãn số
    groups.selectAll("text.label")
        .data(d => heartDiseaseStatuses.map(key => ({ exerciseHabit: d.exerciseHabit, status: key, value: d[key] })))
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => xSubgroup(d.status) + xSubgroup.bandwidth() / 2)
        .attr("y", d => yScale(d.value) - 5)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .style("fill", "black")
        .style("font-size", "12px")
        .text(d => d.value);

    // Legend
    const legendBox = svg.append("g")
        .attr("transform", `translate(${width - 190}, ${margin.top})`)
        .attr("class", "legend-box");

    // Khung nền
    legendBox.append("rect")
        .attr("width", 160)
        .attr("height", 70)
        .attr("fill", "#fefefe")
        .attr("stroke", "#ccc")
        .attr("rx", 6)
        .attr("ry", 6);

    // Tiêu đề
    legendBox.append("text")
        .attr("x", 10)
        .attr("y", 18)
        .text("Heart Disease Status")
        .style("font-size", "14px")
        .style("font-weight", "bold");

    // Dòng chú thích
    heartDiseaseStatuses.forEach((key, i) => {
        legendBox.append("rect")
            .attr("x", 10)
            .attr("y", 25 + i * 20)
            .attr("width", 30)
            .attr("height", 12)
            .attr("fill", color(key));

        legendBox.append("text")
            .attr("x", 45)
            .attr("y", 35 + i * 20)
            .text(key)
            .style("font-size", "13px");
    });
});