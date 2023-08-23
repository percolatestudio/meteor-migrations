import { Migrations } from "meteor/percolate:migrations";

Migrations.add({
  version: 1,
  name: 'its a test',
  up: function() {console.log('Inside migrations');}
});

Meteor.startup(function () {
  // code to run on server at startup
  Migrations.migrateTo('latest');
});
