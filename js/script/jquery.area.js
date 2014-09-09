/**
 * 地区选择控件
 *
 * @author zhouyuan,geliang
 */
(function($) {

    function AreaLayer(options) {
        var _this = this;
        this.relatedEl = null;
        this.layer = $(options["layer"]);
        this.bigAreas = $("input[name='bigArea']", this.layer);
        this.smallAreas = $("input[name='smallArea']", this.layer);
        this.smallAreasText = {}; //省份的值-文本hash
        this.resultContainer = $(options["resultContainer"]); //选择结果区域
        this.submitButton = $(options["submitBtn"]);
        this.cancelButton = $(options["cancelBtn"]);
        this.areaRules = options["areaRules"]; //区与省份的对应规则，形如{"Huazhong":["Jiangxi","Henan","Hubei","Hunan"]}
        this.currVal = options["currVal"];
        
        this.smallAreas.each(function(i, area) {
            _this.smallAreasText[$(area).val()] = $(area).parent().text();
        });
        
        // 取消按钮
        this.cancelButton.click(function() {
            _this.layer.popHide();
        });
        // 确定按钮
        this.submitButton.click(function() {
            _this.submitSelected();
        });
        //大区选择时触发选中省份，并且检查是否存在子类大区
        this.bigAreas.click(function() {
            var bigArea = $(this);
            var listValue = _this.areaRules[bigArea.val()];
            _this.smallAreas.each(function(i) {
                if ($.inArray($(this).val(), listValue) !== -1) {
                    $(this).attr("checked", bigArea.attr("checked"));
                }
            });
            _this.renderResult();
        });
        this.smallAreas.click(function() {
            _this.renderResult();
        });
        
        //结果区域删除省份的处理
        $(options["resultContainer"] + " span.delete").live("click", function() {
            var val = ($(this).siblings(":hidden").val());
            _this.smallAreas.filter("[value='" + val + "']").attr("checked", false);
            $(this).parent().remove();
            _this.refreshBigArea();
        });
    }
    
    $.extend(AreaLayer.prototype, {
        /**
         * 弹出地区选择层
         */
        pop: function() {
            var currVal = this.currVal.call(this.relatedEl);
            //根据当前值，给选中的省份打上勾
            if (currVal) {
                this.smallAreas.each(function(i, checkbox) {
                    if ($.inArray($(checkbox).val(), currVal) > -1) {
                        $(checkbox).attr("checked", true);
                    }
                    else {
                        $(checkbox).attr("checked", false);
                    }
                });
                this.renderResult();
            }
            this.renderSelected();
            this.layer.pop();
        },
        
        /**
         * 根据省份的选择情况渲染结果区域，并将对应的大区域选中
         */
        renderResult: function() {
            var _this = this;
            var smallVals = [];
            this.smallAreas.filter(":checked").each(function() {
                smallVals.push($(this).val());
            });
            this.resultContainer.empty();
            $.each(smallVals, function(i, v) {
                var hidden = $('<input type="hidden">').val(v);
                var text = _this.smallAreasText[v];
                var img = $("<span class='delete'><img src='/images/delete.png' /></span>")
                var span = $('<a href="javascript:void(0);" />').text(text).append(hidden).append(img);
                _this.resultContainer.append(span);
            });
            this.refreshBigArea(smallVals);
        },
        
        /**
         * 反过来将对应的大区选上，因为大区与大区之间有关联关系
         * @param smallVals 选中的省份的value数组
         * @param flag
         */
        refreshBigArea: function(smallVals) {
            //如果没有smallVals，就自己计算一下
            if (!smallVals) {
                smallVals = []
                this.smallAreas.filter(":checked").each(function() {
                    smallVals.push($(this).val());
                });
            }
            for (var rule in this.areaRules) {
                if (this.isArrayContains(smallVals, this.areaRules[rule])) {
                    this.bigAreas.filter("[value='" + rule + "']").attr("checked", true);
                }
                else {
                    this.bigAreas.filter("[value='" + rule + "']").attr("checked", false);
                }
            }
        },
        
        /**
         * 根据传进来的已经选择的省份，给相应元素标上样式
         */
        renderSelected: function() {
            var selectedAreaCodes = this.selectedAreaCodes.call(this.relatedEl);
            var selectedSmallVals = [];
            this.smallAreas.parent().removeClass("selected");
            this.bigAreas.parent().removeClass('selected');
            //给已经被选过的省份加上样式
            if (selectedAreaCodes && selectedAreaCodes.length > 0) {
                var selectedSmallVals = [];
                //先将省份标上
                this.smallAreas.each(function(i, checkbox) {
                    if ($(checkbox).attr("checked") === false && $.inArray($(checkbox).val(), selectedAreaCodes) > -1) {
                        $(checkbox).parent().addClass('selected');
                        selectedSmallVals.push($(checkbox).val());
                    }
                });
                //再将省份对应的区标上
                for (var rule in this.areaRules) {
                    if (this.isArrayContains(selectedSmallVals, this.areaRules[rule])) {
                        this.bigAreas.filter("[value='" + rule + "']").parent().addClass('selected');
                    }
                }
            }
        },
        
        /**
         * 检查数组A是否包含数组B的函数，即B是否为A的子集
         * @param {Object} arrA  “较大”的数组
         * @param {Object} arrb  “较小”的数组
         */
        isArrayContains: function(arrA, arrB) {
            arrB = arrB || [];
            var flag = true;
            $.each(arrB, function(i, b) {
                if ($.inArray(b, arrA) === -1) {
                    flag = false;
                    return false;
                }
            });
            return flag;
        },
        
        submitSelected: function() {
            var text = [], value = [];
            $("input:hidden", this.resultContainer).each(function() {
                text.push($(this).parent().text());
                value.push($(this).val());
            });
            this.onSubmit.call(this.relatedEl, text, value);
            this.layer.popHide();
        },
        
        /**
         * 设置当前设置目录关联的元素
         */
        setRelatedElement: function(el) {
            this.relatedEl = el;
        }
    });
    
    var areaLayer; //单例
    $.fn.area = function(options) {
        var settings = $.extend({
            "layer": "#area", //弹出层
            "submitBtn": "#areaSubmit", //弹出层确定按钮
            "cancelBtn": "#areaCancel", //弹出层取消按钮
            "resultContainer": "#areaResult" //展示已选择选项的区域
        }, options);
        if (!areaLayer) {
            areaLayer = new AreaLayer(settings);
        }
        //已经被选过的省份，渲染时会给个不同样式
        var selectedAreaCodes = options["selectedAreaCodes"] ||
        function() {
            return [];
        };
        //点击确定时的处理函数
        var onSubmitFunc = options["onSubmit"] ||
        function() {
        };
        //弹窗时，会根据此函数信息来回显数据，需要传递一个value数组
        var currValFunc = options["currVal"] ||
        function() {
            return null;
        };
        
        return this.each(function(i, el) {
            $(el).click(function() {
                areaLayer.setRelatedElement($(this));
                areaLayer.onSubmit = onSubmitFunc;
                areaLayer.currVal = currValFunc;
                areaLayer.selectedAreaCodes = selectedAreaCodes;
                areaLayer.pop();
            }).focus(function() {
                $(this).click();
            }).keydown(function(e) {
                e.preventDefault();
            });
        });
    };
})(jQuery);
