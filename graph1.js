function graph1(csvpath, color, location) {
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

  var margin = {top: 50, right: 70, bottom: 60, left: 80},
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

  var line2 = d3.svg.line()
  .interpolate("cardinal")  
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y(d.exp); });

  var svg = d3.select("."+location).append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var title = svg.append("text")
  .attr("x", width/2)
  .attr("y", -15)
  .attr("class", "graphTitle")
  .style("text-anchor", "middle")
  .style("font-size", "14px");

  var graph = d3.tsv(csvpath, function(data) {
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

    var button = svg.append("g")
    .attr("transform", function(d) { return "translate("+ (width+20) + "," + (height/5) +")";});

    button.append("rect")
    .attr("class", "button")
    .attr("width", "40px")
    .attr("height", "20px")
    .style("fill", "none")
    .style("stroke", 1)
    .style("stroke-color", "black")
    .attr("ry", 20/10);

    button.append("text")
    .attr("x", 38)
    .attr("y", 13)
    .style("text-anchor", "end")
    .text("Vaheta");

    var nest = d3.nest()
    .key(function(d) { return d.party; })
    .entries(data.sort(function(a, b){ return a.date - b.date; }));
    var transitionTime = 500;

    nest.forEach(function(d, i) {
      var partyLines = svg.append("g")
      .datum(data);

      partyLines.append("path")
      .attr("class", "line")
      .style("fill", "none");

      partyLines.append("text")
      .attr("class", "partyText")
      .attr("dy", ".35em");
    });

    Axis();
    income();

    function income() {
      y.domain([d3.min(data, function(d) { return d.value; })-10, d3.max(data, function(d) { return d.value; })+10]);

      d3.select(".y.axis")
      .transition()
      .duration(transitionTime)
      .ease("sin-in-out")
      .call(yAxis);
      d3.select(".y.axis").selectAll(".tick text")
      .transition()
      .duration(transitionTime)
      .attr("transform", "translate(-5, 0)");

      d3.selectAll(".line")
      .data(nest)
      .transition()
      .duration(transitionTime)
      .attr("d", function(d){ return line(d.values); })
      .style("stroke", function(d,i){ return z(i); });

      d3.selectAll(".partyText")
      .data(nest)
      .transition()
      .duration(transitionTime)
      .attr("transform", function(d,i) {
        var lastValue = nest[i].values[(nest[i].values.length-1)].value;
        return "translate(" + (width+3) + "," + y(lastValue) + ")"; })
      .text(function(d,i) { return data[i].party; });

      d3.select(".graphTitle")
      .transition()
      .duration(transitionTime)
      .text("Sissetuleku muutus võrrelduna eelmise aasta sama perioodiga");
      d3.select(".ylabel")
      .transition()
      .duration(200)
      .text("Muutus protsentides");

      d3.select(".zeroLine")
      .transition()
      .duration(transitionTime)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .style("display", "inline");
    }

    function exp(){
      y.domain([d3.min(data, function(d) { return d.exp; })-100000, d3.max(data, function(d) { return d.exp; })+100000]);

      d3.select(".y.axis")
      .transition()
      .duration(transitionTime)
      .ease("sin-in-out")
      .call(yAxis);
      d3.select(".y.axis").selectAll(".tick text")
      .transition()
      .duration(transitionTime)
      .attr("transform", "translate(-5, 0)");

      d3.selectAll(".line")
      .data(nest)
      .transition()
      .duration(transitionTime)
      .attr("d", function(d){ return line2(d.values); })
      .style("stroke", function(d,i){ return z(i); });

      d3.selectAll(".partyText")
      .data(nest)
      .transition()
      .duration(transitionTime)
      .attr("transform", function(d,i) {
        var lastValue = nest[i].values[(nest[i].values.length-1)].exp;
        return "translate(" + (width+3) + "," + y(lastValue) + ")"; })
      .text(function(d,i) { return data[i].party; });

      d3.select(".graphTitle")
      .transition()
      .duration(200)
      .text("Erakondade tehtud kulutused");
      d3.select(".ylabel")
      .transition()
      .duration(200)
      .text("Summa eurodes");

      d3.select(".zeroLine")
      .transition()
      .duration(transitionTime)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .style("display", "none");
    }

    var switcher = [true];
    button.on("click", function(d){
      if (!switcher[0]) {
        income();
      } else {
        exp(); 
      }
      switcher[0] =! switcher[0];
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
        .text(y.invert(pos.y).toFixed(0));

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
      .attr("class", "ylabel")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("x", -7)
      .attr("dy", ".71em")
      .style("text-anchor", "end");

      svg.selectAll(".y.axis").selectAll(".tick text")
      .attr("transform", "translate(-5, 0)");
      svg.selectAll(".x.axis").selectAll(".tick text")
      .attr("transform", "translate(0, 3)");

      svg.append("line")
      .attr("class", "zeroLine")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .attr("stroke-width", 1)
      .attr("stroke", "black")
    };

  });

};