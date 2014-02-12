/**
 * Created with JetBrains PhpStorm.
 * User: bailey
 * Date: 13-2-21
 * Time: 下午3:52
 * To change this template use File | Settings | File Templates.
 */
var M = {
    _dbSupport:window.openDatabase,
    db : $.WebSQL('tomato'),
    init:function(){
        if(M._dbSupport){
            M.createTables();
        }else{
            alert("Databases are not supported in your browser");
        }
    },
    createTables:function(){
        M.db.query(
            'CREATE TABLE IF NOT EXISTS activity (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, del TEXT, time DATE)',
            'CREATE TABLE IF NOT EXISTS plan (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, del TEXT,time DATE)',
            'CREATE TABLE IF NOT EXISTS log (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, num INTEGER,time DATE)'
        ).fail(function (tx, err) {
                alert('An error occurred while create tables');
                throw new Error(err.message);
            });
    },
    table:{
        get:function(table,callback){
            if(!table){return false;}
            M.db.query('SELECT * from '+table+' ORDER BY time ASC').fail(function (tx, err) {
                alert(err);
                return false;
            }).done(function (d) {
                    callback&&callback(d);
                });
        },
        add:function(table,name,callback){
            if(!table||!name){return false;}
            M.db.query(
                'INSERT INTO '+table+'(name, del, time) VALUES ("'+name+'","no", "'+timer.now()+'")'
            ).fail(function (tx, err) {
                    alert('An error occurred while create tables');
                    return false;
                }).done(function (d) {
                    callback&&callback({name:name,time:timer.now(),id:d.insertId})
                });
        },
        del:function(table,id,callback){
            M.db.query(
                'UPDATE '+table+' SET del = "y" WHERE id = ' + id*1
            ).fail(function (tx, err) {
                    alert('An error occurred while delete data');
                    return false;
                }).done(function () {
                    callback&&callback({id:id});
                });
        }
    },
    activity:{
        get:function(callback){
            M.db.query('SELECT * from activity ORDER BY time ASC').fail(function (tx, err) {
                alert(err);
                return false;
            }).done(function (d) {
                    callback&&callback(d)
                });
        },
        add:function(name){
            M.db.query(
                'INSERT INTO activity(name, del, time) VALUES ("'+name+'","no", "'+timer.now()+'")'
            ).fail(function (tx, err) {
                    alert('An error occurred while create tables');
                    return false;
                }).done(function (d) {
                    V.activity.add({name:name,time:timer.now(),id:d.insertId});
                });
        },
        del:function(id){
            M.db.query(
                'UPDATE activity SET del = "y" WHERE id = ' + id*1
            ).fail(function (tx, err) {
                    alert('An error occurred while delete data');
                    return false;
                }).done(function () {
                    V.activity.del({id:id});
                });
        }
    },
    log:{
        getLog:function(d,callback){
            var date = d || timer.date();//默认查询今天
            M.db.query('SELECT * from log where time between "'+date+' 00:00:00'+'" AND "'+date+' 23:59:59'+'" ORDER BY time ASC').fail(function (tx, err) {
                alert(err);
                return false;
            }).done(function (d) {
                    callback&&callback(d)
                });
        },
        add:function(name,num){
            M.db.query(
                'INSERT INTO log(name, num, time) VALUES ("'+name+'","'+num+'", "'+timer.now()+'")'
            ).fail(function (tx, err) {
                    alert('An error occurred while create tables');
                    return false;
                }).done(function (d) {
                    V.log.add({name:name,num:num,time:timer.now(),id:d.insertId});
                });
        }
    }
};

var C = {
    init:function(){
        if(M._dbSupport){
            $("#goactivity").click(function(){
                if($.trim($("#inputbox").val())){
                    C.activity.add($.trim($("#inputbox").val()));
                }
            });
            $("#goplan").click(function(){
                if($.trim($("#inputbox").val())){
                    C.plan.add($.trim($("#inputbox").val()));
                }
            });
            V._acList.on("mouseenter","li", V.activity.showHover).on("mouseleave","li",V.activity.hideHover);
            V._planList.on("mouseenter","li", V.plan.showHover).on("mouseleave","li", V.plan.hideHover);
        }else{

        }
    },
    activity:{
        add:function(v){
            //对输入的处理
            M.activity.add(v);
        },
        del:function(){
            if(V.activity._hoverItem){
                var id = V.activity._hoverItem.attr("id").substr(3);
                M.activity.del(id);
            }
        }
    },
    plan:{
        add:function(v){
            //对输入的处理
            M.table.add("plan",v, function(d){
                V.plan.add(d);
            });
        },
        del:function(item){
            if(item){
                var id = item.attr("id").substr(5);
                M.table.del("plan",id,function(){
                    V.plan.del({id:id});
                });
            }else if(V.plan._hoverItem){
                var id = V.plan._hoverItem.attr("id").substr(5);
                M.table.del("plan",id,function(){
                    V.plan.del({id:id});
                });
            }
        },
        doit:function(){
            if(V.plan._hoverItem){
                V.plan._task = V.plan._hoverItem;
                V.plan.doit();
            }
        }
    },
    log:{
        add:function(v){
            //对输入的处理
            M.log.add(v,timer._length);
        }
    }
};

var V = {
    _onebox:$("#inputbox"),
    _acList:$("#acList"),
    _planList:$("#planList"),
    _logList:$("#logList"),
    init:function(){
        M.activity.get(function(data){
            for(var i=0;i<data.length;i++){
                var item = data[i];
                item.del!="y" && V.activity.add(item);
            }
        });
        M.table.get("plan",function(data){
            for(var i=0;i<data.length;i++){
                var item = data[i];
                item.del!="y" && V.plan.add(item);
            }
        });
        M.log.getLog("",function(data){
            for(var i=0;i<data.length;i++){
                var item = data[i];
                V.log.add(item);
            }
        });
        V._acList.on("click","i.icon-trash",function(){C.activity.del()});
        V._acList.on("click","i.icon-hand-right",function(){
            var item = V.activity._hoverItem;
            C.plan.add(item.text());
            C.activity.del();
        });

        V._planList.on("click","i.icon-bell",function(){C.plan.doit()});
        V._planList.on("click","i.icon-trash",function(){C.plan.del()});
        V._planList.on("click","i.icon-ok",function(){
            //var item = V.plan._hoverItem;
            //C.log.add(item.text());
            C.plan.del();
        });

        var picker = new Pikaday({
            field: $('#day')[0],
            onSelect:function(date){
                M.log.getLog(date,function(data){
                    V.log.update(data);

                });
            }
        });
        $("#day").val(timer.date());
    },
    activity:{
        _hoverItem:null,
        _menu:[
            $("<i class='icon-trash' title='删除'></i>"),
            $("<i class='icon-hand-right' title='转为计划'></i>")
        ],
        add:function(data){
            data && V._acList.prepend("<li title='"+data.name+"' id='"+"ac-"+data.id+"' time='"+data.time+"'>"+data.name+"</li>");
            V._onebox.val("");
        },
        del:function(data){
            V.activity.getHoverAc().appendTo("body");
            data && $("#ac-"+data.id).remove();;
        },
        showHover:function(){
            var $this = $(this);
            V.activity._hoverItem = $this;
            V.activity.getHoverAc().appendTo($this).show();
        },
        hideHover:function(){
            V.activity.getHoverAc().hide();
            V.activity._hoverItem = null;
        },
        getHoverAc:function(){
            if($("#hoverAc").length){
                return $("#hoverAc");
            }else{
                return $("<div id='hoverAc' class='hoverMenu'></div>").append(V.activity._menu);
            }
        }
    },
    plan:{
        _hoverItem:null,
        _menu:[
            $("<i class='icon-bell' title='吃一个'></i>"),
            $("<i class='icon-trash' title='删除'></i>"),
            $("<i class='icon-ok' title='完成'></i>")
        ],
        add:function(data){
            data && V._planList.prepend("<li title='"+data.name+"' id='"+"plan-"+data.id+"' time='"+data.time+"'>"+data.name+"</li>");
            V._onebox.val("");
        },
        doit:function(item){
            $("#task").text(V.plan._task.text());
            $("#timerPanel").fadeIn();
        },
        del:function(data){
            V.plan.getHover().appendTo("body");
            data && $("#plan-"+data.id).remove();
        },
        showHover:function(){
            var $this = $(this);
            V.plan._hoverItem = $this;
            V.plan.getHover().appendTo($this).show();
        },
        hideHover:function(){
            V.plan.getHover().hide();
            V.plan._hoverItem = null;
        },
        getHover:function(){
            if($("#hoverPlan").length){
                return $("#hoverPlan");
            }else{
                return $("<div id='hoverPlan' class='hoverMenu'></div>").append(V.plan._menu);
            }
        }
    },
    log:{
        add:function(data){
            data && V._logList.prepend("<li title='"+data.name+"' id='"+"log-"+data.id+"' time='"+data.time+"'>"+data.name+"</li>");
        },
        update:function(data){
            V._logList.empty();
            for(var i=0;i<data.length;i++){
                var item = data[i];
                V.log.add(item);
            }
        }
    }
};

var K = {
    _kibo:new Kibo(document.getElementById('inputbox')),
    init:function(){
        this._kibo.down("enter",function(e){
            if(e.ctrlKey){
                $("#goplan").trigger("click");
            }else{
                $("#goactivity").trigger("click");
            }
            return false;
        });
    }
}

var timer = {
    _length:0,
    init:function(){
        //音量点颜色数组，12个点，60分钟，一个点5分钟
        var colors = ['26e000','37e700','51ef00','6bfb00','80ff05','93ff0b','6bfb00','a9ff07','d7ff07','fff30a','ffce0a','ffb509'];

        var rad2deg = 180/Math.PI;
        var deg = 0;
        var bars = $('#bars');

        for(var i=0;i<colors.length;i++){
            deg = i*30;//360除以12等于30
            $('<div class="colorBar">').css({
                backgroundColor: '#'+colors[i],
                top: -Math.sin(deg/rad2deg)*70+97,
                left: Math.cos((180-deg)/rad2deg)*70+103
            }).appendTo(bars);
        }

        var colorBars = bars.find('.colorBar');
        var numBars = 0, lastNum = -1;
        //初始化控制旋钮
        $('#control').knobKnob({
            snap : 30,
            value: 0,
            turn : function(ratio){
                numBars = Math.round(colorBars.length*ratio);
                if(numBars == lastNum){
                    return false;
                }
                lastNum = numBars;
                colorBars.removeClass('active').slice(0, numBars).addClass('active');
                //更新timer
                var time = timer.pad(Math.round(ratio*60/5)*5,2);
                $("#digits").countdown.set(time+":00");
            },
            stop:function(ratio){
                timer._length = Math.round(ratio*60/5)*5;
            }
        });
        //初始化倒计时
        $("#digits").countdown({
            format: "mm:ss",
            startTime: "00:00",
            autoStart:false,
            timerEnd:function(){
                if(V.plan._task){
                    C.log.add(V.plan._task.text());
                    notify.webkitShow("恭喜你吃完了一个番茄！","完成任务："+V.plan._task.text());
                    //C.plan.del(V.plan._task);
                    timer.returnZero();
                    $("#timerPanel").fadeOut();//隐藏面板
                    $("#cancel,#start").show();//显示开始和取消按钮
                    $("#pause").hide();//隐藏中断按钮
                    $("title").text("tomato");
                }
            },
            step:function(time){
                $("title").text(time+" "+V.plan._task.text());
            }
        });

        //点击开始按钮
        $("#start").click(function(){
            if(timer._length>0){
                $('#control').knobKnob.disable();//禁用控制旋钮
                $("#digits").countdown.start(); //开始计时
                $("#cancel,#start").hide();//隐藏开始和取消按钮
                $("#pause").show();//显示中断按钮
            }
        });
        //点击取消按钮
        $("#cancel").click(function(){
            timer.returnZero();
            $("#timerPanel").fadeOut();//隐藏面板
        });
        //点击中止按钮
        $("#pause").click(function(){
            if(confirm("半途而废，前功尽弃，你确定要这样？")){
                timer.returnZero();
                $("#timerPanel").fadeOut();//隐藏面板
                $("#cancel,#start").show();//显示开始和取消按钮
                $("#pause").hide();//隐藏中断按钮
            }else{
                alert("迷途知返，继续努力！");
            }
        });
    },
    returnZero:function(){
        $('#control').knobKnob.enable();//启用控制旋钮
        $('#control').knobKnob.set(0);//控制旋钮归0
        $("#digits").countdown.set("00:00");//计时器归0
        $("#digits").countdown.pause();//计时器归0
        timer._length = 0;
        V.plan._task = null;
    },
    /* 数字前补0 */
    pad:function(num, n){
        var len = num.toString().length;
        while(len < n) {
            num = "0" + num;
            len++;
        }
        return num;
    },
    now:function(){
            var d = new Date();
            return d.getFullYear() + "-" + (d.getMonth()+1)+"-"+ d.getDate() + " " + (d.getHours()+1)+":"+d.getMinutes()+":"+d.getSeconds();
    },
    date:function(){
        var d = new Date();
        return d.getFullYear() + "-" + (d.getMonth()+1)+"-"+ d.getDate();
    }
};

var notify = {
    webkitShow:function(title,des){
        if(window.webkitNotifications.checkPermission()===0){
            var notification =  window.webkitNotifications.createNotification(
                "img/tomato.png",
                title,des
            );
            notification.onclick = function () {
                window.focus();
                this.cancel();
            };
            notification.show();
        }else{
            alert(title+"-"+des);
            window.webkitNotifications.requestPermission();
        }


    }
};

$(function(){
    M.init();
    C.init();
    V.init();
    K.init();
    timer.init();
});
