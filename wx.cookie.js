  /**
   * 获取cookie和设置cookie
   * @name    cookie
   * @param   {String}  名字
   * @param   {String}  值
   * @param   {Object}  配置选项
   * @return  {String}  当只有名字时返回名字对应值
  */

define(['wx'],function(wx){
  wx.cookie = function(name, value, options) {
    if (typeof value !== 'undefined') {
      options = options || {};
      if (value === null) {
        value = '';
        options = $.extend({}, options);
        options.expires = -1;
      }
      var expires = '';
      if (options.expires && (typeof options.expires === 'number' || options.expires.toUTCString)) {
        var date;
        if (typeof options.expires === 'number') {
          date = new Date();
          date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
        } else {
          date = options.expires;
        }
        expires = '; expires=' + date.toUTCString();
      }
      var path = options.path ? '; path=' + (options.path) : ';path=/';
      var domain = options.domain ? '; domain=' + (options.domain) : '';
      var secure = options.secure ? '; secure' : '';
      document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else {
      var cookieValue = null;
      if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
          var cookie = wx.trim(cookies[i]);
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }
      return cookieValue;
    }
  };

  /**
   * 删除cookie的快捷方法
   * @name    removeCookie
   * @param   {String}  名字
  */
  wx.removeCookie = function(key) {
    wx.cookie(key,'',{expires:-1});
  };
  return wx;
})
