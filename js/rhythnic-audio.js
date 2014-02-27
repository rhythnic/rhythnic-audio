function RhythnicAudio (elem, options) {
    var self = this;
    
    self.audio = document.createElement('audio');
    self.bTimeSlide = false; //boolean tells if seek bar is being dragged by the user
    self.options = options || {}; //global options
    self.tracks = []; //list of paths to audio files
    self.titles = []; //list of 'a' element nodes, track list
    self.current = 0; //current track
    
    /* HTML elements */
    self.elem = elem; //div container for the playlist
    self.controls = self.elem.querySelector(".controls"); //container for playlist controls
    self.playlist = self.elem.querySelector(".playlist"); //container for the lists that contain the audio links
    self.play = self.controls.querySelector(".play");//play,pause icon element
    self.seek = self.controls.querySelector('.seek'); //range input slider, seek
    self.duration = self.controls.querySelector('.duration'); //song duration display
    self.time = self.controls.querySelector('.time'); //song current time display
    self.playlistView = self.elem.querySelector('.toggle-playlist-view'); //toggle playlist view icon element
}

/* Test browser's support for the audio tag, throw error if no support */
RhythnicAudio.prototype.audioTest = function() {
    if (!this.audio.canPlayType)
        throw new Error("Your browser doesn't support the audio tag.\nPlaylist will be a list of audio links.");
};

/* Initialize audio player, assemble tracks, test for MIME support, bind events */
RhythnicAudio.prototype.init = function() {
    var self = this;
    
    self.audioTest(); //test browser support for the audio element
    self.controls.style.display = "block";
    self.overrideOptions(self.defaultOptions, self.options);
    self.getTracksAndTitles(self.playlist);
    self.removeElementFocus();
    
    self.bindEvents();
    self.audioSetup();
    
    if (self.tracks.length <= 1) {
        self.playlistView.style.display = "none";
    } else {
        if (self.options.hidePlaylist) {
            self.options.hidePlaylist = false;
            self.togglePlaylistView();
        }
        
        if (self.options.lockPlaylist)
            self.playlistView.style.display = "none";
    }
    
    if (self.options.autoplay)
        self.togglePlay(self.audio.paused);
};

/* Bind event listeners for mouse, touch, and keyboard */
RhythnicAudio.prototype.bindEvents = function() {
    var self = this;
    
    self.controls.addEventListener("click", function(e){
        switch(e.target) {
            case self.play: self.togglePlay(self.audio.paused); break;
            case self.playlistView: self.togglePlaylistView(); break;
        }
    }, false);      
    
    self.elem.addEventListener("click", function(e){
        if (e.target.nodeName == "A") {
            e.preventDefault();
            if (e.target.parentElement.className.indexOf("selected") == -1) {
                self.playTrack(self.titles.indexOf(e.target));
        } else {        
                self.togglePlay(self.audio.paused);
            }
        }
    }, false);
    
    self.elem.addEventListener("keydown", function(e) {
        switch(e.keyCode){
            case 32: e.preventDefault(); self.togglePlay(self.audio.paused); break;
            case 37: e.preventDefault(); self.audio.currentTime -= 2; break;
            case 39: e.preventDefault(); self.audio.currentTime += 2; break;
            case 38: e.preventDefault(); self.playTrack(self.current - 1); break;
            case 40:e.preventDefault(); self.playTrack(self.current + 1); break;
        }               
    }, false);
    
    self.seek.addEventListener("keydown", function(e) {
        switch(e.keyCode) {

        }
    }, false);

    
    self.audio.addEventListener("loadedmetadata", function() {
        if (self.audio.duration != Number.POSITIVE_INFINITY && self.audio.duration != Number.NEGATIVE_INFINITY){
            self.seek.max = self.audio.duration;
            self.duration.innerHTML = "/" + self.formatTime(self.audio.duration);
        } else {
            self.duration.innerHTML = "?:??";
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
    
    self.seek.addEventListener("touchstart", function() {
        self.bTimeSlide = true;
    }, false);
    
    self.seek.addEventListener("touchmove", function() {
        self.time.innerHTML = self.formatTime(self.seek.value);
    }, false);
    
    self.seek.addEventListener("touchend", function() {
        self.audio.currentTime = self.seek.value;
        self.bTimeSlide = false;
    }, false);
};

/*  Setup and initiate track playback of track at index
    Remove selected class from previous track, add to new track */
RhythnicAudio.prototype.playTrack = function(index) {
    this.titles[this.current].parentElement.className =
    this.titles[this.current].parentElement.className.replace(' selected', '');
    this.current = (index < 0) ? this.tracks.length - 1 : index % this.tracks.length;
    this.titles[this.current].parentElement.className += " selected";
    this.audio.src = this.tracks[this.current];
    this.togglePlay( this.audio.paused );
};

/* Test whether the browser supports the MIME type in global options variable
    If no support, check the tracks key in the global options other file types
    that might be supported.  Provided files should be in a set that is referenced
    by a string for their MIME type.  If a supported MIME type is found, set the
    global tracks variable to that set of file paths. */
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

/* Toggle play and pause, swap icon classes */
RhythnicAudio.prototype.togglePlay = function(play) {            
    if ( play ) {
        this.audio.play();
        this.play.className = this.play.className.replace(this.options.playIcon, this.options.pauseIcon);
    } else {
        this.audio.pause();
        this.play.className = this.play.className.replace(this.options.pauseIcon, this.options.playIcon);
    }
};

/*  Query for all A elements, store in global titles
    Get the hrefs and store them in the global tracks */
RhythnicAudio.prototype.getTracksAndTitles = function(playlistContainer) {
    var self = this;
    self.titles = self.querySelectAll(playlistContainer, ["A"]);
    self.titles.forEach(function(title){
        self.tracks.push(title.href);
    });
};

/*  Wrote this due to problems with querySelectorAll, but it does the same thing
    Find all occurances of any element in the set "tags" that occur in "container"
    Put them into a set and return the set */
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

/*  Toggle showing and hiding the playlist by adding and removing the "hide" class
    to/from the playlist container.  The transition rules are set in the CSS. */
RhythnicAudio.prototype.togglePlaylistView = function() {
    if (this.options.hidePlaylist == true) {
        this.playlist.className = 
            this.playlist.className.replace(" plHide", '');
        this.options.hidePlaylist = false;
    } else {
        this.playlist.className += " plHide";
        this.options.hidePlaylist = true;
    }
};

/* format seconds to display as 0:00 */
RhythnicAudio.prototype.formatTime = function( time ) {
    var seconds = Math.floor(time % 60);
    return Math.floor( time / 60 ) + ':' + (seconds < 10 ? '0' + seconds : seconds);
};

RhythnicAudio.prototype.removeElementFocus = function() {
    this.titles.forEach(function(title){
        title.setAttribute("tabindex", "-1");
        title.style.outline = "none";
}); 
};

/* Override default options with user provided options */
RhythnicAudio.prototype.overrideOptions = function(defaultOptions, userOptions){
    for (var key in defaultOptions) {
        if (!(key in userOptions)) {
            userOptions[key] = defaultOptions[key];
        }
    }
};

/* Default options */
RhythnicAudio.prototype.defaultOptions = {
    "mime" : "mp4",
    "autoplay" : false,
    "hidePlaylist" : false,
    "lockPlaylist" : false,
    "showCurrentTrack" : true,
    "playIcon" : "fa-play",
    "pauseIcon" : "fa-pause",
    "tracks" : {}
};

