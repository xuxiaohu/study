/**
 * @author geliang
 * 输入框提示文字效果
 */
(function($) {
    $.support.placeholder = "placeholder" in document.createElement("input");
    $.fn.placeholder = function() {
        var this_label = $(this);
        if (!$.support.placeholder) {
            var ph = this_label.attr("placeholder");
            if ($.trim(this_label.val()) == "" || $.trim(this_label.val()) == ph) {
                this_label.val(ph).addClass("placeholder");
            }
            this_label.focus(function() {
                var class_str = $(this).attr("class");
                if (class_str.search("placeholder") != -1) {
                    $(this).val("").removeClass("placeholder");
                }
            }).blur(function() {
                if ($.trim($(this).val()) == "") {
                    $(this).val(ph).addClass("placeholder");
                }
            });
        }
    }
})(jQuery);
