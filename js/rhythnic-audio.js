function RhythnicAudio (elem, options) {
    var self = this;
    
    self.elem = elem;
    self.audio = document.createElement('audio');
    self.controls = self.elem.children[0];
    self.play = self.controls.children[0];
    self.tracks = null;
    self.options = options || {};
}

RhythnicAudio.prototype.init = function() {
    var self = this;
    
    self.controls.style.display = "block";
    self.overrideOptions(self.defaultOptions, self.options);
    self.tracks = self.getTracks(self.elem.children[1]);
    self.bindEvents();
};

RhythnicAudio.prototype.overrideOptions = function(defaultOptions, userOptions){
    for (var key in defaultOptions) {
        if (!(key in userOptions)) {
            userOptions[key] = defaultOptions[key];
        }
    }
};

RhythnicAudio.prototype.getTracks = function(playlistContainer) {
    
    var tracks = [];
    
    function findLinkElement(element) {
        if (element.nodeName == "A") {
            tracks.push(element);
        } else {
            for (var i = 0; i < element.children.length; i++){
                findLinkElement(element.children[i]);
            }
        }
    };
    
    findLinkElement(playlistContainer);
    return tracks;
};

RhythnicAudio.prototype.bindEvents = function() {
    var self = this;
    
    self.play.addEventListener("click", function(){
        self.togglePlay(true);
    }, false);
};

RhythnicAudio.prototype.togglePlay = function(play) {            
    if ( play ) {
        //this.audio.play();
        this.play.className = this.play.className.replace(this.options.playIcon, this.options.pauseIcon);
    } else {
        //this.audio.pause();
        this.play.className = this.play.className.replace(this.options.pauseIcon, this.options.playIcon);
    }
};

RhythnicAudio.prototype.defaultOptions = {
    "hidePlaylist" : false,
    "playIcon" : "fa-play",
    "pauseIcon" : "fa-pause"
};

