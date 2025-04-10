(() => {
// thiết lập kích thước svg
const width = 700;
const height = 550;
const margin = { top: 40, right: 160, bottom: 100, left: 70 };

// tạo svg gắn với phần tử có id là #chart-task1
const svg = d3.select("#chart-task1")
    .attr("width", width)
    .attr("height", height);

// đọc file csv
d3.csv("project_heart_disease.csv").then(data => {
    // lọc ra những dòng có giá trị tuổi hợp lệ (không rỗng, không null, là số)
    data = data.filter(d => {
        const ageVal = d["Age"]?.trim();
        return ageVal !== "" && ageVal !== null && ageVal !== undefined && !isNaN(+ageVal);
    });

    // gán nhãn nhóm tuổi cho mỗi dòng
    data.forEach(d => {
        const age = +d["Age"];
        if (age >= 18 && age < 30) d["AgeGroup"] = "Under 30";
        else if (age < 40) d["AgeGroup"] = "Under 40";
        else if (age < 50) d["AgeGroup"] = "Under 50";
        else if (age < 60) d["AgeGroup"] = "Under 60";
        else if (age < 70) d["AgeGroup"] = "Under 70";
        else d["AgeGroup"] = "Above 70";
    });

    // ===== BIỂU ĐỒ TRÒN - 1.1 =====
    // lọc các trường hợp mắc bệnh
    const heartCases = data.filter(d => d["Heart Disease Status"] === "Yes");

    // đếm số ca mắc bệnh theo từng nhóm tuổi
    const ageGroupCounts = d3.rollup(heartCases, v => v.length, d => d["AgeGroup"]);

    // tổng số ca mắc bệnh
    const totalCases = d3.sum(ageGroupCounts.values());

    // chuẩn hóa dữ liệu thành mảng có percent, sắp xếp giảm dần theo count
    const processedData = Array.from(ageGroupCounts, ([group, count]) => ({
        group,
        count,
        percent: (count / totalCases * 100).toFixed(3)
    })).sort((a, b) => b.count - a.count);

    // tạo dữ liệu cho pie chart
    const pie = d3.pie().sort(null).value(d => d.count);
    const pieData = pie(processedData);

    // tạo arc và group để chứa pie chart
    const arc = d3.arc().innerRadius(0).outerRadius(120);
    const pieGroup = svg.append("g").attr("transform", `translate(${width / 4 - 20}, ${height / 2 - 20})`);

    // màu cho từng nhóm
    const color = d3.scaleOrdinal().domain(processedData.map(d => d.group)).range(d3.schemeSet2);

    // tạo tooltip cho pie chart
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "6px")
        .style("border-radius", "6px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // vẽ các phần của biểu đồ tròn
    pieGroup.selectAll("path")
        .data(pieData)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.group))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .on("mouseover", (event, d) => {
            tooltip
                .style("opacity", 1)
                .html(`<strong>${d.data.group}</strong><br>Cases: ${d.data.count}<br>Percentage: ${d.data.percent}%`);
        })
        .on("mousemove", event => {
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0));

    // tiêu đề cho biểu đồ tròn
    svg.append("text")
        .attr("x", width / 4 - 20)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("1.1 - Tỉ lệ mắc bệnh theo nhóm tuổi");

    // vẽ chú thích (legend) cho biểu đồ tròn
    const itemsPerRow = 3;
    const itemSpacingX = 90;
    const itemSpacingY = 24;

    const legendGroup = svg.append("g")
        .attr("transform", `translate(${width / 4 - 120}, ${height / 2 + 150})`);

    const legendItems = legendGroup.selectAll("g")
        .data(processedData)
        .enter()
        .append("g")
        .attr("transform", (d, i) => {
            const col = i % itemsPerRow;
            const row = Math.floor(i / itemsPerRow);
            return `translate(${col * itemSpacingX}, ${row * itemSpacingY})`;
        });

    legendItems.append("rect")
        .attr("width", 16)
        .attr("height", 16)
        .attr("fill", d => color(d.group));

    legendItems.append("text")
        .attr("x", 22)
        .attr("y", 12)
        .style("font-size", "12px")
        .text(d => `${d.group}`);

    // ===== BIỂU ĐỒ CỘT CHỒNG - 1.2 =====
    // đếm số ca có và không mắc bệnh trong từng nhóm tuổi (tính phần trăm)
    const grouped = d3.rollups(data, v => {
        const total = v.length;
        const yes = v.filter(d => d["Heart Disease Status"] === "Yes").length;
        const no = total - yes;
        return {
            Yes: +(yes / total * 100).toFixed(1),
            No: +(no / total * 100).toFixed(1)
        };
    }, d => d["AgeGroup"]);

    // sắp xếp nhóm tuổi đúng thứ tự
    const ageGroupOrder = ["Under 30", "Under 40", "Under 50", "Under 60", "Under 70", "Above 70"];
    grouped.sort((a, b) => ageGroupOrder.indexOf(a[0]) - ageGroupOrder.indexOf(b[0]));

    // chuẩn hóa dữ liệu cho stacked bar chart
    const barData = grouped.map(d => ({
        AgeGroup: d[0],
        Yes: d[1].Yes,
        No: d[1].No
    }));

    // tạo group cho bar chart
    const barGroup = svg.append("g").attr("transform", `translate(${width / 2 + 20}, 120)`);

    // scale trục x và y
    const x = d3.scaleBand().domain(ageGroupOrder).range([0, 300]).padding(0.2);
    const y = d3.scaleLinear().domain([0, 100]).nice().range([300, 0]);

    // tạo các layer cho cột chồng
    const subgroups = ["Yes", "No"];
    const stacked = d3.stack().keys(subgroups)(barData);

    // màu cho từng trạng thái mắc/không
    const colorBar = d3.scaleOrdinal().domain(subgroups).range(["#e41a1c", "#377eb8"]);

    // tooltip cho biểu đồ cột
    const tooltipBar = d3.select("body").append("div")
        .style("position", "absolute")
        .style("padding", "6px 10px")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // vẽ các cột
    barGroup.append("g")
        .selectAll("g")
        .data(stacked)
        .join("g")
        .attr("fill", d => colorBar(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => x(d.data.AgeGroup))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .on("mouseover", (event, d) => {
            const subgroupName = d3.select(event.target.parentNode).datum().key;
            const subgroupLabel = subgroupName === "Yes" ? "Tỉ lệ mắc bệnh" : "Tỉ lệ không mắc bệnh";
            tooltipBar.transition().duration(200).style("opacity", 0.9);
            tooltipBar.html(`Nhóm tuổi: ${d.data.AgeGroup}<br>${subgroupLabel}: ${(d[1] - d[0]).toFixed(1)}%`);
        })
        .on("mousemove", event => {
            tooltipBar.style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => tooltipBar.transition().duration(200).style("opacity", 0));

    // vẽ trục x và y
    barGroup.append("g").attr("transform", "translate(0,300)").call(d3.axisBottom(x));
    barGroup.append("g").call(d3.axisLeft(y));

    // tiêu đề cho biểu đồ cột
    svg.append("text")
        .attr("x", width / 2 + 160)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("1.2 - Tỉ lệ mắc/không mắc theo nhóm tuổi");
});
})();