// Utility  *for older browsers that don't support Object.create
if ( typeof Object.create !== 'function' ) {
    Object.create = function( obj ) {
        function F(){};
        F.prototype = obj;
        return new F();
    };
}

(function( $, window, document, undefined ) {
    var RhythnicAudio = {
        init: function( options, elem ) {
            var self = this;
            
            self.$elem = $(elem);
            self.$controls = self.$elem.children(".controls");
            self.$play = self.$controls.find(".play");
            
            self.options = $.extend({}, $.fn.rhythnicaudio.options, options);  //options array

            
            self.drawControls();
            self.bindEvents();

        },
        
        bindEvents: function() {
            var self = this;
            
            self.play.on('click tap', function() {
                this.hide();
                self.pause.show();
                self.playLayer.draw();
            }).on('mouseover', function() {
                this.fill(self.options.color['play']['hover']);
                self.playLayer.draw();
                self.$controls.css('cursor', 'pointer'); 
            }).on('mouseout', function() {
                this.fill(self.options.color['play']['default']);
                self.playLayer.draw();
                self.$controls.css('cursor', 'default'); 
            }).on('mousedown', function() {
                this.fill(self.options.color['play']['active']);
                self.playLayer.draw();
            });
            
            self.pause.on('click tap', function() {
                this.hide();
                self.play.show();
                self.playLayer.draw();
            }).on('mouseover', function() {
                this.fill(self.options.color['pause']['hover']);
                self.playLayer.draw();
                self.$controls.css('cursor', 'pointer'); 
            }).on('mouseout', function() {
                this.fill(self.options.color['pause']['default']);
                self.playLayer.draw();
                self.$controls.css('cursor', 'default'); 
            }).on('mousedown', function() {
                this.fill(self.options.color['pause']['active']);
                self.playLayer.draw();
            });;
            
            self.volUp.on('mouseover', function() {
                this.fill(self.options.color['volume']['hover']);
                self.volumeLayer.draw();
                self.$controls.css('cursor', 'pointer'); 
            }).on('mouseout', function() {
                this.fill(self.options.color['volume']['default']);
                self.volumeLayer.draw();
                self.$controls.css('cursor', 'default');
            }).on('mousedown', function() {
                this.fill(self.options.color['volume']['active']);
                self.volumeLayer.draw();
            }).on('mouseup', function() {
                this.fill(self.options.color['volume']['hover']);
                self.volumeLayer.draw();
            });
            
            self.volDown.on('mouseover', function() {
                this.fill(self.options.color['volume']['hover']);
                self.volumeLayer.draw();
                self.$controls.css('cursor', 'pointer');
            }).on('mouseout', function() {
                this.fill(self.options.color['volume']['default']);
                self.skipLayer.draw();
                self.$controls.css('cursor', 'default');
            }).on('mousedown', function() {
                this.fill(self.options.color['volume']['active']);
                self.volumeLayer.draw();
            }).on('mouseup', function() {
                this.fill(self.options.color['volume']['hover']);
                self.volumeLayer.draw();
            });
            
            self.prev.on('mouseover', function() {
                this.fill(self.options.color['skip']['hover']);
                self.skipLayer.draw();
                self.$controls.css('cursor', 'pointer'); 
            }).on('mouseout', function() {
                this.fill(self.options.color['skip']['default']);
                self.skipLayer.draw();
                self.$controls.css('cursor', 'default');
            }).on('mousedown', function() {
                this.fill(self.options.color['skip']['active']);
                self.skipLayer.draw();
            }).on('mouseup', function() {
                this.fill(self.options.color['skip']['hover']);
                self.skipLayer.draw();
            });
            
            self.next.on('mouseover', function() {
                this.fill(self.options.color['skip']['hover']);
                self.skipLayer.draw();
                self.$controls.css('cursor', 'pointer');
            }).on('mouseout', function() {
                this.fill(self.options.color['skip']['default']);
                self.skipLayer.draw();
                self.$controls.css('cursor', 'default');
            }).on('mousedown', function() {
                this.fill(self.options.color['skip']['active']);
                self.skipLayer.draw();
            }).on('mouseup', function() {
                this.fill(self.options.color['skip']['hover']);
                self.skipLayer.draw();
            });
            
            
            
        }
    };
                    
    $.fn.RhythnicAudio = function( options ) {
        return this.each(function() {
            var RhythnicAudio = Object.create( RhythnicAudio );
            RhythnicAudio.init( options || {}, this );
        });
    };

    //default options
    $.fn.RhythnicAudio.options = {

    };

})( jQuery, window, document );