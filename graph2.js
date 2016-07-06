function graph2(csvpath, color, location, w, h) {
  if (color == "blue") {
    colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
  }
  else if (color == "pink") {
    colorrange = ["#980043", "#DD1C77", "#DF65B0", "#C994C7", "#D4B9DA", "#F1EEF6"];
  }
  else if (color == "party") {
    colorrange = ["#109618", "#ff9900", "#3366cc", "#dc3912", "#d3d3d3", "#7a5230"];
  }
  else if (color == "orange") {
    colorrange = ["#B30000", "#E34A33", "#FC8D59", "#FDBB84", "#FDD49E", "#FEF0D9"];
  };

  var margin = {top: 50, right: 80, bottom: 120, left: 80},
  width = 1000,
  height = 180,
  radius = 10,
  multiplier = window.devicePixelRatio,
  wMulti = width * multiplier,
  hMulti = height * multiplier,
  transitionTime = 700;

  var x = d3.time.scale().range([0, width]),
  y = d3.scale.linear().range([height, 0]),
  y2 = d3.scale.log().range([height+40, height+5]),
  r = d3.scale.log().range([1, 10]),
  z = d3.scale.ordinal().range(colorrange)
  .domain(["kesk", "ref", "irl", "sde", "vaba", "ekre"]),
  xA1 = d3.svg.axis()
  .scale(x)
  .tickFormat(EST.timeFormat("%b"))
  .tickSize(5,0)
  .orient("bottom")
  .tickSize(-height, 0, 4),
  xA2 = d3.svg.axis()
  .scale(x)
  .ticks(d3.time.years, 1)
  .tickFormat(d3.time.format("%Y"))
  .tickSize(5,0)
  .orient("bottom"),
  yA2 = d3.svg.axis()
  .scale(y2)
  .orient("left")
  .ticks(3, "s")
  .tickSize(0, 0, 3);

  var svg = d3.select("."+location)
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var base = d3.select("."+location);
  var chart = base.append("canvas")
  .style("left", margin.left + "px")
  .style("top", margin.top + 10 + "px")
  .attr("width", wMulti)
  .attr("height", hMulti)
  .style("width", function(){ return width + "px"; })
  .style("height", function(){ return height + "px"; })
  .style("position", "absolute");

  var context = chart.node().getContext("2d");
  context.scale(multiplier,multiplier);

  var line = d3.svg.line() 
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y2(d.total); });

  d3.tsv("annetused.txt", function(error, data) {

    var date = "date",
    sum  = "sum",
    party = "party";
    data.forEach(function(d) {
      d[date] = new Date(+d.year, +d.month-1, +d.day);
      d[sum] = +d.sum+1;
      d.name = d.name;
      d[party] = d.party;
    });
    initialData = [];
    initialData = data;

    var dropDown = d3.select("."+location)
    .append("select")
    .attr("name", "partyList")
    .style("top", margin.top + height + 110 + "px")
    .style("left", margin.left + 5 + "px")
    .selectAll("option")
    .data(partyArray)
    .enter()
    .append("option")
    .attr("value", function (d,i) { return partyArray[(i)]; })
    .text(function (d,i) { return partyArray[(i)]; });
    
    d3.select("select")
    .on("change", function(d) {
      reload(partyArray[this.selectedIndex]);
    });

    reload("kesk");
    function reload(selectedParty){
      nest = [];
      nodes = [];
      nodesData = [];
      nestData = [];

      data = initialData.filter(function(d) { return d.party === selectedParty && d.sum > 0; });

      x.domain(d3.extent(data, function(d) { return d.date; }));
      y.domain([d3.min(data, function(d) { return d.sum; })-30000, d3.max(data, function(d) { return d.sum; })+10000]);

      nest = d3.nest()
      .key(function(d){return d.party;})
      .key(function(d) { return d.date;})
      .rollup(function(d) { 
        return {
          date: d[0].date,
          party: d[0].party,
          total: d3.sum(d,function(g){return g.sum;})
        };
      })
      .entries(data);

      createNodes();
      y2.domain([d3.min(nodesData, function(d) { return d.total; }), d3.max(nodesData, function(d) { return d.total; })]);

      function createNodes() {
        nodes = [];
        nodesData = [];
        nest.forEach(function(d) {
          var partyPush = d.key;
          d.values.forEach(function(e) {
            nodes.push(e);
          });
        });
        nodes.forEach(function(d){
         nodesData.push(d.values);
       });
      }

      nestData = d3.nest()
      .key(function(d){return d.party;})
      .entries(nodesData.sort(function(a, b){ return a.date - b.date; }));

      nestData.forEach(function(d, i) {
        var partyLines = svg.append("g")
        .append("path")
        .attr("class", "line");

        partyLines.append("text")
        .attr("class", "partyText")
        .attr("dy", ".35em");
      });

      d3.selectAll(".line")
      .data(nestData)
      .attr("id", function(d){return d.key;})
      .style("fill", "none");

      lines();
      canvas();
    }

    function lines() {

      d3.selectAll(".line")
      .data(nestData)
      .transition()
      .duration(transitionTime)
      .attr("d", function(d){ return line(d.values); })
      .style("stroke", function(d,i){ return z(d.values[0].party); });

      d3.selectAll(".x.axis1")
      .transition()
      .duration(transitionTime)
      .ease("sin-in-out")
      .call(xA1);

      d3.selectAll(".x.axis2")
      .transition()
      .duration(transitionTime)
      .ease("sin-in-out")
      .call(xA2);
    }
    function canvas(){
      data.forEach(function(d) { d.x = x(d[date]); d.y = y(d[sum]); });

      var force = d3.layout.force()
      .nodes(data)
      .size([width, height*3])
      .charge(-11)
      .gravity(0)
      .chargeDistance(10)
      .friction(.3);

      force.on("tick", function(d) {
        clear();
        data.forEach(initialPosition(d.alpha));
        data.forEach(bounded());
        data.forEach(function(d) {
          context.beginPath();
          //context.fillStyle = z(d.party);
          context.strokeStyle = z(d.party);//"black";
          cr = r(d.sum)/6;
          context.arc(d.x, d.y*1.2, cr, 0, 2 * Math.PI);
          //context.fill();
          context.stroke();
          context.closePath();
        });

      });

      force.start();
    }

    var legendSize = svg.selectAll(".legendSize")
    .data(partyArray, function(d, i) { return d + i; })
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate("+ i * 60 +",0)"; });

    legendSize.append("circle")
    .attr("id", function (d,i) { return "size "+i; })
    .attr("cx", 10)
    .attr("cy", height + 100)
    .attr("r", function (d,i) {return r(Math.pow(10,i))/6;})
    .style("stroke", 1)
    .style("fill", "none");

    legendSize.append("text")
    .text(function (d,i) { return "€" + Math.pow(10,i); })
    .attr("x", 20)
    .attr("y", height + 100)
    .attr("dy", ".35em")
    .style("text-anchor", "start");

    var legendParty = svg.selectAll(".legendParty")
    .data(partyArray, function(d, i) { return d + i; })
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate("+ i * 55 +",0)"; });
    
    legendParty.append("circle")
    .attr("id", function (d) { return d+"Legend"; })
    .attr("cx", width - 300)
    .attr("cy", height + 100)
    .attr("r", 5)
    .style("stroke", function(d, i) { return z(i); })
    .style("fill", "none");

    legendParty.append("text")
    .text(function (d) { return d; })
    .attr("x", width - 290)
    .attr("y", height + 99)
    .attr("dy", ".35em")
    .style("text-anchor", "start");

    svg.append("g")
    .attr("class", "x axis1")
    .attr("transform", "translate(0," + (height+40) + ")")
    .call(xA1);
    svg.append("g")
    .attr("class", "x axis2")
    .attr("transform", "translate(0," + (height+50) + ")")
    .call(xA2);

    function clear(){
      context.clearRect(0, 0, wMulti, hMulti);
    };

    function initialPosition(alpha) {
      return function(d) {
        d.x += (x(d[date]) - d.x) * .8 * alpha;
        d.y += (y(d[sum]) - d.y) * .03 * alpha;
      };
    }
    function bounded() {
      return function(d) {
        d.x = Math.max(radius, Math.min(width - radius, d.x));
        d.y = Math.max(radius, Math.min(height - radius - 30, d.y));
      };
    }

  });
};