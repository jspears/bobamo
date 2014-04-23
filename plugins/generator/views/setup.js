var views//${nl()} =  {{json pluginManager.reconfigure}}
views = views || [];
define(views, function () {
        console.log('setup views', views);
        if (views.length > 0)
            window.location.href = '${plugin.baseUrl}setup.html'


    }
)