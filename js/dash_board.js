let active_minutes_dataset=[];


// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;


// append the svg object to the body of the page
var svg = d3.select("#distance")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");










d3.json("./data/lightly_active_minutes.json").then(function(d){
        return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
      },


    function(data) {
    console.log(data);
    active_minutes_dataset = data

});