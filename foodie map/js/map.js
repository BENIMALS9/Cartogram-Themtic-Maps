var chart_map = echarts.init(document.getElementById('rightmap'));

var label_data;

var c_label_data;

var line_data;

var map_color = gz_color;

var label =  $.ajax({
    url: "../data/gz_poinum_poi.geojson",//json文件位置，文件名
    type: "GET",//请求方式为get
    dataType: "json", //返回数据格式为json
    async: false,
    success: function(data) {//请求成功完成后要执行的方法
        label_data = data.features;
    }
});

var c_label =  $.ajax({
    url: "../data/gz_poinum_circle.geojson",//json文件位置，文件名
    type: "GET",//请求方式为get
    dataType: "json", //返回数据格式为json
    async: false,
    success: function(data) {//请求成功完成后要执行的方法
        c_label_data = data.features;
    }
});

var centroid =  $.ajax({
    url: "../data/gz_poinum_cen.geojson",//json文件位置，文件名
    type: "GET",//请求方式为get
    dataType: "json", //返回数据格式为json
    async: false,
    success: function(data) {//请求成功完成后要执行的方法
        centroid_data = data.features;
    }
});

var line =  $.ajax({
    url: "../data/gz_square_line.geojson",//json文件位置，文件名
    type: "GET",//请求方式为get
    dataType: "json", //返回数据格式为json
    async: false,
    success: function(data) {//请求成功完成后要执行的方法
        line_data = data.features;
    }
});

var map_label_data = [];
var map_c_label_data = [];
var centroid_label_data = [];
var Lines=[];

for (var i = 0; i < label_data.length; i++) {
    var geoCoord = [label_data[i]['properties'].lng84, label_data[i]['properties'].lat84];
    var geoValue = geoCoord.concat(label_data[i]['properties'].type_1);
    geoValue = geoValue.concat((label_data[i]['properties'].taste_score + label_data[i]['properties'].environment_score + label_data[i]['properties'].service_score) / 3);
    geoValue = geoValue.concat((label_data[i]['properties'].rest_review));
    map_label_data.push({
        name: label_data[i]['properties'].rest_name,
        value:geoValue,
    });
}

for (var i = 0; i < c_label_data.length; i++) {
    var geoCoord = [c_label_data[i]['properties'].lng84, c_label_data[i]['properties'].lat84];
    var geoValue = geoCoord.concat(c_label_data[i]['properties'].type_1);
    geoValue = geoValue.concat((c_label_data[i]['properties'].taste_score + c_label_data[i]['properties'].environment_score + c_label_data[i]['properties'].service_score) / 3);
    geoValue = geoValue.concat((label_data[i]['properties'].rest_review));
    map_c_label_data.push({
        name: c_label_data[i]['properties'].rest_name,
        value:geoValue,
    });
}

for (var i = 0; i < centroid_data.length; i++) {
    var geoCoord = [centroid_data[i]['properties'].lng84, centroid_data[i]['properties'].lat84];
    var geoValue = geoCoord.concat(centroid_data[i]['properties'].poi_num);
    centroid_label_data.push({
        name: centroid_data[i]['properties'].cluster_ID,
        value:geoValue,
    });
}

for(var i=0;i<line_data.length;i++){
    var points = [];
    for(var j=0;j<line_data[i].geometry.coordinates[0].length;j++){
        points.push([line_data[i].geometry.coordinates[0][j][0], line_data[i].geometry.coordinates[0][j][1]]);
    }
    Lines.push({
        coords: points,// 坐标这个数据是必须给的
        name:line_data[i].properties.cluster_ID,// 类似name还可以根据自己的需求给更多的数据
        lineStyle: { //给每条线都不同的样式
            normal: {
                color: 'black',
                width: 1,
                type: 'dashed'
            }
        }
    });
};


var option4 = {
    tooltip: {

    },
    geo: {
        map: "gz",
        roam: true,
        label: {
            normal: {
                show: false
            },
            emphasis: {
                show: false
            }
        },
        itemStyle: {
            normal: {
                areaColor: '#000000',
                borderColor: '#000000',
                borderWidth: 0.1
            }
        },
        aspectScale:1,
        zoom:1.5,
        center: [113.5, 23.2],
        regions: map_color
    },
    series: [
        {
            name: "foodie cartogram map", // 展示名称
            type: "map", // 地图类型
            map: 'gz', // 需要展示的注册地图对应名称
            emphasis: {
                label: {
                    show: false
                }
            },
            roam:true,
            geoIndex:0
        },
        {
            name: '美食POI',
            type: 'scatter',
            coordinateSystem: 'geo',
            symbol: function(val) {
                return 'image://../icon/' + val[2] + '.png';
            },
            symbolSize: function(val) {
                return 10 + (5 - val[3]) / 1.1  * 15;
            },
            tooltip: {
                trigger: "item",
                formatter: function (params) {
                    let point_data = params
                    let str = params.seriesName + "<br/ >"
                    str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:blue;"></span>' + '美食店铺名' + " : " + point_data.data.name + "<br />";
                    str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:red;"></span>' + '美食类型' + " : " + point_data.data.value[2] + "<br />";
                    str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:yellow;"></span>' + '用户评分' + " : " + point_data.data.value[3] + "<br />";
                    str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:green;"></span>' + '评论数量' + " : " + point_data.data.value[4] + "<br />";
                    return str
                }
            },
            label: {
                show: false
            },
            itemStyle: {
                normal: {
                    color: '#F62157',
                }
            },
            // zlevel: 6,
            data: map_label_data
        },
        {
            name: '美食圈美食POI',
            type: 'scatter',
            coordinateSystem: 'geo',
            symbol: function(val) {
                return 'image://../icon/' + val[2] + '.png';
            },
            symbolSize: function(val) {
                return 10 + (5 - val[3]) / 1.1  * 15;
            },
            tooltip: {
                trigger: "item",
                formatter: function (params) {
                    let point_data = params
                    let str = params.seriesName + "<br/ >"
                    str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:blue;"></span>' + '美食店铺名' + " : " + point_data.data.name + "<br />";
                    str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:red;"></span>' + '美食类型' + " : " + point_data.data.value[2] + "<br />";
                    str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:yellow;"></span>' + '用户评分' + " : " + point_data.data.value[3] + "<br />";
                    str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:green;"></span>' + '评论数量' + " : " + point_data.data.value[4] + "<br />";
                    return str
                }
            },
            label: {
                show: false
            },
            itemStyle: {
                normal: {
                    color: '#F62157',
                }
            },
            // zlevel: 6,
            data: map_c_label_data
        },
        {
            name: '美食圈',
            type: 'scatter',
            coordinateSystem: 'geo',
            symbol: 'image://../icon/商业圈.png',
            symbolSize: function(val) {
                return 10 + val[2] * 2;
            },
            tooltip: {
                trigger: "item",
                formatter: function (params) {
                    let point_data = params
                    let str = params.seriesName + "<br/ >"
                    str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:blue;"></span>' + '美食圈ID' + " : " + point_data.data.name + "<br />";
                    str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:red;"></span>' + '圈内筛选POI数量' + " : " + point_data.data.value[2] + "<br />";
                    return str
                }
            },
            label: {
                show: false
            },
            itemStyle: {
                normal: {
                    color: '#F62157',
                }
            },
            // zlevel: 6,
            data: centroid_label_data
        },
        {
            type: 'lines',
            coordinateSystem: 'geo',
            polyline: true,
            data: Lines,
            lineStyle: {
                normal: {
                    opacity: 1,
                    width: 2
                }
            }
        }
    ]
}

chart_map.setOption(option4, true)

chart_map.on('georoam', function (params) {
    let _option = chart_map.getOption();
 	let _zoom = _option.geo[0].zoom;
    _option.series[1].symbolSize = _zoom
 });

 function switch_City(city_id){
    // gz zoom 1.5 113.5, 23.2
    // cd zoom 1.3 104.1, 30.6
    // wh zoom 1.3 114.4, 30.6
    // cq xoom 1.3 106.48, 29.50 
    if (city_id == 'gz'){
        var map_zoom = 1.5;
        var map_center = [113.5, 23.2];
        var map_color = gz_color;
        var symbol_size = 10;
    }
    else if (city_id == 'wh'){
        var map_zoom = 1.2;
        var map_center = [114.4, 30.6];
        var map_color = wh_color;
        var symbol_size = 15;
    }
    if (city_id == 'cd'){
        var map_zoom = 1.2;
        var map_center = [104.1, 30.6];
        var map_color = cd_color;
        var symbol_size = 15;
    }
    if (city_id == 'cq'){
        var map_zoom = 1.2;
        var map_center = [106.48, 29.50];
        var map_color = cq_color;
        var symbol_size = 15;
    }

    var label_data;

    var c_label_data;

    var line_data;

    var label =  $.ajax({
        url: "../data/" + city_id + "_poinum_poi.geojson",//json文件位置，文件名
        type: "GET",//请求方式为get
        dataType: "json", //返回数据格式为json
        async: false,
        success: function(data) {//请求成功完成后要执行的方法
            label_data = data.features;
        }
    });

    var c_label =  $.ajax({
        url: "../data/" + city_id + "_poinum_circle.geojson",//json文件位置，文件名
        type: "GET",//请求方式为get
        dataType: "json", //返回数据格式为json
        async: false,
        success: function(data) {//请求成功完成后要执行的方法
            c_label_data = data.features;
        }
    });

    var centroid =  $.ajax({
        url: "../data/" + city_id + "_poinum_cen.geojson",//json文件位置，文件名
        type: "GET",//请求方式为get
        dataType: "json", //返回数据格式为json
        async: false,
        success: function(data) {//请求成功完成后要执行的方法
            centroid_data = data.features;
        }
    });

    var line =  $.ajax({
        url: "../data/" + city_id + "_square_line.geojson",//json文件位置，文件名
        type: "GET",//请求方式为get
        dataType: "json", //返回数据格式为json
        async: false,
        success: function(data) {//请求成功完成后要执行的方法
            line_data = data.features;
        }
    });

    var map_label_data = [];
    var map_c_label_data = [];
    var centroid_label_data = [];
    var Lines=[];

    for (var i = 0; i < label_data.length; i++) {
        var geoCoord = [label_data[i]['properties'].lng84, label_data[i]['properties'].lat84];
        var geoValue = geoCoord.concat(label_data[i]['properties'].type_1);
        geoValue = geoValue.concat((label_data[i]['properties'].taste_score + label_data[i]['properties'].environment_score + label_data[i]['properties'].service_score) / 3);
        geoValue = geoValue.concat((label_data[i]['properties'].rest_review));
        map_label_data.push({
            name: label_data[i]['properties'].rest_name,
            value:geoValue,
        });
    }

    for (var i = 0; i < c_label_data.length; i++) {
        var geoCoord = [c_label_data[i]['properties'].lng84, c_label_data[i]['properties'].lat84];
        var geoValue = geoCoord.concat(c_label_data[i]['properties'].type_1);
        geoValue = geoValue.concat((c_label_data[i]['properties'].taste_score + c_label_data[i]['properties'].environment_score + c_label_data[i]['properties'].service_score) / 3);
        geoValue = geoValue.concat((c_label_data[i]['properties'].rest_review));
        map_c_label_data.push({
            name: c_label_data[i]['properties'].rest_name,
            value:geoValue,
        });
    }

    for (var i = 0; i < centroid_data.length; i++) {
        var geoCoord = [centroid_data[i]['properties'].lng84, centroid_data[i]['properties'].lat84];
        var geoValue = geoCoord.concat(centroid_data[i]['properties'].poi_num);
        centroid_label_data.push({
            name: centroid_data[i]['properties'].cluster_ID,
            value:geoValue,
        });
    }

    for(var i=0;i<line_data.length;i++){
        var points = [];
        for(var j=0;j<line_data[i].geometry.coordinates[0].length;j++){
            points.push([line_data[i].geometry.coordinates[0][j][0], line_data[i].geometry.coordinates[0][j][1]]);
        }
        Lines.push({
            coords: points,// 坐标这个数据是必须给的
            name:line_data[i].properties.cluster_ID,// 类似name还可以根据自己的需求给更多的数据
            lineStyle: { //给每条线都不同的样式
                normal: {
                    color: 'black',
                    width: 1,
                    type: 'dashed'
                }
            }
        });
    };
    
    var option = {
        tooltip: {
    
        },
        geo: {
            map: city_id,
            roam: true,
            label: {
                normal: {
                    show: false
                },
                emphasis: {
                    show: false
                }
            },
            itemStyle: {
                normal: {
                    areaColor: '#000000',
                    borderColor: '#000000',
                    borderWidth: 0.1
                }
            },
            aspectScale:1,
            zoom:map_zoom,
            center: map_center,
            regions: map_color
        },
        series: [
            {
                name: "foodie cartogram map", // 展示名称
                type: "map", // 地图类型
                map: city_id, // 需要展示的注册地图对应名称
                emphasis: {
                    label: {
                        show: false
                    }
                },
                roam:true,
                geoIndex:0
            },
            {
                name: '美食POI',
                type: 'scatter',
                coordinateSystem: 'geo',
                symbol: function(val) {
                    return 'image://../icon/' + val[2] + '.png';
                },
                symbolSize: function(val) {
                    return symbol_size + (5 - val[3]) / 1.1  * 15;
                },
                tooltip: {
                    trigger: "item",
                    formatter: function (params) {
                        let point_data = params
                        let str = params.seriesName + "<br/ >"
                        str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:blue;"></span>' + '美食店铺名' + " : " + point_data.data.name + "<br />";
                        str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:red;"></span>' + '美食类型' + " : " + point_data.data.value[2] + "<br />";
                        str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:yellow;"></span>' + '用户评分' + " : " + point_data.data.value[3] + "<br />";
                        str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:green;"></span>' + '评论数量' + " : " + point_data.data.value[4] + "<br />";
                        return str
                    }
                },
                label: {
                    show: false
                },
                itemStyle: {
                    normal: {
                        color: '#F62157',
                    }
                },
                // zlevel: 6,
                data: map_label_data
            },
            {
                name: '美食圈美食POI',
                type: 'scatter',
                coordinateSystem: 'geo',
                symbol: function(val) {
                    return 'image://../icon/' + val[2] + '.png';
                },
                symbolSize: function(val) {
                    return symbol_size + (5 - val[3]) / 1.1  * 15;
                },
                tooltip: {
                    trigger: "item",
                    formatter: function (params) {
                        let point_data = params
                        let str = params.seriesName + "<br/ >"
                        str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:blue;"></span>' + '美食店铺名' + " : " + point_data.data.name + "<br />";
                        str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:red;"></span>' + '美食类型' + " : " + point_data.data.value[2] + "<br />";
                        str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:yellow;"></span>' + '用户评分' + " : " + point_data.data.value[3] + "<br />";
                        str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:green;"></span>' + '评论数量' + " : " + point_data.data.value[4] + "<br />";
                        return str
                    }
                },
                label: {
                    show: false
                },
                itemStyle: {
                    normal: {
                        color: '#F62157',
                    }
                },
                // zlevel: 6,
                data: map_c_label_data
            },
            {
                name: '美食圈',
                type: 'scatter',
                coordinateSystem: 'geo',
                symbol: 'image://../icon/商业圈.png',
                symbolSize: function(val) {
                    return symbol_size + val[2] * 2;
                },
                tooltip: {
                    trigger: "item",
                    formatter: function (params) {
                        let point_data = params
                        let str = params.seriesName + "<br/ >"
                        str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:blue;"></span>' + '美食圈ID' + " : " + point_data.data.name + "<br />";
                        str = str + '<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;left:5px;background-color:red;"></span>' + '圈内筛选POI数量' + " : " + point_data.data.value[2] + "<br />";
                        return str
                    }
                },
                label: {
                    show: false
                },
                itemStyle: {
                    normal: {
                        color: '#F62157',
                    }
                },
                // zlevel: 6,
                data: centroid_label_data
            },
            {
                type: 'lines',
                coordinateSystem: 'geo',
                polyline: true,
                data: Lines,
                lineStyle: {
                    normal: {
                        opacity: 1,
                        width: 2
                    }
                }
            }
        ]
    }
    
    chart_map.setOption(option, true)
 }