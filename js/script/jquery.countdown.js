/**
 * @author geliang
 * 页面全局倒计时插件
 */
(function($) {
    var worked = false; //全局标识是否已经运行，此插件只应该调用一次
    var now;
    var countDownEls;
    var seconds = [];
    
    /**
     * 渲染需要倒计时的html元素
     */
    function renderCountDown(hideSecAttr) {
        setInterval(function() {
            countDownEls.each(function(index, el) {
                var s = --seconds[index];
                var second, minite, hour, day, html;
                if (s <= 0) {
                    html = "剩余时间：<em>0</em>";
                }
                else {
                    var hideSec = $(el).attr(hideSecAttr)
                    if (hideSec !== "true") {
                        second = Math.floor(s % 60).toString();
                    }
                    minite = Math.floor((s / 60) % 60).toString();
                    hour = Math.floor((s / 3600) % 24).toString();
                    day = Math.floor((s / 3600) / 24).toString();
                    html = "剩余时间：<em>" + day + "</em>天<em>" + hour + "</em>时<em>" + minite + "</em>分 ";
                    if (second) {
                        html += "<em>" + second + "</em>秒";
                    }
                }
                $(el).html(html);
            });
        }, 1000);
    }
    
    $.countdown = function(options) {
        if (worked === true) {
            return;
        }
        var settings = $.extend({
            "timeUrl": "/time.json",
            "query": "div.time",
            "expiredAttr": "data-expired", //每个元素的过期时间会写在html的元素属性上，这是属性的名字
            //每个元素的倒计时显示时是否隐藏秒，这个将由元素的属性决定，默认是不需要此属性的
            //如果需要隐藏，将此属性设为true
            "hideSecAttr": "data-hidesec"
        }, options);
        countDownEls = $(settings["query"]);
        countDownEls.each(function(index, el) {
            var s = parseInt($(el).attr(settings["expiredAttr"]));
            if (isNaN(s)) {
                alert("Missing time attribute,index is " + index + "!");
                s = new Date().getTime();
            }
            s = parseInt(s / 1000);
            seconds.push(s);
        });
        $.get(settings["timeUrl"], function(data) {
            now = parseInt(data / 1000);
            for (var i = 0; i < seconds.length; i++) {
                seconds[i] = seconds[i] - now;
            }
            renderCountDown(settings["hideSecAttr"]);
            worked = true;
        })
    }
})(jQuery);
