function graph4(csvpath, color, location, w, h) {
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
  nrTicks = 25,
  miniH = 33;

  var x = d3.time.scale().range([0, width]),
  y = d3.scaleLinear().range([miniH, 0]),
  z = d3.scaleOrdinal().range(colorrange)
  .domain(["kesk", "ref", "irl", "sde", "vaba", "ekre"]),
  xA1a = d3.axisBottom(x)
  .tickFormat(EST.timeFormat("%b"))
  .ticks(nrTicks/3)
  .tickSize(5,0),
  xA1b = d3.axisBottom(x)
  .tickFormat("")
  .ticks(nrTicks)
  .tickSize(5,0),
  xA2 = d3.axisBottom(x)
  .ticks(d3.timeYears)
  .tickFormat(d3.timeFormat("%Y"))
  .tickSize(0,0),
  yA = d3.axisLeft(y)
  .tickFormat(EST.numberFormat("$,f"))
  .tickValues([0,50000,100000])
  .tickSize(-width+12);

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
  .text("Alla ja üle 10,000€ annetused ning nende arv");

  var line = d3.line() 
  .x(function(d) { return x(d.date); })
  .y(function(d) { return y(d.total); })
  .curve(d3.curveMonotoneX);

  d3.tsv("annetused.txt", function(error, data) {

    var date = "date",
        sum  = "sum",
        small = "small",
        party = "party";
    data.forEach(function(d) {
      d[date] = new Date(+d.year, +d.month-1, +d.day);
      d[sum] = +d.sum+1;
      d.name = d.name;
      d[party] = d.party;
      if(+d.sum<10000){ return d[small] = 1; } else { return d[small] = 0; }
    });
    initialData = [];
    initialData = data;

    reload();
    function reload(){
      nest = [];
      nodes = [];
      nodesData = [];
      nestData = [];

      data = initialData.filter(function(d) { return d.sum > 0; }).sort(function(a, b){ return a.date - b.date; });

      x.domain(d3.extent(data, function(d) { return d.date; }));

      nest = d3.nest()
      .key(function(d){return d.party;})
      .key(function(d){return d3.timeMonth(d.date);})
      .key(function(d){return d.small;})
      .rollup(function(d) { 
        return {
          date: d[0].date,
          party: d[0].party,
          small: d[0].small,
          total: d3.sum(d,function(g){return g.sum;}) - d.length
        };
      })
      .entries(data);

      createNodes();
      y.domain([d3.min(nodesData, function(d) { return d.total; }), d3.max(nodesData, function(d) { return d.total; })]);

      function createNodes() {
        nest.forEach(function(d) {
          d.values.forEach(function(e) {
            e.values.forEach(function(b) {
              nodes.push(b);
            });
          });
        });
        nodes.forEach(function(d){
         nodesData.push(d.value);
       });
      }

      y.domain([d3.min(nodesData, function(d) { return d.total; }), d3.max(nodesData, function(d) { return d.total; })]);

      nestData = d3.nest()
      .key(function(d){return d.party;})
      .entries(nodesData
        .sort(function(a, b){ return a.date - b.date; })
        .sort(function(a, b){ return d3.ascending(a.party, b.party); })
        .filter(function(d) { return d.small == 1; }));

      nestData.forEach(function(d, i) {
        var partyLines = svg.append("g")
        .attr("transform", function(d){ return "translate(0," + miniH*i + ")" ;});

        partyLines.append("path")
        .attr("class", "lineGraph4")
        .style("fill", "none")
        .style("stroke-width", 1.5)
        .style("stroke-dasharray", ("3, 3"));

        partyLines.append("text")
        .attr("class", "partyTextGraph4")
        .attr("id", "partyTextGraph4")
        .attr("dy", ".35em");

        partyLines.append("g")
        .attr("class", "y axisGraph4")
        .attr("id", "axis")
        .call(yA);

      });

      nestData2 = d3.nest()
      .key(function(d){return d.party;})
      .entries(nodesData
        .sort(function(a, b){ return a.date - b.date; })
        .sort(function(a, b){ return d3.ascending(a.party, b.party); })
        .filter(function(d) { return d.small == 0; }));

      nestData2.forEach(function(d, i) {
        var partyLines2 = svg.append("g")
        .attr("transform", function(d){ return "translate(0," + miniH*(i+1) + ")" ;});

        partyLines2.append("path")
        .attr("class", "line2Graph4")
        .style("fill", "none")
        .style("stroke-width", 1.5);

        partyLines2.append("text")
        .attr("class", "partyText2Graph4")
        .attr("id", "partyTextGraph4")
        .attr("dy", ".35em")
        .style("font-weight", "bold");

      });

      d3.selectAll(".lineGraph4")
      .data(nestData)
      .attr("id", function(d){return d.key;});

      d3.selectAll(".line2Graph4")
      .data(nestData2)
      .attr("id", function(d){return d.key + "2" ;});

      svg.append("line")
      .attr("class", "RKlG4")
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "black")
      svg.append("text")
      .attr("class", "RKG4")
      .attr("transform", "rotate(-90)")
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("RK 2015");

      svg.append("line")
      .attr("class", "KOVlG4")
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "black")
      svg.append("text")
      .attr("class", "KOVG4")
      .attr("transform", "rotate(-90)")
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("KOV 2013");

      svg.append("line")
      .attr("class", "EPlG4")
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "black")
      svg.append("text")
      .attr("class", "EPG4")
      .attr("transform", "rotate(-90)")
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("EP 2014");

      bigLines();
      smallLines();
    }

    function bigLines() {

      d3.selectAll(".line2Graph4")
      .data(nestData2)
      .transition()
      .duration(transitionTime)
      .attr("d", function(d){ return line(d.values); })
      .style("stroke", function(d){ return z(d.values[0].party); });

      d3.selectAll(".partyText2Graph4")
      .data(nestData2)
      .attr("x", width-10)
      .attr("y", function(d,i){ 
        var lastValue = nestData2[i].values[(nestData2[i].values.length-1)].total;
        return y(lastValue);})
      .style("fill", function(d){ return z(d.values[0].party); })
      .text(function(d) {
        return d.values[0].party + " " +
        data.filter(function(e) { return e.small == 0 && e.party == d.values[0].party; }).length;
      });
    }

    function smallLines() {

      d3.selectAll(".lineGraph4")
      .data(nestData)
      .transition()
      .duration(transitionTime)
      .attr("d", function(d){ return line(d.values); })
      .style("stroke", function(d){ return z(d.values[0].party); });

      d3.selectAll(".partyTextGraph4")
      .data(nestData)
      .attr("x", width-10)
      .attr("y", function(d,i){ 
        var lastValue = nestData[i].values[(nestData[i].values.length-1)].total;
        return y(lastValue);})
      .style("fill", function(d){ return z(d.values[0].party); })
      .text(function(d) {
        return d.values[0].party + " " +
        data.filter(function(e) { return e.small == 1 && e.party == d.values[0].party; }).length;
      });

      d3.select(".RKlG4")
      .transition()
      .duration(transitionTime)
      .attr("x1", x(new Date(2015,2,1)))
      .attr("x2", x(new Date(2015,2,1)));

      d3.select(".RKG4")
      .transition()
      .duration(transitionTime)
      .attr("y", x(new Date(2015,2,1))+5);

      d3.select(".KOVlG4")
      .transition()
      .duration(transitionTime)
      .attr("x1", x(new Date(2013,9,20)))
      .attr("x2", x(new Date(2013,9,20)));

      d3.select(".KOVG4")
      .transition()
      .duration(transitionTime)
      .attr("y", x(new Date(2013,9,20))+5);

      d3.select(".EPlG4")
      .transition()
      .duration(transitionTime)
      .attr("x1", x(new Date(2014,4,25)))
      .attr("x2", x(new Date(2014,4,25)));

      d3.select(".EPG4")
      .transition()
      .duration(transitionTime)
      .attr("y", x(new Date(2014,4,25))+5);

      d3.select(".x.axisA1aGraph4")
      .transition()
      .duration(transitionTime)
      .call(xA1a);
      d3.select(".x.axisA1bGraph4")
      .transition()
      .duration(transitionTime)
      .call(xA1b);
      d3.select(".x.axisA2Graph4")
      .transition()
      .duration(transitionTime)
      .call(xA2);
      d3.selectAll(".y.axisGraph4")
      .transition()
      .duration(transitionTime)
      .call(yA);

      arrangeLabels();
    }

    function arrangeLabels() {
      var move = 1;
      while(move > 0) {
        move = 0;
        d3.selectAll("#partyTextGraph4")
        .each(function() {
         var that = this,
         a = this.getBoundingClientRect();
         d3.selectAll("#partyTextGraph4")
         .each(function() {
          if(this != that) {
            var b = this.getBoundingClientRect();
            if((Math.abs(a.top - b.top) * 3 < (a.height + b.height))) {
              var dy = (Math.max(0, a.bottom - b.top) + Math.min(0, a.top - b.bottom)) * .02,
              tt = d3.transform(d3.select(this).attr("transform")),
              to = d3.transform(d3.select(that).attr("transform"));
              move += Math.abs(dy);

              to.translate = [ 0, to.translate[1] + dy ];
              tt.translate = [ 0, tt.translate[1] - dy ];
              d3.select(this).attr("transform", "translate(" + tt.translate + ")");
              d3.select(that).attr("transform", "translate(" + to.translate + ")");
              a = this.getBoundingClientRect();
            }
          }
        });
       });
      }
    }

    svg.append("g")
    .attr("class", "x axisA1aGraph4")
    .attr("id", "axis")
    .attr("transform", "translate(0," + (height + 5) + ")")
    .call(xA1a);
    svg.append("g")
    .attr("class", "x axisA1bGraph4")
    .attr("id", "axis")
    .attr("transform", "translate(0," + (height + 5) + ")")
    .call(xA1b);
    svg.append("g")
    .attr("class", "x axisA2Graph4")
    .attr("id", "axis")
    .attr("transform", "translate(0," + (height+25) + ")")
    .call(xA2);

  });
};