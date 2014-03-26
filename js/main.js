//add company news

(function() {

Parse.initialize("AEW56QYuceSwGtfv0ylqsAq5klUJfPa36mlb6gSw", "pT4UaM2bEYkkcE3Q0nQ0cMDlqZIl3OlSLbcNvIUb");

window.App = {
  Models: {},
  Collections: {},
  Views: {},
  Router: {}
}

  App.Views.Business = Parse.View.extend({
    el: '.content',

    initialize: function() {

      this.$el.html(_.template($("#business-search-template").html()));


    },

    events: {
      'click #logout': 'logOut',
      'click #search': 'render',
      'click #remove': 'remove'

    },

    render: function(e) {

      e.preventDefault();

      $('#crunchbase').html('<center><img src="images/loader.gif" alt="loading..."></center>');

      var company = $('#s').val();

      //Crunchbase API
      var requrl = "http://api.crunchbase.com/v/1/company/";
      var apikey = "h3mrfe9mfastjr6bxjnn9ezq";
      var crunchbaseUrl = requrl + company + ".js?api_key=" + apikey;

      var googlebaseUrl = "https://www.googleapis.com/customsearch/v1?";
      var googleKey = "key=AIzaSyBjcXVKPx7ayQh_jMycHTtunsARcy6AAYw&cref&q=";
      var searchTerm = "%20site%3Alinkedin.com%2Fin%2F%20OR%20site%3Alinkedin.com%2Fpub%2F%20-site%3Alinkedin.com%2Fpub%2Fdir%2F";
      var googleURL = googlebaseUrl + googleKey + company + searchTerm;

      $.ajax({
      url: crunchbaseUrl,
      dataType: 'jsonp',
      success: function(companydata) {
        var data = companydata
        var company = companydata.name;
        var employees = companydata.number_of_employees;
        var industry = companydata.category_code;
        var description = companydata.overview;
        var twitter = companydata.twitter_username;
        var thumbnail = companydata.image;
        var site = companydata.homepage_url;
        var people = companydata.relationships;

        var html = '<div class="data">\n';
        //html += '<img src="'+thumb+'" class="thumbimg">\n';
        html += '<div class="companydata"><h2>'+company+'</h2>\n';
        html += '<a href="'+site+'" class="btn btn-primary" target="_blank">Visit Website</a>\n';
        html += '<p>'+description+'</p>'
        html += '<ul>\n';
        html += '<li>Twitter: '+'<a href="https://twitter.com/'+twitter+'" target=_blank>'+twitter+'</a></li>\n'
        html += '<li>Industry: '+industry+'</li>\n'
        html += '<li>Employees: '+employees+'</li>\n'
        html += '<li>People:<ul>'
        for(var i in people){
          if(people[i].is_past === false){
            html += '<li>'+(people[i].person.first_name)+' '+(people[i].person.last_name)+' - '+(people[i].title)+'</li>';
          }
        }
        html += '</ul></li>'
        html += '</ul>\n'
        html += '</div></li>\n';

        $('#crunchbase').html(html);
        
        console.log(twitter);
        kloutData(twitter);

      }
      });

      $.ajax({
      url: googleURL,
      dataType: 'jsonp',
      success: function(searchdata) {
        var customSearchData = searchdata.items;

        var html = '<h3>Google Custom Search People</h3>'
        html += '<ul>'
        for(var i in customSearchData){
              var rawTitle = customSearchData[i].title;
              var title = rawTitle.slice(0, rawTitle.lastIndexOf(" |"));
              html += '<li>'+title+' <a href="'+customSearchData[i].link+'" target=_blank>LinkedIn Profile</a> <a href="http://www.toofr.com/" target="_blank">Guess Email</a> - '+customSearchData[i].htmlSnippet+'</li>';
            }
        html += '</ul>'

        //add searching by department here

        $('#custom-search').html(html);   

        }
      });
    },

    kloutData: function(twitter) {
      var twitterHandle = twitter;
      var kloutBase = 'http://api.klout.com/v2/';
      var kloutIdentity = 'identity.json/twitter?screenName=';
      var kloutKey = 'key=7w4pfy7e4m9qksvpvyv7hh4m';
      var kloutIdentityUrl = kloutBase+kloutIdentity+twitterHandle+'&'+kloutKey;
      $.ajax({
        url: kloutIdentityUrl,
        dataType: 'jsonp',
        success: function(kloutuser) {
          var userId = kloutuser.id;
          var kloutUserUrl = kloutBase+'user.json/'+userId+'/score?'+kloutKey;
          $.ajax({
            url: kloutUserUrl,
            dataType: 'jsonp',
            success: function(kloutscore) {
              var score = kloutscore.score;
              var html = '<h3>Klout Score:'+score+'</h3>';
            
              $('#klout').html(html);
            }
          });
        }
    });
  },

    remove: function(e) {
      new App.Views.Business();
      self.undelegateEvents();
      delete self;
    },

    logOut: function(e) {
      Parse.User.logOut();
      new App.Views.LogIn();
      this.undelegateEvents();
      delete this;
    }

  });

  App.Views.LogIn = Parse.View.extend({

    events: {
        "submit form.login-form": "logIn",
        "submit form.signup-form": "signUp",
        "click .sign-up": "showSignUp",
        "click .log-in": "showLogIn"
      },

    el: ".content",

    initialize: function() {
      _.bindAll(this, "logIn", "signUp");
      this.render();
    },

    logIn: function(e) {
      var self = this;
      var username = this.$('#login-username').val();
      var password = this.$('#login-password').val();

      Parse.User.logIn(username, password, {
        success: function(user) {
          new App.Views.Business();
          self.undelegateEvents();
          delete self;
        }, 

        error: function(user, error) {
          this.$("login-form .error").html("Invalid username or password").show();
        }
      });

      return false;

    },

    signUp: function(e) {
      var self = this;
      var username = this.$("#signup-username").val();
      var password = this.$("#signup-password").val();
      
      Parse.User.signUp(username, password, { ACL: new Parse.ACL() }, {
        success: function(user) {
          new App.Views.Business();
          self.undelegateEvents();
          //self.remove();
          delete self;
        },

        error: function(user, error) {
          self.$(".signup-form .error").html(error.message).show();
          this.$(".signup-form button").removeAttr("disabled");
        }
      });

      return false;
    },

    render: function() {
      this.$el.html(_.template($("#login-template").html()));
      this.delegateEvents();
    },

    showSignUp: function() {
      $(".signup-form").toggle("slow");
    },

    showLogIn: function() {
      $(".login-form").toggle("slow");
    }

  });

  App.Views.App = Parse.View.extend({
    el: $("#app"),

    initialize: function() {
      this.render();
    },

    render: function() {
      if (Parse.User.current()) {
        new App.Views.Business();
      } else {
        new App.Views.LogIn();
      }
    }
  });

  new App.Views.App;

})();