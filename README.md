Narrative moment widget
===

This widget lets you display a Narrative Moment on your own site.

Setup
---

First you need to register a Narrative Open Platform app.

1. Sign in to [open.getnarrative.com](http://open.getnarrative.com/) and [Create a New App](http://open.getnarrative.com/apps)
2. Add your sites domain to the Redirect URIs, this will also white list this domain in CORS.
3. Copy your apps Client ID and Client secret
4. OBS! There's currently a limit to new Open Platform apps restricting them from doing so called anonymous api calls, to enable this please email [open@getnarrative.com](mailto://open@getnarrative.com) and ask to get your app enabled.

Usage
---

Grap the UUID for the Moment you want to display, it's the last part of a shared Moment link. Looking something like this `4f0c241562a24bce86a9e24a009c845d`


Then add both the jquery plugin and the css file to your site. Lastly add the following to your html.

```javascript
var clientID = '<Your Client ID>';
var clientSecret = '<Your Client Secret>';
var momentUUID = '<The moments UUID you want to display, needs to be public>';
$('#nrtv__current-photo').nrtvScrubb(momentUUID, clientID, clientSecret);
```

And this HTML code

```html
<div id="nrtv__current-photo" class="nrtv__loading">
  <div class="nrtv__progress"></div>
  <div class="nrtv__meta"></div>
</div>
```
