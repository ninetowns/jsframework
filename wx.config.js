  define(function(){
  var config = {

    url:{},

    //默认上传地址
    uploadUrl : '',

    //默认上传类型，全部支持为 *
    uploadType : 'jpeg|jpg|png|gif',

    //默认上传文件大小，以MB为单位
    uploadSize : '2',

    //懒加载的显示类型，可以是show或者是fadeIn
    lazyLoadShowType : 'show',

    //懒加载临界点
    lazyLoadThreshold : 100,

    //ajax请求返回数据成功与否的标示字段
    dataFlag : 'Result.Header.resultID',

    //ajax请求返回数据中的描述信息，用于向用户展示
    dataInfo : 'Result.Header.resultMessage',

    //ajax请求返回数据成功与否的判断数值
    dataSuccessVal : '0',

    //ajax请求返回数据中用于定义业务异常展示的数值
    dataDefaultAlertVal : '5',

    //ajax请求返回数据中用于获得跳转地址的字段
    dataJumpFlag : 'jump',

    //模板引擎解析时使用的开始标示符
    tplOpenTag : "<%",

    //模板引擎解析时使用的结束标示符
    tplCloseTag : "%>",

    validator : {
      "required"        : "不能为空",
      "email"           : "请填写正确的电子邮箱",
      "mobile"          : "请填写正确的手机号码",
      "telphone"        : "请填写正确的固定电话",
      "range"           : "请输入区间在@的数字或字母",
      "min"             : "请输入不小于@的数字或字母",
      "max"             : "请输入不大于@的数字或字母",
      "rangeEqual"      : "请输入@位的数字或字母",
      "rangelength"     : "请输入@位的数字或字母",
      "minLength"       : "请输入不小于@位的数字或字母",
      "maxLength"       : "请输入不大于@位的数字或字母",
      "byteRangeEqual"  : "请输入@位的数字或字母",
      "byteRangeLength" : "请输入@位的数字或字母",
      "byteMinLength"   : "请输入不小于@位的数字或字母",
      "byteMaxLength"   : "请输入不大于@位的数字或字母",
      "equalTo"         : "请保持所填写的内容一致",
      "digits"          : "请填写数字",
      "post"            : "请填写正确的邮编号码",
      "cardId"          : "请填写正确的身份证号码",
      "noSymbol"        : "不能有符号",
      "date"            : "日期填写不正确",
      "money"           : "请填写正确的金额",
      "ajax"            : "填写不正确",
      "regExp"          : "填写不正确",
      "url"             : "请使用正确格式，如http://www.website.com"
    },

    //弹出框loading结构
    loading: '<table class="ui-dialog">\
      <tbody>\
          <td class="ui-dialog-body">\
            <div class="ui-dialog-content"><%content||"&nbsp;&nbsp;&nbsp;请等待..."%></div>\
          </td>\
        </tr>\
      </tbody>\
    </table>',

    //弹出框alert结构
    alert: '<table class="ui-dialog">\
      <tbody>\
        <tr class="Js-drag">\
          <td class="ui-dialog-header">\
            <%if(!noBtn){%>\
              <button class="ui-dialog-close Js-dialog-close" title="取消">×</button>\
            <%}%>\
            <div class="ui-dialog-title"><%title||"提示"%></div>\
          </td>\
        </tr>\
        <tr>\
          <td class="ui-dialog-body">\
            <div class="ui-dialog-content"><%content%></div>\
          </td>\
        </tr>\
        <tr>\
          <td class="ui-dialog-footer">\
            <div class="ui-dialog-button">\
            <%if(!noBtn){%>\
              <button class="ui-dialog-autofocus Js-dialog-close" type="button"><%okText||"确 定"%></button>\
            <%}%>\
            </div>\
          </td>\
        </tr>\
      </tbody>\
    </table>',


    //弹出框confirm结构
    confirm: '<table class="ui-dialog">\
      <tbody>\
        <tr class="Js-drag">\
          <td class="ui-dialog-header">\
            <button class="ui-dialog-close Js-dialog-close" title="取消">×</button>\
            <div class="ui-dialog-title"><%title||"消息"%></div>\
          </td>\
        </tr>\
        <tr>\
          <td class="ui-dialog-body">\
            <div class="ui-dialog-content"><%content%></div>\
          </td>\
        </tr>\
        <tr>\
          <td class="ui-dialog-footer">\
            <div class="ui-dialog-button">\
              <button class="Js-dialog-close" type="button">取消</button>\
              <button id="Js-dialog-confirm" class="ui-dialog-autofocus" type="button"><%okText||"确 定"%></button>\
            </div>\
          </td>\
        </tr>\
      </tbody>\
    </table>',

    //弹出框通用样式
     pop:'<div class="ui-dialog">\
       <div class="ui-dialog-header Js-drag"><%title||"消息"%></div>\
       <%content%>\
     </div>'
   }

   config.getStatus = function(data){
      return new Function('data','return data.'+config.dataFlag)(data);
   }

    config.getInfo = function(data){
      return new Function('data','return data.'+config.dataInfo)(data);
   }

  return config;
 });