"use strict";

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
let group = "February";
let active_minutes_dataset = [];
let parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
let datasetBarChart = [];
let dataset = [];
let datasetLineChart = [];

document.addEventListener("DOMContentLoaded", () => {

  initialize();
});

async function initialize() {
  let rawData = await fetch("./data/lightly_active_minutes.json");
  rawData = await rawData.json();

  console.log("Raw Data", rawData);
  datasetBarChart = parseData(rawData);
  datasetLineChart = parseData(rawData);
  console.log("parsed data", datasetBarChart);
  dataset = monthTotal(datasetBarChart);
  console.log("total values", dataset);

  dsBarChart();
  dsPieChart();
  dsLineChart();
}

function parseData(dataDistance) {
  return dataDistance.map((item) => {
    const date = parseDate(item.dateTime);
    const month = monthNames[date.getMonth()];

    return {
      group: month,
      category: date.getUTCDate(),
      measure: item.value
    };
  });
}

function monthTotal(parsedDistances) {
  const total = new Map();

  parsedDistances.forEach((item) => {
    if (total.has(item.group)) {
      const currentDistance = total.get(item.group);
      currentDistance.measure += Number.parseInt(item.measure, 10);
    } else {
      total.set(item.group, {category: item.group, measure: Number.parseInt(item.measure)});
    }
  });

  return Array.from(total.values());
}

function dsPieChart() {
  const width = 400,
    height = 400,
    outerRadius = Math.min(width, height) / 2,
    innerRadius = outerRadius * .999,
    // for animation
    innerRadiusFinal = outerRadius * .5,
    innerRadiusFinal3 = outerRadius * .45,
    color = d3.scaleOrdinal(d3.schemeCategory10)    //builtin range of colors
  ;

  const vis = d3.select("#pieChart")
    .append("svg:svg")              //create the SVG element inside the <body>
    .data([dataset])                   //associate our data with the document
    .attr("width", width)           //set the width and height of our visualization (these will be attributes of the <svg> tag
    .attr("height", height)
    .append("svg:g")                //make a group to hold our pie chart
    .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")")    //move the center of the pie chart from 0, 0 to radius, radius
  ;

  const arc = d3.arc()              //this will create <path> elements for us using arc data
    .outerRadius(outerRadius).innerRadius(innerRadius);

  // for animation
  const arcFinal = d3.arc().innerRadius(innerRadiusFinal).outerRadius(outerRadius);
  const arcFinal3 = d3.arc().innerRadius(innerRadiusFinal3).outerRadius(outerRadius);

  const pie = d3.pie()           //this will create arc data for us given a list of values
    .value(function (d) {
      return d.measure;
    });    //we must tell it out to access the value of each element in our data array

  const arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
    .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties)
    .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
    .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
    .attr("class", "slice")    //allow us to style things in the slices (like text)
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .on("click", up)
  ;

  arcs.append("svg:path")
    .attr("fill", function (d, i) {
      return color(i);
    }) //set the color for each slice to be chosen from the color function defined above
    .attr("d", arc)     //this creates the actual SVG path using the associated data (pie) with the arc drawing function
    .append("svg:title") //mouseover title showing the figures
    .text((d) => {
      return d.data.category + ": " + d.data.measure;
    });

  d3.selectAll("g.slice").selectAll("path").transition()
    .duration(750)
    .delay(10)
    .attr("d", arcFinal)
  ;

  // Add a label to the larger arcs, translated to the arc centroid and rotated.
  // source: http://bl.ocks.org/1305337#index.html
  arcs.filter(function (d) {
    return d.endAngle - d.startAngle > .2;
  })
    .append("svg:text")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .attr("transform", function (d) {
      return "translate(" + arcFinal.centroid(d) + ")rotate(" + angle(d) + ")";
    })
    .text((d) => d.data.category)
  ;

  // Computes the label angle of an arc, converting from radians to degrees.
  function angle(d) {
    const a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
    return a > 90 ? a - 180 : a;
  }


  // Pie chart title
  vis.append("svg:text")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text("Month")
    .attr("class", "title")
  ;


  function mouseover() {
    d3.select(this).select("path").transition()
      .duration(750)
      //.attr("stroke","red")
      //.attr("stroke-width", 1.5)
      .attr("d", arcFinal3)
    ;
  }

  function mouseout() {
    d3.select(this).select("path").transition()
      .duration(750)
      //.attr("stroke","blue")
      //.attr("stroke-width", 1.5)
      .attr("d", arcFinal)
    ;
  }

  function up(d, i) {

    /* update bar chart when user selects piece of the pie chart */
    //updateBarChart(dataset[i].category);
    updateBarChart(d.data.category, color(i));
    updateLineChart(d.data.category, color(i));

  }
}

function datasetBarChosen(group) {
  const ds = [];
  for (const x in datasetBarChart) {
    if (datasetBarChart[x].group == group) {
      ds.push(datasetBarChart[x]);
    }
  }
  return ds;
}


function dsBarChartBasics() {

  const margin = {top: 30, right: 5, bottom: 20, left: 50},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    colorBar = d3.scaleOrdinal(d3.schemeCategory10),
    barPadding = 1;

  return {
    margin: margin,
    width: width,
    height: height,
    colorBar: colorBar,
    barPadding: barPadding
  }
    ;
}

function dsBarChart() {

  const firstDatasetBarChart = datasetBarChosen(group);

  const basics = dsBarChartBasics();

  const margin = basics.margin,
    width = basics.width,
    height = basics.height,
    colorBar = basics.colorBar,
    barPadding = basics.barPadding
  ;

  const xScale = d3.scaleLinear()
    .domain([0, firstDatasetBarChart.length])
    .range([0, width])
  ;

  // Create linear y scale
  // Purpose: No matter what the data is, the bar should fit into the svg area; bars should not
  // get higher than the svg height. Hence incoming data needs to be scaled to fit into the svg area.
  const yScale = d3.scaleLinear()
    // use the max funtion to derive end point of the domain (max value of the dataset)
    // do not use the min value of the dataset as min of the domain as otherwise you will not see the first bar
      .domain([0, d3.max(firstDatasetBarChart, function (d) {
        return d.measure;
      })])
      // As coordinates are always defined from the top left corner, the y position of the bar
      // is the svg height minus the data value. So you basically draw the bar starting from the top.
      // To have the y position calculated by the range function
      .range([height, 0])
  ;

  //Create SVG element

  const svg = d3.select("#barChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id", "barChartPlot")
  ;

  const plot = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  ;

  plot.selectAll("rect")
    .data(firstDatasetBarChart)
    .enter()
    .append("rect")
    .attr("x", function (d, i) {
      return xScale(i);
    })
    .attr("width", width / firstDatasetBarChart.length - barPadding)
    .attr("y", function (d) {
      return yScale(d.measure);
    })
    .attr("height", function (d) {
      return height - yScale(d.measure);
    })
    .attr("fill", "lightgrey")
  ;


  // Add y labels to plot

  plot.selectAll("text")
    .data(firstDatasetBarChart)
    .enter()
    .append("text")
    .text((d) => d.measure)
    .attr("text-anchor", "middle")
    // Set x position to the left edge of each bar plus half the bar width
    .attr("x", function (d, i) {
      return (i * (width / firstDatasetBarChart.length)) + ((width / firstDatasetBarChart.length - barPadding) / 2);
    })
    .attr("y", function (d) {
      return yScale(d.measure) + 14;
    })
    .attr("class", "yAxis")
  /* moved to CSS
  .attr("font-family", "sans-serif")
  .attr("font-size", "11px")
  .attr("fill", "white")
  */
  ;

  // Add x labels to chart

  const xLabels = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + (margin.top + height) + ")")
  ;

  xLabels.selectAll("text.xAxis")
    .data(firstDatasetBarChart)
    .enter()
    .append("text")
    .text(function (d) {
      return d.category;
    })
    .attr("text-anchor", "middle")
    // Set x position to the left edge of each bar plus half the bar width
    .attr("x", function (d, i) {
      return (i * (width / firstDatasetBarChart.length)) + ((width / firstDatasetBarChart.length - barPadding) / 2);
    })
    .attr("y", 15)
    .attr("class", "xAxis")
  //.attr("style", "font-size: 12; font-family: Helvetica, sans-serif")
  ;

  // Title

  svg.append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", 15)
    .attr("class", "title")
    .attr("text-anchor", "middle")
    .text("month")
  ;
}

function updateBarChart(group, colorChosen) {

  const currentDatasetBarChart = datasetBarChosen(group);

  const basics = dsBarChartBasics();

  const margin = basics.margin,
    width = basics.width,
    height = basics.height,
    colorBar = basics.colorBar,
    barPadding = basics.barPadding
  ;

  const xScale = d3.scaleLinear()
    .domain([0, currentDatasetBarChart.length])
    .range([0, width])
  ;


  const yScale = d3.scaleLinear()
    .domain([0, d3.max(currentDatasetBarChart, function (d) {
      return d.measure;
    })])
    .range([height, 0])
  ;

  const svg = d3.select("#barChart svg");

  const plot = d3.select("#barChartPlot")
    .datum(currentDatasetBarChart)
  ;

  /* Note that here we only have to select the elements - no more appending! */
  plot.selectAll("rect")
    .data(currentDatasetBarChart)
    .transition()
    .duration(750)
    .attr("x", function (d, i) {
      return xScale(i);
    })
    .attr("width", width / currentDatasetBarChart.length - barPadding)
    .attr("y", function (d) {
      return yScale(d.measure);
    })
    .attr("height", function (d) {
      return height - yScale(d.measure);
    })
    .attr("fill", colorChosen)
  ;

  plot.selectAll("text.yAxis") // target the text element(s) which has a yAxis class defined
    .data(currentDatasetBarChart)
    .transition()
    .duration(750)
    .attr("text-anchor", "middle")
    .attr("x", function (d, i) {
      return (i * (width / currentDatasetBarChart.length)) + ((width / currentDatasetBarChart.length - barPadding) / 2);
    })
    .attr("y", function (d) {
      return yScale(d.measure) + 14;
    })
    .text((d) => d.measure)
    .attr("class", "yAxis")
  ;


  svg.selectAll("text.title") // target the text element(s) which has a title class defined
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", 15)
    .attr("class", "title")
    .attr("text-anchor", "middle")
    .text(group + "'s activity")
  ;
}


// set initial category value
function datasetLineChartChosen(group) {
  const ds = [];
  for (const x in datasetLineChart) {
    if (datasetLineChart[x].group == group) {
      ds.push(datasetLineChart[x]);
    }
  }
  return ds;
}

function dsLineChartBasics() {

  const margin = {top: 20, right: 10, bottom: 0, left: 50},
    width = 1000 - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom
  ;

  return {
    margin: margin,
    width: width,
    height: height
  }
    ;
}


function dsLineChart() {

  const firstDatasetLineChart = datasetLineChartChosen(group);

  const basics = dsLineChartBasics();

  const margin = basics.margin,
    width = basics.width,
    height = basics.height
  ;

  const xScale = d3.scaleLinear()
    .domain([0, firstDatasetLineChart.length - 1])
    .range([0, width])
  ;

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(firstDatasetLineChart, function (d) {
      return d.measure;
    })])
    .range([height, 0])
  ;

  const line = d3.line()
    //.x(function(d) { return xScale(d.category); })
      .x(function (d, i) {
        return xScale(i);
      })
      .y(function (d) {
        return yScale(d.measure);
      });

  const svg = d3.select("#lineChart").append("svg")
    .datum(firstDatasetLineChart)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
  // create group and move it so that margins are respected (space for axis and title)

  const plot = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("id", "lineChartPlot");

  /* descriptive titles as part of plot -- start */
  const dsLength = firstDatasetLineChart.length;

  plot.append("text")
    .text(firstDatasetLineChart[dsLength - 1].measure)
    .attr("id", "lineChartTitle2")
    .attr("x", width / 2)
    .attr("y", height / 2)
  ;
  /* descriptive titles -- end */

  plot.append("path")
    .attr("class", "line")
    .attr("d", line)
    // add color
    .attr("stroke", "lightgrey")
  ;

  plot.selectAll(".dot")
    .data(firstDatasetLineChart)
    .enter().append("circle")
    .attr("class", "dot")
    //.attr("stroke", function (d) { return d.measure==datasetMeasureMin ? "red" : (d.measure==datasetMeasureMax ? "green" : "steelblue") } )
    .attr("fill", function (d) {
      return d.measure == d3.min(firstDatasetLineChart, function (d) {
        return d.measure;
      }) ? "red" : (d.measure == d3.max(firstDatasetLineChart, function (d) {
        return d.measure;
      }) ? "green" : "white")
    })
    //.attr("stroke-width", function (d) { return d.measure==datasetMeasureMin || d.measure==datasetMeasureMax ? "3px" : "1.5px"} )
    .attr("cx", line.x())
    .attr("cy", line.y())
    .attr("r", 3.5)
    .attr("stroke", "lightgrey")
    .append("title")
    .text(function (d) {
      return d.category + ": " + d.measure
    })
  ;

  svg.append("text")
    .text("Light activity minutes")
    .attr("id", "lineChartTitle1")
    .attr("x", margin.left + ((width + margin.right) / 2))
    .attr("y", 10);
}


/* ** UPDATE CHART ** */

/* updates bar chart on request */
function updateLineChart(group, colorChosen) {

  const currentDatasetLineChart = datasetLineChartChosen(group);

  const basics = dsLineChartBasics();

  const margin = basics.margin,
    width = basics.width,
    height = basics.height;

  const xScale = d3.scaleLinear()
    .domain([0, currentDatasetLineChart.length - 1])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(currentDatasetLineChart, function (d) {
      return d.measure;
    })])
    .range([height, 0]);

  const line = d3.line()
    .x(function (d, i) {
      return xScale(i);
    })
    .y(function (d) {
      return yScale(d.measure);
    });

  const plot = d3.select("#lineChartPlot")
    .datum(currentDatasetLineChart);

  /* descriptive titles as part of plot -- start */
  const dsLength = currentDatasetLineChart.length;

  plot.select("text")
    .text(currentDatasetLineChart[dsLength - 1].measure);
  /* descriptive titles -- end */

  plot
    .select("path")
    .transition()
    .duration(750)
    .attr("class", "line")
    .attr("d", line)
    // add color
    .attr("stroke", colorChosen)
  ;

  const path = plot
    .selectAll(".dot")
    .data(currentDatasetLineChart)
    .transition()
    .duration(750)
    .attr("class", "dot")
    .attr("fill", function (d) {
      return d.measure == d3.min(currentDatasetLineChart, function (d) {
        return d.measure;
      }) ? "red" : (d.measure == d3.max(currentDatasetLineChart, function (d) {
        return d.measure;
      }) ? "green" : "white")
    })
    .attr("cx", line.x())
    .attr("cy", line.y())
    .attr("r", 3.5)
    // add color
    .attr("stroke", colorChosen);

  path
    .selectAll("title")
    .text(function (d) {
      return d.category + ": " + d.measure;
    });
}




