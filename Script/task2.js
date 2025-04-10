(() => {
    const width = 400, height = 400;
    const radius = Math.min(width, height) / 2 - 40;

    // ánh xạ màu cho từng loại status
    const color = d3.scaleOrdinal()
        .domain(["No", "Yes"])
        .range(["#4e79a7", "#f28e2b"]);

    const svg = d3.select("#chart-task2")
        .append("svg")
        .attr("width", 1000)
        .attr("height", 500);

    const svgFemale = svg.append("g")
        .attr("transform", `translate(${width / 2 +50}, ${height / 2 + 30})`);

    const svgMale = svg.append("g")
        .attr("transform", `translate(${width / 2 + 450}, ${height / 2 + 30})`);

    // tạo tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("font-size", "14px");

    d3.csv("project_heart_disease.csv").then(data => {
        // lọc dữ liệu hợp lệ (nam/nữ)
        data = data.filter(d => d.Gender?.trim() === "Male" || d.Gender?.trim() === "Female");

        // đếm số lượng theo gender và heart disease status
        const grouped = d3.rollups(
            data,
            v => v.length,
            d => d.Gender,
            d => d["Heart Disease Status"]
        );

        const formattedData = [];

        // đảm bảo mỗi gender đều có cả Yes và No
        const ensureBothStatus = (gender, values) => {
            const map = new Map(values);
            const total = d3.sum(values, d => d[1]);

            ["Yes", "No"].forEach(status => {
                const count = map.get(status) || 0;
                const ratio = total > 0 ? ((count / total) * 100).toFixed(2) : 0;
                formattedData.push({
                    Gender: gender,
                    "Heart Disease Status": status,
                    Count: count,
                    Ratio: ratio
                });
            });
        };

        // format lại toàn bộ data
        for (const [gender, values] of grouped) {
            ensureBothStatus(gender, values);
        }

        // tách dữ liệu nam/nữ
        const femaleData = formattedData.filter(d => d.Gender === "Female");
        const maleData = formattedData.filter(d => d.Gender === "Male");

        // tạo pie chart và sắp xếp sao cho "Yes" lên trước
        const pie = d3.pie()
            .value(d => d.Count)
            .sort((a, b) => d3.ascending(a["Heart Disease Status"], b["Heart Disease Status"]));

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        function drawChart(svg, data, genderLabel) {
            // vẽ từng miếng của biểu đồ tròn
            svg.selectAll("path")
                .data(pie(data))
                .enter()
                .append("path")
                .attr("d", arc)
                .attr("fill", d => color(d.data["Heart Disease Status"]))
                .on("mouseover", (event, d) => {
                    tooltip.transition().duration(200).style("opacity", 1);
                    tooltip.html(`
                        <strong>Gender:</strong> ${d.data.Gender}<br/>
                        <strong>Status:</strong> ${d.data["Heart Disease Status"] === "Yes" ? "Mắc bệnh" : "Không mắc"}<br/>
                        <strong>Cases:</strong> ${d.data.Count}<br/>
                        <strong>Ratio:</strong> ${d.data.Ratio}%
                    `)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 30 + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition().duration(300).style("opacity", 0);
                });

            // hiển thị label phần trăm
            svg.selectAll("text")
                .data(pie(data))
                .enter()
                .append("text")
                .attr("transform", d => `translate(${arc.centroid(d)})`)
                .attr("text-anchor", "middle")
                .attr("dy", "0.35em")
                .text(d => `${d.data.Ratio}%`)
                .style("font-size", "14px");

            // thêm tiêu đề giới tính cho chart
            svg.append("text")
                .attr("x", 0)
                .attr("y", -radius - 30)
                .attr("text-anchor", "middle")
                .style("font-weight", "bold")
                .text(genderLabel)
                .style("font-size", "16px");
        }

        // vẽ 2 biểu đồ cho nam và nữ
        drawChart(svgFemale, femaleData, "Female");
        drawChart(svgMale, maleData, "Male");

        // tạo legend hiển thị màu và chú thích
        const legend = svg.append("g")
            .attr("transform", `translate(${width - 110}, ${height + 50})`);

        const legendData = [
            { label: "Không mắc bệnh tim", color: "#4e79a7" },
            { label: "Mắc bệnh tim", color: "#f28e2b" }
        ];

        legend.selectAll("rect")
            .data(legendData)
            .enter()
            .append("rect")
            .attr("x", (d, i) => i * 200)
            .attr("y", 0)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", d => d.color);

        legend.selectAll("text")
            .data(legendData)
            .enter()
            .append("text")
            .attr("x", (d, i) => i * 200 + 30)
            .attr("y", 15)
            .text(d => d.label)
            .style("font-size", "14px");
    });
})();
