function RhythnicAudio (elem, options) {
    var self = this;
    
    self.audio = document.createElement('audio');
    self.audioTest();
    
    self.elem = elem;
    self.controls = self.elem.children[0];
    self.play = self.controls.children[0];
    self.tracks = [];
    self.titles = [];
    self.options = options || {};
    
    self.init();
}

RhythnicAudio.prototype.init = function() {
    var self = this;
    
    self.controls.style.display = "block";
    self.overrideOptions(self.defaultOptions, self.options);
    self.getTracksAndTitles(self.elem.children[1], self.tracks, self.titles);
    
    self.bindEvents();
};

RhythnicAudio.prototype.audioTest = function() {
    if (!this.audio.canPlayType)
        throw new Error("Your browser doesn't support the audio tag.\nPlaylist will be a list of audio links.");
};

RhythnicAudio.prototype.overrideOptions = function(defaultOptions, userOptions){
    for (var key in defaultOptions) {
        if (!(key in userOptions)) {
            userOptions[key] = defaultOptions[key];
        }
    }
};

RhythnicAudio.prototype.getTracksAndTitles = function(playlistContainer, tracks, titles) {
    
    function findLinkElement(element) {
        if (element.nodeName == "A") {
            tracks.push(element.href);
            titles.push(element.innerText);
        } else {
            for (var i = 0; i < element.children.length; i++){
                findLinkElement(element.children[i]);
            }
        }
    };
    
    findLinkElement(playlistContainer);
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

