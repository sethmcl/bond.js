# bond.js

## Usage

bond.js can be used in by browser or node.js based applications.

### node.js

Grab with npm:

```bash
npm install bond.js
```

Require in your app:

```javascript
var bond = require('bond.js');
```

### browser

```html
<script src="bond.js"></script>
```

## API

### Create a promise

```javascript
  var b = bond();
  var promise = b.promise;
```

### Add handlers

```javascript
promise.then(function (value) {
  alert(value);
}, function (error) {
  alert(error.message);
});
```

### Fulfill the promise

```javascript
b.fulfill('happy');
// alert: 'happy'
```

### Reject the promise:

```javascript
b.reject(new Error('sorry'));
// alert: 'sorry'
```


