/**
 * 目录选择控件，依赖于jquery.linkage，支持单选与多选
 *
 * @author geliang
 */
(function($) {
    function CategoryLayer(options) {
        var _this = this;
        this.layer = $(options["layer"]);
        this.select0 = $("select:eq(0)", this.layer);
        this.select1 = $("select:eq(1)", this.layer);
        this.select2 = $("select:eq(2)", this.layer);
        this.resultDiv = $(options["resultDiv"]); //选择结果区域
        this.submitButton = $(options["submitBtn"]);
        this.cancelButton = $(options["cancelBtn"]);
        this.relatedInput = null;
        this.selected = false; // 是否选中了“叶子”节点
        this.multi = !!options["multi"];
        this.multiMax = options["multiMax"];
        this.onSubmit = options["onSubmit"];
        this.currVal = options["currVal"];
        
        // 先隐藏第三级目录
        this.select2.hide();
        // 如果是多选的话，样式做一些改变
        if (this.multi === true) {
            var multiCtrl = $('<div class="tReTitle"><div class="fr" style="display:none"><span class="red">清除所有</span></div><div>您已经选择了以下选项：</div></div>');
            this.multiTip = $('<div class="red"></div>').appendTo(multiCtrl);
            this.multiResultDiv = $("<div>").appendTo(multiCtrl);
            multiCtrl.find("span").click(function() {
                _this.clearMultiSelect();
            });
            $(options["resultDiv"] + " :checkbox").live("click", function() {
                _this.changeCheckStyle($(this));
            });
            this.resultDiv.append(multiCtrl);
        }
        this.createLinkage(options);
        // 对第三级的选择事件捕获，显示可选项
        this.select2.change(function() {
            if (_this.select2.children().size() > 0) {
                if (_this.select2.val() !== null) {
                    _this.showSelected([_this.select0, _this.select1, _this.select2]);
                }
                else {
                    _this.showUnSelect();
                }
            }
        });
        // 取消按钮
        this.cancelButton.click(function() {
            _this.layer.popHide();
        });
        // 确定按钮
        this.submitButton.click(function() {
            _this.submitSelected();
        });
    }
    
    $.extend(CategoryLayer.prototype, {
    
        /**
         * 对三级目录选择框应用Linkage
         */
        createLinkage: function(options) {
            var _this = this;
            var linkageOption = [{}, {}, {}];
            $.each(linkageOption, function(i, op) {
                op["el"] = _this["select" + i];
                op["url"] = options["cateUrls"][i];
            });
			//因为是列表框，所以不会自动选择第一个option
			//这时只给第一级的自动选上第一个选项
			linkageOption[0]["afterRender"] = function(){
				this[0].selectedIndex = 0;
			}
            // 由于有可能第二级元素即是可选择的目录，所以给第三级加上一个afterRender回调函数
            linkageOption[2]["afterRender"] = function() {
                // 如果第二级的change事件是由用户触发的
                if (_this.select1.val() !== null) {
                    if (_this.select2.children().size() === 0) {
                        _this.showSelected([_this.select0, _this.select1]);
                    }
                }// 如果change事件不是由用户触发，则显示未选中
                else {
                    _this.showUnSelect();
                }
            };
            $.linkage(linkageOption);
        },
        
        /**
         * 在页面展示所选中的目录
         *
         * @param {Object}
         *            els select元素列表
         */
        showSelected: function(els) {
            var _this = this;
            if (this.multi) {
                var el = els[els.length - 1];
                //不允许重复选择
                var existed = $(":checkbox[value='" + el.val() + "']", this.multiResultDiv);
                if (existed.size() > 0) {
                    existed.attr("checked", "checked");
                    this.changeCheckStyle(existed);
                }
                else {
                    this.appendMultiCheck(this.getSelText(el), el.val());
                    this.resultDiv.find(".fr").show();
                }
            }
            else {
                var html = " 您当前选中的为";
                $.each(els, function(i, el) {
                    html += "<em>" + _this.getSelText(el) +
                    "</em>";
                    if (i !== els.length - 1) {
                        html += "&gt;";
                    }
                });
                this.resultDiv.html(html);
                this.selected = true;
                this.submitButton.removeClass().addClass("fixed");
            }
        },
        
        /**
         * 展示未选中任何项的提示
         */
        showUnSelect: function() {
            this.selected = false;
            if (this.multi === false) {
                this.resultDiv.html("您尚未选中任何一项");
                this.submitButton.removeClass().addClass("fixedGray");
            }
        },
        
        /**
         * 清除所有的多选项
         */
        clearMultiSelect: function() {
            this.multiResultDiv.empty();
            this.resultDiv.find(".fr").hide();
        },
        
        /**
         * 设置当前设置目录关联的input框
         *
         * @param {Object}
         *            relatedInput
         */
        setRelatedInput: function(relatedInput) {
            this.relatedInput = relatedInput;
        },
        
        /**
         * 点确定提交时的操作，将调用onSubmit回调函数，将选择的值和文本传递给回调，另外将回调的this设置为input框本身
         */
        submitSelected: function() {
            var _this = this;
            // 多选时，传递两个数组给回调函数
            if (this.multi) {
                if ($(":checkbox:checked", this.multiResultDiv).size() > this.multiMax) {
                    this.multiTip.html("您最多只能选择" + this.multiMax + "项");
                    setTimeout(function() {
                        _this.multiTip.html("");
                    }, 1000)
                    return;
                }
                var text = [], value = [];
                $(":checkbox:checked", this.multiResultDiv).each(function() {
                    text.push($(this).parent().text());
                    value.push($(this).val());
                });
                this.onSubmit.call(this.relatedInput, text, value);
            }
            // 单选时，传递两个文本给回调函数
            else {
                if (this.selected === false) {
                    return;
                }
                var text, value;
                // 判断一下选择的第二级还是第三级
                if (this.select2.val() !== null) {
                    text = this.getSelText(this.select2);
                    value = this.select2.val();
                }
                else if (this.select1.val() !== null) {
                    text = this.getSelText(this.select1);
                    value = this.select1.val();
                }
                this.onSubmit.call(this.relatedInput, text, value);
            }
            this.layer.popHide();
        },
        
        /**
         * 向待选区新增一个checkbox
         */
        appendMultiCheck: function(text, value) {
            var html = "<label><input type=\"checkbox\" value=\"" +
            value +
            "\" checked=\"checked\" />" +
            text +
            "</label>";
            this.multiResultDiv.append($(html));
        },
        
        /**
         * 取消选择checkbox时，会增加一个样式
         * @param {Object} checkbox
         */
        changeCheckStyle: function(checkbox) {
            if (checkbox.attr("checked") === true) {
                checkbox.parent().removeClass("del");
            }
            else {
                checkbox.parent().addClass("del");
            }
        },
        
        /**
         * 弹出目录选择层
         */
        pop: function() {
            if (this.multi) {
                this.clearMultiSelect();
                var currVal = this.currVal.call(this.relatedInput);
                if (currVal) {
                    var text = currVal.text;
                    var value = currVal.value;
                    for (var i = 0; i < text.length; i++) {
                        if (value[i] && $.trim(value[i]).length > 0) {
                            this.appendMultiCheck(text[i], value[i]);
                        }
                    }
                    this.resultDiv.find(".fr").show();
                }
            }
            this.layer.pop();
        },
        
        /**
         * 取得select元素选中值的text
         */
        getSelText: function(el) {
            var index = el[0].selectedIndex;
            if (index > -1) {
                return el[0].options[index].text;
            }
            else {
                return "";
            }
        }
    });
    
    $.fn.category = function(options) {
        var settings = $.extend({
            "layer": "#cateLayer", //弹出层
            "submitBtn": "#submitCate", //弹出层确定按钮
            "cancelBtn": "#cancelCate", //弹出层取消按钮
            "resultDiv": "#cateResult", //展示已选择选项的区域
            "cateUrls": ["/cate.json?level=1", "/cate.json?level=2", "/cate.json?level=3"], //ajax的url
            "multi": false, //是否多选
            "multiMax": 10,
            "onSubmit": function() {//点击确定时的回调
            },
            "currVal": function() { //弹窗时，会根据此函数信息来回显数据，需要传递一个形如{value:[],text:[]}的json
                return null;
            }
        }, options);
        var cateLayer = new CategoryLayer(settings);
        return this.each(function(i, el) {
            $(el).click(function() {
                cateLayer.setRelatedInput($(this));
                cateLayer.pop();
            }).focus(function() {
                $(this).click();
            }).keydown(function(e) {
                e.preventDefault();
            });
        });
    };
})(jQuery);
