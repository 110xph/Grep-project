resizeContainer('sq_performance', 'performance_div', 0.95, 0.8);
resizeContainer('trans_performance', 'performance_div', 0.95, 0.8);
resizeContainer('server_graph_chart', 'partition_div', 1.5, 0.5);
// resizeContainer('row_subgraph', 'row_div', 1, 0.5);

//resizeContainer('data_graph_chart', 'graph_chart_div', 1, 0.6);
// resizeContainer('cpu_chart', 'cpu_chart_div', 1, 0.85);
//resizeContainer('bar', 'bar_div', 1, 0.85);
//resizeContainer('disk_chart', 'disk_chart_div', 1, 0.6);  ???

//let bar_dom_id = echarts.init(document.getElementById('bar'));
let trans_performance_dom_id = echarts.init(document.getElementById('trans_performance'));
let sql_performance_dom_id = echarts.init(document.getElementById('sq_performance'));
let server_graph_chart_dom_id = echarts.init(document.getElementById('server_graph_chart'));
//let data_graph_chart_dom_id = echarts.init(document.getElementById('data_graph_chart'));
//let cpu_chart_dom_id = echarts.init(document.getElementById('cpu_chart'));
//let dgraph_dom_id = echarts.init(document.getElementById('server_graph_chart'));
let d_graph_dom_id = echarts.init(document.getElementById('server_graph_chart'));

// let row_subgraph_dom_id = echarts.init(document.getElementById('row_subgraph'));
$(function () { $("[data-toggle='popover']").popover(); });

var s_graph;
$.get('/about/actual-graph', function (xml) {
    s_graph = dataTool.gexf.parse(xml);
    var categories = [];
    for (var i = 0; i < 9; i++) {
        categories[i] = {
            name: '类目' + i
        };
    }
    s_graph.nodes.forEach(function (node) {
        node.itemStyle = null;
        node.value = node.symbolSize;
        // node.label.normal.show = node.symbolSize > 30;
        node.label = {
            show: true
        };
        node.category = node.attributes.modularity_class;

    });}, 'xml');

//addQueryRow()

//let disk_chart_dom_id = echarts.init(document.getElementById('disk_chart'));

// graph_chart(server_graph_chart_dom_id, [{value: 70, name: ''}]);
// data_graph_chart(data_graph_chart_dom_id, [{value: 70, name: ''}]);
//gauge_chart(cpu_chart_dom_id, [{value: 70, name: ''}]);
//gauge_chart(disk_chart_dom_id, [{value: 89, name: ''}]);
//bar_chart(bar_dom_id)
// subgraph_chart(row_subgraph_dom_id, [{value: 70, name: ''}]);

function showDemo(dom_id) {
    demoInfo.innerHTML = "Dataset:TPC-H | Size:0.1x | Queries:3000";
    var body = document.getElementsByTagName("body")[0];
    // create elements <table> and a <tbody>
    var tbl = document.createElement("table");
    var tblBody = document.createElement("tbody");

    // cells creation
    var pdata = [["Table.Key","Node1","Node2","Node3","Node4","Node5"],
        ["supplier.s_suppkey","0.1","0.3","0.3","0.2","0.1"],
        ["part.p_partkey","0.3","0.3","0.1","0.2","0.1"],
        ["partsupp.ps_pkey","0.2","0.25","0.25","0.23","0.07"],
        ["customer.c_ctkey","0.2","0.1","0.3","0.3","0.3"],
        ["orders.o_orderkey","0.13","0.13","0.24","0.24","0.26"],
        ["lineitem.p_partkey","0.2","0.3","0.3","0.1","0.1"],
        ["nation.p_partkey","0.3","0.3","0.3","0.05","0.05"],
        ["region.p_partkey","0.1","0.1","0.1","0.35","0.35"]];
    for (var j = 0; j < pdata.length; j++) {
        // table row creation
        var row = document.createElement("tr");

        for (var i = 0; i < 6; i++) {
            // create element <td> and text node
            //Make text node the contents of <td> element
            // put <td> at end of the table row
            var cell = document.createElement("td");
            //var cellText = document.createTextNode("cell is row " + j + ", column " + i);
            var cellText = document.createTextNode(pdata[j][i])

            cell.appendChild(cellText);
            row.appendChild(cell);
        }

        //row added to end of table body
        tblBody.appendChild(row);
    }

    // append the <tbody> inside the <table>
    tbl.appendChild(tblBody);
    // put <table> in the <body>
    body.appendChild(tbl);
    // tbl border attribute to
    tbl.setAttribute("border", "2");

    var divContainer = document.getElementById("partitionscheme");
    divContainer.innerHTML = "";
    divContainer.appendChild(tbl);

    ourPartition();
    commitDataset();
    table_line(trans_performance_dom_id, 'upload', 'download');
    table_line(sql_performance_dom_id, 'upload', 'download');
}

function addRow(tbodyID)
{
    var bodyObj=document.getElementById(tbodyID);
    if(bodyObj==null)
    {
        alert("Body of Table not Exist!");
        return;
    }
    var rowCount = bodyObj.rows.length;
    var cellCount = bodyObj.rows[0].cells.length;
    var newRow = bodyObj.insertRow(rowCount++);
    for(var i=0;i<cellCount;i++)
    {
        var cellHTML = bodyObj.rows[0].cells[i].innerHTML;
        if(cellHTML.indexOf("none")>=0)
        {
            cellHTML = cellHTML.replace("none","");
        }
        newRow.insertCell(i).innerHTML=cellHTML;
    }
}

function addQueryRow(){
    $("#ptable").bootstrapTable('destroy');
    var columns = [
        {
            field:"graph",
            title: 'Graph Model'
        },
        {
            field: 'time',
            title: 'Actual Latency'
        },
        {
            field: 'partition',
            title: '划分加速比例'
        },
        {
            field: 'tune',
            title: '调参加速比例'
        },
        {
            field: 'error',
            title: '预测误差'
        }];
    var data= [
    ];
//bootstrap table初始化数据
    $('#ptable').bootstrapTable({
        toolbar:"#toolbar",
        data:data,
        columns: columns,
    });
    var idCar=new Array();
    for (var j = 0; j < 10; j++) {
        var cnt = $("#ptable").bootstrapTable('getData').length;
        var inta = 1.5*Math.random();

        var graphid = 20*Math.random();
        graphid = graphid.toFixed(0);
        while(idCar.includes(graphid))
        {
            graphid = 20*Math.random();
            graphid = graphid.toFixed(0);
        }
        idCar.push(graphid);
        console.log(idCar);

        var latency = 10*Math.random();
        var partition = 50*Math.random();
        var tune = 20*Math.random();

        console.log(cnt);

        inta = inta.toFixed(2);
        latency = latency.toFixed(2);
        partition = partition.toFixed(2);
        tune = tune.toFixed(2);

        $("#ptable").bootstrapTable('insertRow', {
            index: cnt,
            row: {
                graph: "#subgraph"+graphid.toString(),
                time: latency.toString()+' s',
                partition: partition+'%',
                tune: tune.toString()+'%',
                error: inta.toString()+'%'
            }
        });
    }
}

function removeRow(inputobj)
{
    if(inputobj==null) return;
    var parentTD = inputobj.parentNode;
    var parentTR = parentTD.parentNode;
    var parentTBODY = parentTR.parentNode;
    parentTBODY.removeChild(parentTR);
}

function fileSelected() {
    var file = document.getElementById('fileToUpload').files[0];
    if (file) {
        var fileSize = 0;
        if (file.size > 1024 * 1024)
            fileSize = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
        else
            fileSize = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';

//        document.getElementById('fileName').innerHTML = 'Name: ' + file.name;
        document.getElementById('fileSize').innerHTML = 'Size: ' + fileSize;
//        document.getElementById('fileType').innerHTML = 'Type: ' + file.type;
    }
}

function uploadFile() {
    var fd = new FormData();
    var url = 'design';
    fd.append("fileToUpload", document.getElementById('fileToUpload').files[0]);
    var xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", uploadProgress, false);
    xhr.addEventListener("load", uploadComplete, false);
    xhr.addEventListener("error", uploadFailed, false);
    xhr.addEventListener("abort", uploadCanceled, false);
    xhr.open("POST", url, true);
    xhr.onloadend = function() {
        if(xhr.status == 404)
            throw new Error(url + ' replied 404');
    }
    xhr.send(fd);
}

function showDataByText() {
    var resultFile = document.getElementById("fileToUpload").files[0];

    var fd = new FormData();
    fd.append("fileToUpload", document.getElementById('fileToUpload').files[0]);
    var xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", uploadProgress, false);
//    xhr.send(fd);

    if (resultFile) {
        var reader = new FileReader();
        reader.readAsText(resultFile,'UTF-8');
        reader.onload = function (e) {
            var urlData = this.result;
            document.getElementById("result").innerHTML += urlData;
        };
    }
}

function uploadProgress(evt) {
    if (evt.lengthComputable) {
        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
        document.getElementById('progressNumber').innerHTML = percentComplete.toString() + '%';
    }
    else {
        document.getElementById('progressNumber').innerHTML = '无法计算';
    }
}

function uploadComplete(evt) {
    /* 当服务器响应后，这个事件就会被触发 */
    alert(evt.target.responseText);
}

 function uploadFailed(evt) {
    alert("上传文件发生了错误尝试");
}

function uploadCanceled(evt) {
    alert("上传被用户取消或者浏览器断开连接");
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

function showLocalServer(id) {
    // var divContainer = document.getElementById("server_graph_chart");
    // divContainer.innerHTML = "";

    serverInfo.innerHTML = "# Cluster-local, Total: 11";

//    graph_chart(server_graph_chart_dom_id, [{value: 70, name: ''}]);

    server_graph_chart_dom_id.innerHTML = "";
    server_graph_chart_dom_id.showLoading();
    $.get('/about/server-graph', function (xml) {
        server_graph_chart_dom_id.hideLoading();
        var graph = dataTool.gexf.parse(xml);
        var categories = [];
        categories[0] = {name: "166.111.121.x"}
        categories[1] = {name: "172.6.31.x"}

        graph.nodes.forEach(function (node) {
            node.itemStyle = null;
            node.value = node.symbolSize;
            // node.label.normal.show = node.symbolSize > 30;
            node.category = node.attributes.modularity_class;
        });
        option = {
            title: {
                text: 'Les Miserables',
                subtext: 'Default layout',
                top: 'bottom',
                left: 'right'
            },
            tooltip: {},
            legend: [{
                // selectedMode: 'single',
                data: categories.map(function (a) {
                    return a.name;
                })
            }],
            animationDuration: 1500,
            animationEasingUpdate: 'quinticInOut',
            series : [
                {
                    name: 'Server Info',
                    type: 'graph',
                    layout: 'none',
                    data: graph.nodes,
                    links: graph.links,
                    categories: categories,
                    roam: true,
                    label: {
                        normal: {
                            position: 'right'
                        }
                    },
                    lineStyle: {
                        normal: {
                            curveness: 0.3
                        }
                    }
                }
            ]
        };
        server_graph_chart_dom_id.setOption(option);

    }, 'xml');

    server_graph_chart_dom_id.on('click', function (params){
        console.log(params.name);
        var dvalue = 26 + Math.random()*10;
        var cvalue = 0.81 + Math.random()*2;
        var ivalue = 1.23 + Math.random()*2;
        dvalue = dvalue.toFixed(2);
        cvalue = cvalue.toFixed(2);
        ivalue = ivalue.toFixed(2);

        $("#diskbar").css("width",dvalue+ + "%").text(dvalue + "%");
        $("#cpubar").css("width",cvalue + "%").text(cvalue + "%");
        $("#iobar").css("width",ivalue + "%").text(ivalue + "%");
        nodelabel.innerHTML = params.name;
    });

    //gauge_chart(cpu_chart_dom_id, [{value: 81, name: ''}]);
    //d_graph_chart(d_graph_dom_id);
}

function showLocalWorkload(id) {
    workloadInfo.innerHTML = "# Type: TPC-H";
}

function showLocalData(id) {
    dataInfo.innerHTML = "# Size: 100M";
}

function selectPartitionFunc(dom_id){
    // console.log(dom_id.selectedIndex);
    // server_graph_chart_dom_id;
    var idx = document.getElementById("partitionselect").selectedIndex;

    //    var nSel = document.getElementById("partitionselect");
    //    var index = nSel.selectedIndex; // 选中索引
    //    var text = nSel.options[index].text; // 选中文本
    // console.log(index);
    if (idx == "1"){//performance
        table_line(trans_performance_dom_id, 'upload', 'download');
        table_line(sql_performance_dom_id, 'upload', 'download');
    } //performance
    else if (idx == "2"){// partition scheme
        var body = document.getElementsByTagName("body")[0];
        // create elements <table> and a <tbody>
        var tbl = document.createElement("table");
        var tblBody = document.createElement("tbody");

        // cells creation
        var pdata = [["Table.Key","Node1","Node2","Node3","Node4","Node5"],
            ["supplier.s_suppkey","0.1","0.3","0.3","0.2","0.1"],
            ["part.p_partkey","0.3","0.3","0.1","0.2","0.1"],
            ["partsupp.ps_pkey","0.2","0.25","0.25","0.23","0.07"],
            ["customer.c_ctkey","0.2","0.1","0.3","0.3","0.3"],
            ["orders.o_orderkey","0.13","0.13","0.24","0.24","0.26"],
            ["lineitem.p_partkey","0.2","0.3","0.3","0.1","0.1"],
            ["nation.p_partkey","0.3","0.3","0.3","0.05","0.05"],
            ["region.p_partkey","0.1","0.1","0.1","0.35","0.35"]];
        for (var j = 0; j < pdata.length; j++) {
            // table row creation
            var row = document.createElement("tr");

            for (var i = 0; i < 6; i++) {
                // create element <td> and text node
                //Make text node the contents of <td> element
                // put <td> at end of the table row
                var cell = document.createElement("td");
                //var cellText = document.createTextNode("cell is row " + j + ", column " + i);
                var cellText = document.createTextNode(pdata[j][i])

                cell.appendChild(cellText);
                row.appendChild(cell);
            }

            //row added to end of table body
            tblBody.appendChild(row);
        }

        // append the <tbody> inside the <table>
        tbl.appendChild(tblBody);
        // put <table> in the <body>
        body.appendChild(tbl);
        // tbl border attribute to
        tbl.setAttribute("border", "2");

        var divContainer = document.getElementById("partitionscheme");
        divContainer.innerHTML = "";
        divContainer.appendChild(tbl);
    }

}

function starttune(dom_id){
    tuneInfo.innerHTML = "Tuned Parameters: 6";

}

function resettune(dom_id){
    resetInfo.innerHTML = "Reset Parameters: 6";
}


function ourPartition(dom_id){
    server_graph_chart_dom_id.showLoading();
    $.get('/about/simulate-graph', function (xml) {
        server_graph_chart_dom_id.hideLoading();
        var graph = dataTool.gexf.parse(xml);
        var categories = [];
        categories[0] = {name: "Chosen Node"};
        categories[1] = {name: "Left Node"};

        graph.nodes.forEach(function (node) {
            node.itemStyle = null;
            node.value = node.symbolSize;
            // node.label.normal.show = node.symbolSize > 30;
            node.category = node.attributes.modularity_class;
        });
        option = {
            title: {
                text: 'Les Miserables',
                subtext: 'Default layout',
                top: 'bottom',
                left: 'right'
            },
            tooltip: {},
            legend: [{
                // selectedMode: 'single',
                data: categories.map(function (a) {
                    return a.name;
                })
            }],
            animationDuration: 1500,
            animationEasingUpdate: 'quinticInOut',
            series : [
                {
                    name: 'Data Exchange',
                    type: 'graph',
                    layout: 'none',
                    data: graph.nodes,
                    links: graph.links,
                    categories: categories,
                    roam: true,
                    label: {
                        show: true,
                        normal: {
                            position: 'right'
                        }
                    },
                    lineStyle: {
                        normal: {
                            curveness: 0.3
                        }
                    }
                }
            ]
        };
        server_graph_chart_dom_id.setOption(option);

    }, 'xml');
}

function commitDataset(dom_id){
    var validNodeNum=5;
    var conLevel = 3;

    //动画代码
    setInterval(function () {
        var cl = Math.round((conLevel) * Math.random());
        for (var i = 0; i < cl; i++) {
            var source = Math.round((validNodeNum - 1) * Math.random());
            var target = Math.round((validNodeNum - 1) * Math.random());
            if (source !== target) {
                s_graph.links.push({
                    source: source,
                    target: target
                });
            }
        }

        server_graph_chart_dom_id.setOption({
            series: [{
                type: 'graph',
                roam: true,
                data: s_graph.nodes,
                links: s_graph.links
            }]
        });
        // console.log('nodes: ' + data.length);
        // console.log('links: ' + data.length);
    }, 500);

    server_graph_chart_dom_id.on('mouseover', function (params){
        console.log(params.name);
        var dvalue = 26 + Math.random()*10 + 40;
        var cvalue = 0.81 + Math.random()*2 + 50.23;
        var ivalue = 1.23 + Math.random()*2 + 80.92;
        dvalue = dvalue.toFixed(2);
        cvalue = cvalue.toFixed(2);
        ivalue = ivalue.toFixed(2);

        $("#diskbar").css("width",dvalue+ + "%").text(dvalue + "%");
        $("#cpubar").css("width",cvalue + "%").text(cvalue + "%");
        $("#iobar").css("width",ivalue + "%").text(ivalue + "%");
        nodelabel.innerHTML = params.name;
    });

}

function showServerOption(id,servermenu) {
    servermenu.innerHTML = id.innerHTML;
    data_graph_chart(server_graph_chart_dom_id, [{value: 70, name: ''}]);
    //gauge_chart(cpu_chart_dom_id, [{value: 81, name: ''}]);
}


function ChangeEdge(ud) {

    d_graph_dom_id.graph.nodes.forEach(function (node) {
        node.category = 3;
    });
}

function d_graph_chart(myChart)
{
    myChart.showLoading();
    $.get('/about/server-graph', function (xml) {
        myChart.hideLoading();
        var graph = dataTool.gexf.parse(xml);
        var categories = [];
        for (var i = 0; i < 9; i++) {
            categories[i] = {
                name: '类目' + i
            };
        }
        graph.nodes.forEach(function (node) {
            node.itemStyle = null;
            node.value = node.symbolSize;
            // node.label.normal.show = node.symbolSize > 30;
            node.category = node.attributes.modularity_class;
        });
        option = {
            title: {
                text: 'Les Miserables',
                subtext: 'Default layout',
                top: 'bottom',
                left: 'right'
            },
            tooltip: {},
            legend: [{
                // selectedMode: 'single',
                data: categories.map(function (a) {
                    return a.name;
                })
            }],
            animationDuration: 1500,
            animationEasingUpdate: 'quinticInOut',
            series : [
                {
                    name: 'Les Miserables',
                    type: 'graph',
                    layout: 'none',
                    data: graph.nodes,
                    links: graph.links,
                    categories: categories,
                    roam: true,
                    label: {
                        normal: {
                            position: 'right'
                        }
                    },
                    lineStyle: {
                        normal: {
                            curveness: 0.3
                        }
                    }
                }
            ]
        };
        myChart.setOption(option);

        //动画代码
        setInterval(function () {
            var source = Math.round((graph.nodes.length - 1) * Math.random());
            var target = Math.round((graph.nodes.length - 1) * Math.random());
            if (source !== target) {
                graph.links.push({
                    source: source,
                    target: target
                });
            }
            myChart.setOption({
                series: [{
                    roam: true,
                    data: graph.nodes,
                    links: graph.links
                }]
            });
            // console.log('nodes: ' + data.length);
            // console.log('links: ' + data.length);
        }, 500);
    }, 'xml');
}

function graph_chart(dom_id){
    var categories = [];
    categories[1] = {name:'working'};
    categories[0] = {name: 'idle'};

    let  option = {
        // 图的标题
        // 提示框的配置
        tooltip: {
            formatter: function (x) {
                return x.data.des;
            }
        },
        // 工具箱
        toolbox: {
            // 显示工具箱
            show: true,
            feature: {
                mark: {
                    show: true
                },
                // 还原
                restore: {
                    show: true
                },
                // 保存为图片
                saveAsImage: {
                    show: true
                }
            }
        },
        legend: [{
            // selectedMode: 'single',
            data: categories.map(function (a) {
                return a.name;
            })
        }],
        series: [{
            type: 'graph', // 类型:关系图
            layout: 'force', //图的布局，类型为力导图
            symbolSize: 10, // 调整节点的大小
            roam: true, // 是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移,可以设置成 'scale' 或者 'move'。设置成 true 为都开启
            edgeSymbol: ['circle'],
            edgeSymbolSize: [2, 10],
            edgeLabel: {
                normal: {
                    textStyle: {
                        fontSize: 20
                    }
                }
            },
            force: {
                repulsion: 1500,
                edgeLength: [2, 10]
            },
            draggable: true,
            lineStyle: {
                normal: {
                    width: 2,
                    color: '#4b565b',
                }
            },
            edgeLabel: {
                normal: {
                    show: true,
                    formatter: function (x) {
                        return x.data.name;
                    }
                }
            },
            label: {
                normal: {
                    show: true,
                    textStyle: {
                        fontSize: 10
                    }
                }
            },

            // 数据
            data: [{
                name: 'node01',
                des: 'nodedes01',
                symbolSize: 40,
                category: 0,
            }, {
                name: 'node02',
                des: 'nodedes02',
                symbolSize: 40,
                category: 1,
            }, {
                name: 'node03',
                des: 'nodedes3',
                symbolSize: 40,
                category: 1,
            }, {
                name: 'node04',
                des: 'nodedes04',
                symbolSize: 40,
                category: 1,
            }],
            links: [{
                source: 'node02',
                target: 'node03',
                name: '0.1',
                des: 'link01des'
            }, {
                source: 'node02',
                target: 'node04',
                name: '0.1',
                des: 'link02des'
            }, {
                source: 'node03',
                target: 'node04',
                name: '0.1',
                des: 'link03des'
            }, {
                source: 'node01',
                target: 'node02',
                name: '100',
                des: 'link05des'
            }],
            categories: categories,
        }]
    };
    dom_id.setOption(option);
}

function data_graph_chart(dom_id){
    var categories = [];

    for (var i = 0; i < 3; i++) {
        categories[i] = {
            name: 'Cluster' + i
        };
    }

    let  option = {
        // 图的标题
        // 提示框的配置
        tooltip: {
            formatter: function (x) {
                return x.data.des;
            }
        },
        // 工具箱
        toolbox: {
            // 显示工具箱
            show: true,
            feature: {
                mark: {
                    show: true
                },
                // 还原
                restore: {
                    show: true
                },
                // 保存为图片
                saveAsImage: {
                    show: true
                }
            }
        },
        legend: [{
            // selectedMode: 'single',
            data: categories.map(function (a) {
                return a.name;
            })
        }],
        series: [{
            type: 'graph', // 类型:关系图
            layout: 'force', //图的布局，类型为力导图
            symbolSize: 10, // 调整节点的大小
            roam: true, // 是否开启鼠标缩放和平移漫游。默认不开启。如果只想要开启缩放或者平移,可以设置成 'scale' 或者 'move'。设置成 true 为都开启
            edgeSymbol: ['circle'],
            edgeSymbolSize: [2, 10],
            edgeLabel: {
                normal: {
                    textStyle: {
                        fontSize: 20
                    }
                }
            },
            force: {
                repulsion: 100,
                edgeLength: [2, 10]
            },
            draggable: true,
            lineStyle: {
                normal: {
                    width: 2,
                    color: '#4b565b',
                }
            },
            edgeLabel: {
                normal: {
                    show: true,
                    formatter: function (x) {
                        return x.data.name;
                    }
                }
            },
            label: {
                normal: {
                    show: true,
                    textStyle: {
                        fontSize: 7
                    }
                }
            },

            // 数据
            data: [{
                name: 'c1',
                des: 'cdes01',
                symbolSize: 20,
                category: 0,
            },{
                name: 'c2',
                des: 'cdes02',
                symbolSize: 20,
                category: 0,
            }, {
                name: 'p1',
                des: 'pdes01',
                symbolSize: 20,
                category: 0,
            },{
                name: 'p2',
                des: 'pdes02',
                symbolSize: 20,
                category: 0,
            },{
                name: 'p3',
                des: 'pdes03',
                symbolSize: 20,
                category: 1,
            },{
                name: 's1',
                des: 'sdes01',
                symbolSize: 20,
                category: 0,
            },{
                name: 's2',
                des: 'sdes02',
                symbolSize: 20,
                category: 0,
            },{
                name: 's3',
                des: 'sdes03',
                symbolSize: 20,
                category: 1,
            },{
                name: 's4',
                des: 'sdes04',
                symbolSize: 20,
                category: 2,
            },{
                name: 'ps1',
                des: 'psdes01',
                symbolSize: 20,
                category: 0,
            },{
                name: 'ps2',
                des: 'psdes02',
                symbolSize: 20,
                category: 0,
            },{
                name: 'ps3',
                des: 'psdes03',
                symbolSize: 20,
                category: 1,
            }],
            links: [{
                source: 'c1',
                target: 'p1',
                name: '1',
                des: 'link01des'
            },{
                source: 'c1',
                target: 'p2',
                name: '1',
                des: 'link02des'
            },{
                source: 'c2',
                target: 'p1',
                name: '1',
                des: 'link03des'
            },{
                source: 'p1',
                target: 's1',
                name: '1',
                des: 'link04des'
            }, {
                source: 'p2',
                target: 's2',
                name: '1',
                des: 'link05des'
            },{
                source: 'p2',
                target: 's3',
                name: '1',
                des: 'link06des'
            },{
                source: 'p3',
                target: 's3',
                name: '1',
                des: 'link07des'
            },{
                source: 's1',
                target: 'ps1',
                name: '1',
                des: 'link08des'
            },{
                source: 's2',
                target: 'ps2',
                name: '1',
                des: 'link09des'
            },{
                source: 's3',
                target: 'ps3',
                name: '1',
                des: 'link10des'
            }],
            categories: categories,
        }]
    };
    dom_id.setOption(option);
}

function bar_chart(dom_id, data) {
    let option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        legend: {
            right: '1%',
            data: ['Server Selection', 'Data Partition', 'Knob Tuning']
        },
        xAxis: {
            //type: "category"
            show: false,
            type: 'value'
        },
        yAxis: {
            show: false,
            type: 'category',
            data: ['进度']
        },
        series: [
            {
                name: 'Server Selection',
                type: 'bar',
                stack: '总量',
                barWidth: 20,
                label: {
                    show: false,
                    position: 'insideRight'
                },
                data: [320]
            },
            {
                name: 'Data Partition',
                type: 'bar',
                stack: '总量',
                label: {
                    show: false,
                    position: 'insideRight'
                },
                data: [320]
            },
            {
                name: 'Knob Tuning',
                type: 'bar',
                stack: '总量',
                label: {
                    show: false,
                    position: 'insideRight'
                },
                data: [220]
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
        },],
        title: [{
            top: '10%',
            left: 'center',
            text: title1
        }],
        tooltip: {
            trigger: 'axis'
        },
        xAxis: [{
            data: dateList
        }],
        yAxis: [{
            splitLine: {show: false}
        }],
        grid: [{
            bottom: '10%'
        }],
        series: [{
            type: 'line',
            showSymbol: false,
            data: valueList
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
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#283b56'
                }
            }
        },
        legend: {
            data:['预测表现', '实际表现']
        },
        toolbox: {
            show: true,
            feature: {
                dataView: {readOnly: false},
                restore: {},
                saveAsImage: {}
            }
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: true,
                data: (function (){
                    var now = new Date();
                    var res = [];
                    var len = 10;
                    while (len--) {
                        res.unshift(now.toLocaleTimeString().replace(/^\D*/,''));
                        now = new Date(now - 2000);
                    }
                    return res;
                })()
            }

        ],
        yAxis: [
            {
                type: 'value',
                scale: true,
                name: 'Throughput (tps)',
                max: 30,
                min: 0,
                boundaryGap: [0.2, 0.2]
            }
        ],
        series: [
            {
                name: '预测表现',
                type: 'line',
                data: (function (){
                    var res = [];
                    var len = 0;
                    var timelen = 10;
                    while (len < timelen) {
                        res.push((Math.random()*10 + 5).toFixed(1) - 0);
                        len++;
                    }
                    return res;
                })()
            },
            {
                name: '实际表现',
                type: 'line',
                data: (function (){
                    var res = [];
                    var len = 0;
                    var timelen = 10;
                    while (len < timelen) {
                        res.push((Math.random()*10 + 5).toFixed(1) - 0);
                        len++;
                    }
                    return res;
                })()
            }
        ]
    };

    setInterval(function (){
        var axisData = (new Date()).toLocaleTimeString().replace(/^\D*/, '');

        var data0 = option.series[0].data;
        var data1 = option.series[1].data;
        var value = (Math.random() * 10 + 5).toFixed(1) - 0;
        data0.shift();
        data0.push(value);
        data1.shift();
        data1.push(value+Math.random()*2);

        option.xAxis[0].data.shift();
        option.xAxis[0].data.push(axisData);
        dom_id.setOption(option);
    }, 2100);

    dom_id.setOption(option);


    dom_id.on('click',function(params){
        var name = params.name;
        var seriesType = params.seriesType;
        //console.log(name+"\n"+seriesType);
        console.log("Queries at "+name);
        //generate corresponding subgraphs of slow queries
        //$("#performance_text").innerHTML = "Slow Queries at " + now.getDate();
        performance_text.innerHTML = "Predicted: Slow Queries at " + name;
        visual_title.innerHTML = "(Slow Queries at " + name+')';
        addQueryRow();
    });
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


