function total(csvpath, color) {
if (color == "blue") {
  colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
  }
  else if (color == "pink") {
  colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
  }
  else if (color == "party") {
  colorrange = ["#109618", "#ff9900", "#3366cc", "#dc3912"];
  }
  else if (color == "orange") {
  colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
  };

strokecolor = colorrange[0];
strokecolor2 = function (d, i) { return z(i);};

var format = d3.time.format("%m/%d/%y");

var margin = {top: 50, right: 20, bottom: 60, left: 80},
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .attr("transform","translate(300,300)")
    .style("position", "absolute")
    .style("z-index", "20")
    .style("visibility", "hidden");

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var z = d3.scale.ordinal()
    .range(colorrange);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10)
    .tickSize(-width, 0, 4);

var xAxis1 = d3.svg.axis()
    .scale(x)
    .tickFormat(EST.timeFormat("%B"))
    .tickSize(5,0)
    .orient("bottom")
    .ticks(10)
    .tickSize(-height, 0, 4);

var xAxis2 = d3.svg.axis()
    .scale(x)
    .ticks(d3.time.years, 1)
    .tickFormat(d3.time.format("%Y"))
    .tickSize(5,0)
    .orient("bottom");

var stack = d3.layout.stack()
    .offset("zero")
    .values(function(d) { return d.values; })
    .x(function(d) { return d.date; })
    .y(function(d) { return d.value; });

var nest = d3.nest()
    .key(function(d) { return d.party; });

var area = d3.svg.area()
    .interpolate("cardinal")
    .x(function(d) { return x(d.date); })
    .y0(function(d) { return y(d.y0); })
    .y1(function(d) { return y(d.y0 + d.y); });

//-----------
function line_to_stacked(t) {
  return d3.svg.area()
    .interpolate("cardinal")
    .x(function(d) { return x(d.date); })
    .y0(function(d) { return y(t * d.y0 + d.y); })
    .y1(function(d) { return y(t * d.y0 + d.y); });
}

function area_to_stacked(t) {
  return d3.svg.area()
    .interpolate("cardinal")
    .x(function(d) { return x(d.date); })
    .y0(function(d) { return y(d.y0 + (1 - t) * d.y); })
    .y1(function(d) { return y(d.y0 + d.y); });
}
//------------

var svg = d3.select(".total").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.append("rect")
      .attr("x", 0)
      .attr("y",-0.5)
      .attr("width", width+0.5)
      .attr("height", height)
      .style("fill", "#045A8D")
      .style("opacity", 0.05);

var graph = d3.csv(csvpath, function(data) {

  data.forEach(function(d) {
    d.date = new Date(+d.year, +d.month-1, 1);
    d.membership = +d.membership;
    d.donation = +d.donation;
    d.government = +d.government;
    d.loan = +d.loan;
    d.private = d.donation+d.membership;
    d.sum = +d.N;
    d.party = d.party;
    d.value = d.donation;
    //console.log(d);
  });

  var layers = stack(nest.entries(data));

  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })+100000]);

  d3.select(".chart")
    .append("button")
    .attr("class", "buttons")
    .text("Update")
    .attr("float", "left")
    .on("click", update);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis1);
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height+25) + ")")
    .call(xAxis2);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("x", -7)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Annetused eurodes");

    svg.selectAll(".y.axis").selectAll(".tick text")
      .attr("transform", "translate(-5, 0)");
    svg.selectAll(".x.axis").selectAll(".tick text")
      .attr("transform", "translate(0, 3)");

    svg.append("clipPath")
      .attr("id", "rectClip")
      .append("rect")
      .attr("width", 0)
      .attr("height", height);

    var partyLayers = svg.selectAll(".layer").data(layers, function(d) { return d.key; });

    partyLayers.enter()
      .append("g")
      .attr("id", function(d) { return d.key+"Container"; })
      .attr("class", "layer");

initiate();
function initiate(){

svg.selectAll("#layer").data(layers, function(d) { return d.key; }).enter()
      .append("path")
      .attr("id", function(d) { return d.key; })
      .attr("class", "paths")
      .attr("data-legend", function(d) { return d.key; })
      .attr("d", function(d) { return area(d.values); })
      .attr("clip-path", "url(#rectClip)")
      .style("fill", function(d, i) { return z(i); })
      .attr("stroke", strokecolor)
      .attr("stroke-width", "0.5px")
      .style("opacity", 0.6)
      .call(function(d) {
        d3.select("#rectClip rect")
       .transition().duration(3000)
       .attr("width", 1200);
        });

    legend = svg.append("g")
      .attr("class","legend")
      .attr("transform","translate(50,30)")
      .style("font-size","12px")
      .call(d3.legend);
    pathAbilities();
};

function update() {
    
    partyLayers.append("path")
      .attr("id", function(d) { return d.key; })
      .attr("class", "paths")
      .style("fill", function(d, i) { return z(i); })
      .attr("data-legend", function(d) { return d.key; })
      .attr("d", function(d) { return area(d.values); })
      .attr("clip-path", "url(#rectClip)")
      .attr("stroke", strokecolor)
      .attr("stroke-width", "0.5px")
      .style("opacity", 0.6);

    svg.selectAll(".paths")
      .data(layers)
      .transition()
      .duration(2000)
      .attr("id", function(d) { return d.key; })
      .style("fill", function(d, i) { return z(i); })
      .attr("d", function(d) { return area(d.values); });
    
    pathAbilities();
};

function remove(target) {

    svg.selectAll("#"+target).remove();

    svg.selectAll(".paths")
      .data(layers, function(d) { return d.party; })
      .order()
      .transition()
      .duration(200)
      .attr("d", function(d) { return area(d.values); });

};


});

var is_area_plot = true;
function transition() {
  var duration = 1000;
  var axis = svg.select(".y.axis")
    .transition()
    .duration(duration*3);

  var party = svg.selectAll(".layer")
  var transition = party.transition()
      .delay(function(d, i) { return i * 300; })
      .duration(duration);

  var postTransition = transition.transition();
  if (!is_area_plot) {
    y.domain([0, 1200000]);
    axis.call(yAxis)
    .selectAll(".tick text")
    .attr("transform", "translate(-5,0)");

    transition.selectAll("path")
      .attrTween("d", shapeTween(line_to_stacked, 1));
    postTransition.selectAll("path")
      .style("stroke-width", 0.5)
      .style("stroke", strokecolor)
      .attrTween("d", shapeTween(area_to_stacked, 1));
  } else {
    y.domain([0, 1200000]);
    axis.call(yAxis)
    .selectAll(".tick text")
    .attr("transform", "translate(-5,0)")

    transition.selectAll("path")
      .attrTween("d", shapeTween(area_to_stacked, 0));
    postTransition.selectAll("path")
      .style("stroke", "null")
      .style("stroke-width", 3)
      .attrTween("d", shapeTween(line_to_stacked, 0));
      svg.selectAll(".layer").attr("stroke", function(d, i) { return z(i); });
  }
  is_area_plot = !is_area_plot;
}

function shapeTween(shape, direction) {
  return function(d, i, a) {
    return function(t) {
      return shape(direction ? t : 1.0 - t)(d.values);
    };
  };
}



};
