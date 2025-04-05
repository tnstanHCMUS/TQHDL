const width5 = 700;
const height5 = 550;
const margin5 = { top: 40, right: 160, bottom: 100, left: 70 };

const svg5 = d3.select("#chart-task5")
    .attr("width", width5)
    .attr("height", height5);


// Tooltip hiển thị khi hover
const tooltip5 = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

d3.csv("project_heart_disease.csv").then(data => {
    // Lọc dữ liệu hợp lệ
    const filtered = data.filter(d => d["Heart Disease Status"] && d["Cholesterol Level"]);

    // Gom nhóm và tính trung bình
    const nested = d3.rollups(
        filtered,
        v => d3.mean(v, d => +d["Cholesterol Level"]),
        d => d["Heart Disease Status"]
    );

    // Định dạng lại thành mảng đối tượng
    const processed = nested.map(([status, avg]) => ({
        status: status.trim(),
        avg_cholesterol: avg
    }));

    // Dữ liệu đã sẵn sàng
    const xScale = d3.scaleBand()
        .domain(processed.map(d => d.status))
        .range([margin5.left, width5 - margin5.right])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(processed, d => d.avg_cholesterol) * 1.1])
        .range([height5 - margin5.bottom, margin5.top]);

    const color = d3.scaleOrdinal()
        .domain(["No", "Yes"])
        .range(["#6baed6", "#e6550d"]);

    // Trục X
    svg5.append("g")
        .attr("transform", `translate(0, ${height5 - margin5.bottom})`)
        .call(d3.axisBottom(xScale));

    svg5.append("text")
        .attr("x", width5 / 2)
        .attr("y", height5 - 45)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Tình trạng bệnh tim");

    // Trục Y
    svg5.append("g")
        .attr("transform", `translate(${margin5.left}, 0)`)
        .call(d3.axisLeft(yScale));

    svg5.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height5 / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Mức cholesterol trung bình");

    // Cột
    svg5.selectAll("rect")
        .data(processed)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.status))
        .attr("y", d => yScale(d.avg_cholesterol))
        .attr("height", d => height5 - margin5.bottom - yScale(d.avg_cholesterol))
        .attr("width", xScale.bandwidth())
        .attr("fill", d => color(d.status))
        .on("mouseover", (event, d) => {
            tooltip5
                .html(`<strong>${d.status}</strong><br/>${d.avg_cholesterol.toFixed(1)}`)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`)
                .transition()
                .duration(200)
                .style("opacity", 1);
        })
        .on("mouseout", () => {
            tooltip5.transition().duration(300).style("opacity", 0);
        });

    // Nhãn số
    svg5.selectAll("text.label")
        .data(processed)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.status) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d.avg_cholesterol) - 8)
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
        .text(d => d.avg_cholesterol.toFixed(1));

    // Legend
    const legendBox = svg5.append("g")
        .attr("transform", `translate(${width5 - 190}, ${margin5.top})`);

    legendBox.append("rect")
        .attr("width", 160)
        .attr("height", 60)
        .attr("fill", "#fefefe")
        .attr("stroke", "#ccc")
        .attr("rx", 6)
        .attr("ry", 6);

    legendBox.append("text")
        .attr("x", 10)
        .attr("y", 18)
        .text("Heart Disease Status")
        .style("font-size", "14px")
        .style("font-weight", "bold");

    color.domain().forEach((key, i) => {
        legendBox.append("rect")
            .attr("x", 10)
            .attr("y", 25 + i * 18)
            .attr("width", 20)
            .attr("height", 12)
            .attr("fill", color(key));

        legendBox.append("text")
            .attr("x", 35)
            .attr("y", 35 + i * 18)
            .text(key)
            .style("font-size", "13px");
    });
});