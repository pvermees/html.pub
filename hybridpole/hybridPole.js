function plotMap(){
  refresh();
  var HP = getHybridPole();
  if (document.inputform.plotSites.checked){ plotSiteMarkers(HP.sites); }
  if (document.inputform.plotPoles.checked){ plotPoleMarkers(HP.sites); }
  if (document.inputform.plotCircles.checked){ plotCircles(HP.sites); }
  plotMarker(HP.lat,HP.lon,'RedMarker.png');
  printResults(HP);
}

function printResults(HP){
  document.getElementById('results').innerHTML = 
    "Hybrid pole:<br> lat=" + HP.lat.toPrecision(4) + 
    ", lon=" + HP.lon.toPrecision(5) + ", A95=" + 
    HP.AP95.toPrecision(2);
}

function rotate(site,angle){
  // rotate site pole [x,y,z] around an axis [u,v,w] on either
  // a small or a great circle over a given angle
  var xyz = getXYZ(site.polelat,site.polelon);
  var uvw = getXYZ(site.sitelat,site.sitelon);
  var out = new Array(3);
  var x=xyz[0], y=xyz[1], z=xyz[2], u=uvw[0], v=uvw[1], w=uvw[2];
  if (site.great) {
    uvw = getGreatCircleCenter(x,y,z,u,v,w);
    u = uvw[0];
    v = uvw[1];
    w = uvw[2];
  }
  out[0] = u*(u*x+v*y+w*z)*(1-Math.cos(angle)) + x*Math.cos(angle) + (-w*y+v*z)*Math.sin(angle);
  out[1] = v*(u*x+v*y+w*z)*(1-Math.cos(angle)) + y*Math.cos(angle) + (w*x-u*z)*Math.sin(angle);
  out[2] = w*(u*x+v*y+w*z)*(1-Math.cos(angle)) + z*Math.cos(angle) + (-v*x+u*y)*Math.sin(angle);
  return getLatLon(out[0],out[1],out[2]);
}

function getGreatCircleCenter(x1,y1,z1,x2,y2,z2){
  var A = (y2/x2)*(z1*x2-x1*z2)/(y1*x2-x1*y2)-z2/x2;
  var B = (x1*z2-z1*x2)/(y1*x2-x1*y2);
  var z = 1/Math.sqrt(A*A+B*B+1);
  var y = B*z;
  var x = A*z;
  return [x,y,z];
}

function refresh(){
  window.map = new google.maps.Map(document.getElementById('map_canvas'),
    window.mapOptions);
}

function getHybridPole(){
  var HP = new hybridPole();
  init(HP);
  HP.prox = getProx(HP.sites,HP.lat,HP.lon);
  var lL = move('north',HP.sites,HP.lat,HP.lon,HP.prox,1,1); // first round
  HP.prox = getProx(HP.sites,lL[0],lL[1]);
  lL = move('north',HP.sites,lL[0],lL[1],HP.prox,0.1,1); // zoom in
  HP.lat = lL[0];
  HP.lon = lL[1];
  HP.AP95 = getA95(HP.sites,HP.lat,HP.lon);
  return HP;
}

function getA95(sites, lat, lon){
  var xyz, l=0, m=0, n=0, R=0, lL;
  var N = sites.length;
  for (var i=0; i<N; i++){
    xyz = corrSite(sites[i],lat,lon,false);
    l += xyz[0];
    m += xyz[1];
    n += xyz[2];
  }
  R = Math.sqrt(l*l+m*m+n*n);
  return 2*Math.acos(R/N)*180/Math.PI;
}

function sign(n){
  return n/Math.abs(n);
}

function move(direction,sites,lati,loni,proxi,deg,i){
  // recursive function to find the hybrid pole
  if (i==5){ 
    return [lati,loni]; 
  }
  var increasing = (direction=='north' || direction=='east');
  var latitudinal = (direction=='north' || direction=='south');
  ddeg = increasing ? deg : -deg;
  var lat = latitudinal ? sign(lati+ddeg)*(90-Math.abs(Math.abs(lati+ddeg)-90)) : lati;
  var lon = latitudinal ? loni : -180 + (loni+ddeg+180)%360;
  var prox = getProx(sites,lat,lon);
  if (prox>proxi){
      return move(direction,sites,lat,lon,prox,deg,1);
  } else {
    switch (direction){
    case 'north':
	return move('east',sites,lati,loni,proxi,deg,i+1);
    case 'east':
	return move('south',sites,lati,loni,proxi,deg,i+1);
    case 'south': 
	return move('west',sites,lati,loni,proxi,deg,i+1);
    case 'west':
	return move('north',sites,lati,loni,proxi,deg,i+1);
    }
  }
}

function getProx(mysites,lat,lon){
  // get the proximity (cosine of angle) 
  // between [lat,lon] circles described by sites 
  var prox = 0;
  for (var i=0; i<mysites.length; i++){
    prox += corrSite(mysites[i],lat,lon,true);
  }
  return prox;
}

function corrSite(mysite,lat,lon,doprox){
  // solves the following system of equations and returns the proximity for mysite:
  // Eq1 = x^2+y^2+z^2=1 (sphere)
  // Eq2 = a*x+b*y+c*z=d (plane going through great or small circle)
  // Eq3 = e*x+f*y+g*z=0 (plane going through origin, site and point of interest)
  // if doprox == true: return prox, if doprox == false: return lat & lon
  var xyz, x1, y1, z1, x2, y2, z2, x3, y3, z3,
    a, b, c, d, e, f, g, A, B, C, D, E, F, G,
    x4, y4, z4, x5, y5, z5, prox1, prox2, lL;
  xyz = getXYZ(mysite.sitelat,mysite.sitelon);
  x1 = xyz[0];
  y1 = xyz[1];
  z1 = xyz[2];
  xyz = getXYZ(mysite.polelat,mysite.polelon);
  x2 = xyz[0];
  y2 = xyz[1];
  z2 = xyz[2];
  xyz = getXYZ(lat,lon);
  x3 = xyz[0];
  y3 = xyz[1];
  z3 = xyz[2];
  a = (mysite.great) ? y1*z2-z1*y2 : x1;
  b = (mysite.great) ? z1*x2-x1*z2 : y1;
  c = (mysite.great) ? x1*y2-y1*x2 : z1;
  d = (mysite.great) ? 0 : a*x2+b*y2+c*z2;
  e = b*z3-c*y3;
  f = c*x3-a*z3;
  g = a*y3-b*x3;
  // combine variables to solve system of 3 equations
  A = -(f*d)/(e*b-a*f);
  B = (f*(c-a*g/e))/(e*b-a*f) - g/e;
  C = d/(b-a*f/e);
  D = -(c-a*g/e)/(b-a*f/e);
  E = B*B+D*D+1;
  F = 2*(A*B+C*D);
  G = A*A+C*C-1;
  // two solutions for corrected poles moved along the small or great circle
  z4 = -(F + Math.sqrt(F*F-4*E*G))/(2*E);
  z5 = -(F - Math.sqrt(F*F-4*E*G))/(2*E);
  x4 = A+B*z4;
  x5 = A+B*z5;
  y4 = C+D*z4;
  y5 = C+D*z5;
  prox1 = x4*x3+y4*y3+z4*z3;
  prox2 = x5*x3+y5*y3+z5*z3;
  if (prox1>prox2){
    if (doprox){
      return prox1;
    } else {
      return [x4,y4,z4];
    }
  } else {
    if (doprox){
      return prox2;
    } else {
      return [x5,y5,z5];
    }
  }
}

function init(HP){
  HP.sites = readTextBox();
  var l = 0;
  var m = 0;
  var n = 0;
  var XYZ;
  for (var i=0; i<HP.sites.length; i++){
    XYZ = getXYZ(HP.sites[i].polelat,HP.sites[i].polelon);
    l += XYZ[0];
    m += XYZ[1];
    n += XYZ[2];
  }
  var R = Math.sqrt(l*l+m*m+n*n);
  var lL = getLatLon(l/R,m/R,n/R);
  HP.lat = lL[0];
  HP.lon = lL[1];
}

function getLatLon(X,Y,Z){
  var l = Math.asin(Z);
  var L = sign(X)*Math.acos(Y/Math.cos(l));
  var lL = [l*180/Math.PI, L*180/Math.PI];
  return lL;
}

function getXYZ(lat,lon){
  var l = lat*Math.PI/180;
  var L = lon*Math.PI/180;
  XYZ = [];
  XYZ[0] = Math.cos(l)*Math.sin(L);
  XYZ[1] = Math.cos(l)*Math.cos(L);
  XYZ[2] = Math.sin(l);
  return XYZ;
}

function readTextBox(){
  var text = document.inputform.inputdata.value;
  var lines = text.split('\n');
  var numLines = lines.length;
  var line, mysite, sites = new Array();
  for (var i=0; i<numLines; i++){
    line = lines[i].split(/[\s,]+/);
    mysite = parseLine(line);
    if (mysite.valid){
        sites.push(mysite);
    }
  }
  return sites;
}

function parseLine(line){
  var mysite = new site();
  var i = -1;
  do {i++;
      if (isNumber(line[i])){
        mysite.sitelat = line[i];
	break;
      }
  } while (i<line.length);
  do {i++;
      if (isNumber(line[i])){
        mysite.sitelon = line[i];
	break;
      }
  } while (i<line.length);
  do {i++;
    if (isNumber(line[i])){
      mysite.polelat = line[i];
      break;
    }
  } while (i<line.length);
  do {i++;
    if (isNumber(line[i])){
      mysite.polelon = line[i];
      break;
    }
  } while (i<line.length);
  do {i++;
    if (line[i]=='great'){
      mysite.great = true;
      mysite.valid = true;
      break;
    } else if (line[i]=='small'){
      mysite.great = false;
      mysite.valid = true;
      break;
    }
  } while (i<line.length);
  return mysite;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function plotCircles(sites){
  for (var i=0; i<sites.length; i++){
    plotCircle(sites[i]);
  }
}

function plotCircle(site){
  var coords = [], lL, i=0;
  for (var angle=0; angle<2*Math.PI; angle+=Math.PI/180){
    lL = rotate(site, angle);
    coords[i++] = new google.maps.LatLng(lL[0],lL[1]);
  }
  // Construct the polygon
  var myCircle = new google.maps.Polygon({
    paths: coords,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillOpacity: 0
  });
  myCircle.setMap(window.map);
}

function plotSiteMarkers(sites){
  var label = '';
  for (var i=0; i<sites.length; i++){
    label = 'icons/black' + (i+1) + '.png';
    plotMarker(sites[i].sitelat,sites[i].sitelon,label);
  }
}

function plotPoleMarkers(sites){
  var label = '';
  for (var i=0; i<sites.length; i++){
    label = 'icons/red' + (i+1) + '.png';
    plotMarker(sites[i].polelat,sites[i].polelon,label);
  }
}

function plotMarker(lat,lon,image){
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(lat,lon),
    icon: image,
    title: 'lat:' + lat + ', lon:' + lon,
    map: window.map
  });
}

function hybridPole(){
  this.lat = 90;
  this.lon = 0;
  this.prox = 0;
  this.AP95 = 0;
  this.sites = [new site()];
}

function site(){
  this.valid = false;
  this.sitelat = 0;
  this.sitelon = 0;
  this.polelat = 0;
  this.polelon = 0;
  this.great = 'small';
}
