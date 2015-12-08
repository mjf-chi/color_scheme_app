from django.contrib import admin
from mywebgl.models import *

admin.site.register(Color, ColorAdmin)
admin.site.register(ColorScheme, ColorSchemeAdmin)
admin.site.register(ComparisonData, ComparisonDataAdmin)
