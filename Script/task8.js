const width8 = 700;
const height8 = 550;
const margin8 = { top: 40, right: 160, bottom: 100, left: 70 };

const svg8 = d3.select("#chart-task8")
    .attr("width", width8)
    .attr("height", height8);

d3.csv("project_heart_disease.csv").then(data => {
    data = data.filter(d => d["Gender"] && d["Cholesterol Level"]);

    const grouped = d3.groups(data, d => d["Gender"]);

    const colorScale = d3.scaleOrdinal()
        .domain(["Male", "Female"])
        .range(["#1f77b4", "#fdb913"]);

    const stats = grouped.map(([gender, values]) => {
        const levels = values.map(d => +d["Cholesterol Level"]).sort(d3.ascending);
        const q1 = d3.quantile(levels, 0.25);
        const median = d3.quantile(levels, 0.5);
        const q3 = d3.quantile(levels, 0.75);
        const iqr = q3 - q1;
        const min = d3.max([d3.min(levels), q1 - 1.5 * iqr]);
        const max = d3.min([d3.max(levels), q3 + 1.5 * iqr]);

        return { gender, min, q1, median, q3, max };
    });

    const xScale = d3.scaleBand()
        .domain(stats.map(d => d.gender))
        .range([margin8.left, width8 - margin8.right])
        .padding(0.5);

    const yScale = d3.scaleLinear()
        .domain([
            d3.min(stats, d => d.min) - 10,
            d3.max(stats, d => d.max) + 10
        ])
        .range([height8 - margin8.bottom, margin8.top]);

    // Trục
    svg8.append("g")
        .attr("transform", `translate(0, ${height8 - margin8.bottom})`)
        .call(d3.axisBottom(xScale));

    svg8.append("g")
        .attr("transform", `translate(${margin8.left}, 0)`)
        .call(d3.axisLeft(yScale));

    // Tiêu đề
    svg8.append("text")
        .attr("x", width8 / 2)
        .attr("y", height8 - 45)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Giới tính");

    svg8.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height8 / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Mức cholesterol");

    // Vẽ box plot
    stats.forEach(d => {
        const cx = xScale(d.gender) + xScale.bandwidth() / 2;
        const color = colorScale(d.gender);

        // Đường min-max
        svg8.append("line")
            .attr("x1", cx).attr("x2", cx)
            .attr("y1", yScale(d.min)).attr("y2", yScale(d.max))
            .attr("stroke", "black");

        // Box Q1 - Q3
        svg8.append("rect")
            .attr("x", cx - 30).attr("width", 60)
            .attr("y", yScale(d.q3))
            .attr("height", yScale(d.q1) - yScale(d.q3))
            .attr("fill", color)
            .attr("stroke", "black");

        // Median line
        svg8.append("line")
            .attr("x1", cx - 30).attr("x2", cx + 30)
            .attr("y1", yScale(d.median)).attr("y2", yScale(d.median))
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Hiển thị số
        svg8.append("text").attr("x", cx + 35).attr("y", yScale(d.min))
            .attr("alignment-baseline", "middle").style("font-size", "12px").text(`Min: ${d.min}`);
        svg8.append("text").attr("x", cx + 35).attr("y", yScale(d.q1))
            .attr("alignment-baseline", "middle").style("font-size", "12px").text(`Q1: ${d.q1}`);
        svg8.append("text").attr("x", cx + 35).attr("y", yScale(d.median))
            .attr("alignment-baseline", "middle").style("font-size", "12px").text(`Median: ${d.median}`);
        svg8.append("text").attr("x", cx + 35).attr("y", yScale(d.q3))
            .attr("alignment-baseline", "middle").style("font-size", "12px").text(`Q3: ${d.q3}`);
        svg8.append("text").attr("x", cx + 35).attr("y", yScale(d.max))
            .attr("alignment-baseline", "middle").style("font-size", "12px").text(`Max: ${d.max}`);
    });

    // Khung chú thích (legend)
    const legendBox = svg8.append("g")
        .attr("transform", `translate(${width8 - 150}, ${margin8.top})`)
        .attr("class", "legend-box");

    legendBox.append("rect")
        .attr("width", 130)
        .attr("height", 60)
        .attr("fill", "#fefefe")
        .attr("stroke", "#ccc")
        .attr("rx", 6)
        .attr("ry", 6);

    legendBox.append("text")
        .attr("x", 10)
        .attr("y", 18)
        .text("Giới tính")
        .style("font-size", "14px")
        .style("font-weight", "bold");

    ["Male", "Female"].forEach((gender, i) => {
        legendBox.append("rect")
            .attr("x", 10)
            .attr("y", 25 + i * 18)
            .attr("width", 20)
            .attr("height", 12)
            .attr("fill", colorScale(gender));

        legendBox.append("text")
            .attr("x", 35)
            .attr("y", 35 + i * 18)
            .text(gender)
            .style("font-size", "13px");
    });
});
