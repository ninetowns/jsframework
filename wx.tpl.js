define(['wx','wx.config'],function(wx,config){
  var cache = {};
  wx.tpl = function(template,data,appendEle){
    if(!cache[template]){
      var content    = template,
          match      = null,
          lastcursor = 0,
          codeStart  = 'var c = [];',
          codeEnd    = 'return c.join("");',
          param      = '',
          compileTpl = '',
          checkEXP   = /(^( )?(if|for|else|switch|case|continue|break|var|{|}))(.*)?/g,
          searchEXP  = new RegExp(config.tplOpenTag+'(.*?)'+config.tplCloseTag+'?','g'),
          replaceEXP = /[^\w$]+/g;

      if(template.charAt(0) === '#')
        content = $(template).html();
      else
        content = template;
      while(match = searchEXP.exec(content)){
        var b = RegExp.$1;
        var c = content.substring(lastcursor,match.index);
        c = _formatString(c);
        if(c.length)
          compileTpl += 'c.push("'+c+'");\n';
        if(checkEXP.test(b)){
          compileTpl += b;
        }
        else{
          compileTpl += 'c.push('+b+');\n';
        }
        _setVar(b);
        lastcursor = match.index+match[0].length;
      }

      compileTpl+= 'c.push("'+$.trim(_formatString(content.substring(lastcursor)))+'");';
      cache[template] = new Function('data','helper',param+codeStart+compileTpl+codeEnd);
    }

    var result = cache[template].call(null,data,wx.tpl.helperList);
    if(appendEle){
     $(appendEle).append(result);
    }

    function _formatString(s){
      return s.replace(/^\s*|\s*$/gm, '').replace(/[\n\r\t\s]+/g, ' ').replace(/"/gm,'\\"');
    }

    function _setVar(code){
      code = code.replace(replaceEXP,',').split(',');
      for(var i=0,l=code.length;i<l;i++){
        code[i] = code[i].replace(checkEXP,'');
        if(!code[i].length || checkEXP.test(code[i]) ||/^\d+$/.test(code[i])) continue;
        if(wx.tpl.helperList && code[i] in wx.tpl.helperList)
          param += code[i]+' = helper.'+code[i]+';';
        else
          param += 'var '+code[i]+' = data.'+code[i]+';';
      }
    }
    return result;
  };
  return wx;
})
