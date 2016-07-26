function graph7(csvpath, color, location, w, h) {
  if (color == "blue") {
    colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
  }
  else if (color == "pink") {
    colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
  }
  else if (color == "party") {
    colorrange = ["#109618", "#ff9900", "#3366cc", "#dc3912", "#888888", "#7a5230"];
  }
  else if (color == "orange") {
    colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
  };

  var margin = {top: 40, right: 50, bottom: 50, left: 80},
  width = w,
  height = h,
  transitionTime = 700,
  nrTicks = 25;

  var x0 = d3.scale.ordinal()
          .rangeRoundBands([0, width], .1),
      x1 = d3.scale.ordinal();
  y = d3.scaleLinear().rangeRound([height,0]),
  z = d3.scaleOrdinal().range(colorrange)
  .domain(["kesk", "ref", "irl", "sde", "vaba", "ekre"]),
  xA = d3.axisBottom(x0),
  yA = d3.axisLeft(y)
  .tickFormat(EST.numberFormat("$,f"))
  .tickSize(5,0);

  var svg = d3.select("."+location)
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var title = svg.append("text")
  .attr("x", width/2)
  .attr("y", -20)
  .attr("class", "graphTitle")
  .style("text-anchor", "middle")
  .text("2015. aasta tulud ja kulud");

  d3.tsv(csvpath, function(error, data) {
  if (error) throw error;

  var ageNames = d3.keys(data[0]).filter(function(key) { return key !== "party"; });

  data.forEach(function(d) {
    d.ages = ageNames.map(function(name) { return {name: name, value: +d[name]}; });
  });

  data = data.sort(function(a, b){ return b.Tulud - a.Tulud; });

  x0.domain(data.map(function(d) { return d.party; }));
  x1.domain(ageNames).rangeRoundBands([0, x0.rangeBand()]);
  y.domain([0, d3.max(data, function(d) { return d3.max(d.ages, function(d) { return d.value; }); })]);

  var state = svg.selectAll(".state")
      .data(data)
    .enter().append("g")
      .attr("class", "state")
      .attr("transform", function(d) { return "translate(" + x0(d.party) + ",0)"; });

  state.selectAll("rect")
      .data(function(d) { return d.ages; })
    .enter().append("rect")
      .attr("width", x1.rangeBand())
      .attr("x", function(d) { return x1(d.name); })
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })
      .style("fill", function(d) { return z(d.name); });

  svg.append("g")
    .attr("class", "x axisGraph7")
    .attr("id", "axis")
    .attr("transform", "translate(" + x0.rangeBand()/2  + "," + (height + 5) + ")")
    .call(xA);
    svg.append("g")
    .attr("class", "y axisGraph7")
    .attr("id", "axis")
    .call(yA);

  var legend = svg.selectAll(".legend")
    .data(ageNames.slice())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 35)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", z);

  legend.append("text")
      .attr("x", width - 40)
      .attr("y", 9)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text(function(d) { return d; });
});

};