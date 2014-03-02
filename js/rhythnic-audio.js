// Utility  *for older browsers that don't support Object.create
if (typeof Object.create !== 'function') {
    Object.create = function (obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}

function RhythnicAudio (container, options) {
    var self = this;
    
    self.audio = document.createElement('audio');
    self.bTimeSlide = false; //boolean tells if seek bar is being dragged by the user
    self.options = options || {}; //global options
    self.tracks = []; //array of paths to audio files
    self.titles = []; //array of 'a' element nodes, track list
    self.current = 0; //index of current track
    
    /* HTML elements */
    self.container = container; //div container for the playlist
    self.controls = self.container.querySelector(".controls"); //container for playlist controls
    self.playlist = self.container.querySelector(".playlist"); //container for the lists that contain the audio links
    self.play = self.controls.querySelector(".play");//play,pause icon element
    self.seek = self.controls.querySelector('.seek'); //range input slider, seek
    self.duration = self.controls.querySelector('.duration'); //song duration display
    self.time = self.controls.querySelector('.time'); //song current time display
    self.playlistView = self.container.querySelector('.toggle-playlist-view'); //toggle playlist view icon element
}

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
    
    if (self.tracks.length <= 1)
        self.playlistView.style.display = "none";
    else {
        if (self.options.hidePlaylist) {
            self.options.hidePlaylist = false;
            self.togglePlaylistView();
        }
        
        if (self.options.lockPlaylist) self.playlistView.style.display = "none";
    }
    
    if (self.options.autoplay) self.togglePlay(self.audio.paused);
};


/* Bind event listeners for mouse, touch, and keyboard */
RhythnicAudio.prototype.bindEvents = function() {
    var self = this;
    
    self.controls.addEventListener ("click",      function(e) { self.onClickControls(e); });      
    self.container.addEventListener("click",      function(e) { self.onClickContainer(e); });
    self.container.addEventListener("keydown",    function(e) { self.onKeydownContainer(e); });
    self.audio.addEventListener("durationchange", function(e) { self.onDurationchange(); });
    self.audio.addEventListener("timeupdate",     function(e) { self.onTimeupdate(); });
    self.audio.addEventListener('ended',          function(e) { self.onEnded(); });   
    self.seek.addEventListener("mousedown",       function(e) { self.bTimeSlide = true; });
    self.seek.addEventListener("touchstart",      function(e) { self.bTimeSlide = true; });
    self.seek.addEventListener("change",          function(e) { self.time.innerHTML = self.formatTime(self.seek.value); });
    self.seek.addEventListener("mouseup",         function(e) { self.onPointerdownSeek(); });
    self.seek.addEventListener("touchend",        function(e) { self.onPointerdownSeek(); });
};

/*
********* Event Handlers *************
*/
RhythnicAudio.prototype.onClickControls = function(e) {
    switch(e.target) {
        case this.play: this.togglePlay(this.audio.paused); break;
        case this.playlistView: this.togglePlaylistView(); break;
    }
};

RhythnicAudio.prototype.onClickContainer = function(e) {
    if (e.target.nodeName == "A") {
        e.preventDefault();
        if (e.target.parentElement.className.indexOf("selected") == -1)
             this.playTrack(this.titles.indexOf(e.target));
        else this.togglePlay(this.audio.paused);
    }
};

RhythnicAudio.prototype.onKeydownContainer = function(e) {
    switch(e.keyCode){
        case 32: e.preventDefault(); this.togglePlay(this.audio.paused); break;
        case 37: e.preventDefault(); this.audio.currentTime -= 2; break;
        case 39: e.preventDefault(); this.audio.currentTime += 2; break;
        case 38: e.preventDefault(); this.playTrack(this.current - 1); break;
        case 40: e.preventDefault(); this.playTrack(this.current + 1); break;
    }
};

RhythnicAudio.prototype.onDurationchange = function() {
    if (this.audio.duration != Number.POSITIVE_INFINITY &&
        this.audio.duration != Number.NEGATIVE_INFINITY &&
        !isNaN(this.audio.duration) && this.audio.duration !== 0){
            this.seek.max = this.audio.duration;
            this.duration.innerHTML = "/" + this.formatTime(this.audio.duration);
        }
};

RhythnicAudio.prototype.onTimeupdate = function() {
    if ( this.bTimeSlide ) return;
    this.seek.value = this.audio.currentTime;
    this.time.innerHTML = this.formatTime(this.audio.currentTime);
};

RhythnicAudio.prototype.onEnded = function() {
    if (this.tracks.length > 1) this.playTrack(this.current + 1);
    else this.togglePlay(false);
};

RhythnicAudio.prototype.onPointerdownSeek = function() {
    this.audio.currentTime = this.seek.value;
    this.bTimeSlide = false;
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
    self.titles = Array.prototype.slice.call(playlistContainer.getElementsByTagName('A'));
    self.titles.forEach(function(title) { self.tracks.push(title.href); });
};


/*  Toggle showing and hiding the playlist by adding and removing the "hide" class
    to/from the playlist container.  The transition rules are set in the CSS. */
RhythnicAudio.prototype.togglePlaylistView = function() {
    this.toggleView(this.playlist, "plHide");
    this.options.hidePlaylist = !this.options.hidePlaylist;
};

/*  Toggle the view of an element by adding or removing a class */
RhythnicAudio.prototype.toggleView = function(element, hiddenClass){
    var re = new RegExp("(?:^|\\s)" + hiddenClass + "(?!\\S)", "g");
    if (re.test(element.className))
        element.className = element.className.replace(re , '' );
    else
        element.className += ' ' + hiddenClass;
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

/* Test browser's support for the audio tag, throw error if no support */
RhythnicAudio.prototype.audioTest = function() {
    if (!this.audio.canPlayType)
        throw new Error("Your browser doesn't support the audio tag.\nPlaylist will be a list of audio links.");
};

/* Override default options with user provided options */
RhythnicAudio.prototype.overrideOptions = function(defaultOptions, userOptions){
    for (var key in defaultOptions) {
        if (!(key in userOptions)) userOptions[key] = defaultOptions[key];
    }
};

/* Default options */
RhythnicAudio.prototype.defaultOptions = {
    "mime" : "mp4",
    "autoplay" : false,
    "hidePlaylist" : false,
    "lockPlaylist" : false,
    "playIcon" : "fa-play",
    "pauseIcon" : "fa-pause",
    "tracks" : {}
};

