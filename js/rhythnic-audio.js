function RhythnicAudio (elem, options) {
    var self = this;
    
    self.audio = document.createElement('audio');
    self.audioTest();
    
    self.elem = elem;
    self.controls = self.elem.children[0];
    self.play = self.controls.children[0];
    self.seek = self.controls.querySelector('.seek');
    self.duration = self.elem.querySelector('.duration');
    self.time = self.elem.querySelector('.time');
    self.playlistView = self.elem.querySelector('.toggle-playlist-view');
    self.second = null;
    self.bTimeSlide = false;
    self.options = options || {};
    self.tracks = [];
    self.titles = [];
    self.current = 0;
    
    self.init();
}

RhythnicAudio.prototype.init = function() {
    var self = this;
    
    self.controls.style.display = "block";
    self.overrideOptions(self.defaultOptions, self.options);
    self.getTracksAndTitles(self.elem.children[1]);
    self.audioSetup();
    self.bindEvents();
    if (self.tracks.length > 1 && self.options.hidePlaylist) {
        self.options.hidePlaylist = false;
        self.togglePlaylistView();
    }
};

RhythnicAudio.prototype.bindEvents = function() {
    var self = this;
    
    self.play.addEventListener("click", function(){
        self.togglePlay(self.audio.paused);
    }, false);
    
    self.playlistView.addEventListener('click', function(){
        self.togglePlaylistView();
    }, false);
    
    self.titles.forEach(function(title){
        title.addEventListener("click", function(e) {
            e.preventDefault();
            if (this.parentElement.className.indexOf("selected") == -1) {
                self.playTrack(self.titles.indexOf(this));
            }
        }, false);
    });
    
    self.seek.addEventListener("mousedown", function() {
        self.bTimeSlide = true;
    }, false);
    
    self.seek.addEventListener("change", function() {
        self.time.innerHTML = self.formatTime(self.seek.value);
    }, false);
    
    self.seek.addEventListener("mouseup", function() {
        self.audio.currentTime = self.seek.value;
        self.bTimeSlide = false;
    }, false);
    
    self.controls.addEventListener("keyup", function(e) {
        switch(e.keyCode){
            case 32:
                self.togglePlay(self.audio.paused);
                break;
            case 37:
                self.playTrack(self.current - 1);
                break;
            case 39:
                self.playTrack(self.current + 1);
                break;
        }
    }, false);
    
    self.controls.addEventListener("keydown", function(e) {
        switch(e.keyCode){
            case 38:
                self.audio.volume = (self.audio.volume < 0.95) ? self.audio.volume + .05 : 1;
                break;
            case 40:
                self.audio.volume = (self.audio.volume > 0.05) ? self.audio.volume - .05 : 0;
                break;
        }
    }, false);
    
    self.audio.addEventListener("loadedmetadata", function() {
        if (self.audio.duration != Number.POSITIVE_INFINITY && self.audio.duration != Number.NEGATIVE_INFINITY){
            self.seek.max = self.audio.duration;
            self.duration.innerHTML = "/" + self.formatTime(self.audio.duration);
        } else {
            self.duration.innerHTML = "0:00";
        }
    }, false);
    
    self.audio.addEventListener("timeupdate", function()  {
        if ( !self.bTimeSlide ) {
            self.seek.value = self.audio.currentTime;
            self.time.innerHTML = self.formatTime(self.audio.currentTime);
        }
    }, false);
    
    self.audio.addEventListener('ended', function() {
        if (self.tracks.length > 1) {
            self.playTrack(self.current + 1);
        } else {
            self.togglePlay(false);
        }
    }, false);                
};

RhythnicAudio.prototype.playTrack = function(index) {
    this.titles[this.current].parentElement.className =
        this.titles[this.current].parentElement.className.replace(' selected', '');
    //if ( this.options.hidePlaylist ) this.$titles.eq(this.current).hide();
    this.setCurrent(index);
    this.titles[this.current].parentElement.className += " selected";
    //show this.titles[this.current]
    this.audio.src = this.tracks[this.current];
    this.togglePlay( this.audio.paused );
};

RhythnicAudio.prototype.audioSetup = function() {
    if (this.audio.canPlayType('audio/' + this.options.mime)) {
        this.audio.type = 'audio/' + this.options.mime;
    } else {
        var found = false;
        for (var mime in this.options.tracks) {
            if (this.audio.canPlayType('audio/' + mime)) {
                this.audio.type = 'audio/' + mime;
                this.tracks = this.options.tracks[mime];
                found = true;
            }
        }
        if (!found)
            throw new Error("Your browser doesn't support any of the provided audio file types.");
    }
    this.audio.src = this.tracks[this.current];
    this.titles[this.current].parentElement.className += " selected";
};

RhythnicAudio.prototype.togglePlay = function(play) {            
    if ( play ) {
        this.audio.play();
        this.play.className = this.play.className.replace(this.options.playIcon, this.options.pauseIcon);
    } else {
        this.audio.pause();
        this.play.className = this.play.className.replace(this.options.pauseIcon, this.options.playIcon);
    }
};

RhythnicAudio.prototype.audioTest = function() {
    if (!this.audio.canPlayType)
        throw new Error("Your browser doesn't support the audio tag.\nPlaylist will be a list of audio links.");
};

RhythnicAudio.prototype.getTracksAndTitles = function(playlistContainer) {
    var self = this;
    self.titles = self.querySelectAll(playlistContainer, ["A"]);
    self.titles.forEach(function(title){
        self.tracks.push(title.href);
    });
};

RhythnicAudio.prototype.querySelectAll = function(container, tags) {
    var result = [];
    
    function queryElement(element) {
        if (tags.indexOf(element.nodeName) != -1) {
            result.push(element);
        } else {
            for (var i = 0; i < element.children.length; i++){
                queryElement(element.children[i]);
            }
        }
    };
    
    queryElement(container);
    return result;
};

RhythnicAudio.prototype.togglePlaylistView = function() {
    if (this.options.hidePlaylist == true) {
        this.elem.children[1].className = 
            this.elem.children[1].className.replace(" hide", '');
        this.options.hidePlaylist = false;
    } else {
        this.elem.children[1].className += " hide";
        this.options.hidePlaylist = true;
    }
};

//format seconds to display as 0:00
RhythnicAudio.prototype.formatTime = function( time ) {
    this.second = Math.floor( time % 60 ).toString();
    this.second = (this.second.length > 1) ? this.second : '0' + this.second;
    return Math.floor( time / 60 ) + ':' + this.second;
};

//set current image
RhythnicAudio.prototype.setCurrent = function (index) {
    this.current = (index < 0) ? this.tracks.length - 1 : index % this.tracks.length;
};

RhythnicAudio.prototype.overrideOptions = function(defaultOptions, userOptions){
    for (var key in defaultOptions) {
        if (!(key in userOptions)) {
            userOptions[key] = defaultOptions[key];
        }
    }
};

RhythnicAudio.prototype.defaultOptions = {
    "mime" : "mp4",
    "hidePlaylist" : false,
    "playIcon" : "fa-play",
    "pauseIcon" : "fa-pause",
    "tracks" : {}
};

