function graph2(csvpath, color, location, w, h) {
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

  var margin = {top: 40, right: 50, bottom: 150, left: 80},
  width = w,
  height = h,
  radius = 10,
  multiplier = window.devicePixelRatio,
  wMulti = width * multiplier,
  hMulti = height * multiplier,
  transitionTime = 700,
  nrTicks = 25;

  var x = d3.time.scale().range([0, width]),
  y = d3.scaleLinear().range([height, 0]),
  y2 = d3.scaleLog().range([height+40, height+5]),
  r = d3.scaleLog().range([1, 10]),
  z = d3.scaleOrdinal().range(colorrange)
  .domain(["kesk", "ref", "irl", "sde", "vaba", "ekre"]),
  xA1a = d3.axisBottom(x)
  .tickFormat(EST.timeFormat("%b"))
  .tickSize(5,0)
  .ticks(nrTicks/3),
  xA1b = d3.axisBottom(x)
  .tickFormat("")
  .ticks(nrTicks)
  .tickSize(5,0),
  xA2 = d3.axisBottom(x)
  .ticks(d3.timeYears)
  .tickFormat(d3.timeFormat("%Y"))
  .tickSize(0,0);

  var svg = d3.select("."+location)
  .append("svg")
  .attr("class", "svgGraph2")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var title = svg.append("text")
  .attr("x", width/2)
  .attr("y", -20)
  .attr("class", "graphTitle")
  .style("text-anchor", "middle")
  .text("Rahaliste annetuste suurus päevade lõikes");

  var base = d3.select("."+location);
  var chart = base.append("canvas")
  .attr("class", "canvas")
  .style("left", margin.left + "px")
  .style("top", margin.top + 10 + "px")
  .attr("width", wMulti)
  .attr("height", hMulti)
  .style("width", function(){ return width + "px"; })
  .style("height", function(){ return height + "px"; });

  var hiddenChart = base.append("canvas")
  .attr("class", "canvas")
  .style("left", margin.left + "px")
  .style("top", margin.top + 10 + "px")
  .attr("width", wMulti)
  .attr("height", hMulti)
  .style("width", function(){ return width + "px"; })
  .style("height", function(){ return height + "px"; })
  .style("display", "none");

  var context = chart.node().getContext("2d");
  context.scale(multiplier,multiplier);

  var hiddenContext = hiddenChart.node().getContext("2d");
  hiddenContext.scale(multiplier,multiplier);

  var line = d3.line() 
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y2(d.total); })
  .curve(d3.curveLinear);

  d3.tsv(csvpath, function(error, data) {

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

    y.domain([d3.min(data, function(d) { return d.sum; })-30000, d3.max(data, function(d) { return d.sum; })+10000]);

    nameNest = d3.nest()
      .key(function(d){return d.name;})
      .entries(data.sort(function(a, b){ return b.sum - a.sum || a.date - b.date }));

    var dropDownParty = d3.select("."+location)
    .append("select")
    .attr("class", "selectParty")
    .attr("name", "partyList")
    .style("top", margin.top + 20  + "px")
    .style("left", margin.left + width + 20 + "px")
    .selectAll("option")
    .data(partyArray)
    .enter()
    .append("option")
    .attr("value", function (d,i) { return partyArray[(i)]; })
    .text(function (d,i) { return partyArray[(i)]; });

    var dropDownName = d3.select("."+location)
    .append("select")
    .attr("class", "selectName")
    .attr("name", "nameList")
    .style("top", margin.top + 50 + "px")
    .style("left", margin.left + width + 20 + "px")
    //.style("width", 200 + "px")
    .selectAll("option")
    .data(nameNest)
    .enter()
    .append("option")
    .attr("value", function (d) { return d.key; })
    .text(function (d) { return d.key + " - " + d3.sum(d.values, function(d,i){ return d.sum - 1; }) + "€"; });
    
    d3.select(".selectParty")
    .on("change", function(d) {
      reload(partyArray[this.selectedIndex],"");
    });

    d3.select(".selectName")
    .on("change", function(d) {
      reload("", nameNest[this.selectedIndex].key);
    });

    svg.append("line")
    .attr("class", "RKlG2")
    .attr("y1", 0)
    .attr("y2", height+40)
    .attr("stroke", "black")
    svg.append("text")
    .attr("class", "RKG2")
    .attr("transform", "rotate(-90)")
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("RK 2015");

    svg.append("line")
    .attr("class", "KOVlG2")
    .attr("y1", 0)
    .attr("y2", height+40)
    .attr("stroke", "black")
    svg.append("text")
    .attr("class", "KOVG2")
    .attr("transform", "rotate(-90)")
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("KOV 2013");

    svg.append("line")
    .attr("class", "EPlG2")
    .attr("y1", 0)
    .attr("y2", height+40)
    .attr("stroke", "black")
    svg.append("text")
    .attr("class", "EPG2")
    .attr("transform", "rotate(-90)")
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("EP 2014");

    reload("kesk","");
    function reload(selectedParty, selectedName){
      nest = [];
      nodes = [];
      nodesData = [];
      nestData = [];

      if (selectedParty) data = initialData.filter(function(d) { return d.party === selectedParty && d.sum > 0; });
      if (selectedName) data = initialData.filter(function(d) { return d.name === selectedName && d.sum > 0; });

      x.domain(d3.extent(data, function(d) { return d.date; }));

      nest = d3.nest()
      .key(function(d){return d.party;})
      .key(function(d) { return d3.timeDay(d.date);})
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
        nest.forEach(function(d) {
          var partyPush = d.key;
          d.values.forEach(function(e) {
            nodes.push(e);
          });
        });
        nodes.forEach(function(d){
         nodesData.push(d.value);
       });
      }

      y2.domain([d3.min(nodesData, function(d) { return d.total; }), d3.max(nodesData, function(d) { return d.total; })]);

      nestData = d3.nest()
      .key(function(d){return d.party;})
      .entries(nodesData.sort(function(a, b){ return a.date - b.date; }));

      nestData.forEach(function(d, i) {
        var partyLines = svg.append("g")
        .append("path")
        .attr("class", "lineGraph2")
        .style("fill", "none");

      });

      d3.selectAll(".line")
      .data(nestData)
      .attr("id", function(d){return d.key;});

      lines();
      canvas();
    }

    function lines() {

      d3.selectAll(".lineGraph2")
      .data(nestData)
      .transition()
      .duration(transitionTime)
      .attr("d", function(d){ return line(d.values); })
      .style("stroke", function(d){ return z(d.values[0].party); });

      d3.selectAll(".lineGraph2")
      .data(nestData)
      .exit()
      .remove();

      d3.select(".RKlG2")
      .transition()
      .duration(transitionTime)
      .attr("x1", x(new Date(2015,2,1)))
      .attr("x2", x(new Date(2015,2,1)));

      d3.select(".RKG2")
      .transition()
      .duration(transitionTime)
      .attr("y", x(new Date(2015,2,1))+5);

      d3.select(".KOVlG2")
      .transition()
      .duration(transitionTime)
      .attr("x1", x(new Date(2013,9,20)))
      .attr("x2", x(new Date(2013,9,20)));

      d3.select(".KOVG2")
      .transition()
      .duration(transitionTime)
      .attr("y", x(new Date(2013,9,20))+5);

      d3.select(".EPlG2")
      .transition()
      .duration(transitionTime)
      .attr("x1", x(new Date(2014,4,25)))
      .attr("x2", x(new Date(2014,4,25)));

      d3.select(".EPG2")
      .transition()
      .duration(transitionTime)
      .attr("y", x(new Date(2014,4,25))+5);

      d3.select(".x.axis1aGraph2")
      .transition()
      .duration(transitionTime)
      .call(xA1a);

      d3.select(".x.axis1bGraph2")
      .transition()
      .duration(transitionTime)
      .call(xA1b);

      d3.select(".x.axis2Graph2")
      .transition()
      .duration(transitionTime)
      .call(xA2);
    }

    function canvas(){
      data.forEach(function(d) { d.x = x(d[date]); d.y = y(d[sum]) - 30 ; });

      colToNode = new Array;

      var simulation = d3.forceSimulation(data)
      .force("x", d3.forceX(function(d) { return x(d[date]); }).strength(1))
      .force("collide", d3.forceCollide(3));

      for (var i = 0; i < 10; ++i) {
        simulation.tick();
        if (i == 9) simulation.on("tick", tick);
      }

      function tick(d) {
        clear();
        data.forEach(bounded());
        data.forEach(function(d) {
          context.beginPath();
          context.strokeStyle = z(d.party);
          context.arc(d.x, d.y*1.2, r(d.sum)/6, 0, 2 * Math.PI);
          context.stroke();
          context.closePath();

          var color = genColor();
          hiddenContext.beginPath();
          hiddenContext.fillStyle = color;
          hiddenContext.arc(d.x, d.y*1.2, r(d.sum)/6, 0, 2 * Math.PI);
          hiddenContext.fill();
          hiddenContext.closePath();

          colToNode.push({clr: color, name: d.name, sum: d.sum, date: d.date });
        });
        simulation.stop();
      }

      /*
      simulation.on("tick", function(d) {
        clear();
        data.forEach(bounded());
        data.forEach(function(d) {
          context.beginPath();
          //context.fillStyle = z(d.party);
          context.strokeStyle = z(d.party);//"black";
          context.arc(d.x, d.y*1.2, r(d.sum)/6, 0, 2 * Math.PI);
          //context.fill();
          context.stroke();
          context.closePath();
        });
      });

      */
      
    }

      chart.on("mousemove", function(e){
        var mouseX = d3.mouse(this)[0] * multiplier;
        var mouseY = d3.mouse(this)[1] * multiplier;

        var col = hiddenContext.getImageData(mouseX, mouseY, 1, 1).data;
        var colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";
        var node = colToNode.filter(function(d){ return d.clr == colString});

        if(node.length > 0) {
          d3.select("#tooltip")
            .style("visibility", "visible")
            .html(node[0].name + "</br>" + EST.timeFormat("%d. %B, %Y")(node[0].date) + "</br>" + (node[0].sum - 1) + "€")
            .style("top", function () { return (d3.event.pageY - 50)+"px"})
            .style("left", function () { return (d3.event.pageX - 50)+"px";}); 
        } else {
          d3.select("#tooltip")
            .style("visibility", "hidden");
        }

      });

    var legendSize = svg.selectAll(".legendSize")
    .data(partyArray, function(d, i) { return d + i; })
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate("+ i * 70 +",0)"; });

    legendSize.append("circle")
    .attr("id", function (d,i) { return "size "+i; })
    .attr("cx", 10)
    .attr("cy", height + 100)
    .attr("r", function (d,i) {return r(Math.pow(10,i))/6;})
    .style("stroke", "black")
    .style("fill", "none");

    f=d3.format(",");

    legendSize.append("text")
    .text(function (d,i) { return  f(Math.pow(10,i)) + "€"; })
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
    .attr("cx", width - 310)
    .attr("cy", height + 100)
    .attr("r", 5)
    .style("stroke", function(d, i) { return z(i); })
    .style("fill", "none");

    legendParty.append("text")
    .text(function (d) { return d; })
    .attr("x", width - 300)
    .attr("y", height + 99)
    .attr("dy", ".35em")
    .style("text-anchor", "start");

    svg.append("g")
    .attr("class", "x axis1aGraph2")
    .attr("id", "axis")
    .attr("transform", "translate(0," + (height + 40) + ")")
    .call(xA1a);
    svg.append("g")
    .attr("class", "x axis1bGraph2")
    .attr("id", "axis")
    .attr("transform", "translate(0," + (height + 40) + ")")
    .call(xA1b);
    svg.append("g")
    .attr("class", "x axis2Graph2")
    .attr("id", "axis")
    .attr("transform", "translate(0," + (height+ 60) + ")")
    .call(xA2);

    function clear(){
      context.clearRect(0, 0, wMulti, hMulti);
      hiddenContext.clearRect(0, 0, wMulti, hMulti);
    };

    function bounded() {
      return function(d) {
        d.x = Math.max(radius, Math.min(width - radius, d.x));
        d.y = Math.max(radius, Math.min(height - radius - 30, d.y));
      };
    }

    var nextCol = 1;
      function genColor(){
        var ret = [];

        if(nextCol < 16777215){
          ret.push(nextCol & 0xff); // R
          ret.push((nextCol & 0xff00) >> 8); // G 
          ret.push((nextCol & 0xff0000) >> 16); // B

          nextCol += 1;
        }
        var col = "rgb(" + ret.join(',') + ")";
        return col;
      }

  });
};