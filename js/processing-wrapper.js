/* processing-wrapper.js
 * A wrapper class for processing.js that eliminates the use of the Processing instance for users
 */
 
$(document).ready(function() {
	$("#compile-button1").click(draw);
});
    
var code;

var draw = function()
    {
        code = myCodeMirror.getValue();
        console.log(code);
        var canvas = document.getElementById("canvas1");
        // attaching the sketchProc function to the canvas
        var processingInstance = new Processing(canvas, wrapperClass);    
    }
    
function wrapperClass(processing)
    {
        // wrapper functions
        function ellipse(x, y, h, w)
        {
            processing.ellipse(x, y, h, w);
        }
        
        function random(min, max)
        {
            return processing.random(min, max);
        }
        
        function background(color)
        {
            processing.background(color);
        }
        
        function size(width, height)
        {
            processing.size(width, height);
        }
        
        function smooth()
        {
            processing.smooth();
        }
        
        function frameRate(rate)
        {
            processing.frameRate(rate);
        }
        
        function strokeWeight(weight)
        {
            processing.strokeWeight(weight);
        }
        
        function stroke(a, b, c, d)
        {
            processing.stroke(a, b, c, d);
        }
        
        function line(a, b, c, d)
        {
            processing.line(a, b, c, d);
        }
        
        function width()
        {
            return processing.width;
        }
        
        function height()
        {
            return processing.height;
        }
        
        var canvas = $("#canvas1")[0].getContext("2d");
        // Clear the canvas
        canvas.fillStyle="#FFFFFF";
        canvas.fillRect(0, 0, $("#canvas1")[0].width, $("#canvas1")[0].height);
        eval(code);
    }
    
/*
// sketch code
var i = 0;

// set up
processing.background(255);
processing.size(750, 250);
processing.smooth();
processing.frameRate(30);
processing.strokeWeight(12);

// draw
processing.draw = function()
{
    processing.stroke(processing.random(50), processing.random(255), processing.random(255), 100);
    processing.line(i, 0, random(0, processing.width), processing.height);
    processing.line(processing.width-i, 0, random(0, processing.width), processing.height);
    processing.line(i, processing.height, random(0, processing.width), 0);
    processing.line(processing.width-i, processing.height, random(0, processing.width), 0);            
    if(i < processing.width)
    {
        i = i + 1;
    } else
    {
        i = 0;
    }
    ellipse(random(0, processing.width), random(0, processing.height), 25, 25);
}
*/

/*
// sketch code
var i = 0;

// set up
background(255);
size(750, 250);
smooth();
frameRate(30);
strokeWeight(12);

// draw
processing.draw = function()
{
    stroke(processing.random(50), processing.random(255), processing.random(255), 100);
    line(i, 0, random(0, width()), height());
    line(width()-i, 0, random(0, width()), height());
    line(i, height(), random(0, width()), 0);
    line(width()-i, height(), random(0, width()), 0);            
    if(i < width())
    {
        i = i + 1;
    } else
    {
        i = 0;
    }
    ellipse(random(0, width()), random(0, height()), 25, 25);
}
*/
    