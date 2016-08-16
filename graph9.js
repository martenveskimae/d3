function graph9(csvpath, color, location, w, h) {
  if (color == "blue") {
    colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#dedeed"];
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

  var margin = {top: 40, right: 100, bottom: 50, left: 80},
  width = w,
  height = h,
  transitionTime = 700,
  nrTicks = 25;

  var x = d3.scaleBand()
    .rangeRound([0, width])
    .padding(0.1)
    .align(0.1),
  y = d3.scaleLinear().rangeRound([height,0]),
  z = d3.scaleOrdinal().range(colorrange)
  .domain(["kesk", "ref", "irl", "sde", "vaba", "ekre"]),
  yA = d3.axisLeft(y)
  .tickFormat(EST.numberFormat("$,f"))
  .tickSize(5,0);

  var stack = d3.stack()
      .offset(d3.stackOffsetExpand);

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
  .text("Reklaamikulud 2015. aastal");

  d3.tsv(csvpath, type, function(error, data) {
  if (error) throw error;

  data.sort(function(a, b) { return a[data.columns[6]] / a.total - b[data.columns[6]] / b.total; });

  x.domain(data.map(function(d) { return d.party; }));
  z.domain(data.columns.slice(1));

  var serie = svg.selectAll(".serie")
    .data(stack.keys(data.columns.slice(1))(data))
    .enter().append("g")
      .attr("class", "serie")
      .attr("fill", function(d) { return z(d.key); });
    
  serie.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.data.party); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth());

  svg.append("g")
    .attr("class", "x axisA1aGraph5")
    .attr("id", "axis")
    .attr("transform", "translate(0," + (height + 5) + ")")
    .call(d3.axisBottom(x));
  svg.append("g")
    .attr("class", "axis axis--y")
    .attr("id", "axis")
    .call(d3.axisLeft(y).ticks(10, "%"));

  var legend = serie.append("g")
      .attr("class", "legend")
      .attr("transform", function(d) { var d = d[d.length - 1]; return "translate(" + (x(d.data.party) + x.bandwidth()) + "," + ((y(d[0]) + y(d[1])) / 2) + ")"; });

  legend.append("line")
      .attr("x1", -6)
      .attr("x2", 6)
      .attr("stroke", function(d) { if(d.key!== "Tulu erakonna varalt") return "#000"; });

  legend.append("text")
      .attr("x", 9)
      .attr("dy", "0.35em")
      .attr("fill", "#000")
      .attr("id", "axis")
      .text(function(d) { if(d.key!== "Tulu erakonna varalt") return d.key; });

});

function type(d, i, columns) {
  for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
  d.total = t;
  return d;
}

};