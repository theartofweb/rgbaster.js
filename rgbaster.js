;(function(window, undefined) {

  "use strict";

  var createRange = function(start, end) {
    var retval = []
    for(var i=start; i <= end; i++) retval.push(i);
    return retval;
  };

  var randomSample = function(array, sampleSize) {
    var retval = [];
    for(var i = array.length - 1; i > 0 && retval.length < sampleSize; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      retval.push(array.splice(j, 1));
    }
    return retval;
  };

  var getImageData = function(img, callback) {

    var imgObj = new Image();

    // can't set cross origin to be anonymous for data urls
    // https://github.com/mrdoob/three.js/issues/1305
    if(!img.src.match(/^data:/)) imgObj.crossOrigin = "Anonymous";
    
    imgObj.src = img.src;

    imgObj.onload = function() {
      var context = document.createElement("canvas").getContext("2d");
      context.drawImage(imgObj, 0, 0);

      var imageData = context.getImageData(0, 0, img.width, img.height);
      callback && typeof callback == "function" && callback(imageData.data);
    };

  };

  /**
  *     RGBaster Object
  *     
  *     @method getPalette     
  *
  */
  var SAMPLESIZE = 5; // percent

  var RGBaster = {};

  RGBaster.getPalette = function(img, callback, paletteSize) {

    var loaded = function(data) {

      var length        = data.length,
          w             = img.width,
          h             = img.height,
          sampleSize    = Math.ceil(w * SAMPLESIZE / 100),
          samplePoints  = [],
          rgb           = [],
          colorCounts   = [],
          tuples        = [],
          palette       = [];

      for(var row = 0; row < h; row++) {
        samplePoints = samplePoints.concat(
          randomSample(createRange(row * w, (row+1) * w - 1), sampleSize)
        );
      }

      for(var pixelPos in samplePoints) {
        var idx = 4 * pixelPos;
        // average to nearest #RGB colour	
        rgb[0] = 17 * Math.round(data[idx]/17);
        rgb[1] = 17 * Math.round(data[idx+1]/17);
        rgb[2] = 17 * Math.round(data[idx+2]/17);
        var rgbString = rgb.join(",");

        // count all colours not black/white
        if(rgbString != "0,0,0" && rgbString != "255,255,255") {
          if(rgbString in colorCounts) {
            colorCounts[rgbString]++;
          } else {
            colorCounts[rgbString] = 1;
          }
        }

      }

      // sort colours in descending order
      for(var key in colorCounts) tuples.push([key, colorCounts[key]]);
      tuples.sort(function(a, b) { return b[1] - a[1]; });

      var total = 0;
      if(!paletteSize) paletteSize = tuples.length;
      for(var i=0; i < Math.min(tuples.length, paletteSize); i++) {
        palette.push({ name: tuples[i][0], count: tuples[i][1] });
        total += tuples[i][1];
      }

      callback && typeof callback == "function" && callback(
        palette.map(function(c) {
          return { color: "rgb(" + c.name + ")", percent: Math.round(1000 * c.count/total)/10 }
        })
      );

    };

    getImageData(img, loaded);
  }

  window.RGBaster = window.RGBaster || RGBaster;

})(window);
