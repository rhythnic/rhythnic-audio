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
            self.$controls = self.$elem.children("#controls");
            self.cWidth = self.$controls.width(),
            self.cHeight = self.$controls.height();
            
            self.drawControls();
            self.bindEvents();

        },
        
        bindEvents: function() {
            var self = this;
            
            self.play.on('click', function() {
                this.hide();
                self.pause.show();
                self.playLayer.draw();
            }).on('mouseover', function() {
                self.$controls.css('cursor', 'pointer'); 
            }).on('mouseout', function() {
                self.$controls.css('cursor', 'default'); 
            });
            
            self.pause.on('click', function() {
                this.hide();
                self.play.show();
                self.playLayer.draw();
            }).on('mouseover', function() {
                self.$controls.css('cursor', 'pointer'); 
            }).on('mouseout', function() {
                self.$controls.css('cursor', 'default'); 
            });
            
            self.volUp.on('mouseover', function() {
                this.fill('blue');
                self.volumeLayer.draw();
                self.$controls.css('cursor', 'pointer'); 
            }).on('mouseout', function() {
                this.fill('#fff');
                self.volumeLayer.draw();
                self.$controls.css('cursor', 'default');
            });
            
            self.volDown.on('mouseover', function() {
                this.fill('blue');
                self.volumeLayer.draw();
                self.$controls.css('cursor', 'pointer');
            }).on('mouseout', function() {
                this.fill('#fff');
                self.volumeLayer.draw();
                self.$controls.css('cursor', 'default');
            });
            
        },
        
        drawControls: function() {
            var self = this;
            self.stage = new Kinetic.Stage({ container: 'controls', width: self.cWidth, height: self.cHeight });
            self.playLayer = new Kinetic.Layer(),
            self.volumeLayer = new Kinetic.Layer(),
            self.skipLayer = new Kinetic.Layer();
            
            self.play = new Kinetic.RegularPolygon({
                x: self.cWidth/2.1,
                y: self.cHeight/2,
                sides: 3,
                radius: self.cWidth / 5,
                fill: '#00D2FF',
                rotationDeg: -30
            });
            
            self.pause = new Kinetic.Shape({
                sceneFunc: function(context) {
                    context.beginPath();
                    context.moveTo(self.cWidth/3.2, self.cHeight/3.2);
                    context.lineTo(self.cWidth/3.2, self.cHeight/1.45);
                    context.lineTo(self.cWidth/2.29, self.cHeight/1.45);
                    context.lineTo(self.cWidth/2.29, self.cHeight/3.2);
                    context.lineTo(self.cWidth/3.2, self.cHeight/3.2);
                    context.moveTo(self.cWidth/1.78, self.cHeight/3.2);
                    context.lineTo(self.cWidth/1.78, self.cHeight/1.45);
                    context.lineTo(self.cWidth/1.45, self.cHeight/1.45);
                    context.lineTo(self.cWidth/1.45, self.cHeight/3.2);
                    context.closePath();
                    // KineticJS specific context method
                    context.fillStrokeShape(this);
                },
                fill: '#fff',
                hitFunc: function(context) {
                  context.beginPath();
                  context.moveTo(self.cWidth/3.2, self.cHeight/3.2);
                  context.lineTo(self.cWidth/3.2, self.cHeight/1.45);
                  context.lineTo(self.cWidth/1.45, self.cHeight/1.45);
                  context.lineTo(self.cWidth/1.45, self.cHeight/3.2);
                  context.closePath();
                  context.fillStrokeShape(this);
                }
            });
            
            self.volUp = new Kinetic.RegularPolygon({
                x: self.cWidth * .5,
                y: self.cHeight * .15,
                sides: 3,
                radius: self.cWidth / 10,
                fill: '#fff'
            });
            
            self.volDown = new Kinetic.RegularPolygon({
                x: self.cWidth * .5,
                y: self.cHeight * .85,
                sides: 3,
                radius: self.cWidth / 10,
                fill: '#fff',
                rotationDeg: 60
            });
            
            self.next = new Kinetic.Shape({
                sceneFunc: function(context) {
                    context.beginPath();
                    context.moveTo(self.cWidth/1.2, self.cHeight/2.4);
                    context.lineTo(self.cWidth/1.09, self.cHeight/2);
                    context.lineTo(self.cWidth/1.09, self.cHeight/2.4);
                    context.lineTo(self.cWidth/1.06, self.cHeight/2.4);
                    context.lineTo(self.cWidth/1.06, self.cHeight/1.71);
                    context.lineTo(self.cWidth/1.09, self.cHeight/1.71);
                    context.lineTo(self.cWidth/1.09, self.cHeight/2);
                    context.lineTo(self.cWidth/1.2, self.cHeight/1.71);
                    context.lineTo(self.cWidth/1.2, self.cHeight/2.4);
                    context.closePath();
                    // KineticJS specific context method
                    context.fillStrokeShape(this);
                },
                fill: '#fff',
                hitFunc: function(context) {
                  context.beginPath();
                  context.moveTo(self.cWidth/1.2, self.cHeight/2.4);
                  context.lineTo(self.cWidth/1.2, self.cHeight/1.71);
                  context.lineTo(self.cWidth/1.06, self.cHeight/1.71);
                  context.lineTo(self.cWidth/1.06, self.cHeight/2.4);
                  context.closePath();
                  context.fillStrokeShape(this);
                }
            });
            
            self.prev = new Kinetic.Shape({
                sceneFunc: function(context) {
                    context.beginPath();
                    context.moveTo(self.cWidth/6, self.cHeight/2.4);
                    context.lineTo(self.cWidth/12, self.cHeight/2);
                    context.lineTo(self.cWidth/12, self.cHeight/2.4);
                    context.lineTo(self.cWidth/18.46, self.cHeight/2.4);
                    context.lineTo(self.cWidth/18.46, self.cHeight/1.71);
                    context.lineTo(self.cWidth/12, self.cHeight/1.71);
                    context.lineTo(self.cWidth/12, self.cHeight/2);
                    context.lineTo(self.cWidth/6, self.cHeight/1.71);
                    context.lineTo(self.cWidth/6, self.cHeight/2.4);
                    context.closePath();
                    // KineticJS specific context method
                    context.fillStrokeShape(this);
                },
                fill: '#fff',
                hitFunc: function(context) {
                  context.beginPath();
                  context.moveTo(self.cWidth/6, self.cHeight/2.4);
                  context.lineTo(self.cWidth/6, self.cHeight/1.71);
                  context.lineTo(self.cWidth/18.46, self.cHeight/1.71);
                  context.lineTo(self.cWidth/18.46, self.cHeight/2.4);
                  context.closePath();
                  context.fillStrokeShape(this);
                }
            });
            
                self.playLayer.add(self.play);
                self.playLayer.add(self.pause);
                self.pause.hide();
                
                self.volumeLayer.add(self.volUp);
                self.volumeLayer.add(self.volDown);
                
                self.skipLayer.add(self.next);
                self.skipLayer.add(self.prev);
                
                self.stage.add(self.playLayer);
                self.stage.add(self.volumeLayer);
                self.stage.add(self.skipLayer);
        }
    };
                    
        $.fn.rhythnicaudio = function( options ) {
            return this.each(function() {
                var rhythnicaudio = Object.create( RhythnicAudio );
                rhythnicaudio.init( options || {}, this );
            });
        };
    
        //default options
        $.fn.rhythnicaudio.options = {
            playColor: '#00ff00',
            pauseColor: '#fff',
            volumeColor: '#fff',
            skipColor: '#fff'
        };

})( jQuery, window, document );