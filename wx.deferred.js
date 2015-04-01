  /**
   * 用以解决回调地狱，参照Promise/A规范
   * @name    deferred
   * @return  {Object}  Promise对象
  */

define(['wx'],function(wx){
  wx.deferred = function(){
    function Promise(){
      this.methods = [];
      this.isFirst = true;
    }
    Promise.prototype = {
      then : function(fn, context){
        this.methods.push({callback:fn,context:this});
        if(this.isFirst){
          this.next();
          this.isFirst = false;
        }
        return this;
      },
      next : function(){
        var _this = this,
            _next = this.methods.shift(),
             args = Array.prototype.slice.call(arguments);
        args.unshift(function(){
          if(_next)
            _this.next.apply(_this,arguments);
        });
        if(_next){
          _next.callback.apply(_next.context,args);
        }
      }
    };
    return new Promise();
  };
  return wx;
})
