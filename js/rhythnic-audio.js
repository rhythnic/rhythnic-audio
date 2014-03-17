/* Constructor */
function RhythnicAudio (container) {
    /* Create audio element and do audio support test */
    this.audio = document.createElement("audio");
    
    //test browser support for the audio element
    try { this.audioTest(this.audio); }
    catch(error) { alert(error.message); return; }
    
    /* Get HTML elements */
    this.container  = container; //div container for the playlist
    this.controls   = this.container.querySelector(".controls"); //container for playlist controls
    this.playlist   = this.container.querySelector(".playlist"); //container for the lists that contain the audio links
    this.playBtn    = this.controls.querySelector(".play"); //play and pause icon element
    this.viewBtn    = this.controls.querySelector(".plView"); //toggle playlist view icon element
    this.seek       = this.controls.querySelector(".seek"); //range input slider, seek
    this.duration   = this.controls.querySelector(".duration"); //song duration display
    this.time       = this.controls.querySelector(".time"); //song current time display
    
    /* Get track path and title info */
    this.tracks = []; //array of paths to audio files
    this.titles = []; //array of 'a' element nodes, track list
    this.getTracksAndTitles(this.playlist);
    if (this.tracks.length <= 1) this.viewBtn.style.setProperty("display", "none");
    
    this.bTimeSlide = false; //boolean tells if seek bar is being dragged by the user
    this.current = 0; //index of current track
    
    this.bindEvents();
}


/* Initialize player and audio object according to the user options*/
RhythnicAudio.prototype.init = function(options) {
    /* Combine user and default options */
    this.options = options || {}; //global options
    this.overrideOptions(this.defaultOptions, this.options);

    /* Setup player according to options */
    if (this.options.hidePlaylist) this.togglePlaylistView();
    if (this.options.lockPlaylist) this.viewBtn.style.setProperty("display", "none");
    if (this.options.autoplay)     this.togglePlay(this.audio.paused);
    if (this.options.drawIcons) this.drawIcons();
    
    /* HTML element setup */
    this.controls.style.setProperty("display", "block");
    this.removeElementFocus(this.titles);
    this.playChild  = Array.prototype.slice.call(this.playBtn.childNodes);
    var cls = this.playChild[1].getAttribute("class");
    if (!cls || cls.indexOf("remove") === -1) this.toggleClass(this.playChild[1], "remove");
    
    //setup audio object according to options
    try { this.audioSetup(); }
    catch(error) { alert(error.message); return; }
};


/* Bind event listeners for mouse, touch, and keyboard */
RhythnicAudio.prototype.bindEvents = function() {
    var self = this;
    
    self.playBtn.addEventListener("click",        function(e) { self.togglePlay(self.audio.paused); });
    self.viewBtn.addEventListener("click",        function(e) { self.playlist.classList.toggle("plHide"); });
    self.playlist.addEventListener("click",       function(e) { self.onClickPlaylist(e); });
    self.container.addEventListener("keydown",    function(e) { self.onKeydownContainer(e); });
    self.audio.addEventListener("durationchange", function(e) { self.onDurationchange(); });
    self.audio.addEventListener("timeupdate",     function(e) { self.onTimeupdate(); });
    self.audio.addEventListener("ended",          function(e) { self.onEnded(); });   
    self.seek.addEventListener("mousedown",       function(e) { self.bTimeSlide = true; });
    self.seek.addEventListener("touchstart",      function(e) { self.bTimeSlide = true; });
    self.seek.addEventListener("change",          function(e) { self.time.innerHTML = self.formatTime(self.seek.value); });
    self.seek.addEventListener("mouseup",         function(e) { self.onPointerdownSeek(); });
    self.seek.addEventListener("touchend",        function(e) { self.onPointerdownSeek(); });
};


//Draw the play, pause, and playlist view icons using RhythnicIcon
//Set the pause icon class to remove (display: none)
RhythnicAudio.prototype.drawIcons = function(){
    //create play, pause, and playlist view icons
    RhythnicIcon.draw("play", this.playBtn);
    var pauseBtn = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    pauseBtn.className = "remove";
    RhythnicIcon.draw("pause", pauseBtn);
    this.playBtn.appendChild(pauseBtn);
    params = {"title": "Playlist View"};
    RhythnicIcon.draw("menu", this.viewBtn);
};


/* Event Handlers */
//When a track link is clicked, find the index of that track and initiate playback
RhythnicAudio.prototype.onClickPlaylist = function(e) {
    if ((e.target.nodeName) !== "A") return;
    e.preventDefault();
    this.playTrack(this.titles.indexOf(e.target));
};

//Determine the key pressed and act accordingly
//Space bar = play/pause, right/left arrows = seek, up/down arrows = track select
RhythnicAudio.prototype.onKeydownContainer = function(e) {
    switch(e.keyCode){
        case 32: e.preventDefault(); this.togglePlay(this.audio.paused); break;
        case 37: e.preventDefault(); this.audio.currentTime -= 2; break;
        case 39: e.preventDefault(); this.audio.currentTime += 2; break;
        case 38: e.preventDefault(); this.playTrack(this.current - 1); break;
        case 40: e.preventDefault(); this.playTrack(this.current + 1); break;
    }
};

//Get the audio duration and set the seek max and duration span innerHTML
RhythnicAudio.prototype.onDurationchange = function() {
    if (this.audio.duration != Number.POSITIVE_INFINITY &&
        this.audio.duration != Number.NEGATIVE_INFINITY &&
        !isNaN(this.audio.duration) && this.audio.duration !== 0){
            this.seek.max = this.audio.duration;
            this.duration.innerHTML = "/" + this.formatTime(this.audio.duration);
        }
};

//Update seek value and time span innerHTML on time update
RhythnicAudio.prototype.onTimeupdate = function() {
    if ( this.bTimeSlide ) return;
    this.seek.value = this.audio.currentTime;
    this.time.innerHTML = this.formatTime(this.audio.currentTime);
};

//On song end, stop single play, go to next track in playlist
RhythnicAudio.prototype.onEnded = function() {
    if (this.tracks.length > 1) this.playTrack(this.current + 1);
    else this.togglePlay(false);
};

//Pointer down on seek, set boolean to reflect dragging state (bTimeSlide)
//Set current time to seek value
RhythnicAudio.prototype.onPointerdownSeek = function() {
    this.audio.currentTime = this.seek.value;
    this.bTimeSlide = false;
};

/* End of event handlers */


//Setup and initiate track playback of track at index
//Remove selected class from previous track LI, add to new track LI
RhythnicAudio.prototype.playTrack = function(index) {
    this.titles[this.current].parentElement.classList.toggle("selected");
    this.current = (index < 0) ? this.tracks.length - 1 : index % this.tracks.length;
    this.titles[this.current].parentElement.classList.toggle("selected");
    this.audio.src = this.tracks[this.current];
    this.togglePlay( this.audio.paused );
};


/* Test whether the browser supports the MIME type in global options variable
    If no support, check the tracks key in the global options other file types
    that might be supported.  Provided files should be in a set that is referenced
    by a string for their MIME type.  If a supported MIME type is found, set the
    global tracks variable to that set of file paths. */
RhythnicAudio.prototype.audioSetup = function() {
    if (this.audio.canPlayType("audio/" + this.options.mime)) {
        this.audio.type = "audio/" + this.options.mime;
    } else {
        var found = false;
        for (var mime in this.options.tracks) {
            if (this.audio.canPlayType("audio/" + mime)) {
                this.audio.type = "audio/" + mime;
                this.tracks = this.options.tracks[mime];
                found = true;
            }
        }
        if (!found)
            throw new Error("Your browser doesn't support any of the provided audio file types.");
    }
    
    this.audio.setAttribute("preload", this.options.preload);
    this.audio.src = this.tracks[this.current];
    this.titles[this.current].parentElement.classList.toggle("selected");
};


/* Toggle play and pause, hide play or pause icons accordingly */
RhythnicAudio.prototype.togglePlay = function(play) {
    var self = this;
    if ( play ) this.audio.play();
    else this.audio.pause();
    
    if ((play && this.playChild[1].getAttribute("class").indexOf("remove") !== -1) ||
        (!play && this.playChild[0].getAttribute("class").indexOf("remove") !== -1)) {
        this.playChild.forEach(function(x){ self.toggleClass(x, "remove"); });
    }
};


//Query for all A elements for playlist container, store in this.titles
//Get the hrefs from A nodes and store them in this.tracks
RhythnicAudio.prototype.getTracksAndTitles = function(playlistContainer) {
    var self = this;
    this.titles = Array.prototype.slice.call(playlistContainer.getElementsByTagName("A"));
    this.titles.forEach(function(a) { self.tracks.push(a.href); });
};


//For int time (seconds), return a string in the format m:ss
RhythnicAudio.prototype.formatTime = function( time ) {
    var seconds = Math.floor(time % 60);
    return Math.floor( time / 60 ) + ":" + (seconds < 10 ? "0" + seconds : seconds);
};


//For each element in elementList, set tabindex to -1 and outline style to none
RhythnicAudio.prototype.removeElementFocus = function(elementList) {
    elementList.forEach(function(elem){
        elem.setAttribute("tabindex", "-1");
        elem.style.setProperty("outline", "none");
    }); 
};


//Test browser's support for the audio tag, throw error if no support
RhythnicAudio.prototype.audioTest = function(audio) {
    if (!audio.canPlayType)
        throw new Error("Your browser doesn't support the audio tag.\nPlaylist will display as a list of audio links.");
};


//Equivalent of element.classList.toggle(classItem)
RhythnicAudio.prototype.toggleClass = function(element, classItem){
    var re = new RegExp("(?:^|\\s)" + classItem + "(?!\\S)", "g");
    var clsName = element.getAttribute("class");
    if (re.test(clsName))
        element.setAttribute("class", clsName.replace(re, ''));
    else
        element.setAttribute("class", clsName + " " + classItem);
};


//Add missing default options to the user options object
RhythnicAudio.prototype.overrideOptions = function(defaultOptions, userOptions){
    for (var key in defaultOptions) {
        if (!(key in userOptions)) userOptions[key] = defaultOptions[key];
    }
};


//Default options
RhythnicAudio.prototype.defaultOptions = {
    "mime" : "mp4",
    "autoplay" : false,
    "preload" : "metadata",
    "hidePlaylist" : false,
    "lockPlaylist" : false,
    "tracks" : {},
    "drawIcons": true
};

