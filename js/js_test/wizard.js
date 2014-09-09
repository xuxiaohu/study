// Copyright FUJITSU LIMITED 2011
// jQuery UI fjWizard
// extend jQuery UI Tabs 1.8.13 ++
(function($,undefined){
  var templates = {
    iconNode: [
'<span class="fjWizard-navi-icon-node"></span>'
    ].join(""),
    iconArrow: [
'<li class="fjWizard-navi-icon-arrow"></li>'
    ].join(""),
    iconLabel: [
'<div class="fjWizard-navi-label-cnt">',
  '<span class="fjWizard-navi-step"><%- step %></span>',
  '<span class="fjWizard-navi-label"><%- label %></span>',
'</div>'
    ].join("")
  }
  $.widget("ui.fjWizard", $.extend({},$.ui.tabs.prototype,{
    options: $.extend(true,{},$.ui.tabs.prototype.options,{
      parse: true,
      event: null,
      cache: true,
      navi: true,
      iconNavi: false,
      labels: {
        next: "Next",
        back: "Back",
        request: "Request",
        cancel: "Cancel"
      },
      request: {},
      extData: {}
    }),
    _create: function(){
      var self = this;
      var $element = self.element;
      var selfId = $element.attr("id");
      $element.addClass("fjWizard");
      $.ui.tabs.prototype._create.apply(this,arguments);
      self.fjDialogTop = $element.closest(".fjDialog-top").first();
      self.fjDialog = self.fjDialogTop.find(".fjDialog").first();
      self.fjDialogTop
        .addClass("fjWizard-dialog-top")
      // iconNavi
      if(self.options.iconNavi){
        // add icon node
        self.option("spinner","");
        self.anchors
          .each(function(idx){
            var $anchor = $(this);
            var aInner = $anchor.html();
            
            $anchor
              .empty()
              .append($(_.template(templates.iconLabel)({step:"Step"+(idx+1),label:aInner})));
            
            
          })
        self.anchors
          .prepend(templates.iconNode)
          .each(function(){
            var $anchor = $(this);
            $anchor
              .find(".fjWizard-navi-icon-node")
                .addClass($anchor.data("icon-class") || "fjWizard-no-icon")
              .end();
              
          })
        // hide no icon li node
        self.anchors
          .find(".fjWizard-no-icon")
            .closest("li")
              .hide()
            .end()
          .end();
            
        self.list.addClass("fjWizard-icon-navi");
        self.fjDialogTop.addClass("fjWizard-icon-navi-dialog-top");
        self.fjDialogTitle = self.fjDialogTop.find(".ui-dialog-titlebar");
        self.fjDialogContent = self.fjDialogTop.find(".ui-dialog-content");
        // add flow arrow node
        self.lis.addClass("fjWizard-icon-navi-li");
        self.lis.first().addClass("fjWizard-icon-navi-li-first");
        self.list
          .find(".fjWizard-icon-navi-li + .fjWizard-icon-navi-li:not(:hidden)")
            .before(templates.iconArrow);
        // adjust navi label margin
        self.anchors
          .find(".fjWizard-navi-label")
            .each(function(){
              var $label = $(this);
              // 2 rows
              if($label.height()>16){
                $label
                  .closest(".fjWizard-navi-label-cnt")
                    .addClass("fjWizard-navi-label-cnt-narrow-top")
              }
            })
          .end();
        
      }
      self.wizForm = $element.find(".fj-dialog-params").first();
      // create all button
      self._createButton({
        type: "back",
        label: self.options.labels.back,
        clickTopic: ["",selfId,"fjWizard/back"].join("/"),
        disabled: true,
        clickOnce: false
      });
      self._createButton({
        type: "next",
        label: self.options.labels.next,
        clickTopic: ["",selfId,"fjWizard/next"].join("/"),
        disabled: true,
        clickOnce: false
      });
      // request button
      self._createButton({
        type: "request",
        label: self.options.labels.request,
        request: $.extend({},self.options.request,{
          beforeSend: function(){
            self._copyToDialogForm();
          }
        }),
        clickTopic: ["",selfId,"fjWizard/request"].join("/")
      });
      self._createButton({
        type: "cancel",
        label: self.options.labels.cancel,
        clickTopic: ["",selfId,"fjWizard/cancel"].join("/")
      });
      
      // subscribe topic
      $element
        .fjSubscribe(["",selfId,"fjWizard/next"].join("/"),function(){
          var selected = self.option("selected");
          var $wizChild = self.panels.eq(selected).children();
          var wizChildId = $wizChild.attr("id");
          var checkUrl = $wizChild.data("check-url");
          var data = $wizChild.find(".fj-wizard-check-params").serializeObject();
          var requestType = $wizChild.data("type") || "GET";
          var checkType = $wizChild.data("check-type") || "";
          var dfd_next = $.Deferred();
          if(selected+1 >= self.length()){
            return;
          }
          self._setDisabledBtn("back", true);
          self._setDisabledBtn("next", true);
          self.fjDialog.fjDialog('openInProgressDialog', {message: 'Checking ...'});
          if(checkUrl && $.isString(checkUrl)){
            $.ajax({
              url: checkUrl,
              type: checkType || requestType,
              data: data
            })
            .done(function(){
              $wizChild.fjPublish(["",wizChildId,"check/ok"].join("/"),arguments);
              $wizChild.fjPublish(["",selfId,"check/ok"].join("/"),arguments);
              dfd_next.resolve();
            })
            .fail(function(){
              $wizChild.fjPublish(["",wizChildId,"check/error"].join("/"),arguments);
              $wizChild.fjPublish(["",selfId,"check/error"].join("/"),arguments);
              self.fjDialog.fjDialog('closeInProgressDialog');
            })
          }else{
            dfd_next.resolve();
          }
          dfd_next
            .done(function(){
              self.fjDialog.fjDialog('closeInProgressDialog');
              self._copyToDialogForm();
              var sendData;
              // if pre confirm request
              if(selected == (self.length() - 2)){
                  sendData = self.wizForm.serializeObject();
              } else {
                  sendData = data;
              }
              self._setOptions({
                ajaxOptions: {
                  type: requestType,
                  data: sendData
                }
              });
              self.select(selected+1);
              self._setBtnState();
            })
        })
        //Back button
        .fjSubscribe(["",selfId,"fjWizard/back"].join("/"),function(){
            var selected = self.option("selected");
            if (selected == 0) {
              return;
            };
            
            self._setDisabledBtn("back", true);
            self._setDisabledBtn("next", true);
            self._restoreDialogForm();
            self.anchors.eq(selected).data("cache.tabs",false);
            self.select(selected-1);
            self._setBtnState();
        })
        .fjSubscribe(["",selfId,"fjWizard/select"].join("/"),function(aId){
          if($.isString(aId)){
            var aIds = $.makeArray(
              self.anchors
                .map(function(){
                  return ($(this).attr("id")||"null")
                })
              )
            self.select($.inArray(aId,aIds));
            self._setBtnState();
          }
        })
        // Initialized Button State
        .one("tabsload", function(event){
            clearTimeout(self._createTimer);
            self._setBtnState();
            self._setDisabledBtn("back",false);
            self._setDisabledBtn("next",false);
        })
        // Convert to disable/enabe
        .bind("tabsshow",function(event,ui){
          var selected = ui.index;
          var $wizChild = self.panels.eq(selected).children();
          var btnLabels = $wizChild.data("button-labels") || null;
          var showBtns = $wizChild.data("show-buttons") || null;
          var hideBtns = $wizChild.data("hide-buttons") || null;
          self._setDisabledBtn("back",false);
          self._setDisabledBtn("next",false);
          self._setBtnLabels(btnLabels);
          setTimeout(function(){
            self._setShowBtns(showBtns);
            self._setHideBtns(hideBtns);
          },1);
        })
        .bind("tabsselect", function(event,ui){
            var selected = ui.index;
            $element.find("ul.ui-tabs-nav")
              .children("li.fjWizard-navi-next-active")
                .removeClass("fjWizard-navi-next-active")
              .end()
            .end();
            if(selected > 0){
              // set previous navi class
              $(self.anchors[selected-1]).parent("li").addClass("fjWizard-navi-next-active");
            }
        })
        .bind("tabscreate tabsadd tabsremove",function(event,ui){
          $element
            .find("ul.ui-tabs-nav")
              .children("li.fjWizard-navi-last")
                .removeClass("fjWizard-navi-last")
              .end()
              .children("li:last")
                .addClass("fjWizard-navi-last")
              .end()
            .end()
          if(self.length()>1 && (self.options.navi)){
            self.list.show();
          }else{
            self.list.hide();
          }
        })
        .bind("tabsload", function(event,ui){
          var selected = ui.index;
          var $wizChild = self.panels.eq(selected).children();
          var $dialogForm = $element.find(".fj-dialog-params").first();
          var btnLabels = $wizChild.data("button-labels") || null;
          var showBtns = $wizChild.data("show-buttons") || null;
          var hideBtns = $wizChild.data("hide-buttons") || null;
          if($wizChild.data("next-disabled")){
            setTimeout(function(){
              self._setDisabledBtn("next",true);
            },1);
          }
          self._setBtnLabels(btnLabels);
          $(ui.panel).children()
            .data("fjWizard-form",$dialogForm)
            .data("fjWizard-top-id",$element.attr("id"))
          .end();
          self._setShowBtns(showBtns);
          self._setHideBtns(hideBtns);
          // autoParse
          if(self.options.parse){
            self.element.fjParse();
          }
        })
      self._createTimer = setTimeout(function(){
        self._setBtnState(true);
      },0)
    },
    _createButton: function(data){
      var $element = this.element;
      $("<div>")
        .addClass("fj-dialog-button fjWizard-dialog-button")
        .appendTo($element)
        .data(data)
    },
    _setBtnState: function(hide){
      var self = this;
      var $element = self.element;
      var selfId = $element.attr("id");
      var selected = self.option("selected");
      var length = self.length();
      var btnStatus = {"back":"show", "next": "show", "request": "hide", "cancel":"show"};
      var isLast = selected == (length - 1);
      var isFirst = selected == 0;
      
      if(isLast){
          $.extend(btnStatus, {"next": "hide", "request": "show"});
      }
      if(isFirst) {
        $.extend(btnStatus, {"back":"hide"});
      }

      $.each(btnStatus, function(i, val){
        if(hide){
          val = "hide";
        }
         $element.fjPublish(["", selfId, val, "button"].join("/"),[i])
      });
    },
    _setDisabledBtn: function(type, disabled){
      var $element = this.element;
      var selfId = $element.attr("id");
      var convertTo;
      if(disabled){
          convertTo = "disable";
      } else {
          convertTo = "enable";
      }
      
      $element.fjPublish(["", selfId, convertTo, "button"].join("/"),[type],true);
    },
    _setBtnLabels: function(btnLabels){
      var self = this;
      var $element = self.element;
      var selfId = $element.attr("id")
      if(btnLabels == "reset"){
        $.each(self.options.labels,function(key,value){
          $element.fjPublish(["",selfId,"set/button/label"].join("/"),[key,value]);
        });
      }
      if($.isPlainObject(btnLabels)){
        $.each(btnLabels,function(key,value){
          $element.fjPublish(["",selfId,"set/button/label"].join("/"),[key,value]);
        });
      }
    },
    _setShowBtns: function(showBtns){
      var self = this;
      var $element = self.element;
      var selfId = $element.attr("id")
      $.each($.makeArray(showBtns),function(index,value){
        $element.fjPublish(["",selfId,"show/button"].join("/"),[value]);
        if($.inArray(value,["next","back","request","cancel"]) == -1){
          $element.one("tabsselect",function(){
            $element.fjPublish(["",selfId,"hide/button"].join("/"),[value]);
          });
        }
      })
    },
    _setHideBtns: function(hideBtns){
      var self = this;
      var $element = self.element;
      var selfId = $element.attr("id")
      $.each($.makeArray(hideBtns),function(index,value){
        $element.fjPublish(["",selfId,"hide/button"].join("/"),[value]);
      })
    },
    _copyToDialogForm: function(){
      // set form data childForm -> wizForm
      var self = this;
      var selected = self.option("selected");
      var $wizChild = self.panels.eq(selected).children();
      var data = $wizChild.find(".fj-wizard-check-params").serializeObject();
      // backup form values
      self.wizForm.data("fjWizard-backup-form-values",self.wizForm.serializeObject());
      $.fj.plugin.setFormValues(self.wizForm,data);
    },
    _restoreDialogForm: function(){
      var self = this;
      $.fj.plugin.setFormValues(self.wizForm,self.wizForm.data("fjWizard-backup-form-values"));
    },
    _notifyEvent: function($target,topic){
      var targetId = $target.attr("id");
      var self = this;
      var $element = self.element;
      if(targetId && $.isString(topic)){
        $element.fjPublish(["",targetId,"fjWizard",topic].join("/"));
      }
    },
    destroy: function(){
      var self = this;
      if(self.fjDialogTop && $.isFunction(self.fjDialogTop.removeClass)){
        self.fjDialogTop
        .removeClass("fjWizard-dialog-top")
        .removeClass("fjWizard-icon-navi-dialog-top")
      }
      $.ui.tabs.prototype.destroy.apply(this, arguments);
    }
  }));
})(jQuery);

(function($) {
    
    // The topics/subscriptions hash
    var topics = {};
    
    /**
     * @description Publishes some data on a named topic.
     * @param {String} topic The topic to publish.
     * @param {Array} [args] The data to publish.
     * @param {Boolean} [sync] Whether publish topics in order of execution (sync = true) or when possible (default).      
     * @returns {jQuery} returns jQuery object.
     * @example
     * $( "#sidebarWidget" ).publish( "/some/topic", [ "a", "b", "c" ] ); 
     */
     $.fn.publish = function ( topic, args, sync ) {   
        
        if ( typeof topics[topic] == "undefined" ) { 
            return this;
        }
        
        var args = args || [],
            argsLength = args.length, 
            t = topics[topic], 
            l = t.length,
            that = this,
            publish = function() {
                that.each( function( i, obj ) {             
                    // Let's add a reference to the publisher object
                    args[argsLength] = obj;
                    
                    for (var i = 0; i < l; i++) {
                        t[i].callback.apply( t[i].object, args );
                    }   
                });
            };
        
        if ( sync === true ) {
            publish();
        } else {
            setTimeout( publish, 0 );
        }
        
        return this;
    };
    
    
    /**
     * @description Registers a callback on a named topic.
     * @param {String} topic The topic to subscribe to.
     * @param {Function} callback The handler. Anytime something is published on a subscribed 
     * topic, the callback will be called with the published array as ordered arguments.            
     * @returns {jQuery} returns jQuery object.
     * @example
     * $( "#header" ).subscribe( "/some/topic", function( a, b, c ) { // handle data } ); 
     */
    $.fn.subscribe = function( topic, callback ) {
        topics[topic] = topics[topic] || [];
        
        this.each( function( i, obj ) {
            // Array.push() is way slower. See: http://jsperf.com/array-push-el-vs-array-array-length-el
            topics[topic][topics[topic].length] = { "object": obj, "callback": callback };
        });
        
        return this;    
    };
    
    
    /**
     * @description Unregisters a previously registered callback for a named topic.
     * @param {String} topic The topic to unsubscribe from.     
     * @returns {jQuery} returns jQuery object.
     * @example
     * $( "#header" ).unsubscribe( "/some/topic" ); 
     */
    $.fn.unsubscribe = function ( topic ) {
        
        if ( typeof topics[topic] == "undefined" ) { 
            return this;
        }
        
        this.each( function( i, obj ) {
            topics[topic] = $.grep( topics[topic], function( aElem, j ) {
                return ( obj !== aElem.object );
            });
        });
        
        if ( topics[topic].length === 0 ) {
            delete topics[topic];
        }
        
        return this;    
    };
    
}(jQuery));

(function($,undefined){
  $.fn.fjSubscribe = function(topic,callback){
    return this.unsubscribe(topic)
               .subscribe(topic,null)
               .each(function(){
                 var $this = $(this),
                      name = 'fjSubscribe-remove' + topic;
                 if(!$this.data(name)){
                   $this
                     .data(name,true)
                     .on('remove',function(){
                       $(this).unsubscribe(topic);
                     });
                  }
               });
  };
  $.fn.fjPublish = function(topic,args,sync){
    return this.publish(topic,$.makeArray(args),sync);
  };
  $.fn.fjUnsubscribe = $.fn.unsubscribe;
})(jQuery);
