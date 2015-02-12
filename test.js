var minim = require('./index');

var objectType = new minim.ObjectType()
  .set('name', 'John Doe')
  .set('email', 'john@example.com')
  .set('id', 4)

console.log(objectType.toValue());
