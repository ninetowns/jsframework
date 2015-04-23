define(['wx','wx.config','wx.pop'],function(wx,config){
    var W3C    = window.FormData !== undefined ? true : false,
        prefix = "wx-upload";

    wx.upload = function($elem) {
        var options = init($elem);
        if(!options.name || !options.url)
            return;

        if(W3C){
            $elem.change(h5);
        } else{
            $elem.change(normal);
        }
    };

    function init($elem) {
        var options = {
            name       : $elem.attr("name"),
            url        : $elem.attr(prefix) || config.uploadUrl || "",
            type       : $elem.attr(prefix+"-type") || config.uploadType,
            size       : $elem.attr(prefix+"-size") || config.uploadSize,
            set        : $elem.attr(prefix+"-set"),
            param      : $elem.attr(prefix+"-param") || "",
            assign     : $elem.attr(prefix+"-assign"),
            mult       : typeof $elem.attr(prefix+"-mult") != "undefined",
            loading    : typeof $elem.attr(prefix+"-load") != "undefined"
        };
        options.url      += options.url.indexOf("?") !== -1 ? "&_="+new Date().getTime() : "?_="+new Date().getTime();
        options.size     = options.size ? parseFloat(options.size)*1024*1024 : null;
        options.mult ? $elem.attr("multiple",true) : null;
        $elem.data("opt",options);
        $elem.attr('hidefocus','true');
        return options;
    }

    function before(options,$input) {
        var result = $input.triggerHandler('upload:before');
        if(result || typeof result === 'undefined'){
            if(options.loading)
                wx.loading("正在上传...");
            return true;
        }
        return false;
    }

    function complete(responseText, options, $input) {
        try{
            var data = $.parseJSON(responseText);
            if(config.getStatus(data) == config.dataSuccessVal){
                if(options.assign){
                    var assign = options.assign.split("&");
                    for(var i = 0; i<assign.length; i++){
                        var assVal     = "",
                            assignItem = assign[i].split("="),
                            $inputAss  = $("input[name='"+assignItem[0]+"']");
                        assVal = eval('data["'+assignItem[1].replace(/\./g,'"]["')+'"]');
                        if($inputAss.length)
                            $inputAss.val(assVal);
                        else
                            $input.before('<input name="'+assignItem[0]+'" value="'+assVal+'" style="display:none;">');
                    }
                }
                if(options.set){
                    var set   = options.set.split("&");
                    for(var i = 0; i<set.length; i++){
                        var setVal  = "",
                            setItem = set[i].split("="),
                            $elem   = $("#"+setItem[0]);
                        if($elem.length){
                            setVal = eval('data["'+setItem[1].replace(/\./g,'"]["')+'"]');
                            setVal += setVal.indexOf("?") !== -1 ? "&_"+new Date().getTime() : "?_="+new Date().getTime();
                            if($elem.is("img"))
                                $elem.attr("src",setVal);
                            else
                                $elem.css("background","url("+setVal+")");
                        }
                    }
                }
                if(options.loading)
                    wx.popClose();
                $input.triggerHandler('upload',data);
            } else {
                wx.alert(data[config.dataInfo]);
            }
        }
        catch(e){console.log("uploadComplete error ",e);}
    }

    function h5() {
        var fd      = null,
            xhr     = null,
            files   = this.files,
            $input  = $(this),
            options = $input.data("opt");

        if(!before(options,$input)) return;

        for(var i=0; i<files.length; i++){
            if(options.size && files[i].size > options.size){
                wx.alert("上传的文件太大，请压缩后重新上传");
                continue;
            } else if(options.type && options.type !== "*" && (!files[i].type || options.type.indexOf(files[i].type.split("/")[1]) === -1)){
                wx.alert("文件格式不符");
                continue;
            }

            fd  = new FormData();
            xhr = new XMLHttpRequest();
            xhr.open("POST", options.url);
            bindEvent(xhr);
            addParam(fd);
            fd.append(options.name, files[i]);
            xhr.send(fd);
            fd = xhr = null;
            $input.unbind("change").val('').change(h5);
        }

        function addParam(fd){
            if(options.param){
                var tempURL = options.param.split('&');
                for(var i = 0;i<tempURL.length;i++){
                   var t = tempURL[i].split('=');
                   fd.append(t[0], t[1]);
                }
            }
        }

        function bindEvent(xhr){
            xhr.upload.addEventListener("progress", function(evt){
                if (evt.lengthComputable) {
                    $input.triggerHandler('upload:progress',Math.round(evt.loaded * 100 / evt.total).toString());
                } else {
                    console.log('unable to compute');
                }
            }, false);
            xhr.addEventListener("load", function(evt){complete(evt.target.responseText,options,$input);}, false);
            xhr.addEventListener("error", function(error){complete('{"status:0",error:"'+error+'"}',options,$input);}, false);
        }
    }

    function normal() {
        var $iframe = null,
            $input  = $(this),
            $inputC = $input.clone(),
            options = $input.data("opt"),
            $form   = $('<form id="wx-upload-form" method="post" action="'+options.url+'" enctype="multipart/form-data" target="wx-upload-iframe"></form>');

        if(!before(options,$input)) return;

        if(wx.browser.msie && wx.browser.version == 6){
            var io = document.createElement('<iframe id="wx-upload-iframe" name="wx-upload-iframe" />');
            io.src = 'javascript:false';
            io.style.top = '-1000px';
            io.style.left = '-1000px';
            io.style.position = 'absolute';
            $iframe = $(io);
        } else {
            $iframe = $('<iframe name="wx-upload-iframe" style="display:none"></iframe>');
        }

        $input.parent().append($inputC);
        $form.css({"display":"none","position":"absolute","top":"-1000px","left":"-1000px"}).append($input);
        $iframe.appendTo('body');
        $form.appendTo('body');
        if(options.param){
            var tempURL = options.param.split('&'),
                param   = "";
            for(var i = 0;i<tempURL.length;i++){
               var t = tempURL[i].split('=');
               param += '<input name="'+t[0]+'" value="'+t[1]+'" style="display:none;">';
            }
            $form.append(param);
        }
        $iframe.on("load",function(){
            var content = this.contentWindow ? this.contentWindow : this.contentDocument,
                reponse = content.document.body ? content.document.body.innerHTML: null;
            complete(reponse,options,$input);
            $form.remove();
            $iframe.remove();
            $inputC.data("opt",options);
            $inputC.unbind("change").change(normal);
        });
        $form.submit();
    }
  return wx;
})
