const width = 700;
const height = 550;
const margin = { top: 40, right: 160, bottom: 100, left: 70 };

const svg = d3.select("#chart-task7")
    .attr("width", width)
    .attr("height", height);

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

d3.csv("project_heart_disease.csv").then(data => {
    data = data.filter(d => {
        const val = d["Family Heart Disease"]?.trim();
        return val === "Yes" || val === "No";
    });

    // Gom nhóm và tính phần trăm
    const nested = d3.rollups(
        data,
        v => {
            const total = v.length;
            const yes = v.filter(d => d["Heart Disease Status"] === "Yes").length;
            const no = total - yes;
            return [
                { status: "Yes", count: yes, percent: yes / total },
                { status: "No", count: no, percent: no / total }
            ];
        },
        d => d["Family Heart Disease"]
    );

    const groups = ["No", "Yes"];
    const stackedData = nested.map(d => {
        let y0 = 0;
        return d[1].map(s => {
            const item = {
                group: d[0],
                status: s.status,
                count: s.count,
                percent: s.percent,
                y0: y0,
                y1: y0 + s.percent
            };
            y0 += s.percent;
            return item;
        });
    }).flat();

    const xScale = d3.scaleBand()
        .domain(groups)
        .range([margin.left, width - margin.right])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
        .domain(["No", "Yes"])
        .range(["#fdb913", "#f05a28"]); // vàng cam và cam đậm

    // Trục X
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 45)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Tiền sử gia đình mắc bệnh tim");

    // Trục Y
    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale).tickFormat(d3.format(".0%")));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Tỷ lệ (%)");

    // Vẽ cột
    svg.selectAll("rect")
        .data(stackedData)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.group))
        .attr("y", d => yScale(d.y1))
        .attr("height", d => yScale(d.y0) - yScale(d.y1))
        .attr("width", xScale.bandwidth())
        .attr("fill", d => color(d.status))
        .on("mouseover", (event, d) => {
            tooltip
                .html(`<strong>${d.group}</strong><br/>${d.status}: ${(d.percent * 100).toFixed(1)}%`)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`)
                .transition()
                .duration(200)
                .style("opacity", 1);
        })
        .on("mouseout", () => {
            tooltip.transition().duration(300).style("opacity", 0);
        });

    // Hiển thị số liệu phần trăm trên cột
    svg.selectAll("text.label")
        .data(stackedData)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => xScale(d.group) + xScale.bandwidth() / 2)
        .attr("y", d => yScale((d.y0 + d.y1) / 2))
        .attr("text-anchor", "middle")
        .style("fill", "black")
        .style("font-size", "13px")
        .text(d => `${(d.percent * 100).toFixed(1)}%`);

    // Legend (góc phải, khung và hình chữ nhật dài)
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
    const items = color.domain(); 
    items.forEach((key, i) => {
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
