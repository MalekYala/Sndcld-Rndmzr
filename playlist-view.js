var PlaylistApp = window.PlaylistApp || {};

PlaylistApp.PlaylistView = Backbone.View.extend({
	tagname: 'li',
	template: _.template($('#playlist-template').html()),

	
  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  }
});


