define(['wx.tpl','wx.config'],function(wx,config){
  function Dialog(content,tpl,setting){
    Dialog.zIndex++;
    this.$layer =null;
    this.$body = null;
    this.setting = {
      content:content,
      tpl:tpl,
      top:0,
      autoClose:0,
      action:-1,
      style:{},
      layerClick :false,
      notShow:false,
      attachBg:false
    }
    if($.isPlainObject(setting))
      $.extend(this.setting, setting);
    else
      $.extend(this.setting, {action:setting});

    this.init();
    if(this.setting.notShow)
      this.close();
    else
      this.show();
  }

  Dialog.zIndex = 10;

  Dialog.prototype.init = function(){
    this.setting.content =  wx.tpl(this.setting.tpl,this.setting).replace('<%',config.tplOpenTag).replace('%>',config.tplCloseTag);
    this.$layer = $('<div class="ui-dialog-bg" style="z-index:'+(Dialog.zIndex*10)+'"></div>');
    this.$body  = $('<div class="ui-dialog-container" style="z-index:'+(Dialog.zIndex*10+1)+'">'+this.setting.content+'</div>');
    this.resize();
    if(this.setting.attachBg){
      $("body").css({"overflow":"hidden","position":"relative","height":$(window).height()});
      this.$layer.css({"width":$(window).width(),"height":$(window).height()});
    }
  }

  Dialog.prototype.close = function(){
    if(this.setting.action === wx.RELOAD)
      location.reload();
    else if(this.setting.action === wx.BACK)
      history.back(-1);
    else if($.type(this.setting.action) === 'string')
      location.href = this.setting.action;
    else if($.isFunction(this.setting.action))
      this.setting.action();
    else
      this.$body.triggerHandler('close');
    $(window).off('resize',this.resize);
    this.$layer.hide().remove();
    this.$body.hide().remove();
    if(this.setting.attachBg){
      $('body').css({'overflow':'auto','position':'static','height':'auto'});
    }
  }

  Dialog.prototype.resize = function(){
    var window_width = $(window).width(),
        window_height = $('body').outerHeight(true) > $(window).height() ? $('body').outerHeight(true) : $(window).height();
    this.$layer.css({'width':window_width,'height':window_height});
  }

  Dialog.prototype.bindSystemEvent = function(){
    var closeFun = $.proxy(this.close,this);
    $('.Js-dialog-close',this.$body).click(closeFun);
    $(window).on('resize',$.proxy(this.resize,this));
    if(this.setting.layerClick){
      this.$layer.click(closeFun);
    }
    if(this.setting.autoClose){
      setTimeout(closeFun,this.setting.autoClose);
    }
  }

  Dialog.prototype.bindEvent = function(){
    this.$body.on.apply(this.$body,arguments);
  }

  Dialog.prototype.toCenter = function(){
    this.$body.css($.extend({'margin-left':0-this.$body.width()/2,'margin-top':$(window).scrollTop()-this.$body.height()/2}, this.setting.style));
  }

  Dialog.prototype.animate = function(){
    this.$layer.addClass('show');
    this.$body.addClass('show');
  }

  Dialog.prototype.drag = function(){
    var isMove      = false,
        lastX       = -1,
        lastY       = -1,
        offsetX     = -1,
        offsetY     = -1,
        $winBody    = $('body'),
        $moveBar    = $('.Js-drag',this.$body),
        $moveBody   = this.$body,
        isAbsoluate = $moveBody.css('position') === 'absolute' ? true : false;

    if($moveBar.length === 0 || $moveBody.length === 0) return;
    $moveBar.css('cursor','move').unbind('mousedown').
      bind('mousedown',function(event){
        event.preventDefault();
            tempX = $moveBody.offset().left,
            tempY = $moveBody.offset().top - (isAbsoluate ? 0 : $(document).scrollTop());
        isMove  = true;
        lastX   = event.clientX;
        lastY   = event.clientY;
        offsetX = event.clientX - tempX;
        offsetY = event.clientY - tempY;
        $winBody.unbind('mousemove').bind('mousemove',function(event){
            if(!isMove) return false;
            event.preventDefault();
            event.stopPropagation();
            lastX = event.clientX - lastX;
            lastY = event.clientY - lastY;
            $moveBody.addClass('move').css({'left' : event.clientX-lastX-offsetX,'top' : event.clientY-lastY-offsetY});
            lastX = event.clientX;
            lastY = event.clientY;
        });
    }).unbind('mouseup').bind('mouseup',function(event){
        isMove = false;
        $winBody.unbind('mousemove');
    });
    $winBody.unbind('mouseup').bind('mouseup',function(){
        isMove = false;
    });
    $moveBar.blur(function(){
        isMove = false;
        $winBody.unbind('mousemove');
    });
  }

  Dialog.prototype.show = function(){
    $('body').append(this.$layer,this.$body);
    this.bindSystemEvent();
    this.toCenter();
    this.animate();
    this.drag();
  }

  wx.loading = function(setting){
    return new Dialog('',config.loading,setting);
  }

  wx.alert = function(content,setting){
    return new Dialog(content,config.alert,setting);
  }

  wx.confirm = function(content,setting){
    var confirm = new Dialog(content,config.confirm,setting);
    confirm.bindEvent('click','#Js-dialog-confirm',function(){
      if($.isFunction(setting.fn))
        setting.fn.call(setting.context||this);
      confirm.close();
    });
    return confirm;
  }

  wx.pop = function(content,setting){
    return new Dialog(content,config.pop,setting);
  }
  return wx;
});


