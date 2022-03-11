# Simple instagram media grabber

Made to quickly download all "saved" media in an instagram account.

Version 0.0.1 is a mess, but it works. To use it:

1. Log in to instagram in a browser.
2. Open browser console and go _Network_ tab.
3. Open any API request and go to _Request Headers_.
4. Copy _cookie_, _x-ig-app-id_ and _x-ig-www-claim_ header values to _.env_ file in this project. Use _.env.example_ as a reference.
5. Type `npm start` in console to run the project.
6. Media will be saved to the _downloads_ directory in this project.
