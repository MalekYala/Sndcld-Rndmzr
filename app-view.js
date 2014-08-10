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
		SC.initialize({
	  		client_id: 'a1d2786bf7396bf6d6ad9049a28150d6'
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

		//PlaylistApp.Playlist.create(playlist_values);

		var randomOffset = Math.floor(Math.random() * 100);

		//print selected values
		console.log(playlist_values);

		//get track objects according to selected values
		SC.get('/tracks', { limit: 50,
			offset: randomOffset,
			 q: playlist_values.search,
		 	 type_select: playlist_values.type_select,
		 	 bpm: { from: playlist_values.bpmMin, to: playlist_values.bpmMax },
			 duration: {from:playlist_values.durationMin, to:playlist_values.durationMax},
		     genres: playlist_values.genre,
		  	 tags: playlist_values.tag_list,
		  	 order: playlist_values.order,
		   	 license: playlist_values.license }, function(tracks, error) {

		     //random number between 0 and 199
		   	 var random = Math.floor(Math.random() * 49);
		   	 console.log('track ' + random + ' of 50');
		   	 console.log('offset ' + randomOffset + ' of '+ random + '');
			 if (tracks[random] == undefined) {
			 $('#message').text('Rethink you options and try again.').addClass('errorMessage').slideDown(200);
		 	 $('#extcontrols input')[0].reset();
			 }
		   	 //select random track url between 0 and 299
		     var track_url = tracks[random].permalink_url;
		     //if error display alert message

		     if (track_url == null || track_url == undefined || track_url.length == 0) {console.log('Please Refine Your Search'); }
			 else{

		     console.log('now playing: ' + track_url);
			$('#message').text('Sndcld Rndmzr' ).removeClass('errorMessage');

		      //embed track widget to target div
		      SC.oEmbed(track_url, {auto_play: true, show_comments:"false", iframe:true},
		        document.getElementById("target"))
		  	}


		 });

	},




});

window.PlaylistAppView = new PlaylistApp.AppView();
