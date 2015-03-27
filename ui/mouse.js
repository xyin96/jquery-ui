/*!
 * jQuery UI Mouse @VERSION
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Mouse
//>>group: UI Core
//>>description: Abstracts mouse-based interactions to assist in creating certain widgets.
//>>docs: http://api.jqueryui.com/mouse/

(function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define([
			"jquery",
			"./widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {

this.stopTrigger        = "MSPointerUp." + this.widgetName + " touchend." + this.widgetName + " mouseup." + this.widgetName;
var mouseHandled = false;
$( document ).on(this.stopTrigger, function() {
	mouseHandled = false;
});

return $.widget("ui.mouse", {
	version: "@VERSION",
	options: {
		cancel: "input, textarea, button, select, option",
		distance: 1,
		delay: 0
	},
	_mouseInit: function() {
		var that = this;
        
        this.moveTrigger        = "MSPointerMove." + this.widgetName + " touchmove." + this.widgetName + " mousemove." + this.widgetName;
        this.startTrigger       = "MSPointerDown." + this.widgetName + " touchstart." + this.widgetName + " mousedown." + this.widgetName;
        this.stopTrigger        = "MSPointerUp." + this.widgetName + " touchend." + this.widgetName + " mouseup." + this.widgetName;
        this.clickTrigger       = "click tap";

		this.element
			.on(this.startTrigger, function(event) {
                
				return that._mouseDown(event);
			})
			.on("click", function(event) {
                console.log("click");
				if (true === $.data(event.target, that.widgetName + ".preventClickEvent")) {
					$.removeData(event.target, that.widgetName + ".preventClickEvent");
					event.stopImmediatePropagation();
					return false;
				}
			})

		this.started = false;
        
        this.standardizeEvent = function(event){
        if (("MSPointerEvent" in window) || !event.originalEvent.touches ) {

            if ( event.pageX  ) {
                event.pageX      = event.pageX;
                event.pageY      = event.pageY;
            } else {
                event.pageX      = event.originalEvent.pageX;
                event.pageY      = event.originalEvent.pageY;
            } 
        } else {
                event.pageX      = event.originalEvent.touches[0].pageX;
                event.pageY      = event.originalEvent.touches[0].pageY;
        }
            return event;
        }
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.unbind("." + this.widgetName);
		if ( this._mouseMoveDelegate ) {
			this.document
				.off(this.moveTrigger, this._mouseMoveDelegate)
				.off(this.stopTrigger, this._mouseUpDelegate);
		}
	},

	_mouseDown: function(event) {
		// don't let more than one widget handle mouseStart
		if ( mouseHandled ) {
			return;
		}

		this._mouseMoved = false;
        
        this.standardizeEvent(event);
        console.log(event);

		// we may have missed mouseup (out of window)
		(this._mouseStarted && this._mouseUp(event));
        
		this._mouseDownEvent = event;

		var that = this,
			btnIsLeft = (event.which === 1),
            touchEvent = (event.type === "touchstart"),
			// event.target.nodeName works around a bug in IE 8 with
			// disabled inputs (#7620)
			elIsCancel = (typeof this.options.cancel === "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
		if ((!touchEvent && !btnIsLeft) || elIsCancel || !this._mouseCapture(event)) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if (!this.mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				that.mouseDelayMet = true;
			}, this.options.delay);
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted = (this._mouseStart(event) !== false);
			if (!this._mouseStarted) {
				event.preventDefault();
				return true;
			}
		}

		// Click event may never have fired (Gecko & Opera)
		if (true === $.data(event.target, this.widgetName + ".preventClickEvent")) {
			$.removeData(event.target, this.widgetName + ".preventClickEvent");
		}

		// these delegates are required to keep context
		this._mouseMoveDelegate = function(event) {
			return that._mouseMove(event);
		};
		this._mouseUpDelegate = function(event) {
			return that._mouseUp(event);
		};

		this.document
			.on( this.moveTrigger, this._mouseMoveDelegate )
			.on( this.stopTrigger, this._mouseUpDelegate );

		event.preventDefault();

		mouseHandled = true;
		return true;
	},

	_mouseMove: function(event) {
        this.standardizeEvent(event);
        console.log(event);
		// Only check for mouseups outside the document if you've moved inside the document
		// at least once. This prevents the firing of mouseup in the case of IE<9, which will
		// fire a mousemove event if content is placed under the cursor. See #7778
		// Support: IE <9
		if ( this._mouseMoved ) {
			// IE mouseup check - mouseup happened when mouse was out of window
			if ($.ui.ie && ( !document.documentMode || document.documentMode < 9 ) && !event.button) {
				return this._mouseUp(event);

			// Iframe mouseup check - mouseup occurred in another document
			} else if ( !event.which ) {
				return this._mouseUp( event );
			}
		}

		if ( event.which || event.button ) {
			this._mouseMoved = true;
		}

		if (this._mouseStarted) {
			this._mouseDrag(event);
			return event.preventDefault();
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
		}

		return !this._mouseStarted;
	},

	_mouseUp: function(event) {
		this.document
			.off( this.moveTrigger, this._mouseMoveDelegate )
			.off( this.stopTrigger, this._mouseUpDelegate );

		if (this._mouseStarted) {
			this._mouseStarted = false;

			if (event.target === this._mouseDownEvent.target) {
                $(event.target).trigger("click");
				$.data(event.target, this.widgetName + ".preventClickEvent", true);
			}

			this._mouseStop(event);
		}

		mouseHandled = false;
		return false;
	},

	_mouseDistanceMet: function(event) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function(/* event */) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function(/* event */) {},
	_mouseDrag: function(/* event */) {},
	_mouseStop: function(/* event */) {},
	_mouseCapture: function(/* event */) { return true; }
});

}));
