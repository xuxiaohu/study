(function($,win){
	win.online = [];
	$.fn.qq = function(settings){
		var defaults = {
		    v : 3,
			src : "http://wpa.qq.com/msgrd",
			site : "qq",
			menu : "yes"
	    };
	    settings = $.extend(defaults,settings);
	    var href = settings.src + "?" + settings.v + "&" + settings.uin + "&" + settings.site + "&" + settings.menu ;
	    if(online[0]==0){
		  this.append('<a target="_blank" href=' + href + '><img border="0" src="http://xxxxx/outline.jpg" alt="���������ҷ���Ϣ" title="���������ҷ���Ϣ"></a>');
		  }
		else{
		  this.append('<a target="_blank" href=' + href + '><img border="0" src="http://xxxxx/online.jpg" alt="���������ҷ���Ϣ" title="���������ҷ���Ϣ"></a>');
		}
	}
})(jQuery,window);

