function bilanss(csvpath, color) {
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

  var format = d3.time.format("%m/%d/%y"),
  bisectDate = d3.bisector(function(d) { return d.date; }).left;

  var margin = {top: 50, right: 40, bottom: 60, left: 80},
  width = 600 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

  var x = d3.time.scale()
  .range([0, width]);

  var y = d3.scale.linear()
  .range([height, 0]);

  var z = d3.scale.ordinal()
  .range(colorrange);

  var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left")
  .tickValues([-80, -40, 0, 40, 80, 120])
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

  var line = d3.svg.line()
  .interpolate("cardinal")  
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y(d.value); });

  var svg = d3.select(".bilanss").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var title = svg.append("text")
  .attr("x", width/2)
  .attr("y", -15)
  .style("text-anchor", "middle")
  .style("font-size", "14px")
  .text("Joonis 1. Erakondade sissetuleku muutus võrrelduna eelmise aasta sama kvartaliga");

  var graph = d3.csv(csvpath, function(data) {
    data.forEach(function(d) {
      d.date = new Date(+d.year, +d.month-1, 1);
      d.membership = +d.membership;
      d.donation = +d.donation;
      d.government = +d.government;
      d.loan = +d.loan;
      d.private = d.donation+d.membership;
      d.sum = +d.total;
      d.exp = +d.exp;
      d.kvartal = +d.kvartal;
      d.balance = +d.balance;
      d.party = d.party;
      d.value = d.kvartal;
    });

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([d3.min(data, function(d) { return d.value; })-10, d3.max(data, function(d) { return d.value; })+10]);

    Axis();

    var nest = d3.nest()
    .key(function(d) { return d.party; })
    .entries(data.sort(function(a, b){ return a.date - b.date; }));

    nest.forEach(function(d, i) {
      var partyLines = svg.append("g")
      .datum(data);

      partyLines.append("path")
      .attr("class", "line")
      .attr("d", line(d.values))
      .style("stroke", z(i))
      .style("fill", "none");

      var lastValue = nest[i].values[(nest[i].values.length-1)].value;

      partyLines.append("text")
      .attr("transform", function(d) { return "translate(" + (width+3) + "," + y(lastValue) + ")"; })
      .attr("dy", ".35em")
      .text(function(d) { return data[i].party; });
    });

    var lines = document.getElementsByClassName('line');
    var mouseG = svg.append("g")
    .attr("class", "mouse-over-effects");

    mouseG.append("path")
    .attr("class", "mouse-line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .style("opacity", "0");

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
    .data(nest)
    .enter()
    .append("g")
    .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
    .attr("r", 6)
    .style("stroke", function(d,i) { return z(i); })
    .style("fill", "none")
    .style("stroke-width", "1px")
    .style("opacity", "0");

    mousePerLine.append("text")
    .attr("transform", "translate(10,3)");

    mouseG.append('svg:rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mouseout', function() {
      d3.select(".mouse-line")
      .style("opacity", "0");
      d3.selectAll(".mouse-per-line circle")
      .style("opacity", "0");
      d3.selectAll(".mouse-per-line text")
      .style("opacity", "0");
    })
    .on('mouseover', function() {
      d3.select(".mouse-line")
      .style("opacity", "1");
      d3.selectAll(".mouse-per-line circle")
      .style("opacity", "1");
      d3.selectAll(".mouse-per-line text")
      .style("opacity", "1");
    })
    .on('mousemove', function() {
      var mouse = d3.mouse(this);
      d3.selectAll(".mouse-line")
      .attr("d", function() {
        var d = "M" + mouse[0] + "," + height;
        d += " " + mouse[0] + "," + 0;
        return d;
      });

      d3.selectAll(".mouse-per-line")
      .attr("transform", function(d, i) {
        var xDate = x.invert(mouse[0]),
        bisect = d3.bisector(function(d) { return d.date; }).right;
        idx = bisect(nest[i].values[i].value, xDate);

        var beginning = 0,
        end = lines[i].getTotalLength(),
        target = null;

        while (true){
          target = Math.floor((beginning + end) / 2);
          pos = lines[i].getPointAtLength(target);
          if ((target === end || target === beginning) && pos.x !== mouse[0]) {
            break;
          }
          if (pos.x > mouse[0])      end = target;
          else if (pos.x < mouse[0]) beginning = target;
          else break;
        }

        d3.select(this).select('text')
        .attr("class", "tooltip")
        .text(d3.round(y.invert(pos.y).toFixed(2)));

        return "translate(" + mouse[0] + "," + pos.y +")";
      });
    });


    function Axis(){
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
      .text("Muutus protsentides");

      svg.selectAll(".y.axis").selectAll(".tick text")
      .attr("transform", "translate(-5, 0)");
      svg.selectAll(".x.axis").selectAll(".tick text")
      .attr("transform", "translate(0, 3)");

      svg.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .attr("stroke-width", 1)
      .attr("stroke", "black")
    };

  });


};