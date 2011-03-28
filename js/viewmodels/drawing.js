(function($, ko, Procrastinate) {

  var historyLimit = 65536;
  
  function trigger(events, index, callback) {
    var event = events[index];
    $(document).trigger(event.name, event.args);
    if (++index < events.length) {
      if (index % 5 === 0)
        window.setTimeout(trigger, 15, events, index, callback);
      else
        trigger(events, index, callback);
    }
    else {
      callback();
    }
  }
  
  function Drawing() {
    this.events = amplify.store('drawing.events') || [];
    this.playing = ko.observable(false);
  }
  
  Drawing.prototype = {
  
    event: function(name, args) {
      var newEvent = {
        name: name,
        args: args,
        delay: new Date().getTime() - this.lastTime
      }, self = this;
      this.events.push({name: name, args: args});
      $(document).trigger(name, args);
      Procrastinate.start('drawing.save', 500, 10000, this.save, this);
    },
    
    clear: function() {
      this.events = [];
      this.save();
      $(document).trigger('canvas.clear');
    },
    
    play: function() {
      var self = this;
      this.playing(true);
      $(document).trigger('canvas.clear');
      trigger(this.events, 0, function() {
        self.playing(false);
      });
    },
    
    save: function() {
      if (this.events.length > historyLimit) {
        this.events.splice(0, this.events.length - historyLimit);
      }
      amplify.store('drawing.events', this.events);
    }
    
  };
  
  window.Drawing = Drawing;

})(jQuery, ko, Procrastinate);