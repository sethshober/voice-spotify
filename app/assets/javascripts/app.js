(function () {
    var audio = new Audio();
    var trackNum;
    var cachedResponse;

    function searchTracks(query) {
        $.ajax({
            url: 'https://api.spotify.com/v1/search',
            data: {
                q: query,
                type: 'track'
            },
            success: function (response) {
                cachedResponse = response;
                trackNum = 0;
                playNext(cachedResponse);
            }
        });
    }

    function playNext(response) {
      if (response.tracks.items.length) {
        var track = response.tracks.items[trackNum];
        audio.src = track.preview_url;
        audio.play();
        communicateAction('<div>Playing ' + track.name + ' by ' + track.artists[0].name + '</div><img width="150" src="' + track.album.images[1].url + '">');
      }
    }

    function storeSearch(query) {
      $.ajax({
        url: 'http://localhost:8000/test',
        data: {
          q: query
        },
        success: function(response) {
          console.log(response);
        }
      });
    }

    function playSong(songName, artistName) {
        var query = songName;
        if (artistName) {
            query += ' artist:' + artistName;
        }

        searchTracks(query);
    }

    function communicateAction(text) {
        var rec = document.getElementById('conversation');
        rec.innerHTML += '<div class="action">' + text + '</div>';
    }

    function recognized(text) {
        var rec = document.getElementById('conversation');
        rec.innerHTML += '<div class="recognized"><div>' + text + '</div></div>';
        storeSearch(text);
    }

    if (annyang) {
        // Let's define our first command. First the text we expect, and then the function it should call
        var commands = {
            'stop': function () {
                audio.pause();
            },
                'play track *song': function (song) {
                recognized('Play track ' + song);
                playSong(song);
            },
                'play *song by *artist': function (song, artist) {
                recognized('Play song ' + song + ' by ' + artist);
                playSong(song, artist);
            },
                'play song *song': function (song) {
                recognized('Play song ' + song);
                playSong(song);
            },
                'play *song': function (song) {
                recognized('Play ' + song);
                playSong(song);
            },
                'next': function() {
                  if(trackNum != cachedResponse.tracks.length - 1) {
                    trackNum = trackNum + 1;
                    playNext(cachedResponse);
                }
            },
                'back': function() {
                  if(trackNum != 0) {
                    trackNum = trackNum - 1;
                    playNext(cachedResponse);
                  }
            },
                ':nomatch': function (message) {
                recognized(message);
                communicateAction('Sorry, I don\'t understand this action');
            }
        };

        // Add our commands to annyang
        annyang.addCommands(commands);

        // Start listening. You can call this here, or attach this call to an event, button, etc.
        annyang.start();
    }

    annyang.addCallback('error', function () {
        communicateAction('error');
    });
})();