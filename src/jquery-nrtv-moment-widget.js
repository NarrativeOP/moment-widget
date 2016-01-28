(function( $ ) {
  var nrtvElement;
  $.fn.nrtvScrubb = function(uuid, clientID, clientSecret) {
    nrtvElement = this
      $(document).ready(function() {
        var scrubb = new nrtvScrubb(uuid, clientID, clientSecret);
      });

    /**
     * Nrtv base class
     *
     * Handles all communication with the Narrative api.
     *
     * @params {clientId} Your client_id for this application
     * @params {clientSecret} Your client_secret for this application
     */
    function Nrtv(clientID, clientSecret) {
      var self = this;
      self.cookieName = 'nrtv-codepen';
      self.apiUrl = 'https://narrativeapp.com/';
    }

    /**
     * Get an anonymous access token from the Api
     *
     * If we have an existing api token use that, else look for one the cookie,
     * lastly request a new one.
     *
     * @params {callback} - Callback to be run once we've fetched the moment
     */
    Nrtv.prototype.getAnonymousToken = function(callback) {
      var self = this;

      if(self.token) {
        return callback(self.token);
      }

      var cookie;
      var parts = ('; ' + document.cookie).split('; '+self.cookieName+'=');
      if (parts.length == 2) {
        self.token = JSON.parse(parts.pop().split(';').shift());
        return callback(self.token);
      }

      var url = self.apiUrl + 'oauth2/token/?' + $.param({grant_type: 'client_credentials'});
      $.ajax({
        url: url,
        method: 'post',
        beforeSend: function(request) {
          request.setRequestHeader('Authorization', 'Basic ' + btoa(clientID+':'+clientSecret));
        }
      }).done(function(token) {
        var date = new Date();
        date.setTime(date.getTime()+(1*24*60*60*1000));

        document.cookie = self.cookieName+'='+JSON.stringify(token)+'; expires='+date.toGMTString()+'; path=/';
        self.token = token;
        return callback(token);
      });
    };

    /**
     * Api function
     *
     * First get an anonymous token, then do an api call.
     *
     * @params {string} - Endpoint to call
     * @params {callback} - Callback to be run once we have a response
     */
    Nrtv.prototype.api = function(path, callback) {
      var self = this;
      self.getAnonymousToken(function(token) {
        $.ajax({
          url: self.apiUrl + 'api/v2' + path,
          beforeSend: function(request) {
            request.setRequestHeader('Authorization', 'Bearer '+token.access_token);
          }
        }).done(function(data) {
          callback(data);
        });
      });
    };

    /**
     * Fetch a moments all photos
     *
     * @params {uuid} - The unique identifier of the moment
     * @params {callback} - Callback to be run once we've fetched the photos
     */
    Nrtv.prototype.getPhotos = function(uuid, callback) {
      this.api('/moments/'+uuid+'/photos/?limit=9999', function(data) {
        callback(data.results);
      });
    };

    /**
     * Fetch the moments meta information
     *
     * @params {uuid} - The unique identifier of the moment
     * @params {callback} - Callback to be run once we've fetched the moment
     */
    Nrtv.prototype.getMoment = function(uuid, callback) {
      this.api('/moments/'+uuid+'/', function(data) {
        callback(data);
      });
    };

    /**
     * NrtvScrubb class
     *
     */
    function nrtvScrubb(uuid, clientID, clientSecret) {
      var self = this;
      var nrtv = new Nrtv(clientID, clientSecret);
      var width = nrtvElement.width();
      self.momentPhotos = [];
      $(document).resize(function() {
        width = nrtvElement.width();
      });

      nrtv.getMoment(uuid, function(data) {
        $('.nrtv__meta', nrtvElement).html('<a href="https://getnarrative.com/shared/moment/'+data.uuid+'"><b>'+data.caption+'</b></a>');
      });

      nrtv.getPhotos(uuid, function(response) {
        var photos = [];
        $.each(response, function(key, photo) {
          photos.push(photo.renders.g1_smartphone.url);
        });

        $(nrtvElement).mousemove(function (event) {
          var procent = Math.round(event.offsetX / width * 1000) / 10;
          var photoIndex = Math.round((photos.length-1) * (procent / 100));
          self.updateScrubb(photoIndex, photos);
        });

        self.updateScrubb(0, photos);
        self.preloadPhoto(photos);
        nrtvElement.removeClass('nrtv__loading');
      });
    }

    /**
     * Preload all photos as fast as we can.
     *
     * This will decreases the flickering that happens if a photo isn't loaded
     * when tried to view.
     *
     * @params {array} Array of photos to preload
     */
    nrtvScrubb.prototype.preloadPhoto = function(photos) {
      var images = [];
      for (i = 0; i < photos.length; i++) {
        images[i] = new Image();
        images[i].src = photos[i];
      }
    };

    /**
     * Update the DOM element
     *
     * @params {Int} Index of the selected photo
     * @params {Array} Array of photos.
     */
    nrtvScrubb.prototype.updateScrubb = function(photoIndex, photos) {
      nrtvElement.css({'background-image': 'url('+photos[photoIndex]+')' });
      $('.nrtv__progress', nrtvElement).css({'width': ((photoIndex/photos.length)*100)+'%'});
    };

  }
}( jQuery ));
