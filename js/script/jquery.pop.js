/**
 * 弹出层
 * @author geliang
 */
(function($) {
    $.fn.pop = function() {
        var top = ($(window).height() - this.height()) / 2 + $(window).scrollTop();
        var left = ($(window).width() - this.width()) / 2 + $(window).scrollLeft();
        return this.css({
            'top': top > 0 ? top : 0,
            'left': left > 0 ? left : 0,
            'z-index': 101,
            'position': 'absolute'
        }).fadeIn("fast", function() {
            if ($("#pop_mask").size() > 0) {
                $("#pop_mask").css({
                    'width': document.documentElement.scrollWidth + "px",
                    'height': document.documentElement.scrollHeight + "px"
                }).appendTo($('body')).show();
            }
            else {
                var width = Math.max(document.documentElement.scrollWidth, document.documentElement.offsetWidth);
                var height = Math.max(document.documentElement.scrollHeight, document.documentElement.offsetHeight);
                var mask_css = {
                    'position': 'absolute',
                    'background': 'black',
                    'z-index': 100,
                    'width': width + "px",
                    'height': height + "px",
                    'top': 0,
                    'left': 0,
                    'margin': 0,
                    'padding': 0,
                    'opacity': 0.6
                };
                $('<div id="pop_mask"></div>').css(mask_css).appendTo($('body'));
                //IE6 select box bug
                if ($.browser.msie && $.browser.version < 7) {
                    var mask_iframe = $('<iframe frameborder="0"  tabindex="-1" src="javascript:void(0);"></iframe>');
                    mask_iframe.css({
                        'display': 'block',
                        'position': 'absolute',
                        'z-index': '-1',
                        'opacity': 0,
                        'width': '100%',
                        'height': '100%',
                        'top': 0,
                        'left': 0
                    });
                    $('#pop_mask').append(mask_iframe);
                }
            }
        });
    }
    $.fn.popHide = function() {
        $(this).fadeOut('fast', function() {
            $("#pop_mask").hide();
        })
    }
    
    /**
     * 弹出类似confirm的框，可以传递onSubmit和onCancel回调函数
     */
    $.fn.popConfirm = function(options) {
        var _this = this;
        this.find(":submit").click(function() {
            if (options && options["onSubmit"]) {
                options["onSubmit"]();
            }
            _this.popHide();
        });
        this.find(":reset").click(function() {
            if (options && options["onCancel"]) {
                options["onCancel"]();
            }
            _this.popHide();
        });
        if (options["htmlEsc"] === false) {
            $("#confirmTitle").html(options["title"] || "");
            $("#confirmText").html(options["text"] || "");
        }
        else {
            $("#confirmTitle").text(options["title"] || "");
            $("#confirmText").text(options["text"] || "");
        }
        return this.pop();
    }
    
    /**
     * 弹出类似alert的框
     */
    $.fn.popAlert = function(options) {
        var _this = this;
        this.find(":submit").click(function() {
			if (options && options["onSubmit"]) {
                options["onSubmit"]();
            }
            _this.popHide();
        });
		if (options["htmlEsc"] === false) {
			alert("x");
            $("#alertTitle").html(options["title"] || "");
            $("#alertText").html(options["text"] || "");
        }
        else {
            $("#alertTitle").text(options["title"] || "");
            $("#alertText").text(options["text"] || "");
        }
        return this.pop();
    }
})(jQuery);
