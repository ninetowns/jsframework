/**
* wx
*
* 基础类库
* 提供前端所需要的各种便捷方法
* 目的是用最少代码实现丰富功能
*
* @author xuyong <xuyong@ninetowns.com>
* @createTime 2015-04-01
* @projectHome https://github.com/ninetowns/jsframework
*
* Released under the MIT license:
*   http://www.opensource.org/licenses/mit-license.php
*/

define(['jquery','wx.config'],function($,config){
  function wx(){}
  wx.VERSION = '2.0.0';
  wx.BACK    = 0;
  wx.RELOAD  = 1;

  /**
   * 管道节流，用于mouseover等调用频繁的优化处理
   * @name    throttle
   * @param   {Function}  真正用于执行的方法
   * @param   {Integer}   延时
   * @return  {Function}  节流方法
  */
  wx.throttle = function(fn, timeout) {
    var timer;
    return function(){
        var self = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function(){
            fn.apply(self, args);
        }, timeout);
    };
  };

  /**
   * 获得随机数，如果只传一个参数，则该参为最大数
   * @name    random
   * @param   {Integer}  最小数
   * @param   {Integer}  最大数
   * @return  {Integer}  随机数
  */
  wx.random = function(min, max) {
    if (!max) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  /**
   * 图片加载
   * @name    imgLoad
   * @param   {String}    图片地址
   * @param   {Function}  加载完后的回调方法
  */
  wx.imgLoad = function (url, callback) {
    var image = new Image();
    image.src = url;
    if (image.readyState) {
      image.onreadystatechange = function() {
        if (image.readyState === "loaded" || image.readyState === "complete"){
          image.onreadystatechange = null;
          callback(image.width,image.height);
        }
      };
    } else {
      image.onload = function() {
        if (image.complete)
          callback(image.width,image.height);
      };
    }
  };

  /**
   * 将Json数据转为String
   * @name    jsonToString
   * @param   {Object}  要转化的json对象
   * @param   {Boolean} 是否要进行转码以备URL传输
   * @return  {String}  转化后的字符串
  */
  wx.jsonToString = function(json, isEncode) {
    var strTemp = "";
    for (var key in json) {
      strTemp += key + '=' + (isEncode?encodeURIComponent(json[key]):json[key]) + '&';
    }
    return strTemp.slice(0, -1);
  };

  /**
   * 将String转为Json
   * @name    stringToJson
   * @param   {String}  要转化的字符串
   * @param   {Boolean} 是否要进行转码
   * @return  {String}  转化后的Json对象
  */
  wx.stringToJson = function(string,isDecode) {
    var tempURL = string.split('&'), json="";
    for(var i = 0;i<tempURL.length;i++){
      var t = tempURL[i].split('=');
      json += "'"+t[0]+"':'"+(isDecode?decodeURIComponent(t[1]):t[1])+"',";
    }
    return eval("({"+json.slice(0,-1)+"})");
  };

  /**
   * 去掉空格
   * @name    trim
   * @param   {String}  要去掉空格的字符串
   * @param   {Boolean} 是否去掉字符串中间的空格
   * @return  {String}  处理过的字符串
  */
  wx.trim = function(str, is_global) {
    if(!str) return "";
    var result = str.replace(/(^\s+)|(\s+$)/g, "");
    if (is_global) result = result.replace(/\s/g, "");
    return result;
  };

   /**
    * 获得URL中以GET方式传输的参数
    * @name getParamByName
    * @param {String} 要获得的参数名
    * @return {String} 指定参数名的值
    */
    wx.getParamByName = function(name) {
      var match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
      return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    };
  
  return wx;
})
