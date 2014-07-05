;(function($){
	'use strict';

	var playlist_config = {
		playlist_container: $('#playlist-app'),
		playlist_form: $('#playlist-form'),
		playlist_get_list: $('#get-list'),
		playlist_genera_select: $('#genera-select'),
		playlist_bpm_select: $('#bpm-select'),
		playlist_template: $('#playlist-template')
		};


	Playlist.init(playlist_config);
})(window.jQuery);