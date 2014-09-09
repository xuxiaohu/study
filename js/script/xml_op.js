(function($,win){
  $.xmlOp = function(options){
    var settings = {
                    element:null,
                    ie:$.browser.msie
                   };
    $.extend( settings, options );
    var _this = settings.element.jquery ? settings.element[0]:settings.element;
    var new_element;
    function xmlReplace(node){
      if(_this && _this.parentNode){
        _this.parentNode.replaceChild(node,_this);
      }
      return this;
    }
    
    function init(str_obj){
      return typeof str_obj === "string" ? $.parseXML(str_obj) : str_obj;
    }
    
    function append(node){
      var docObj = _this.documentElement;
      win.test = _this;
      docObj.appendChild(node.firstChild);
    }
  
  var self = {
           appendChildNode:function(str_obj){
             new_element = init(str_obj);
             append(new_element);
             return $(_this);
           },
           removeNode:function(str){
             return $(_this).find(str).remove();
           },
           replaceNode:function(str_obj){
             new_element = init(str_obj);
             xmlReplace(new_element)
             return $(_this);
           },
           find:function(str){
             return $(_this).find(str);
           }
  };
  return self;
};
})(jQuery,window)