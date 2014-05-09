/* 
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 * 
 * See docs and demo at http://neutroncreations.com/labnotes/indicated-tabs/
 *
 * v1.0 - Initial release
 *
 */

(function($){
  
  
  $.fn.indicatedTabs = function(panesSelector, options, tabsOptions) {
    var options         = $.extend({}, $.fn.indicatedTabs.defaultOptions, options),
        
        indicator       = $(options.indicator),
        indicatorWidth  = indicator.width()/2,
        indicatorHeight = indicator.height()/2,
        
        children        = this.children(options.childrenSelector),
        
        tabsOptions     = $.extend({}, $.fn.indicatedTabs.tabsOptions, tabsOptions),
        
        tempFn,
        beforeClick     = function(event, index) {
          var child = children.eq(index),
              newPos = (options.vertical ?  child.position().top + (child.height()/2) - indicatorHeight :
                                            child.position().left + (child.width()/2) - indicatorWidth),
              css = {};
              
          css[options.vertical ? 'top' : 'left'] = newPos + 'px';
          indicator.stop(true).animate(css, options.duration, options.easing);
        };
    
    if (tabsOptions.onBeforeClick) {
      tempFn = tabsOptions.onBeforeClick;
      tabsOptions.onBeforeClick = function(event, index) {
        tempFn(event, index);
        beforeClick(event, index);
      };
    } else {
      tabsOptions.onBeforeClick = beforeClick;
    }
    
    return this.tabs(panesSelector, tabsOptions);
    
  };
  
  $.fn.indicatedTabs.defaultOptions = {
    indicator: '#indicator',
    childrenSelector: 'li',
    duration: 600,
    easing: 'easeInOutExpo',
    vertical: false
  };
  
  $.fn.indicatedTabs.tabOptions = {
    effect: 'fade',
    fadeOutSpeed: 0,
    fadeInSpeed: 400
  };
  
  
  
})(jQuery);
