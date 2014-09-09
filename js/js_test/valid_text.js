(function ($, window, document, undefined) {
    var delegate_elements = [];
    var support_placeholder = "placeholder" in document.createElement("input");
    var delegate_element = null;
    var unique_splite = new Date().getTime();
    var default_settings = {
      on_error: function(){},
      on_success: function(){},
      errorClass: "warning",
      delegate_element: null
    };
    
    $.validText = {
      init: function(options) {
        delegate_element = $(options.elem);
        if(delegate_element.length == 0){
          return;
        }
        if($.inArray(delegate_element[0],delegate_elements) == -1){
          delegate_elements.push(delegate_element[0]);
        }
        default_settings.delegate_element = delegate_element;
        $.extend(default_settings, options);
        return delegate_element;
      }
    };
    
    $.fn.validText =  function(options){
      // trigger it by options is empty
      if(!options){
        this.data("validator").elements_valid(this);
        return this;
      }
      var settings = {
        required: false,
        format: null,
        placeholder: true,
        elements_valid: function(elem){
          var slectors = $(this.delegate_element).data("selector").split(unique_splite);
          var valid_flag = true;
          $.each(slectors,function(i,item){
            if(!valid($(item),$(item)[0] == elem[0])){
              valid_flag = false;
            }
          })
          if(valid_flag){
            this.on_success();
          }else{
            this.on_error();
          }
        }
      };
      var _this = this;
      init();
      
      _this.focus(function(){
        if(!support_placeholder && settings.placeholder){
            removePlaceholder($(this));
        }
      }).blur(function(){
        if(!support_placeholder && settings.placeholder){
            addPlaceholder($(this));
        }
        settings.elements_valid($(this));
      }).keyup(function(){
        settings.elements_valid($(this));
      });
      
      // recored the elements for trigger
      function init(){
        $.extend(settings, options , default_settings);
        settings.delegate_element = delegate_element[0];
        _this.data("validator",settings);
        var selector = _this.selector;
        if(!delegate_element.data("selector") || delegate_element.data("selector") == ""){
            delegate_element.data("selector", selector);
            return;
        }
        var slectors = delegate_element.data("selector").split(unique_splite);
        $.each(slectors,function(i,item){
            if($(item)[0] == _this[0]){
                return;
            }
        })
        delegate_element.data("selector",delegate_element.data("selector") + unique_splite + selector);
      }
      
      function valid(elem,show_flag){
        var valid_flg = true;
        $.each(["required","format"],function(i,item){
          //if(elem.data("validator")[item]){
          if(settings[item]){
            if (!requiredValid(elem,show_flag)){
              valid_flg = false
              return false;
            }
          }
        });
        return valid_flg;
      }
      
      function addPlaceholder(elem){
        elem.val(elem.attr("placeholder")).addClass("placeholder");
      }
      
      function removePlaceholder(elem){
        elem.val("").removeClass("placeholder");
      }
      
      function requiredValid(elem,show_error){
        if($.trim(elem.val()) == ""){
          if(!show_error){
            return false;
          }
          if(!elem.hasClass(settings.errorClass)){
              elem.addClass(settings.errorClass);
              addErrorPlace(elem,settings.required_msg);
          }
          return false;
        }else{
          if(!show_error){
            return true;
          }
          elem.removeClass(settings.errorClass);
          removeErrorPlace(elem);
          return true;
        }
      }
      
      function formatValid(elem,show_error){
        if(new RegExp(settings.pattern).test(this.val())){
          if(!show_error){
            return false;
          }
          this.removeClass(settings.errorClass);
          removeErrorPlace(this);
          return false;
        }else{
          if(!show_error){
            return true;
          }
          this.addClass(settings.errorClass);
          addErrorPlace(this,settings.format_msg);
          return true;
        }
      }
      
      function addErrorPlace(elem,error_msg){
        elem.after("<label class='error_msg'>" + error_msg + "</label>");
      }
      
      function removeErrorPlace(elem){
        elem.next(".error_msg").remove();
      }
    };
    
    // open a door for the delegate element to trigger all the validator;
    $.fn.validator = function(){
      var slectors = this.data("selector").split(unique_splite);
      var valid_flag = true;
      $.each(slectors,function(i,item){
        $(item).validText();
      })
    };
})(jQuery, window, document);