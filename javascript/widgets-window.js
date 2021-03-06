/*
 *
 *  Awesome New Tab Page
 *    http://antp.co/
 *    Copyright 2011+ Michael Hart (http://h4r7.me/).
 *
 *  Want to make it even more awesome?
 *    https://github.com/michaelhart/Awesome-New-Tab-Page/
 *
 *  Widgets Window
 *    JavaScript essential to the widgets window.
 *
 *  Licensed under GPL v3:
 *    http://www.gnu.org/licenses/gpl-3.0.txt
 *
 */
$(document).ready(function($) {
  setTimeout(function() {
    setupInstalledWidgets();
  }, 900);
  setTimeout(function() {
    setupStockWidgets();
  }, 1000);
});

// Only handles 1 at a time; widget
function setupDrawerWidgets(_widget) {
    if (!_widget.request || !_widget.sender) {
      return console.error("setupDrawerWidgets", "Sender missing.");
    }
    if (!_widget.request.body) {
      return console.error("setupDrawerWidgets", "Body missing.");
    }

    if ( _widget.request.body.poke
      && parseInt(_widget.request.body.poke) !== "NaN" ) {
      _widget.request.body.poke = parseInt(_widget.request.body.poke);
    } else {
      _widget.request.body.poke = 1;
    }

    widgets[_widget.sender.id] = _widget.body;

    if( parseInt(_widget.request.body.height) > 3 || parseInt(_widget.request.body.width) > 3 ) {
      return console.error("setupDrawerWidgets", "Width or Height too large.");
    }

    var widget_name;
    if (_widget.sender.name) {
      widget_name = _widget.sender.name;
    } else {
      if ( typeof(_widget.sender.id) === "string" )
        widget_name = extensions.filter(function (ext) { return ext.id === _widget.sender.id })[0];

      if ( typeof(widget_name) !== "undefined"
        && typeof(widget_name.name) === "string" )
        widget_name = widget_name.name;
      else
        return console.error("setupDrawerWidgets", "Widget name undefined.");
    }

    var widget_img ;
    if (_widget.sender.id === "mgmiemnjjchgkmgbeljfocdjjnpjnmcg") {
      widget_img = "icon128.png";
    } else {
      widget_img = 'chrome://extension-icon/' + _widget.sender.id + '/128/0"';
    }

    // Poke v2 Checks
    var obj = _widget.request.body;
    if ( obj.poke && parseInt(obj.poke) === 2 ) {
      if ( obj.v2.resize === true
        && parseInt(obj.v2.min_width ) !== "NaN"
        && parseInt(obj.v2.max_width ) !== "NaN"
        && parseInt(obj.v2.min_height) !== "NaN"
        && parseInt(obj.v2.max_height) !== "NaN" ) {
        obj.v2.min_width  = ( parseInt(obj.v2.min_width  ) < TILE_MIN_WIDTH  ) ? TILE_MIN_WIDTH : parseInt(obj.v2.min_width );
        obj.v2.min_width  = ( parseInt(obj.v2.min_width  ) > TILE_MAX_WIDTH  ) ? TILE_MAX_WIDTH : parseInt(obj.v2.min_width );

        obj.v2.max_width  = ( parseInt(obj.v2.max_width  ) < TILE_MIN_WIDTH  ) ? TILE_MIN_WIDTH : parseInt(obj.v2.max_width );
        obj.v2.max_width  = ( parseInt(obj.v2.max_width  ) > TILE_MAX_WIDTH  ) ? TILE_MAX_WIDTH : parseInt(obj.v2.max_width );

        obj.v2.min_height = ( parseInt(obj.v2.min_height) < TILE_MIN_HEIGHT ) ? TILE_MIN_HEIGHT : parseInt(obj.v2.min_height);
        obj.v2.min_height = ( parseInt(obj.v2.min_height) > TILE_MAX_HEIGHT ) ? TILE_MAX_HEIGHT : parseInt(obj.v2.min_height);

        obj.v2.max_height = ( parseInt(obj.v2.max_height) < TILE_MIN_HEIGHT ) ? TILE_MIN_HEIGHT : parseInt(obj.v2.max_height);
        obj.v2.max_height = ( parseInt(obj.v2.max_height) > TILE_MAX_HEIGHT ) ? TILE_MAX_HEIGHT : parseInt(obj.v2.max_height);
      } else {
        obj.v2 = {};
        obj.v2.resize = false;
      }
    } else {
        obj.v2 = {};
        obj.v2.resize = false;
    }

    $(stitch(
      /*  Type: str [app, widget, app-drawer, widget-drawer]*/  "widget-drawer",
      /*  Ext. ID: str [mgmiemnjjchgkmgbeljfocdjjnpjnmcg]   */  _widget.sender.id,
      /*  Ext. Name: str [Awesome New Tab Page]             */  widget_name,
      /*  URL: str, can be iframe or app url                */  (_widget.request.body.path).replace(/\s+/g, ''),
      /*  Img: str, full path or [id]                       */  ( "id" ),
      /*  Height: int [1, 2, 3]                             */  parseInt(_widget.request.body.height),
      /*  Width: int [1, 2, 3]                              */  parseInt(_widget.request.body.width),
      /*  Top: int                                          */  null,
      /*  Left: int                                         */  null,
      /*  Poke: array                                       */  [obj.poke, obj.v2.resize, obj.v2]
    )).appendTo("#widget-drawer");
}

var widget_refresh_clickable = true;
$(".ui-2.widgets-refresh").live("click", function() {
  if ( widget_refresh_clickable === false ) {
    return;
  }
  widget_refresh_clickable = false;
  $(".ui-2#widgets .widget").remove();

  localStorage.setItem("refresh_widgets", Math.round(new Date().getTime()/1000.0) );

  setTimeout(function() {
    setupInstalledWidgets();
  }, 900);
  setTimeout(function() {
    setupStockWidgets();
    widget_refresh_clickable = true;
  }, 1000);
});

var installed_widgets;
function setupInstalledWidgets() {
  if( localStorage.getItem("installed_widgets") === null ) {
    return;
  }

  installed_widgets = JSON.parse(localStorage.getItem("installed_widgets"));

  $.each(installed_widgets, function(id, widget) {
    setupDrawerWidgets(widget);
  });
}

function setupStockWidgets() {
  $.each(stock_widgets, function(id, widget) {
    if(widget.isApp === false && widget.type !== "shortcut" && widget.type !== "app") {
      setupDrawerWidgets({
        request: {
          body: {
            height: widget.size[0],
            width: widget.size[1],
            path: widget.path,
            poke: 1
          },
          head: "mgmiemnjjchgkmgbeljfocdjjnpjnmcg-pokeback"
        },
        sender: {
          id: "mgmiemnjjchgkmgbeljfocdjjnpjnmcg",
          name: widget.name,
          stock: id,
          tab: null
        }
      });
    }
  });
}

$("#widget-drawer-button").live("click", function(){
  loadFeatured();
  _gaq.push([ '_trackEvent', 'Window', "Widgets" ]);

  $(".ui-2#widgets").fadeToggle();

  $(".ui-2#apps").fadeOut();
  $(".ui-2#config").fadeOut();
  $("#recently-closed-tabs-menu").fadeOut();
  $(".ui-2#about").fadeOut();

  $(".ui-2#editor").fadeOut();
});