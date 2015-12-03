function setPic(file){
    var picture = document.getElementById("myPic");
    picture.src = file;
}
function readPic(){
    var img = document.getElementById("myPic");
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    
    var scale = 1;
    var maxArea = 62500;
    if(img.width*img.height > maxArea){
        scale = Math.sqrt(maxArea/(img.width*img.height));
    }
    
    canvas.width = img.width*scale;
    canvas.height = img.height*scale;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width*scale, img.height*scale);

    var bitmap = [];
    for(var i = 0; i<canvas.height; i++){
        bitmap.push([]);
        for(var j = 0; j<canvas.width; j++){
            bitmap[i].push(ctx.getImageData(j, i, 1, 1));
            /*
         // only storing rgba
      var pixel = ctx.getImageData(j, i, 1, 1);
      var colorInfo = {
        r: pixel.data[0],
        g: pixel.data[1],
        b: pixel.data[2],
        a: pixel.data[3]
      };
      bitmap[i].push(colorInfo);
      */
        }
    }

    return bitmap;

}
function pixelate(imageData, pixelSize){
    var h = imageData.length;
    var w = imageData.length;
    var pHalf = Math.floor(pixelSize/2);
    for(var i=0; i < Math.ceil(h/pixelSize); i++){
        for(var j = 0; j < Math.ceil(w/pixelSize); j++){
            var totalRGBA = [0,0,0,0];
            var count = 0;
            for(var m = i*pixelSize-pHalf; m < i*pixelSize-pHalf+pixelSize; m++){
                for(var n = j*pixelSize-pHalf; n < j*pixelSize-pHalf+pixelSize; n++){
                    if(imageData[m] && imageData[m][n]){
                        for(var c = 0; c < totalRGBA.length; c++){
                            totalRGBA[c] += imageData[m][n].data[c]*imageData[m][n].data[c];
                        }
                        count++;
                    }
                }
            }
            var averageRGBA = totalRGBA.map(function(channel){
                return Math.sqrt(channel/count);
            });
            for(var m = i*pixelSize-pHalf; m < i*pixelSize-pHalf+pixelSize; m++){
                for(var n = j*pixelSize-pHalf; n < j*pixelSize-pHalf+pixelSize; n++){
                    if(imageData[m] && imageData[m][n]){
                        averageRGBA.forEach(function(channel, x){
                            imageData[m][n].data[x] = channel;
                        });
                        count++;
                    }
                }
            }
        }
    }
    return imageData;
}
/*
function grayscale(imageData){
    var h = imageData.length;
    var w = imageData.length;
    imageData.forEach(function(row, y){
        row.forEach(function(p, x){
            //var average = Math.sqrt((p.data[0]*p.data[0]+p.data[1]*p.data[1]+p.data[2]*p.data[2])/3);
            var average = (p.data[0]+p.data[1]+p.data[2])/3
            for(var c = 0; c< 3; c++){
                p.data[c] = average;
            }
        });
    });
    return imageData
}
*/
function modifyPixel(imageData, func){
    var h = imageData.length;
    var w = imageData.length;
    imageData.forEach(function(row, y){
        row.forEach(func);
    });
    return imageData
}
function grayscale(imageData){
    return modifyPixel(imageData,function(p){
        //var average = Math.sqrt((p.data[0]*p.data[0]+p.data[1]*p.data[1]+p.data[2]*p.data[2])/3);
        var average = (p.data[0]+p.data[1]+p.data[2])/3;
        for(var c = 0; c< 3; c++){
            p.data[c] = average;
        }
    });
}
function monochrome(imageData, threshold){
    return modifyPixel(imageData,function(p){
        var average = Math.sqrt((p.data[0]*p.data[0]+p.data[1]*p.data[1]+p.data[2]*p.data[2])/3);
        var isWhite = average > threshold;
        for(var c = 0; c< 3; c++){
            if(isWhite){
                p.data[c] = 255;
            } else{
                p.data[c] = 0;
            }
        }
    });
}
function drawPic(imgData){
    var c = document.getElementById("output").getContext("2d");
    var h = imgData.length
    var w = imgData[0].length;
    c.canvas.height = h;
    c.canvas.width = w;
    imgData.forEach(function(row, y){
        row.forEach(function(p, x){
            c.putImageData(p,x,y);
            /*
           //draw pixel with rgba, doesn't work because of feathering
          c.strokeStyle = 'rgba('+p.r+','+p.g+','+p.b+','+p.a+')';
          c.strokeRect(x,y,1,1);
          */
        });
    });
}
document.getElementById("loader").onchange = function(e){
    if (e.target.files && e.target.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e){
            document.getElementById("myPic").src = e.target.result
        };
        reader.readAsDataURL(e.target.files[0]);
    }
};
