/**
 * @author geliang
 * 给input text增加只能输入数字的功能
 */
(function($) {
    /**
     * 为某个jquery对象增加只能输入数字的功能
     * @param {Object} only_integer 是否是整数，如果是整数的话，可以不传此参数
     * @param {Object} precision    如果是浮点数的话，此参数表示小数点后应该是几位，默认为2
     */
    $.fn.numeric = function(only_integer, precision) {
        var decimal = only_integer === false ? "." : "";
        var reg = new RegExp("[^0-9" + decimal + "]", "g");
        var precision = precision || 2;
        
        this.css("ime-mode", "disabled");
		//输入完成时，将所有非法字符替换掉
        this.keyup(function(e) {
            var key = e.which;
            if (key != 8 /* backspace */ &&
            key != 9 /* tab */ &&
            key != 13 /* enter */ &&
            key != 16 /* shift */ &&
            key != 35 /* end */ &&
            key != 36 /* home */ &&
            key != 37 /* left */ &&
            key != 39 /* right */ &&
            key != 46 /* del */) {
                var position = $(this).position();
                var old_len = $(this).val().length;
                $(this).val($(this).val().replace(reg, ""));
                $(this).position(position - (old_len - $(this).val().length));
            }
        });
        //处理不能输入多个小数点的问题
        this.keydown(function(e) {
            var key = e.which;
            if (only_integer === false && key === 190 /* 小数点 */) {
                if (this.value.indexOf(".") > -1) {
                    return false;
                }
            }
        });
        //焦点离开时，再次更正输入的值，并检查精度
        this.blur(function() {
            if ($(this).val().length > 1) {
                var tmp = parseFloat($(this).val());
                tmp = isNaN(tmp) ? "" : tmp + "";
                if (only_integer === false) {
                    var index = tmp.indexOf(".");
                    if (index > -1) {
                        tmp = tmp.substring(0, index + precision + 1);
                    }
                }
                $(this).val(tmp);
            }
        });
        //取消拖动事件，防止别人将文字拖动到文本框
        this.bind("dragover", function(e) {
            e.originalEvent.dataTransfer.dropEffect = "none";
            e.preventDefault();
            return false;
        });
        return this;
    }
    
    $.fn.position = function(value) {
        var elem = this[0];
        if (elem && (elem.tagName == "TEXTAREA" || elem.type.toLowerCase() == "text")) {
            if ($.browser.msie) {
                var rng;
                if (elem.tagName == "TEXTAREA") {
                    rng = event.srcElement.createTextRange();
                    rng.moveToPoint(event.x, event.y);
                }
                else {
                    rng = document.selection.createRange();
                }
                if (value === undefined) {
                    rng.moveStart("character", -event.srcElement.value.length);
                    return rng.text.length;
                }
                else if (typeof value === "number") {
                    var index = this.position();
                    index > value ? (rng.moveEnd("character", value - index)) : (rng.moveStart("character", value - index))
                    rng.select();
                }
            }
            else {
                if (value === undefined) {
                    return elem.selectionStart;
                }
                else if (typeof value === "number") {
                    elem.selectionEnd = value;
                    elem.selectionStart = value;
                }
            }
        }
    }
})(jQuery);

