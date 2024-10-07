/*
Preload Image With Update Bar Script (By Marcin Wojtowicz [one_spook@hotmail.com])
Submitted to and permission granted to Dynamicdrive.com to feature script in it's archive
For full source code to this script and 100's more, visit http://dynamicdrive.com
*/

// You may modify the following:
    var lengthOfPreloadBar = 150 // Length of preload bar (in pixels)
    var heightOfPreloadBar = 15 // Height of preload bar (in pixels)
    var yourImages = new Array(); // Array of URLs of images that you want to preload

function loadYourImages(pictures) {
    yourImages = pictures;
}


// Do not modify anything beyond this point!
if (document.images) {
    var dots = new Array() 
    dots[0] = new Image(1,1)
    dots[0].src = "black.gif" // default preloadbar color
    dots[1] = new Image(1,1)
    dots[1].src = "blue.gif" // color of bar as preloading progresses
    var preImages = new Array(),coverage = Math.floor(lengthOfPreloadBar/yourImages.length),currCount = 0
    var loaded = new Array(),i,covered,timerID
    var leftOverWidth = lengthOfPreloadBar%coverage
}

function loadImages() { 
    for (i = 0; i < yourImages.length; i++) { 
        preImages[i] = new Image()
        preImages[i].src = yourImages[i]
    }
    for (i = 0; i < preImages.length; i++) { 
        loaded[i] = false
    }
    checkLoad()
}

function loadPicture(picture){
  document.getElementById("middle").innerHTML = 
  "<IMG HEIGHT=400 id=\"z\" NAME=\"animation\" SRC=\"" + picture + "\">" + 
  "<BR><DIV ID=\"latlon\"></DIV>"
  document.getElementById("latlon").innerHTML = ""
}

function checkLoad() {
    if (currCount == preImages.length) {
	loadPicture('intro.gif');
        return
    }
    for (i = 0; i <= preImages.length; i++) {
        if (loaded[i] == false && preImages[i].complete) {
            loaded[i] = true
            eval("document.img" + currCount + ".src=dots[1].src")
            currCount++
        }
    }
    timerID = setTimeout("checkLoad()",10) 
}