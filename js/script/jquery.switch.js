/**
 * @author geliang
 * TAB切换效果
 */
(function($) {
    $.switchable = function(options) {
        var settings = $.extend({
            "nowClass": "now",
            "hover": true,
            "anim": "none",
			"duration": 400
        }, options);
        return new Switch(settings);
    }
    
    /**
     * tab切换处理类
     */
    function Switch(settings) {
        this.tabs = $(settings["tab"]);
        this.boxs = $(settings["box"]);
        this.nowClass = settings["nowClass"];
        this.hover = settings["hover"]; //悬停时是否切换
        this.anim = settings["anim"];   //动画效果
		this.duration = settings["duration"]; //动画的时间
        
        var _this = this;
        var tabTimer;
        
        if (this[this.anim + "AnimInit"]) {
            this[this.anim + "AnimInit"]();
        }
        
        if (this.hover === true) {
            this.tabs.hover(function() {
                var tab = $(this);
                tabTimer = setTimeout(function() {
                    _this.dealSwitch(tab);
                }, 200);
            }, function() {
                clearTimeout(tabTimer);
            });
        }
        this.tabs.click(function() {
            var tab = $(this);
            clearTimeout(tabTimer);
            _this.dealSwitch(tab);
        });
    }
    
    $.extend(Switch.prototype, {
        /**
         * 处理切换
         * @param {Object} tab 需要切换到的tab
         */
        dealSwitch: function(tab) {
            this.tabs.removeClass(this.nowClass);
            tab.addClass(this.nowClass);
            var index = tab.index();
            this[this.anim + "AnimRender"](index);
        },
        
        /**
         * 无动画效果的切换
         * @param {Object} index
         */
        noneAnimRender: function(index) {
            this.boxs.hide();
            this.boxs.eq(index).show();
        },
        
        /**
         * 滚动动画所需的初始化
         */
        scrollAnimInit: function() {
            this.scrollContainer = $("<div></div>").css("position", "absolute");
            this.boxHeight = this.boxs.eq(0).height();
            this.boxs.parent().css("position", "relative")
            this.boxs.parent().append(this.scrollContainer.append(this.boxs));
        },
        
        /**
         * 滚动的切换动画
         * @param {Object} index 需要展示的box的index
         */
        scrollAnimRender: function(index) {
            var newTop = (index) * -(this.boxHeight);
            this.scrollContainer.stop().animate({
                top: newTop
            }, this.duration);
        }
    });
    
})(jQuery);
