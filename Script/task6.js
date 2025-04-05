const width6 = 700;
const height6 = 550;
const margin6 = { top: 40, right: 160, bottom: 100, left: 70 };

const svg6 = d3.select("#chart-task6")
    .attr("width", width6)
    .attr("height", height6);

d3.csv("project_heart_disease.csv").then(data => {
    data = data.filter(d => d["Heart Disease Status"] && d["BMI"]);
    // console.log(`Number of records in data: ${data.length}`);

    const grouped = d3.groups(data, d => d["Heart Disease Status"]);

    const colorScale = d3.scaleOrdinal()
        .domain(["Yes", "No"])
        .range(["#e6550d", "#6baed6"]);

    const stats = grouped.map(([status, values]) => {
        const levels = values.map(d => Math.round(+d["BMI"])).sort(d3.ascending);
        const q1 = d3.quantile(levels, 0.25);
        const median = d3.quantile(levels, 0.5);
        const q3 = d3.quantile(levels, 0.75);
        const iqr = q3 - q1;
        const min = d3.max([d3.min(levels), q1 - 1.5 * iqr]);
        const max = d3.min([d3.max(levels), q3 + 1.5 * iqr]);

        return { status, min, q1, median, q3, max };
    });

    const xScale = d3.scaleBand()
        .domain(stats.map(d => d.status))
        .range([margin6.left, width6 - margin6.right])
        .padding(0.5);

    const yScale = d3.scaleLinear()
        .domain([
            d3.min(stats, d => d.min) - 10,
            d3.max(stats, d => d.max) + 10
        ])
        .range([height6 - margin6.bottom, margin6.top]);

    // Trục
    svg6.append("g")
        .attr("transform", `translate(0, ${height6 - margin6.bottom})`)
        .call(d3.axisBottom(xScale));

    svg6.append("g")
        .attr("transform", `translate(${margin6.left}, 0)`)
        .call(d3.axisLeft(yScale));

    // Tiêu đề
    svg6.append("text")
        .attr("x", width6 / 2)
        .attr("y", height6 - 45)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Tình trạng bệnh tim");

    svg6.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height6 / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Chỉ số BMI");

    // Vẽ box plot
    stats.forEach(d => {
        const cx = xScale(d.status) + xScale.bandwidth() / 2;
        const color = colorScale(d.status);

        // Đường min-max
        svg6.append("line")
            .attr("x1", cx).attr("x2", cx)
            .attr("y1", yScale(d.min)).attr("y2", yScale(d.max))
            .attr("stroke", "black");

        // Box Q1 - Q3
        svg6.append("rect")
            .attr("x", cx - 30).attr("width", 60)
            .attr("y", yScale(d.q3))
            .attr("height", yScale(d.q1) - yScale(d.q3))
            .attr("fill", color)
            .attr("stroke", "black");

        // Median line
        svg6.append("line")
            .attr("x1", cx - 30).attr("x2", cx + 30)
            .attr("y1", yScale(d.median)).attr("y2", yScale(d.median))
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Hiển thị số
        svg6.append("text").attr("x", cx + 35).attr("y", yScale(d.min))
            .attr("alignment-baseline", "middle").style("font-size", "12px").text(`Min: ${d.min}`);
        svg6.append("text").attr("x", cx + 35).attr("y", yScale(d.q1))
            .attr("alignment-baseline", "middle").style("font-size", "12px").text(`Q1: ${d.q1}`);
        svg6.append("text").attr("x", cx + 35).attr("y", yScale(d.median))
            .attr("alignment-baseline", "middle").style("font-size", "12px").text(`Median: ${d.median}`);
        svg6.append("text").attr("x", cx + 35).attr("y", yScale(d.q3))
            .attr("alignment-baseline", "middle").style("font-size", "12px").text(`Q3: ${d.q3}`);
        svg6.append("text").attr("x", cx + 35).attr("y", yScale(d.max))
            .attr("alignment-baseline", "middle").style("font-size", "12px").text(`Max: ${d.max}`);
    });

    // Khung chú thích (legend)
    const legendBox = svg6.append("g")
        .attr("transform", `translate(${width6 - 150}, ${margin6.top})`)
        .attr("class", "legend-box");

    legendBox.append("rect")
        .attr("width", 145)
        .attr("height", 60)
        .attr("fill", "#fefefe")
        .attr("stroke", "#ccc")
        .attr("rx", 6)
        .attr("ry", 6);

    legendBox.append("text")
        .attr("x", 7)
        .attr("y", 18)
        .text("Tình trạng bệnh tim")
        .style("font-size", "14px")
        .style("font-weight", "bold");

    ["Yes", "No"].forEach((status, i) => {
        legendBox.append("rect")
            .attr("x", 10)
            .attr("y", 25 + i * 18)
            .attr("width", 20)
            .attr("height", 12)
            .attr("fill", colorScale(status));

        legendBox.append("text")
            .attr("x", 35)
            .attr("y", 35 + i * 18)
            .text(status)
            .style("font-size", "13px");
    });
});
