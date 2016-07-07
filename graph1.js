function graph1(csvpath, color, location, w, h) {
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

  var format = d3.timeFormat("%m/%d/%y");

  var margin = {top: 50, right: 70, bottom: 60, left: 80},
  width = w - margin.left - margin.right,
  height = h - margin.top - margin.bottom;

  var x = d3.time.scale().range([0, width]),
  y = d3.scaleLinear().range([height, 0]),
  z = d3.scaleOrdinal().range(colorrange),
  yAxis = d3.axisLeft(y)
  .tickSize(-width, 0, 4),
  xAxis1 = d3.axisBottom(x)
  .tickFormat(EST.timeFormat("%b"))
  .tickSize(5,0)
  .tickSize(-height, 0, 4),
  xAxis2 = d3.axisBottom(x)
  .ticks(d3.time.years, 1)
  .tickFormat(d3.timeFormat("%Y"))
  .tickSize(5,0);

  var line = d3.svg.line()
  .interpolate("cardinal")  
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y(d.value); });

  var line2 = d3.svg.line()
  .interpolate("cardinal")  
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y(d.exp); });

  var voronoi = d3.geom.voronoi()
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y(d.value); })
  .clipExtent([[0, 0], [width, height]]);

  var voronoi2 = d3.geom.voronoi()
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y(d.exp); })
  .clipExtent([[0, 0], [width, height]]);

  var svg = d3.select("."+location)
  .append("svg")
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
    flatData = [];
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
      flatData.push({date: d.date, exp: d.exp, value: d.value, key: "value", party: d.party});
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
    var voronoiGroup = svg.append("g")
    .attr("class", "voronoi");
    var vorr = voronoiGroup.selectAll(".voronoi")
    .data(voronoi(flatData))
    .enter()
    .append("path")
    .attr("class", "vorPath");

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

      d3.selectAll(".vorPath")
      .data(voronoi(flatData))
      .transition()
      .duration(transitionTime)
      .attr("d", function(d) { return "M" + d.join("L") + "Z"; });

    }

    function exp(){
      y.domain([d3.min(data, function(d) { return d.exp; })-100000, d3.max(data, function(d) { return d.exp; })+100000]);

      d3.select(".y.axis")
      .transition()
      .duration(transitionTime)
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

      d3.selectAll(".vorPath")
      .data(voronoi2(flatData))
      .transition()
      .duration(transitionTime)
      .attr("d", function(d) { return "M" + d.join("L") + "Z"; });
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
    .attr("class", "tooltip")
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

        
        
        d3.select(this).select("text").text(d3.round(y.invert(pos.y)));
        return "translate(" + mouse[0] + "," + pos.y +")";
      });
    });

    function Axis(){
      svg.append("g")
      .attr("class", "x axis")
      .attr("id", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis1);
      svg.append("g")
      .attr("class", "x axis")
      .attr("id", "axis")
      .attr("transform", "translate(0," + (height+25) + ")")
      .call(xAxis2);

      svg.append("g")
      .attr("class", "y axis")
      .attr("id", "axis")
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