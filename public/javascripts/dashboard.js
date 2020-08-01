/**
 * Created by yuyu on 2020/5/7.
 * */

resizeContainer('cpu_chart', 'cpu_chart_div', 1, 1);
resizeContainer('disk_chart', 'disk_chart_div', 1, 1);
resizeContainer('network_line', 'network_line_div', 1, 1);
resizeContainer('io_line', 'io_line_div', 1, 1);
resizeContainer('td_line1', 'td_line1_div', 2, 1);
resizeContainer('pie_chart', 'pie_chart_div', 1, 1);
resizeContainer('dbms_line1', 'dbms_line_div', 1, 0.3);


let cup_chart_dom_id = echarts.init(document.getElementById('cpu_chart'));
let disk_chart_dom_id = echarts.init(document.getElementById('disk_chart'));
let network_line_dom_id = echarts.init(document.getElementById('network_line'));
let io_line_dom_id = echarts.init(document.getElementById('io_line'));
let td_line1_dom_id = echarts.init(document.getElementById('td_line1'));
let pie_chart_dom_id = echarts.init(document.getElementById('pie_chart'));
let dbms_line1_dom_id = echarts.init(document.getElementById('dbms_line1'));

gauge_chart(cup_chart_dom_id, [{value: 70, name: ''}]);
gauge_chart(disk_chart_dom_id, [{value: 89, name: ''}]);
network_line(network_line_dom_id, 'upload', 'download');
network_line(io_line_dom_id, 'input', 'output');
network_line(dbms_line1_dom_id, 'input', 'output');
table_line(td_line1_dom_id);
pie_chart(pie_chart_dom_id);
/**
 * ajax 由前端向后端发送请求的样例
 * Web后端对应的代码在routes/dashboard下
 */
ajax_example('arg1', 'arg2');
function ajax_example(arg1, arg2) {
    $.ajax({
        method: 'GET',
        url: "/dashboard/visualization", // 这个url是发送到对应的routes下，dashboard是发送到dashboard下
        data: {
            table: arg1,
            arg: arg2,
        },
        dataType: 'json',
        success: function(response){
            // 成功接接收Web后端的响应，在这里可以选择执行一些对前端的操作
            console.log('success, and do something here!')
            console.log(response)
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert("something wrong.");
        }
    })
}
function gauge_chart(dom_id, data) {
    let option = {
        tooltip: {
            formatter: '{a} <br/>{b} : {c}%'
        },
        toolbox: {
            feature: {
                restore: {},
                saveAsImage: {}
            }
        },
        series: [
            {
                name: '业务指标',
                type: 'gauge',
                detail: {formatter: '{value}%'},
                data: data
            }
        ]
    };
    dom_id.setOption(option);
}


function network_line(dom_id, title1, title2) {

    data = [["2000-06-05",116],["2000-06-06",129],["2000-06-07",135],["2000-06-08",86],["2000-06-09",73],["2000-06-10",85],["2000-06-11",73],["2000-06-12",68],["2000-06-13",92],["2000-06-14",130],["2000-06-15",245],["2000-06-16",139],["2000-06-17",115],["2000-06-18",111],["2000-06-19",309],["2000-06-20",206],["2000-06-21",137],["2000-06-22",128],["2000-06-23",85],["2000-06-24",94],["2000-06-25",71],["2000-06-26",106],["2000-06-27",84],["2000-06-28",93],["2000-06-29",85],["2000-06-30",73],["2000-07-01",83],["2000-07-02",125],["2000-07-03",107],["2000-07-04",82],["2000-07-05",44],["2000-07-06",72],["2000-07-07",106],["2000-07-08",107],["2000-07-09",66],["2000-07-10",91],["2000-07-11",92],["2000-07-12",113],["2000-07-13",107],["2000-07-14",131],["2000-07-15",111],["2000-07-16",64],["2000-07-17",69],["2000-07-18",88],["2000-07-19",77],["2000-07-20",83],["2000-07-21",111],["2000-07-22",57],["2000-07-23",55],["2000-07-24",60]];

    var dateList = data.map(function (item) {
        return item[0];
    });
    var valueList = data.map(function (item) {
        return item[1];
    });

    let option = {

        // Make gradient line here
        visualMap: [{
            show: false,
            type: 'continuous',
            seriesIndex: 0,
            min: 0,
            max: 400
        }, {
            show: false,
            type: 'continuous',
            seriesIndex: 1,
            dimension: 0,
            min: 0,
            max: dateList.length - 1
        }],


        title: [{
            top: '10%',
            left: 'center',
            text: title1
        }, {
            top: '50%',
            left: 'center',
            text: title2
        }],
        tooltip: {
            trigger: 'axis'
        },
        xAxis: [{
            data: dateList
        }, {
            data: dateList,
            gridIndex: 1
        }],
        yAxis: [{
            splitLine: {show: false}
        }, {
            splitLine: {show: false},
            gridIndex: 1
        }],
        grid: [{
            bottom: '60%'
        }, {
            top: '60%'
        }],
        series: [{
            type: 'line',
            showSymbol: false,
            data: valueList
        }, {
            type: 'line',
            showSymbol: false,
            data: valueList,
            xAxisIndex: 1,
            yAxisIndex: 1
        }]
    };

    dom_id.setOption(option);
}

function table_line(dom_id) {
    function randomData() {
        now = new Date(+now + oneDay);
        value = value + Math.random() * 21 - 10;
        return {
            name: now.toString(),
            value: [
                [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-'),
                Math.round(value)
            ]
        }
    }

    var data = [];
    var now = +new Date(2018, 5, 6);
    var oneDay = 24 * 3600 * 1000;
    var value = Math.random() * 1000;
    for (var i = 0; i < 1000; i++) {
        data.push(randomData());
    }

    let option = {
        title: {
            text: ''
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                params = params[0];
                var date = new Date(params.name);
                return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
            },
            axisPointer: {
                animation: false
            }
        },
        xAxis: {
            type: 'time',
            splitLine: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '100%'],
            splitLine: {
                show: false
            }
        },
        series: [{
            name: '模拟数据',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data: data
        }]
    };

    setInterval(function () {

        for (var i = 0; i < 5; i++) {
            data.shift();
            data.push(randomData());
        }

        dom_id.setOption({
            series: [{
                data: data
            }]
        });
    }, 1000);

    dom_id.setOption(option);
}

function pie_chart(dom_id) {
    let option = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            // orient: 'vertical',
            left: 10,
            data: ['Success', 'Fail', 'Hang-up', 'Block']
        },
        series: [
            {
                name: '任务运行状况',
                type: 'pie',
                radius: ['40%', '50%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'inside',
                        formatter: '{b}\n\n{c} ({d}%)',//模板变量有 {a}、{b}、{c}、{d}，分别表示系列名，数据名，数据值，百分比。{d}数据会根据value值计算百分比
                    },
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    {value: 335, name: 'Fail'},
                    {value: 310, name: 'Hang-up'},
                    {value: 234, name: 'Success'},
                    {value: 135, name: 'Block'},
                ]
            }
        ]
    };
    dom_id.setOption(option);
}
//用于使chart自适应高度和宽度,通过窗体高宽计算容器高宽
function resizeContainer(chart_id, chart_div, width_ratio = 1, height_ratio = false) {
    let container = document.getElementById(chart_id);
    container.style.width = $("#"+chart_div).width() * width_ratio + 'px';
    if (height_ratio != false){
        // 有长宽比例的时候
        container.style.height = $("#"+chart_id).width() * height_ratio + 'px';
    }
}


