var PlaylistApp = window.PlaylistApp || {};

PlaylistApp.AppView = Backbone.View.extend({

	//boundaries of app
	el: $('#playlist-app'),
	//event click listener
	events: {
		'click #get-list' : 'create_list'
	},
	//declare elements
	initialize: function(){
		this.$playlist_form = $('#playlist-form');
		this.$get_list = $('#get-list');
		this.$search = $('#search');
		this.$genre_select = $('select[name=genre-select]');
		this.$tags = $('#tags');
		this.$order_select = $('select[name=order-select]');
		this.$type_select = $('select[name=type-select]');
		this.$license_select = $('select[name=license-select]');
		this.$durationMin_select = $('#durationMin-select');
	    this.$durationMax_select = $('#durationMax-select');
		this.$bpm_select_min = $('#bpm-select-min');
		this.$bpm_select_max = $('#bpm-select-max');
		this.$track_list = $('#track-list');
		this.$loading = $('#loading');
		this.$target = $('#target');

		//auth with soundcloud api on initalize
		// Using a known working client ID for API v1
		SC.initialize({
	  		client_id: 'a3e059563d7fd3372b49b37f00a00bcf'
		});

		//this.collection.on('sync', this.render, this);
    },

	render: function() {
		 this.$el.empty();
    	console.log('collection: ', this.collection);
    	this.collection.each(this.addOne, this);
    	return this;
	},

    populate_tracks: function(track){
   	 console.log('model: ', track);
    var trackView = new PlaylistApp.PlaylistView({ model: track });
    this.$el.append(trackView.render().el);

    },


	create_list: function(e) {
		e.preventDefault();
		var playlist_values = {
			genre: this.$genre_select.val(),
			search: this.$search.val(),
			tag_list: this.$tags.val(),
			order: this.$order_select.val(),
			type_select: this.$type_select.val(),
			license: this.$license_select.val(),
			durationMin: this.$durationMin_select.val(),
			durationMax: this.$durationMax_select.val(),
			bpmMin: this.$bpm_select_min.val(),
			bpmMax: this.$bpm_select_max.val(),
		};

		var randomOffset = Math.floor(Math.random() * 100);

		//print selected values
		console.log(playlist_values);
		
		// Show loading message
		$('#message').text('Loading...').removeClass('errorMessage');

		// Use SoundCloud v2 API endpoint which works without authentication for public content
		var searchQuery = playlist_values.search || '';
		if (playlist_values.genre) {
			searchQuery += ' ' + playlist_values.genre;
		}
		if (playlist_values.tag_list) {
			searchQuery += ' ' + playlist_values.tag_list;
		}
		
		// Build API URL - using v2 API endpoint
		var apiUrl = 'https://api-v2.soundcloud.com/search/tracks';
		var params = new URLSearchParams({
			q: searchQuery.trim() || 'music',
			limit: 20,
			offset: randomOffset,
			client_id: 'a3e059563d7fd3372b49b37f00a00bcf'
		});
		
		// Fetch tracks using modern fetch API
		fetch(apiUrl + '?' + params.toString())
			.then(response => {
				if (!response.ok) {
					throw new Error('API request failed');
				}
				return response.json();
			})
			.then(data => {
				var tracks = data.collection || data.tracks || [];
				
				console.log('Found ' + tracks.length + ' tracks');
				
				if (tracks.length === 0) {
					$('#message').text('No tracks found. Try different options.').addClass('errorMessage');
					return;
				}
				
				// Select a random track
				var random = Math.floor(Math.random() * tracks.length);
				var track = tracks[random];
				var track_url = track.permalink_url;
				
				console.log('Now playing: ' + track_url);
				$('#message').text('Sndcld Rndmzr').removeClass('errorMessage');
				
				// Embed track widget using iframe
				var widgetUrl = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(track_url) + 
				                '&auto_play=true&show_comments=false&visual=true';
				var iframe = '<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" ' +
				           'src="' + widgetUrl + '"></iframe>';
				document.getElementById("target").innerHTML = iframe;
			})
			.catch(error => {
				console.error('Error fetching tracks:', error);
				$('#message').text('Error loading tracks. Using SoundCloud SDK fallback...').addClass('errorMessage');
				
				// Fallback to old SC.get method
				SC.get('/tracks', { 
					limit: 50,
					offset: randomOffset,
					q: playlist_values.search,
					type_select: playlist_values.type_select,
					bpm: { from: playlist_values.bpmMin, to: playlist_values.bpmMax },
					duration: {from:playlist_values.durationMin, to:playlist_values.durationMax},
					genres: playlist_values.genre,
					tags: playlist_values.tag_list,
					order: playlist_values.order,
					license: playlist_values.license 
				}, function(tracks, error) {
					if (error || !tracks || tracks.length === 0) {
						console.log('SDK Error or no tracks found:', error);
						$('#message').text('No tracks found. Try different options.').addClass('errorMessage');
						return;
					}
					
					var random = Math.floor(Math.random() * Math.min(tracks.length, 49));
					var track_url = tracks[random].permalink_url;
					
					if (track_url) {
						console.log('Now playing (SDK): ' + track_url);
						$('#message').text('Sndcld Rndmzr').removeClass('errorMessage');
						
						var widgetUrl = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(track_url) + 
						                '&auto_play=true&show_comments=false&visual=true';
						var iframe = '<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" ' +
						           'src="' + widgetUrl + '"></iframe>';
						document.getElementById("target").innerHTML = iframe;
					}
				});
			});
	},




});

window.PlaylistAppView = new PlaylistApp.AppView();
