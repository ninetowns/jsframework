define(['wx','wx.config','wx.ajax','wx.pop'],function(wx,config){
  var prefix = 'wx-validator';
  wx.validator = function(context){
    $('form['+prefix+'],form['+prefix+'-ajax]',context||document).each(function(){
      if(!wx.validator[$(this).attr('name')])
        wx.validator[$(this).attr('name')] = new WxForm($(this));
    });
  }

  function WxForm($form){
    this.$form = $form;
    this.$elements = $('input,textarea,select',$form).not('[type=submit]');
    this.$submitBn = $('a[type="submit"]',$form) || $('input[type="submit"]',$form);
    this.wxElements  = [];
    this.isSubmit = false;
    this.setting = {
      name        : $form.attr('name'),
      action      : $form.attr('action'),
      type        : typeof $form.attr(prefix)=='string'?'submit':'submitAjax',
      errorTag    : $form.attr(prefix+'-error-tag')||'span',
      errorClass  : $form.attr(prefix+'-error-class')||'error-text',
      singleError : $form.attr(prefix+'-single-error')||false,
      subConfirm  : this.$submitBn.attr(prefix+'-confirm'),
      enterSubmit : typeof $form.attr(prefix+'-entersubmit')=='string'?0:1,
      autoComp    : typeof $form.attr(prefix+'-autocomplete')=='string'?0:1,
      noScroll    : typeof $form.attr(prefix+'-notscrolltoerror')=='string'?0:1
    };
    this.init();
  }

  WxForm.prototype.init = function(){
    var $form = this.$form;
    $form.attr('autocomplete','off');
    $('a[type="submit"]', $form).click($.proxy(this.checkAll,this));
    $form.submit($.proxy(this.checkAll,this));
    if(this.setting.enterSubmit){
      $form.find('input').filter(':visible :last').keydown(function(event) {
        if(event.keyCode === 13) $form.submit();
      });
    }

    for(var i=0;i<this.$elements.length;i++){
      this.addElement(this.$elements[i]);
    }
  }

  WxForm.prototype.addElement = function(ele){
    if(ele instanceof jQuery)
      ele = ele[0];
    if(!ele.getAttribute('name') || ele.getAttribute(prefix+'-rule') === null)
      return;
    switch(ele.type){
      case 'password':
      case 'text':
      case 'textarea':
          this.wxElements.push(new Input(ele,this));
      break;
      case 'select-one':
          this.wxElements.push(new Select(ele,this));
      break;
      case 'checkbox':
          this.wxElements.push(new Checkbox(ele,this));
      break;
    }
  }

  WxForm.prototype.find = function(name){
    if(!name) return this.wxElements;
    for(var i=0;i<this.wxElements.length;i++){
      if(this.wxElements[i].setting.na.indexOf(name) !== -1)
        return this.wxElements[i];
    }
    return null;
  }

  WxForm.prototype.checkAll = function(event){
    if(window.returnValue) window.returnValue = false;
      event.preventDefault();
    var errorEle = null;
    for(var i=0;i<this.wxElements.length;i++){
      if(!this.wxElements[i].isValid && !this.wxElements[i].valid()){
        errorEle = this.wxElements[i];
        break;
      }
    }

    if(errorEle){
      if(!this.setting.noScroll){
        var errorEleTop = errorEle.$ele.offset().top - errorEle.$ele.height();
        if(errorEleTop < $(document).scrollTop()){
          $('html,body').animate({'scrollTop':errorEleTop},1000);
        }
      }
    } else {
      var before = this.$form.triggerHandler('validator:before',this);
      if(before || typeof before === 'undefined'){
        if(this.setting.subConfirm){
          wx.confirm(this.setting.subConfirm,{context:this,fn:function(){
            this[this.setting.type]();
          }});
        } else {
            this[this.setting.type]();
        }
      }
    }
  }

  WxForm.prototype.submit = function(){
    if(!this.isSubmit){
      this.isSubmit=true;
      this.$form.off('submit').submit();
    }
  }

  WxForm.prototype.submitAjax = function(){
    var thisForm = this,
        presetAcion = this.$form.attr(prefix+'-ajax');
    wx.sendData(this.setting.action,this.$form.serialize(),function(data){
      thisForm.$form.triggerHandler('validator',data);
      if(presetAcion && config.getStatus(data) == config.dataSuccessVal){
        var ajaxAction = presetAcion.split('-');
        wx.alert(config.getInfo(data),{notShow:ajaxAction.length === 2,action:ajaxAction[0].toUpperCase() === 'JUMP' ? data[config.dataJumpFlag] : wx[ajaxAction[0].toUpperCase()]});
      }
    });
  }

  WxForm.prototype.resetSingleError = function(){
    $(this.setting.singleError).text('');
  }

  WxForm.prototype.singleError = function(errText){
    $(this.setting.singleError).text(errText).show();
  }


  function Element(ele,wxform){
    if(!ele) return;
    Element.ID++;

    this.$ele = $(ele);
    this.wxform = wxform;
    this.isValid = false;
    var namePrefix=this.$ele.attr('name');
    namePrefix = prefix+'-'+(namePrefix.indexOf('[]')!=-1 ? namePrefix.slice(0,namePrefix.length-2)+Element.ID : namePrefix)+'-';
    this.setting = {
        'na' : '.'+namePrefix,
        'nb' : namePrefix,
        'nt' : !!this.$ele.attr(prefix+'-notip'),
        'ru' : this.$ele.attr(prefix+'-rule'),
        'ae' : $('.'+namePrefix+'error'),
        'as' : $('.'+namePrefix+'success')
    };
  }

  Element.ID = 0;

  Element.prototype.getValid = function(isValid,errorRule,text){
    this.resetError();
    this.isValid = isValid;
    this.$ele.triggerHandler('validator',isValid);
    if(isValid)
        this.showSuccess(text);
    else
        this.showError(errorRule,text);

    return isValid;
  }

  Element.prototype.resetError = function(){
    this.$ele.removeClass('wx-errorBorder');
    $('[class^='+this.setting.nb+']').not('[class='+this.setting.nb+'left]').hide();
    $(this.setting.na+'[class^='+this.setting.nb+']').hide();
    this.setting.ae.hide();
    this.setting.as.hide();
    this.wxform.resetSingleError();
  }

  Element.prototype.showSuccess = function(info){
    if(this.setting.as.length){
      this.setting.as.show();
    } 
  }

  Element.prototype.showError = function(errorRule,info){
    this.$ele.addClass('wx-errorBorder');
    if(this.setting.nt){
      return;
    }
    var errorRule = errorRule.split(',');
    var errText = this.$ele.attr(this.setting.nb+errorRule[0])||config.validator[errorRule[0]].replace('@',errorRule[1]);
    if(this.wxform.setting.singleError){
      this.wxform.singleError(info||errText);
    } else if(this.setting.ae.length){
      this.setting.ae.show().text(info||errText);
    } else if($(this.setting.na+errorRule[0]).length){
        $(this.setting.na+errorRule[0]).show().text(info);
    } else {
        this.$ele.after('<'+this.wxform.setting.errorTag+' class="'+this.setting.nb+errorRule[0]+' '+this.wxform.setting.errorClass+'">'+(info||errText)+'</'+this.wxform.setting.errorTag+'>');
    }
  }

  function Input(inp,wxform){
    Element.apply(this,arguments);
    this.init();
  }

  Input.prototype = new Element;

  Input.prototype.init = function(){
    $.extend(this.setting, {
        'et' : this.$ele.attr(prefix+'-event'),
        'ph' : this.$ele.attr(prefix+'-placeholder'),
        'ls' : this.$ele.attr(prefix+'-left-show')
    });
    
    if(this.setting.ph){
      this.placeholder();
    }
    this.$ele.on(this.setting.et||'blur',$.proxy(this.valid,this));
  }

  Input.prototype.placeholder = function(){
    var $thisInp = this.$ele,ph = this.setting.ph;
    if('placeholder' in $thisInp[0]){
      $thisInp.attr('placeholder',this.setting.ph);
      $thisInp.next('.wx-placeholder').remove();
    } else {
      $thisInp.val(ph).addClass('wx-placeholder');
      $thisInp.click(function(){
        if($(this).val() == ph)
          $thisInp.val('').removeClass('wx-placeholder');
      }).blur(function(){
        if(wx.trim($(this).val()).length === 0){
          $thisInp.val(ph).addClass('wx-placeholder');
        }
      });
    }
  }

  Input.prototype.valid = function(){
    var rules = this.setting.ru.split('|');
    var isAllRight = true,notValidRule,validItem;
    for(var i=0,l=rules.length;i<l;i++){
        var r = rules[i].split(','),
            value = wx.trim(this.$ele.val()),
            validItem = wx.validator.rule[r[0]]( value == this.setting.ph?'':value,r[1],this);
        if(r[0].length && !validItem){
            isAllRight = false;
            notValidRule = rules[i];
            break;
        }
    }
    if(typeof validItem !== 'undefined')
      this.getValid(isAllRight,notValidRule);
    else
      this.resetError();

    if(this.setting.ls){
      $(this.setting.na+'left').text(parseInt(this.setting.ls) - this.$ele.val().length);
    }
    return isAllRight;
  }

  function Select(sel,wxform){
    Element.apply(this,arguments);
    this.init();
  }

  Select.prototype = new Element;

  Select.prototype.init = function(){
    this.$ele.change($.proxy(this.valid,this));
  }
  Select.prototype.valid = function(){
    return this.getValid(this.$ele.find('option:selected').index(),'required');
  }

  function Checkbox(sel,wxform){
    Element.apply(this,arguments);
    this.init();
  }

  Checkbox.prototype = new Element;

  Checkbox.prototype.init = function(){
    var checkbox = this;
    this.$ele.click(function(){
      checkbox.valid.call(checkbox);
    });
  }
  Checkbox.prototype.valid = function(){
    return this.getValid(this.$ele.is(':checked'),'required');
  }

  function getSringBytes(s){
    var cArr = s.match(/[^x00-xff]/ig);
    return s.length + (cArr === null ? 0 : cArr.length);
  }


  /**
   * 为验证添加新规则
   * @name    addNewRule
   * @param   {String}    规则名称
   * @param   {String}    错误信息
   * @param   {Function}  验证方法
  */
  wx.validator.addNewRule = function(ruleName,errorMessage,fn){
    if(!ruleName || !errorMessage || !fn) return;
    wx.validator.rule[ruleName]   = fn;
    config.validator[ruleName] = errorMessage;
  };

  wx.validator.rule = {
    required: function(value){
      return value.length > 0;
    },
    email: function(value) {
      return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
    },
    mobile: function(value){
      return /^1[3|4|5|7|8][0-9]\d{8}$/.test(value);
    },
    telphone: function(value){
      return /^(\d{3}-\d{8}|\d{4,5}-\d{7,8})$/.test(value);
    },
    range: function(value, param) {
      param = param.split('-');
      return value >= Number(param[0]) && value <= Number(param[1]);
    },
    min: function(value, param ) {
      return value >= Number(param);
    },
    max: function( value, param ) {
      return value <= Number(param);
    },
    rangeEqual: function(value, param) {
      return  value.length === Number(param);
    },
    rangelength: function(value, param) {
      param = param.split('-');
      return  value.length >= Number(param[0]) && value.length <= Number(param[1]);
    },
    minLength:function(value, param){
      return value.length >= parseInt(param);
    },
    maxLength:function(value, param){
      return value.length <= parseInt(param);
    },
    byteRangeLength: function(value, param) {
      param = param.split('-');
      return getSringBytes(value) >= parseInt(param[0]) && getSringBytes(value) <= parseInt(param[1]);
    },
    byteMinLength: function(value,param){
      return getSringBytes(value) >= parseInt(param);
    },
    byteMaxLength:function(value, param){
      return getSringBytes(value) <= parseInt(param);
    },
    byteRangeEqual: function(value, param) {
      return  getSringBytes(value) === parseInt(param);
    },
    equalTo: function(value, equalToElement) {
      return value.length>0 && value === $("input[name='"+equalToElement+"']").val();
    },
    digits: function(value) {
      return /^\d+$/.test(value);
    },
    post: function(value) {
      return /^[0-9]{6}$/.test(value);
    },
    cardId: function(value) {
      return /^(\d{18,18}|\d{15,15}|\d{17,17}[xX])$/.test(value);
    },
    passport: function(value) {
      return /^1[45][0-9]{7}$|^G[0-9]{8}$|^P[0-9]{7}$|^S[0-9]{7,8}$|^D[0-9]+$/.test(value);
    },
    noSymbol: function(value) {
      return /^[\w|\u4e00-\u9fa5]*$/.test(value);
    },
    date: function(value) {
      return /^(\d{4})-(\d{2})-(\d{2})$/.test(value);
    },
    url: function(value){
      return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
    },
    money: function(value) {
      return /^[0-9]+([.]{1}[0-9]{1,2})?$/.test(value);
    },
    ajax: function(value,url,inp) {
      checkAjaxData_thr(value,url,inp);
    },
    regExp: function(value,reg) {
      return new RegExp(reg).test(value);
    },
    empty: function() {
      return true;
    },
    basic:function(value){
      return !/select|update|delete|truncate|join|union|exec|insert|drop|count|'|"|;|>|<|%/i.test(value);
    }
  };

  var checkAjaxData_thr = wx.throttle(checkAjaxData,500);
  function checkAjaxData (value,url,inp) {
      var urlParam = url.split('@');
      wx.sendData(urlParam[1],{data:urlParam[0]+'='+encodeURIComponent(value),'throttle':false,'dataType':'jsonp','type':'get'},function(data){
          inp.getValid(config.getStatus(data) == config.dataSuccessVal,'ajax',config.getInfo(data));
      });
  }
  return wx;
});