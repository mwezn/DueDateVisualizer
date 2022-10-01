var width=500;
var height=500;
var padding=70;

TF=document.getElementById('start');
TF.valueAsDate = new Date();
  


  

function convertTimestamp(unix_timestamp){
    var t= new Date(unix_timestamp*1000);
    return t.toLocaleDateString();
}

function timeScaleDiff(timest){
  var s=new Date(timest)/(24*60*60*1000)
  return Math.round(s);
}

function dailyDiff(unix_timestamp){
    var s= new Date(unix_timestamp*1000)/(24*60*60*1000);
    return Math.round(s);
}


function countElements(i){
  var count=mydata.reduce((total,x)=>(x==i? total+1:total),0)
  return count
}

function LogNormal(x,mu,sigma){
    var mean=mu;
    var std=sigma;
    var f=Math.E**(-1*(Math.log(x)-mean)**2/(2*sigma**2))/(x*std*Math.sqrt(2*Math.PI))
    return f
}

function sumarray(arr,j){
    var before=0
    arr.forEach((d,i)=>{
      if(i<=j){
        before+=d[1]
      }
    })
    return before
}



  const svg = d3
    .select("#my_dataviz2")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${1.2*width} ${1.2*height}`)
    
  svg.append("text")             
      .attr("transform", "translate("+(width/2)+", " + (height -10) + ")")
      .style("text-anchor", "middle")
      .style("font-size","25px")
      .text("Day of pregnancy");
  svg.append("text")             
      .attr("transform", "translate("+20+", " + (height/2) + ")"+"rotate(-90)")
      .style("text-anchor", "middle")
      .style("font-size","25px")
      .text("Percentage chance");
  const svg2 = d3
      .select("#my_dataviz3")
      .append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", `0 0 ${1.2*width} ${1.2*height}`)
   svg2.append("text")             
      .attr("transform", "translate("+(width/2)+", " + (height -10) + ")")
      .style("text-anchor", "middle")
      .style("font-size","25px")
      .text("Day of pregnancy");
  svg2.append("text")
      .style("text-anchor","middle")
      .style("font-size","25px")
      .attr("transform","translate("+20+", " + (height)/2 + ")"+"rotate(-90)")
      .text("Number of people");
  

function Now1(){ 

  d3.select("svg").remove();
  const svg = d3
    .select("#my_dataviz2")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${1.2*width} ${1.2*height}`)
    
  svg.append("text")             
      .attr("transform", "translate("+(width/2)+", " + (height -10) + ")")
      .style("text-anchor", "middle")
      .style("font-size","25px")
      .text("Day of pregnancy");
  svg.append("text")             
      .attr("transform", "translate("+20+", " + (height/2) + ")"+"rotate(-90)")
      .style("text-anchor", "middle")
      .style("font-size","25px")
      .text("Percentage chance");
  
  
  let now= new Date();
  let then=new Date(TF.value);
  console.log(then);
  let dailydif= timeScaleDiff(then.getTime()-now.getTime())
  d3.csv("sf_gestationdata.csv", function(data){
  mydata=[]
  data.forEach(function(d,i){
    let DayNum=dailyDiff(d.birthdate-d.duedate)+280;

    
  if (i<20000){ //with this & the following conditions ive obtained 9408 datapoints
    if(d.birthdate == "NULL"|| d.duedate== "NULL"){ 
      i++; // skip the current survey point in data & move to the next
    }
    else if(DayNum > 308 || DayNum <240){
      i++;
    }   
    //Theres a column in the data for whether birth was medically induced
    //or whether it was spontaneous) 1=induced, 0= spontaneous
    //The following line filters out only natural births
    else if(d.induced==0){
      mydata.push(dailyDiff(d.birthdate-d.duedate)+280)
    }
  }
  return mydata

  })
    mydata.sort(function(a, b){return a - b}); 
  //usually Javascripts inbuilt sort function sorts arrays alphabetically however
  // Since were dealing with numbers & not strings! 
  // we need a compare function to sort it in this case by ascending order

  
  var SortedData=[]
  

  //wrote the following myself to clean & count the number of unique data points
  for (var i=0;i<mydata.length;i++){
    if (mydata[i]==mydata[i-1]){
      continue;
    }
    else{
      var count=mydata.reduce((total,x)=>(x==mydata[i]?total+1:total),0)
      SortedData.push([mydata[i],count])
    }
  }
  //BUT we could do the above using Set & ES6 spread operator!!
  let sorted= new Set(mydata)
  let result = [...sorted]



//These lines are needed to correctly calculate the parameters for a LogNormal distribution
  var M=mydata.map((x)=> Math.log(x))
  var mean=d3.mean(M)
  var std=d3.deviation(M)
  
 

function dueDateCalc(then){
  var t=then==-1?0:then
  let now= 280-t;
  let Ln=[]
  for (let i=now;i<=308;i++){ 
    Ln.push([i,LogNormal(i,mean,std)])
  }
  return Ln
}

const completeLog= ()=>{
  var l=[]
  for (let i=240;i<=308;i++){
    l.push([i,LogNormal(i,mean,std)])
  }
  return l
}

var Ln=dueDateCalc(dailydif);
let probs=completeLog();

  
  const mindate= new Date()
  
  const maxdate= new Date(mindate.getTime()+(28+dailydif+1)*1000*60*60*24); //this gives us 28 days from now
  const Xscale=d3.scaleTime() 
      .domain([mindate,maxdate]) 
      .range([0+padding,width-padding]);
  const Yscale=d3.scaleLinear()
      .domain([0,d3.max(Ln,(d)=>d[1])])
      .range([height-padding,0+padding]);
  

  var x = d3.scaleLinear()
        .domain([d3.min(Ln,(d)=> d[0]),d3.max(Ln,(d)=>d[0])])
        .range([ 0+padding, width-padding ]);
  var y = d3.scaleLinear()
        .domain([0,d3.max(Ln,(d)=>d[1])])
        .range([height-padding,0+padding]);
  const Xscale2=d3.scaleLinear() 
      .domain([d3.min(SortedData,(d)=>d[0]),d3.max(SortedData,(d)=>d[0])])
      .range([0+padding,width-padding]);
  const Yscale2=d3.scaleLinear()
      .domain([0,d3.max(SortedData,(d)=>d[1])])
      .range([height-padding,0+padding]);

  var x2 = d3.scaleLinear()
        .domain([d3.min(SortedData,(d)=> d[0]),d3.max(SortedData,(d)=>d[0])])
        .range([ 0+padding, width-padding ]);
  var y2 = d3.scaleLinear()
        .domain([0,d3.max(SortedData,(d)=>d[1])])
        .range([height-padding,0+padding]);
  var x3=d3.scaleLinear()
        .domain([d3.min(Ln,(d)=> d[0]),d3.max(Ln,(d)=>d[0])])
        .range([mindate,maxdate])
    
      
   var bisect = d3.bisector(function(d) { return d[0]; }).left;
      var I=bisect(Ln,280,1)
      var dueD= svg
         .append('g')
         .append('line')
         .style('stroke', 'red')
         .attr("stroke-width",1.5)
         .style('opacity',1)
         .attr("x1",x(280))
         .attr("y1",y(0))
         .attr("x2",x(280))
         .attr("y2",y(Ln[I][1]))
      // Create the circle that travels along the curve of chart
      var focus = svg
        .append('g')
        .append('circle')
          .style("fill", "none")
          .attr("stroke", "black")
          .attr('r', 8.5)
          .style("opacity", 0)
      var l=svg
        .append('g')
        .append('line')
          .style("stroke","green")
          .style("opacity",0)
      // Add the line for the curve of LN
      svg
        .append("path")
        .datum(Ln)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function(d) { return x(d[0]) })
          .y(function(d) { return y(d[1]) })
          )
  var focusTxt = svg
    .append('g')
    .append('text')
      .style('opacity',0)
      .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle")
  var area = d3.area()
                
        .x( function(d) { return x(d[0])} )
        .y( function(d) { return y(0) } )
        .y1(  function(d) { return y(d[1]) } );
  var a= svg.append('path')
      .attr('stroke', 'black')
      .attr('fill', '#69b3a2'); //#69b3a2

//The following lines of code are event Listeners for 
//laptop devices & mobile devices too
    svg
     .on("mouseover",function(){
       a.style("opacity",1)
       focus.style("opacity",1)
       focusTxt.style("opacity",1)
       h1.style("opacity",1)
       l.style("opacity",1)
     })
     .on("mousemove",function(){
       var x0 = x.invert(d3.mouse(this)[0])  
       var i=bisect(Ln,x0,1)
       var currentData=Ln.slice(0,i)
       var CP=`The probability of a spontaneous birth on or before day ${x3(Ln[i][0]).toString().slice(0,15)}: ${(sumarray(probs,i+40-dailydif)*100).toFixed(3)}\n% Prob exactly on day ${Ln[i][0]}= ${(Ln[i][1]*100).toFixed(3)}%`
       h1.text(CP);
       h1.style("font-family",'arial')
       l.attr("x1",x(Ln[i][0]))
       l.attr("y1",y(Ln[i][1]))
       l.attr("x2",x(Ln[i][0]))
       l.attr("y2",y(0))
       focus.attr("cx",x(Ln[i][0]))
       focus.attr("cy",y(Ln[i][1]))
       focusTxt.html("x:" + Ln[i][0] + "  -  " + "y:" + Ln[i][1])
       
       focusTxt.attr('x',x(Ln[i][0])+10)
       focusTxt.attr('y',y(Ln[i][1]))
       a.attr("d", area(currentData))
     })
     .on("mouseleave",function(){
       a.style("opacity",0)
       focus.style("opacity",0)
       focusTxt.style("opacity",0)
       //h1.style("opacity",0)
       h1.text("Move your mouse over the left graph below to get probability of any specific day. (Move your finger if using a mobile device)")
     })
     .on("touchstart",function(){
       a.style("opacity",1)
       focus.style("opacity",1)
       focusTxt.style("opacity",1)
       h1.style("opacity",1)
       l.style("opacity",1)
     })
     .on("touchmove",function(){
       var x0 = x.invert(d3.mouse(this)[0])  
       var i=bisect(Ln,x0,1)
       var currentData=Ln.slice(0,i)
       var CP=`The probability of a spontaneous birth on or before day ${Ln[i][0]} is ${(sumarray(probs,i+40-dailydif)*100).toFixed(3)}% Prob exactly on day ${Ln[i][0]}= ${(Ln[i][1]*100).toFixed(3)}%`
       console.log(CP)
       h1.text(CP);
       h1.style("font-family",'arial')
       l.attr("x1",x(Ln[i][0]))
       l.attr("y1",y(Ln[i][1]))
       l.attr("x2",x(Ln[i][0]))
       l.attr("y2",y(0))
       focus.attr("cx",x(Ln[i][0]))
       focus.attr("cy",y(Ln[i][1]))
       focusTxt.html("x:" + Ln[i][0] + "  -  " + "y:" + Ln[i][1])
       
       focusTxt.attr('x',x(Ln[i][0])+10)
       focusTxt.attr('y',y(Ln[i][1]))
       a.attr("d", area(currentData))
     })
     .on("touchend",function(){
       a.style("opacity",0)
       focus.style("opacity",0)
       focusTxt.style("opacity",0)
       //h1.style("opacity",0)
       h1.text("Move your mouse over the left graph below to get probability of any specific day. (Scroll your finger if using a mobile device) ")
     })
      svg2
        .append("path")
        .datum(SortedData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function(d) { return x2(d[0]) })
          .y(function(d) { return y2(d[1]) })
          )  
   
  var focus2 = svg2
    .append('g')
    .append('circle')
      .style("fill", "none")
      .attr("stroke", "black")
      .attr('r', 8.5)
      .style("opacity", 0)
   var focusTxt2 = svg2
    .append('g')
    .append('text')
      .style('opacity',0)
      .attr("text-anchor", "left")
      .attr("alignment-baseline", "middle")
    
       
      
   svg2
     .on("mouseover",function(){
       focus2.style("opacity",1)
       focusTxt2.style("opacity",1)
     })
     .on("mousemove",function(){
       var x0 = x.invert(d3.mouse(this)[0])  //Important!
       var i=bisect(SortedData,x0,1)
       console.log(x0,i,SortedData[i])
       focus2.attr("cx",x2(SortedData[i][0]))
       focus2.attr("cy",y2(SortedData[i][1]))
       focusTxt2.html("x:" + SortedData[i][0] + "  -  " + "y:" + SortedData[i][1])
       
       focusTxt2.attr('x',x2(SortedData[i][0])+10)
       focusTxt2.attr('y',y2(SortedData[i][1]))
     })
     .on("mouseleave",function(){
       focus2.style("opacity",0)
       focusTxt2.style("opacity",0)
     })

      // Create a rect on top of the svg area: this rectangle recovers mouse position
      var h1 = d3.select('h1');
      

   const xaxis=d3.axisBottom(Xscale);
   const yaxis=d3.axisLeft(Yscale); 
   svg.append("g")
     .attr("class","xa")
     .attr("transform", "translate(0, " + (height - padding) + ")")
     .call(xaxis);
   svg.append("g")
     .attr("transform", `translate(${padding}, ` + 0 + ")")
     .call(yaxis);
   // now rotate text on x axis
   // solution based on idea here: https://groups.google.com/forum/?fromgroups#!topic/d3-js/heOBPQF3sAY
   // first move the text left so no longer centered on the tick
   // then rotate up to get 45 degrees.
    svg.selectAll(".xa text")  // select all the text elements for the xaxis
          .attr("transform", function(d) {
              return "translate(" + this.getBBox().height*-2 + "," + this.getBBox().height + ")rotate(-45)";
        });
   const xaxis2=d3.axisBottom(Xscale2);
   const yaxis2=d3.axisLeft(Yscale2); 
   svg2.append("g")
     .attr("transform", "translate(0, " + (height - padding) + ")")
     .call(xaxis2);
   svg2.append("g")
     .attr("transform", `translate(${padding}, ` + 0 + ")")
     .call(yaxis2);
   
   
});

  

}

Now1();
