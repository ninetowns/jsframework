define(['wx','wx.config'],function(wx,config){
	function Ajax(url,setting,callback){
		this.url = url;
		this.callback = callback||function(){};
		this.succCallback = null;
		this.failCallback = null;
		this.setting = {
			type:'post',
			dataType:'json',
			throttle :true
		}

		if($.type(setting) === 'string'){
			this.data = setting;
		} else if($.isPlainObject(setting)){
			this.data = setting.data||{};
			$.extend(this.setting, setting);
		} else if($.isFunction(setting)||parseInt(setting)){
			this.callback = setting;
		}
		this.send();
	}
	Ajax.lastUrl = '';
	Ajax.throttle = wx.throttle(function(){Ajax.lastUrl="";},3000);

	Ajax.prototype.send = function(){
		$.ajax({
			url:this.url,
			context:this,
			type:this.setting.type,
			dataType:this.setting.dataType,
			beforeSend:this.before,
			data:this.data
		}).done(this.done);
	}

	Ajax.prototype.before = function(xhr,params){
		var currentUrl = params.url+params.data || '';
		if(currentUrl === Ajax.lastUrl && this.setting.throttle){
			Ajax.throttle();
			return false;
		} else {
			Ajax.lastUrl = currentUrl;
		}
	}
	
	Ajax.prototype.done = function(data){
		if(config.getStatus(data) == config.dataSuccessVal){
			this.succCallback && this.succCallback(data);
		} else {
			this.failCallback && this.failCallback(data);
		}

		if(config.getStatus(data) == config.dataDefaultAlertVal){
			require(['wx.pop'],function(wx){
				wx.alert(config.getInfo(data),this.callback);
			});
		} else {
			this.callback(data);
		}
	}

	Ajax.prototype.success = function(callback){
		this.succCallback = callback;
		return this;
	}

	Ajax.prototype.fail = function(callback){
		this.failCallback = callback;
		return this;
	}

	wx.sendData =  function(url,setting,callback){
		return new Ajax(url,setting,callback);
	}
	return wx;
})
