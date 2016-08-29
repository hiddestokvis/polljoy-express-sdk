# Polljoy express SDK

Add this to your express.js back-end to register polljoy polls. This replaces the ```connect.php``` file currently provided by Polljoy self. **This package was written for node v6+, it uses ES6 classes.**

## Install

Install with npm:

```npm install polljoy-express-sdk --save```

Make sure to use the express-session middleware:

```npm install express-session --save```

```const session = require('express-session');```

```javascript
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
```

include the connector in your app:

```const Polljoy = require('polljoy-express-sdk');```

```javascript
Polljoy('*** INSERT APP ID ***').createEndpoints(app, '/polljoy');
```

This will initialize the /polljoy [POST] endpoint. Follow the regular polljoy instruction and replace the connect.php endpoint with the url of your newly created /polljoy endpoint

## Extra appIds

If you want to use multiple separate polls on your website (or in your app) you'll need to create multiple apps in Polljoy. Store your appIds in your environment variables separated by a comma like so:

```polls='appid1,appid2' node ...your app...```

And point your javascript sdk to your url followed by the number of the appId, so for appid1 i would point it at:

```http://mybackend.com/polljoy/0```


## Contribute

This package is more or less an exact translation of the connect.php provided by Polljoy. No unit testing is yet introduced. If you would like to contribute to this package, please fork this repository and submit your changes as a pull request. Stars are awarded to contributers who add (mocha) unit testing :) Please respect the linting rules set.

## License

Copyright (c) 2016 Hidde Stokvis

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
