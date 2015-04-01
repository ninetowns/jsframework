/**
 * 懒加载
 * @name    lazyLoad
 * @param   {String}    运行上下文
*/
define(['wx','wx.config'],function(wx,config){
  wx.lazyload = function(context) {
    var $els = $(context || "body").find("[wx-lz]:visible"),
        showType = config.lazyLoadShowType,
        threshold  = config.lazyLoadThreshold,
        _height = window.screen.height;
        
    if(!$els.length) return;

    $els.one("appear",function(){
      var $self = $(this),
          url   = $self.attr("wx-lz");
      $self.loaded = true;
      $self.hide();
      $("<img />").on("load", function(){
        if($self.is("img"))
          $self.attr("src",url);
        else
          $self.css("background-image","url("+url+")");
        $self[showType]();
      }).attr("src",url);
    });

    function update(){
      $els.each(function(){
        var $self = $(this);
        if($self.loaded) return;
        checkPos($self);
      });
    }

    function checkPos($el){
      var scroll = $(document).scrollTop()+_height;
      if($el.offset().top < scroll+threshold){
        $el.trigger('appear');
      }
    }

    $(window).on("scroll",wx.throttle(update,100));
    update();
  };
  
  return wx;
})
