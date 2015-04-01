 /**
 * 倒计时
 * @name    countDown
 * @param   {Integer}  当前到结束的时间差
 * @param   {Integer}  唯一索引，当存在多个倒计时时区分
 * @param   {Function} 显示回调方法，将传入时分秒等信息
 * @param   {Function} 倒计时结束的回调方法
*/

define(['wx'],function(wx){

  wx.countDown = function(time, index, showCallback, doneCallback) {
    var initTime = new Date().getTime();
    var timeback = time;
    function start(){
      var sTime = new Date().getTime();
      var timeId = setInterval(function(){
          var offsetTime = new Date().getTime()-sTime;
          sTime = new Date().getTime();
          time -= offsetTime;
          var fTime = getFormatTime(time,0);
          if(offsetTime>1200 || offsetTime<900){
            time =  timeback - (new Date().getTime()-initTime);
          }
          if(time<=0){
              clearInterval(timeId);
              if(typeof doneCallback !== "undefined")
                  doneCallback(index);
          } else {
              showCallback && showCallback(fTime[0],fTime[1],fTime[2],fTime[3]);
          }
      },1000);
    }
    function getFormatTime(t, isShow){
      t=t/1000;
      var day    = Math.floor(t/(60*60*24));
      var hour   = Math.floor((t-day*24*60*60)/3600);
      var minute = Math.floor((t-day*24*60*60-hour*3600)/60);
      var second = Math.floor(t-day*24*60*60-hour*3600-minute*60);
      hour   = hour<10?"0"+hour:hour;
      minute = minute<10?"0"+minute:minute;
      second = second<10?"0"+second:second;
      isShow && showCallback && showCallback(day,hour,minute,second);
      return [day,hour,minute,second];
    }
    getFormatTime(time,1);
    start();
  };
  return wx;
})
