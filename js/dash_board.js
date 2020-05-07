let active_minutes_dataset=[];
var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");




d3.json("./data/lightly_active_minutes.json").then((data) => {
       data.forEach((d) => {
       d["dateTime"] = parseDate(d["dateTime"])
       d["value"] = +d["value"]
       });
       console.log(data);
       active_minutes_dataset = data

   });



