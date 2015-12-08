from django.conf.urls import patterns, include, url

from django.contrib import admin
from mywebgl.views import ColorView
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'django_project.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^webglresearchlab/', 'mywebgl.views.WebGLHomeView', name='webgl-home'),
    url(r'^colors/$', ColorView.as_view(), name='no-color-scheme'),
    url(r'^colors/(?P<schemenum>\d+)/$', ColorView.as_view(), name='color-scheme'),
    url(r'^admin/', include(admin.site.urls)),
)
