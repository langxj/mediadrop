/**
 * SqueezeBox - Expandable Lightbox
 *
 * Allows to open various content as modal,
 * centered and animated box.
 *
 * Dependencies: MooTools 1.2
 *
 * Inspired by
 *  ... Lokesh Dhakar	- The original Lightbox v2
 *
 * @version		1.1 rc4
 *
 * @license		MIT-style license
 * @author		Harald Kirschner <mail [at] digitarald.de>
 * @copyright	Author
 */
var SqueezeBox={presets:{onOpen:$empty,onClose:$empty,onUpdate:$empty,onResize:$empty,onMove:$empty,onShow:$empty,onHide:$empty,size:{x:600,y:450},sizeLoading:{x:200,y:150},marginInner:{x:20,y:20},marginImage:{x:50,y:75},handler:false,target:null,closable:true,closeBtn:true,zIndex:65555,overlayOpacity:0.7,classWindow:"",classOverlay:"",overlayFx:{},resizeFx:{},contentFx:{},parse:false,parseSecure:false,shadow:true,document:null,ajaxOptions:{}},initialize:function(a){if(this.options){return this}this.presets=$merge(this.presets,a);this.doc=this.presets.document||document;this.options={};this.setOptions(this.presets).build();this.bound={window:this.reposition.bind(this,[null]),scroll:this.checkTarget.bind(this),close:this.close.bind(this),key:this.onKey.bind(this)};this.isOpen=this.isLoading=false;return this},build:function(){this.overlay=new Element("div",{id:"sbox-overlay",styles:{display:"none",zIndex:this.options.zIndex}});this.win=new Element("div",{id:"sbox-window",styles:{display:"none",zIndex:this.options.zIndex+2}});if(this.options.shadow){if(Browser.Engine.webkit420){this.win.setStyle("-webkit-box-shadow","0 0 10px rgba(0, 0, 0, 0.7)")}else{if(!Browser.Engine.trident4){var b=new Element("div",{"class":"sbox-bg-wrap"}).inject(this.win);var a=function(c){this.overlay.fireEvent("click",[c])}.bind(this);["n","ne","e","se","s","sw","w","nw"].each(function(c){new Element("div",{"class":"sbox-bg sbox-bg-"+c}).inject(b).addEvent("click",a)})}}}this.content=new Element("div",{id:"sbox-content"}).inject(this.win);this.closeBtn=new Element("a",{id:"sbox-btn-close",href:"#"}).inject(this.win);this.fx={overlay:new Fx.Tween(this.overlay,$merge({property:"opacity",onStart:Events.prototype.clearChain,duration:250,link:"cancel"},this.options.overlayFx)).set(0),win:new Fx.Morph(this.win,$merge({onStart:Events.prototype.clearChain,unit:"px",duration:750,transition:Fx.Transitions.Quint.easeOut,link:"cancel",unit:"px"},this.options.resizeFx)),content:new Fx.Tween(this.content,$merge({property:"opacity",duration:250,link:"cancel"},this.options.contentFx)).set(0)};$(this.doc.body).adopt(this.overlay,this.win)},assign:function(b,a){return($(b)||$$(b)).addEvent("click",function(){return !SqueezeBox.fromElement(this,a)})},open:function(c,b){this.initialize();if(this.element!=null){this.trash()}this.element=$(c)||false;this.setOptions($merge(this.presets,b||{}));if(this.element&&this.options.parse){var e=this.element.getProperty(this.options.parse);if(e&&(e=JSON.decode(e,this.options.parseSecure))){this.setOptions(e)}}this.url=((this.element)?(this.element.get("href")):c)||this.options.url||"";this.assignOptions();var d=d||this.options.handler;if(d){return this.setContent(d,this.parsers[d].call(this,true))}var a=false;return this.parsers.some(function(h,f){var g=h.call(this);if(g){a=this.setContent(f,g);return true}return false},this)},fromElement:function(b,a){return this.open(b,a)},assignOptions:function(){this.overlay.set("class",this.options.classOverlay);this.win.set("class",this.options.classWindow);if(Browser.Engine.trident4){this.win.addClass("sbox-window-ie6")}},close:function(b){var a=($type(b)=="event");if(a){b.stop()}if(!this.isOpen||(a&&!$lambda(this.options.closable).call(this,b))){return this}this.fx.overlay.start(0).chain(this.toggleOverlay.bind(this));this.win.setStyle("display","none");this.fireEvent("onClose",[this.content]);this.trash();this.toggleListeners();this.isOpen=false;return this},trash:function(){this.element=this.asset=null;this.content.empty();this.options={};this.removeEvents().setOptions(this.presets).callChain()},onError:function(){this.asset=null;this.setContent("string",this.options.errorMsg||"An error occurred")},setContent:function(a,b){if(!this.handlers[a]){return false}this.content.className="sbox-content-"+a;this.applyTimer=this.applyContent.delay(this.fx.overlay.options.duration,this,this.handlers[a].call(this,b));if(this.overlay.retrieve("opacity")){return this}this.toggleOverlay(true);this.fx.overlay.start(this.options.overlayOpacity);return this.reposition()},applyContent:function(b,a){if(!this.isOpen&&!this.applyTimer){return}this.applyTimer=$clear(this.applyTimer);this.hideContent();if(!b){this.toggleLoading(true)}else{if(this.isLoading){this.toggleLoading(false)}this.fireEvent("onUpdate",[this.content],20)}if(b){if(["string","array"].contains($type(b))){this.content.set("html",b)}else{if(!this.content.hasChild(b)){this.content.adopt(b)}}}this.callChain();if(!this.isOpen){this.toggleListeners(true);this.resize(a,true);this.isOpen=true;this.fireEvent("onOpen",[this.content])}else{this.resize(a)}},resize:function(c,b){this.showTimer=$clear(this.showTimer||null);var d=this.doc.getSize(),a=this.doc.getScroll();this.size=$merge((this.isLoading)?this.options.sizeLoading:this.options.size,c);var e={width:this.size.x,height:this.size.y,left:(a.x+(d.x-this.size.x-this.options.marginInner.x)/2).toInt(),top:(a.y+(d.y-this.size.y-this.options.marginInner.y)/2).toInt()};this.hideContent();if(!b){this.fx.win.start(e).chain(this.showContent.bind(this))}else{this.win.setStyles(e).setStyle("display","");this.showTimer=this.showContent.delay(50,this)}return this.reposition()},toggleListeners:function(b){var a=(b)?"addEvent":"removeEvent";this.closeBtn[a]("click",this.bound.close);this.overlay[a]("click",this.bound.close);this.doc[a]("keydown",this.bound.key)[a]("mousewheel",this.bound.scroll);this.doc.getWindow()[a]("resize",this.bound.window)[a]("scroll",this.bound.window)},toggleLoading:function(a){this.isLoading=a;this.win[(a)?"addClass":"removeClass"]("sbox-loading");if(a){this.fireEvent("onLoading",[this.win])}},toggleOverlay:function(b){var a=this.doc.getSize().x;this.overlay.setStyle("display",(b)?"":"none");this.doc.body[(b)?"addClass":"removeClass"]("body-overlayed");if(b){this.scrollOffset=this.doc.getWindow().getSize().x-a;this.doc.body.setStyle("margin-right",this.scrollOffset)}else{this.doc.body.setStyle("margin-right","")}},showContent:function(){if(this.content.get("opacity")){this.fireEvent("onShow",[this.win])}this.fx.content.start(1)},hideContent:function(){if(!this.content.get("opacity")){this.fireEvent("onHide",[this.win])}this.fx.content.cancel().set(0)},onKey:function(a){switch(a.key){case"esc":this.close(a);case"up":case"down":return false}},checkTarget:function(a){return this.content.hasChild(a.target)},reposition:function(){var c=this.doc.getSize(),a=this.doc.getScroll(),b=this.doc.getScrollSize();this.overlay.setStyles({width:b.x+"px",height:b.y+"px"});this.win.setStyles({left:(a.x+(c.x-this.win.offsetWidth)/2-this.scrollOffset).toInt()+"px",top:(a.y+(c.y-this.win.offsetHeight)/2).toInt()+"px"});return this.fireEvent("onMove",[this.overlay,this.win])},removeEvents:function(a){if(!this.$events){return this}if(!a){this.$events=null}else{if(this.$events[a]){this.$events[a]=null}}return this},extend:function(a){return $extend(this,a)},handlers:new Hash(),parsers:new Hash()};SqueezeBox.extend(new Events($empty)).extend(new Options($empty)).extend(new Chain($empty));SqueezeBox.parsers.extend({image:function(a){return(a||(/\.(?:jpg|png|gif)$/i).test(this.url))?this.url:false},clone:function(a){if($(this.options.target)){return $(this.options.target)}if(this.element&&!this.element.parentNode){return this.element}var b=this.url.match(/#([\w-]+)$/);return(b)?$(b[1]):(a?this.element:false)},ajax:function(a){return(a||(this.url&&!(/^(?:javascript|#)/i).test(this.url)))?this.url:false},iframe:function(a){return(a||this.url)?this.url:false},string:function(a){return true}});SqueezeBox.handlers.extend({image:function(a){var c,b=new Image();this.asset=null;b.onload=b.onabort=b.onerror=(function(){b.onload=b.onabort=b.onerror=null;if(!b.width){this.onError.delay(10,this);return}var e=this.doc.getSize();e.x-=this.options.marginImage.x;e.y-=this.options.marginImage.y;c={x:b.width,y:b.height};for(var d=2;d--;){if(c.x>e.x){c.y*=e.x/c.x;c.x=e.x}else{if(c.y>e.y){c.x*=e.y/c.y;c.y=e.y}}}c.x=c.x.toInt();c.y=c.y.toInt();this.asset=$(b);b=null;this.asset.width=c.x;this.asset.height=c.y;this.applyContent(this.asset,c)}).bind(this);b.src=a;if(b&&b.onload&&b.complete){b.onload()}return(this.asset)?[this.asset,c]:null},clone:function(a){if(a){return a.clone()}return this.onError()},adopt:function(a){if(a){return a}return this.onError()},ajax:function(b){var a=this.options.ajaxOptions||{};this.asset=new Request.HTML($merge({method:"get",evalScripts:false},this.options.ajaxOptions)).addEvents({onSuccess:function(c){this.applyContent(c);if(a.evalScripts!==null&&!a.evalScripts){$exec(this.asset.response.javascript)}this.fireEvent("onAjax",[c,this.asset]);this.asset=null}.bind(this),onFailure:this.onError.bind(this)});this.asset.send.delay(10,this.asset,[{url:b}])},iframe:function(a){this.asset=new Element("iframe",$merge({src:a,frameBorder:0,width:this.options.size.x,height:this.options.size.y},this.options.iframeOptions));if(this.options.iframePreload){this.asset.addEvent("load",function(){this.applyContent(this.asset.setStyle("display",""))}.bind(this));this.asset.setStyle("display","none").inject(this.content);return false}return this.asset},string:function(a){return a}});SqueezeBox.handlers.url=SqueezeBox.handlers.ajax;SqueezeBox.parsers.url=SqueezeBox.parsers.ajax;SqueezeBox.parsers.adopt=SqueezeBox.parsers.clone;SqueezeBox.handlers.extend({clone:function(a){if(a){return a.clone().setStyle("display","block")}return this.onError()},fittedClone:function(a){a=this.handlers.clone(a);var b=this.options.size.y;this.setOptions({size:{y:a.getSize().h},onClose:function(c,d){this.setOptions({size:{y:d},onClose:$empty})}.bindWithEvent(this,[b])});return a},fittedAdopt:function(a){a=this.handlers.adopt(a);var b=this.options.size.y;this.setOptions({size:{y:a.getSize().h},onClose:function(c,d){this.setOptions({size:{y:d},onClose:$empty})}.bindWithEvent(this,[b])});return a},});SqueezeBox.parsers.fittedClone=SqueezeBox.parsers.clone;SqueezeBox.parsers.fittedAdopt=SqueezeBox.parsers.adopt;