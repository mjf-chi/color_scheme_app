from django.shortcuts import render, render_to_response, redirect
from django.template import RequestContext
from django.core import serializers
from django.http import HttpResponseRedirect
from django.views.generic import View

import json
from StringIO import StringIO

from models import *

def WebGLHomeView(request):
    return redirect('/colors/')
    

class ColorView(View):
    def get(self, request, *args, **kwargs):
	schemenum = 1

	try:
	    schemenum = self.kwargs['schemenum']
	except:
	    pass
	    
        scheme = ColorScheme.objects.get(pk=schemenum)
        allschemes = ColorScheme.objects.all()

        colors = scheme.colors.all()

        hsvcolors = []
  
        for i in colors:
	    hsvcolors.append(i.rgb_hsv())

	increaseRate = 0.020

        to_json = []
        io = StringIO()

        for idx,i in enumerate(hsvcolors):
	    pair = {}
	    pair["hue"]=i[0]
	    pair["saturation"]=i[1]
	    pair["value"]=i[2]
	
	    to_json.append(pair)

	sortedcolors = sorted(to_json, key=lambda x:x['hue'], reverse=False)
	curvePoints = self.calcCurve(sortedcolors, increaseRate)

#	translated = self.translatePoints(curvePoints)
#	scaled = self.scalePoints(translated)

        my_context = {}
        my_context['colors'] = json.dumps(to_json)    
        my_context['rgb'] = serializers.serialize("json", colors)
        my_context['curvePs'] = json.dumps(curvePoints)
        my_context['all'] = allschemes

        return render_to_response('mywebgl/index.html', my_context, context_instance=RequestContext(request))

 
    def calcCurve(self, points, increaseRate):
	curveVals = []

	t = 0.000;
	fixed = 0.000;

	while fixed <= 1.000:
	    x = 0.000;
	    y = 0.000;
	    z = 0.000;
	
	    n = len(points)-1
	    i = 0

	    while i <= n:
	        c = 0
		while c < 3:
		    nfac = math.factorial(n)
		    ifac = math.factorial(i)
		    nifac = n-i
		    nifac = math.factorial(nifac)
		    bio = nfac/(ifac*nifac)
		    if c == 0:
			x = x + (bio*math.pow((1-t),(n-i))*(math.pow(t,i))*points[i]["hue"])
		    elif c == 1:
			y = y + (bio*math.pow((1-t),(n-i))*(math.pow(t,i))*points[i]["saturation"])
		    elif c == 2:
			z = z + (bio*math.pow((1-t),(n-i))*(math.pow(t,i))*points[i]["value"])

		    c = c + 1	
		
		i = i + 1
	    
	    colorObj = {}
	    colorObj["time"] = t
	    colorObj["x"] = x
	    colorObj["y"] = y
	    colorObj["z"] = z

	    curveVals.append(colorObj)	
		
  	    t = t + increaseRate
	    t = round(t, 6)
	    fixed = round(t, 4)	

	return curveVals

    def findDerivs(self, points, increaseRate):
	derivVals = []

	return derivVals

    def updateComparisons(self):
	a = 0
	
	return a 

    def translatePoints(self, points):
	newPoints = points

	totalx = 0
	totaly = 0
	totalz = 0

	for i in points:
	    totalx = totalx + i["x"]
	    totaly = totaly + i["y"]
	    totalz = totalz + i["z"]

	totalx = totalx/(len(points))
	totaly = totaly/(len(points))
	totalz = totalz/(len(points))

	
	for i in newpoints:
	    i["x"] = i["x"]-totalx
	    i["y"] = i["y"]-totaly
	    i["z"] = i["z"]-totalz	

	return newPoints

    def scalePoints(self, points):
	newPoints = points
	
	scale = 0

	totalx = 0;
	totaly = 0;
	totalz = 0;

	for i in newPoints:
	    totalx = totalx + i["x"]
	    totaly = totaly + i["y"]
	    totalz = totalz + i["z"]

	meanx = totalx/(len(newPoints))
	meany = totaly/(len(newPoints))
	meanz = totalz/(len(newPoints))

	scaletotal = 0

	for i in newPoints:
	    scaletotal = scaletotal + math.pow((i["x"]-meanx), 2)
	    scaletotal = scaletotal + math.pow((i["y"]-meany), 2)
	    scaletotal = scaletotal + math.pow((i["z"]-meanz), 2)

	scaletotal = scaletotal/(len(newPoints))

	scale = math.sqrt(scaletotal)
	
	for i in newPoints:
	    i["x"] = (i["x"]-meanx)/scale
	    i["y"] = (i["y"]-meany)/scale
	    i["z"] = (i["z"]-meanz)/scale

	return newPoints

    def rotatePoints(self, pointsetone, pointsettwo):

#FIRST STEP FIND CENTROIDS

	totalx = 0;
	totaly = 0;
	totalz = 0;

	for i in pointsetone:
	    totalx = totalx + i["x"]
	    totaly = totaly + i["y"]
	    totalz = totalz + i["z"]

	meanx = totalx/(len(pointsetone))
	meany = totaly/(len(pointsetone))
	meanz = totalz/(len(pointsetone))

	centroidA = {}
	centroidA['x'] = meanx
	centroidA['y'] = meany
	centroidA['z'] = meanz

	totalx = 0;
	totaly = 0;
	totalz = 0;

	for i in pointsettwo:
	    totalx = totalx + i["x"]
	    totaly = totaly + i["y"]
	    totalz = totalz + i["z"]

	meanx = totalx/(len(pointsettwo))
	meany = totaly/(len(pointsettwo))
	meanz = totalz/(len(pointsettwo))

	centroidB = {}
	centroidB['x'] = meanx
	centroidB['y'] = meany
	centroidB['z'] = meanz

#SECOND STEP: FIND COVARIANCE MATRIX
#MATRIX MATH SUCKS
	H = {}	
	hposoneval = 0
	hpostwoval = 0
	hposthreeval = 0
	hposfourval = 0
	hposfiveval = 0
	hpossixval = 0
	hpossevenval = 0
	hposeightval = 0
	hposnineval = 0

	for idx, i in enumerate(pointsetone):    
	    hposoneval = hposoneval + ((pointsetone[idx]['x']-centroidA['x'])*(pointsettwo[idx]['x']-centroidB['x']))
	    hpostwoval = hpostwoval + ((pointsetone[idx]['x']-centroidA['x'])*(pointsettwo[idx]['y']-centroidB['y']))
	    hposthreeval = hposthreeval + ((pointsetone[idx]['x']-centroidA['x'])*(pointsettwo[idx]['z']-centroidB['z']))
	    hposfourval = hposfourval + ((pointsetone[idx]['y']-centroidA['y'])*(pointsettwo[idx]['x']-centroidB['x']))
	    hposfiveval = hposfiveval + ((pointsetone[idx]['y']-centroidA['y'])*(pointsettwo[idx]['y']-centroidB['y']))
	    hpossixval = hpossixval +((pointsetone[idx]['y']-centroidA['y'])*(pointsettwo[idx]['z']-centroidB['z']))
	    hpossevenval = hpossevenval + ((pointsetone[idx]['z']-centroidA['z'])*(pointsettwo[idx]['x']-centroidB['x']))
	    hposeightval = hposeightval + ((pointsetone[idx]['z']-centroidA['z'])*(pointsettwo[idx]['y']-centroidB['y']))
	    hposnineval = hposnineval + ((pointsetone[idx]['z']-centroidA['z'])*(pointsettwo[idx]['z']-centroidB['z']))

	hposoneval = hposoneval/(len(pointsetone))
	hpostwoval = hpostwoval/(len(pointsetone))
	hposthreeval = hposthreeval/(len(pointsetone))
	hposfourval = hposfourval/(len(pointsetone))
	hposfiveval = hposfiveval/(len(pointsetone))
	hpossixval = hpossixval/(len(pointsetone))
	hpossevenval = hpossevenval/(len(pointsetone))
	hposeightval = hposeightval/(len(pointsetone))
	hposnineval = hposnineval/(len(pointsetone))

	H["xx"]=hposoneval
    	H["xy"]=hpostwoval
	H["xz"]=hposthreeval
	H["yx"]=hposfourval
	H['yy']=hposfiveval
	H['yz']=hpossixval
	H['zx']=hpossevenval
	H['zy']=hposeightval
	H['zz']=hposnineval

	return H
