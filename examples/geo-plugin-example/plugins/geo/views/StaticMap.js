define(['underscore'],function(_){

    var conf //${nl()}= {{json model.defaults || {} }}
    var apiKey = '${plugin.conf.apiKey}'
    return function(options){
        options = _.extend({height:100,width:150,zoomLevel:13,
            sensor:false}, conf, options, this.options);
        //&markers=color:blue%7Clabel:S%7C62.107733,-145.541936
        return function(value){
            var url = 'http://maps.googleapis.com/maps/api/staticmap?center='+value.lat
                +','+value.lon+'&size='+options.width+'x'+options.height;
               if (options.zoomLevel)
                url+='&zoom='+options.zoomLevel;
               if (options.scale)
                url+='&scale='+options.scale;
               var marker =[];
               if (options.markerColor){
                   marker.push("color:"+options.markerColor);
               }
               if (options.markerIcon){
                   marker.push("icon:"+urlencoded(options.markerIcon));
               }
               if (options.markerLabel){
                   marker.push('label:'+options.markerLabel);
               }
               marker.push(value.lat+','+value.lon);
               url+="&markers="+marker.join('%7C');



                url+='&sensor='+options.sensor
                if (apiKey)
                    url+='&key='+apiKey
                ;
            this.$el.html('<img alt="'+ value.formatted_address +'" height="'+options.height+'" width="'+ options.width +'" src="'+url+'"/>');
        }
    };
});