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
        this.startTriggerArray  = this.startTrigger.split(' ');
        this.moveTriggerArray   = this.moveTrigger.split(' ');
        this.stopTriggerArray   = this.stopTrigger.split(' ');
        this.stopEvents         = [ this.stopTrigger, this.options.stopEvents ].join(' ');

		this.element
			.on(this.startTrigger , function(ev) {
                ev.pep        = {};

                if (("MSPointerEvent" in window) || !ev.originalEvent.touches ) {

                    if ( ev.pageX  ) {
                      ev.pep.x      = ev.pageX;
                      ev.pep.y      = ev.pageY;
                    } else {
                      ev.pep.x      = ev.originalEvent.pageX;
                      ev.pep.y      = ev.originalEvent.pageY;
                    }

                    ev.pep.type   = ev.type;

                    }
                    else {
                    ev.pep.x      = ev.originalEvent.touches[0].pageX;
                    ev.pep.y      = ev.originalEvent.touches[0].pageY;
                    ev.pep.type   = ev.type;
                }
                
				return that._mouseDown(ev);
			})
			.on("click." + this.widgetName, function(ev) {
                ev.pep        = {};

                if (("MSPointerEvent" in window) || !ev.originalEvent.touches ) {

                    if ( ev.pageX  ) {
                      ev.pep.x      = ev.pageX;
                      ev.pep.y      = ev.pageY;
                    } else {
                      ev.pep.x      = ev.originalEvent.pageX;
                      ev.pep.y      = ev.originalEvent.pageY;
                    }

                    ev.pep.type   = ev.type;

                    }
                    else {
                    ev.pep.x      = ev.originalEvent.touches[0].pageX;
                    ev.pep.y      = ev.originalEvent.touches[0].pageY;
                    ev.pep.type   = ev.type;
                }
                
				return that._mouseDown(ev);
				if (true === $.data(ev.target, that.widgetName + ".preventClickEvent")) {
					$.removeData(ev.target, that.widgetName + ".preventClickEvent");
					ev.stopImmediatePropagation();
					return false;
				}
			});

		this.started = false;
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

		// we may have missed mouseup (out of window)
		(this._mouseStarted && this._mouseUp(event));
        console.log(event);
		this._mouseDownEvent = event;

		var that = this,
			btnIsLeft = (event.which === 1),
			// event.target.nodeName works around a bug in IE 8 with
			// disabled inputs (#7620)
			elIsCancel = (typeof this.options.cancel === "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);

		if ((!(event.pep.type == "touchstart") && !btnIsLeft) || elIsCancel || !this._mouseCapture(event)) {
            console.log("failed");
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
		this._mouseMoveDelegate = function(ev) {
            console.log("moved");
            ev.pep        = {};

                if (("MSPointerEvent" in window) || !ev.originalEvent.touches ) {

                    if ( ev.pageX  ) {
                      ev.pep.x      = ev.pageX;
                      ev.pep.y      = ev.pageY;
                    } else {
                      ev.pep.x      = ev.originalEvent.pageX;
                      ev.pep.y      = ev.originalEvent.pageY;
                    }

                    ev.pep.type   = ev.type;

                    }
                    else {
                    ev.pep.x      = ev.originalEvent.touches[0].pageX;
                    ev.pep.y      = ev.originalEvent.touches[0].pageY;
                    ev.pep.type   = ev.type;
                }
            console.log("delegate");
			return that._mouseMove(ev);
		};
		this._mouseUpDelegate = function(ev) {
			return that._mouseUp(ev);
		};

		this.document
			.on( this.moveTrigger, this._mouseMoveDelegate )
			.on( this.stopTrigger, this._mouseUpDelegate );

		ev.preventDefault();

		mouseHandled = true;
		return true;
	},

	_mouseMove: function(event) {
        console.log(event.type);
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
        

		if (event.which || event.button ) {
			this._mouseMoved = true;
            console.log("mouseMoved");
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
				$.data(event.target, this.widgetName + ".preventClickEvent", true);
			}

			this._mouseStop(event);
		}

		mouseHandled = false;
		return false;
	},

	_mouseDistanceMet: function(ev) {
        ev.pep        = {};

        if (("MSPointerEvent" in window) || !ev.originalEvent.touches ) {

            if ( ev.pageX  ) {
              ev.pep.x      = ev.pageX;
              ev.pep.y      = ev.pageY;
            } else {
              ev.pep.x      = ev.originalEvent.pageX;
              ev.pep.y      = ev.originalEvent.pageY;
            }

            ev.pep.type   = ev.type;

            }
            else {
            ev.pep.x      = ev.originalEvent.touches[0].pageX;
            ev.pep.y      = ev.originalEvent.touches[0].pageY;
            ev.pep.type   = ev.type;
        }
		return (Math.max(
				Math.abs(this._mouseDownEvent.pep.x - ev.pep.x),
				Math.abs(this._mouseDownEvent.pep.y - ev.pep.y)
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
