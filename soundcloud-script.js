window.App = {
  Models: {},
  Collections: {},
  Views: {}
};
var $genera_select = $('#genera-select');
var $limit = $('#limit');
var $playlist_form = $('#playlist-form');
var $get_list = $('#get-list');
var $search = $('#search');
var $genre_select = $('select[name=genre-select]');
var $tags = $('#tags');
var $order_select = $('select[name=order-select]');
var $type_select = $('select[name=type-select]');
var $license_select = $('select[name=license-select]');
var $durationMin_select = $('#durationMin-select');
var $durationMax_select = $('#durationMax-select');
var $bpm_select_min = $('#bpm-select-min');
var $bpm_select_max = $('#bpm-select-max');
var $track_list = $('#track-list');
var $target = $('#target');

App.Models.Track = Backbone.Model.extend();

App.Collections.Tracks = Backbone.Collection.extend({
  model: App.Models.Track,
  url: 'http://api.soundcloud.com/tracks'
});

App.Views.Tracks = Backbone.View.extend({
  tagName: 'ol',

    events: {
    'click #get-list' : 'render'
  },
  initialize: function() {
    //var model = new App.Models.Track({id: 'asdf'});
    //this.collection.add(model);
    //this.collection.on('add', this.render);
    
    this.collection.on('sync', this.render, this);
  },
  render: function() {
    this.$el.empty();
    console.log('collection: ', this.collection);
    this.collection.each(this.addOne, this);
    return this;
  },
  addOne: function(track) {
    console.log('model: ', track);
    var trackView = new App.Views.Track({ model: track });
    this.$el.append(trackView.render().el);
  }
});

App.Views.Track = Backbone.View.extend({
  tagName: 'li',
  template: _.template($('#playlist-template').html()),


  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  }
});

var tracks = new App.Collections.Tracks();


  var randomOffset = Math.floor(Math.random() * 5999);

tracks.fetch({
  data: {
    format: 'json',
    client_id: 'a1d2786bf7396bf6d6ad9049a28150d6',
    q: $search.val(),
    type_select: $type_select.val(), 
    genres: $genera_select.val(),
    order: $order_select.val(),
    tag_list: $tags.val(),
    limit: 5,
    offset: randomOffset
  }

});

var app = new App.Views.Tracks({
  collection: tracks
});

$('.tracks').html(app.render().el);
