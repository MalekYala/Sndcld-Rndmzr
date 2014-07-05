var PlaylistApp = window.QuiltApp || {};

PlaylistApp.PlaylistCollection = Backbone.Collection.extend({

	model: PlaylistApp.PLaylistModel,
	url: 'http://api.soundcloud.com/tracks',

	localStorage: new Backbone.LocalStorage('playlist-app')






});

PlaylistApp.Playlist = new PlaylistApp.PlaylistCollection();