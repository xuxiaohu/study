/**
 * 多级联动框
 * @author geliang
 */
(function($) {
    function Linkage(opArray, options) {
        this.elements = [];
        this.urls = [];
        this.cache = [];
        this.curr = [];
        this.afterRender = [];
        
        for (var i = 0; i < opArray.length; i++) {
            var op = opArray[i];
            if (!op["el"] || !op["url"]) {
                alert("Missing linkage config of " + i);
                break;
            }
            var el = $(op["el"]);
            el.data("index", i);
            this.elements.push(el);
            this.urls.push(op["url"]);
            this.curr.push(op["curr"]);
            this.afterRender.push(op["afterRender"]);
            this.cache.push({});
        }
        
        if (options && options["renderFunc"]) {
            this.renderFunc = options["renderFunc"];
        }
        
    };
    $.extend(Linkage.prototype, {
        /**
         * 初始化控件
         */
        init: function() {
            var _this = this;
            for (var i = 0; i < this.elements.length; i++) {
                var el = this.elements[i];
                el.change(function(e) {
                    _this.changeHandler(e);
                });
            }
            this.getData(0);
        },
        /**
         * 处理change事件
         */
        changeHandler: function(evt) {
            var index = parseInt($(evt.target).data("index"));
            if (index < this.urls.length - 1) {
                //本级元素的change事件触发下一级元素的数据载入
                this.getData(index + 1);
            }
        },
        /**
         * 取数据，从缓存或通过AJAX
         * @param {Object} index 当前第几个元素取数据
         */
        getData: function(index) {
            var _this = this;
            var url = this.urls[index];
            var el = this.elements[index];
            var value = index === 0 ? "main" : this.elements[index - 1].val(); //上一级元素的选择值
            if (value === null || value === "") {
                this.render(el, []);
                return;
            }
            //检查缓存
            if (this.cache[index][value]) {
                this.render(el, this.cache[index][value]);
            }
            else {
                $.get(url, {
                    "value": value
                }, function(data) {
                    _this.ajaxCallback(el, data);
                });
            }
            
        },
        /**
         * 处理ajax请求
         * @param {Object} el 需要渲染的元素
         * @param {Object} data 数据
         */
        ajaxCallback: function(el, data) {
            //缓存当前元素的结果集
            var index = parseInt(el.data("index"));
            var value = index === 0 ? "main" : this.elements[index - 1].val();
            this.cache[index][value] = data[0];
            //缓存当前元素后级元素的结果集
            for (var i = 1; i < data.length; i++) {
                if (this.cache[index + i]) {
                    this.cache[index + i][data[i - 1][0]["value"]] = data[i];
                }
            }
            this.render(el, data[0]);
        },
        
        /**
         * 渲染元素
         * @param {Object} el
         * @param {Object} data
         */
        render: function(el, data) {
            var index = parseInt(el.data("index"));
            var _this = this;
            el.empty();
            $.each(data, function(i, d) {
                if (_this.renderFunc) {
                    var option = _this.renderFunc(d["text"], d["value"]);
                }
                else {
                    var option = $("<option>" + d["text"] + "</option>").val(d["value"]);
                    //需要在append前指定哪个selected，否则ie6下会报错
                    if (_this.curr[index] && _this.curr[index] == d["value"]) {
                        option.attr("selected", "selected");
                    }
                    for (var p in d) {
                        if (p !== "text" && p !== "value") {
                            option.attr("data-" + p, d[p]);
                        }
                    }
                }
                
                el.append(option);
            });
            //如果没有数据则隐藏自己
            if (data.length === 0) {
                el.hide();
            }
            else {
                if (el.is(":hidden")) {
                    el.show();
                }
            }
            //执行回调函数
            if (this.afterRender[index]) {
                this.afterRender[index].call(el);
            }
            //reflow元素，IE7下可能需要
            if (data.length > 0 && $.nodeName(el[0], "select") && $.browser.msie && $.browser.version <= 7) {
                el.hide().show();
            }
            el.trigger("change");
        },
        
        /**
         * 外部设置值
         * @param {Object} vals 一个包含值的数组
         */
        setVals: function(vals) {
            this.curr = vals;
            this.getData(0);
        }
    });
    
    /**
     * 全局方法
     * @param {Array} opArray 数组，每个数组元素应包含el和url属性
     * @param {Object} options 额外的一些参数构成的对象，通常情况下可以不传递此值
     */
    $.linkage = function(opArray, options) {
        var linkage = new Linkage(opArray, options);
        linkage.init();
        return linkage;
    }
})(jQuery);
