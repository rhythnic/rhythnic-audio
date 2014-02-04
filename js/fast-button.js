function FastButton (element, handler) {
  this.element = element;
  this.handler = handler;
  this.coordinates = [];

  element.addEventListener('touchstart', this, false);
  element.addEventListener('click', this, false);
};

FastButton.prototype.handleEvent = function(event) {
  switch (event.type) {
    case 'touchstart': this.onTouchStart(event); break;
    case 'touchmove': this.onTouchMove(event); break;
    case 'touchend': this.onClick(event); break;
    case 'click': this.onClick(event); break;
  }
};

FastButton.prototype.onTouchStart = function(event) {
  event.stopPropagation();

  this.element.addEventListener('touchend', this, false);
  document.body.addEventListener('touchmove', this, false);

  this.startX = event.touches[0].clientX;
  this.startY = event.touches[0].clientY;
};

FastButton.prototype.onTouchMove = function(event) {
  if (Math.abs(event.touches[0].clientX - this.startX) > 10 ||
      Math.abs(event.touches[0].clientY - this.startY) > 10) {
    this.reset();
  }
};

FastButton.prototype.onClick = function(event) {
  event.stopPropagation();
  this.reset();
  this.handler(event);

  if (event.type == 'touchend') {
    this.preventGhostClick(this.startX, this.startY);
  }
};

FastButton.prototype.reset = function() {
  this.element.removeEventListener('touchend', this, false);
  document.body.removeEventListener('touchmove', this, false);
};

FastButton.prototype.preventGhostClick = function(x, y) {
  this.coordinates.push(x, y);
  window.setTimeout(this.pop, 2500);
};

FastButton.prototype.pop = function() {
  this.coordinates.splice(0, 2);
};