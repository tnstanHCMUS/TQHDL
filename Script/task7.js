const widthT7 = 700;
const heightT7 = 550;
const marginT7 = { top: 40, right: 160, bottom: 100, left: 70 };

const svgT7 = d3.select("#chart-task7")
    .attr("width", widthT7)
    .attr("height", heightT7);

const tooltipT7 = d3.select("body")
    .append("div")
    .attr("class", "tooltipT7");

d3.csv("project_heart_disease.csv").then(data => {
    data = data.filter(d => {
        const val = d["Family Heart Disease"]?.trim();
        return val === "Yes" || val === "No";
    });

    const nestedT7 = d3.rollups(
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

    const groupsT7 = ["No", "Yes"];
    const stackedDataT7 = nestedT7.map(d => {
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

    const xScaleT7 = d3.scaleBand()
        .domain(groupsT7)
        .range([marginT7.left, widthT7 - marginT7.right])
        .padding(0.3);

    const yScaleT7 = d3.scaleLinear()
        .domain([0, 1])
        .range([heightT7 - marginT7.bottom, marginT7.top]);

    const colorT7 = d3.scaleOrdinal()
        .domain(["No", "Yes"])
        .range(["#fdb913", "#f05a28"]);

    svgT7.append("g")
        .attr("transform", `translate(0, ${heightT7 - marginT7.bottom})`)
        .call(d3.axisBottom(xScaleT7));

    svgT7.append("text")
        .attr("x", widthT7 / 2)
        .attr("y", heightT7 - 45)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Tiền sử gia đình mắc bệnh tim");

    svgT7.append("g")
        .attr("transform", `translate(${marginT7.left}, 0)`)
        .call(d3.axisLeft(yScaleT7).tickFormat(d3.format(".0%")));

    svgT7.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -heightT7 / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Tỷ lệ (%)");

    svgT7.selectAll("rect")
        .data(stackedDataT7)
        .enter()
        .append("rect")
        .attr("x", d => xScaleT7(d.group))
        .attr("y", d => yScaleT7(d.y1))
        .attr("height", d => yScaleT7(d.y0) - yScaleT7(d.y1))
        .attr("width", xScaleT7.bandwidth())
        .attr("fill", d => colorT7(d.status))
        .on("mouseover", (event, d) => {
            tooltipT7
                .html(`<strong>${d.group}</strong><br/>${d.status}: ${(d.percent * 100).toFixed(1)}%`)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`)
                .transition()
                .duration(200)
                .style("opacity", 1);
        })
        .on("mouseout", () => {
            tooltipT7.transition().duration(300).style("opacity", 0);
        });

    svgT7.selectAll("text.label")
        .data(stackedDataT7)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", d => xScaleT7(d.group) + xScaleT7.bandwidth() / 2)
        .attr("y", d => yScaleT7((d.y0 + d.y1) / 2))
        .attr("text-anchor", "middle")
        .style("fill", "black")
        .style("font-size", "13px")
        .text(d => `${(d.percent * 100).toFixed(1)}%`);

    const legendBoxT7 = svgT7.append("g")
        .attr("transform", `translate(${widthT7 - 190}, ${marginT7.top})`)
        .attr("class", "legend-box");

    legendBoxT7.append("rect")
        .attr("width", 160)
        .attr("height", 70)
        .attr("fill", "#fefefe")
        .attr("stroke", "#ccc")
        .attr("rx", 6)
        .attr("ry", 6);

    legendBoxT7.append("text")
        .attr("x", 10)
        .attr("y", 18)
        .text("Heart Disease Status")
        .style("font-size", "14px")
        .style("font-weight", "bold");

    const itemsT7 = colorT7.domain();
    itemsT7.forEach((key, i) => {
        legendBoxT7.append("rect")
            .attr("x", 10)
            .attr("y", 25 + i * 20)
            .attr("width", 30)
            .attr("height", 12)
            .attr("fill", colorT7(key));

        legendBoxT7.append("text")
            .attr("x", 45)
            .attr("y", 35 + i * 20)
            .text(key)
            .style("font-size", "13px");
    });
});
