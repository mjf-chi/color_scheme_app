from django.db import models
from django.contrib import admin
from string import join
from os.path import join as pjoin
import math

class Color(models.Model):
    name = models.CharField(max_length=50, blank=True)
    red = models.IntegerField(default=0)
    green = models.IntegerField(default=0)
    blue = models.IntegerField(default=0)
 
    def __unicode__(self):
	return self.name

    def rgb_hsv(self):
	r = float(self.red/255.0)
	g = float(self.green/255.0)
	b = float(self.blue/255.0)

	mx = max(r, g, b)
	mn = min(r, g, b)
	df = mx-mn
	
	if mx == mn:
	    h = 0
	elif mx == r:
	    h = (60 * ((g-b)/df)+360) % 360
	elif mx == g:
	    h = (60 * ((b-r)/df)+120) % 360
	elif mx == b:
	    h = (60 * ((r-g)/df)+240) % 360
	if mx == 0:
	    s = 0
	else:
	    s = df/mx
	v = mx

	return h,s,v

class ColorScheme(models.Model):
    name = models.CharField(max_length=50, blank=True)
    colors = models.ManyToManyField(Color, blank=True)
    created = models.DateTimeField(auto_now_add=True)

    def colors_(self):
	lst = [x[1] for x in self.colors.values_list()]
	return str(join(lst, ', '))

    def __unicode__(self):
	return self.name

class ComparisonData(models.Model):
    name = models.CharField(max_length=50, blank=True)
    schemeid = models.IntegerField(blank=True)
    difference = models.FloatField(blank=True)

    def __unicode__(self):
	return self.name

class ColorAdmin(admin.ModelAdmin):
    list_display = ["name"]

class ColorSchemeAdmin(admin.ModelAdmin):
    list_display = ["name", "colors_", "created"]

class ComparisonDataAdmin(admin.ModelAdmin):
    list_display = ["name"]
