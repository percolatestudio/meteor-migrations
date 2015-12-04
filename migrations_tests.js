Tinytest.add('Migrates up once and only once.', function(test) {
  var run = []; //keeps track of migrations in here
  Migrations._reset();

  // first one
  Migrations.add({up: function () {run.push('u1');}, version: 1});

  // migrates once
  Migrations.migrateTo('latest');
  test.equal(run, ['u1']);
  test.equal(Migrations.getVersion(), 1);

  // shouldn't do anything
  Migrations.migrateTo('latest');
  test.equal(run, ['u1']);
  test.equal(Migrations.getVersion(), 1);
});

Tinytest.add('Migrates up once and back down.', function(test) {
  var run = []; //keeps track of migrations in here
  Migrations._reset();

  // first one
  Migrations.add({
    up: function () {run.push('u1');},
    down: function () {run.push('d1');},
    version: 1
  });

  Migrations.migrateTo('latest');
  test.equal(run, ['u1']);
  test.equal(Migrations.getVersion(), 1);

  // shouldn't do anything
  Migrations.migrateTo('0');
  test.equal(run, ['u1', 'd1']);
  test.equal(Migrations.getVersion(), 0);
});

Tinytest.add('Migrates up several times.', function(test) {
  var run = []; //keeps track of migrations in here
  Migrations._reset();

  // first one
  Migrations.add({up: function () {run.push('u1');}, version: 1});

  // migrates once
  Migrations.migrateTo('latest');
  test.equal(run, ['u1']);
  test.equal(Migrations.getVersion(), 1);

  // add two more, out of order
  Migrations.add({up: function () {run.push('u4');}, version: 4});
  Migrations.add({up: function () {run.push('u3');}, version: 3});

  // should run the next two nicely in order
  Migrations.migrateTo('latest');
  test.equal(run, ['u1', 'u3', 'u4']);
  test.equal(Migrations.getVersion(), 4);
});

Tinytest.add('Migrates up several times with multiple Migrations of same version.', function(test) {
  var run = []; //keeps track of migrations in here
  Migrations._reset();

  // first one
  Migrations.add({up: function () {run.push('u1-2');}, version: 1});
  Migrations.add({up: function () {run.push('u1-1');}, version: 1});

  // migrates once
  Migrations.migrateTo('latest');
  test.equal(run, ['u1-2','u1-1']);
  test.equal(Migrations.getVersion(), 1);

  // add two more, out of order
  Migrations.add({up: function () {run.push('u4-1');}, version: 4});
  Migrations.add({up: function () {run.push('u4-2');}, version: 4});

  Migrations.add({up: function () {run.push('u3-2');}, version: 3});
  Migrations.add({up: function () {run.push('u3-1');}, version: 3});

  // should run the next two nicely in order
  Migrations.migrateTo('latest');
  test.equal(run, ['u1-2', 'u1-1', 'u3-2', 'u3-1', 'u4-1', 'u4-2']);

  test.equal(Migrations.getVersion(), 4);
});

Tinytest.add('Tests migrating down', function(test) {
  var run = []; //keeps track of migrations in here
  Migrations._reset();

  // add the migrations
  Migrations.add({up: function () {run.push('u1');}, version: 1});
  Migrations.add({up: function () {run.push('u2');}, version: 2});
  Migrations.add({
    up: function () {run.push('u3');},
    down: function () {run.push('d3');},
    version: 3,
    name: 'Down Migration' //give it a name, just for shits
  });

  // migrates up
  Migrations.migrateTo('latest');
  test.equal(run, ['u1', 'u2', 'u3']);
  test.equal(Migrations.getVersion(), 3);

  // migrates down
  Migrations.migrateTo('2');
  test.equal(run, ['u1', 'u2', 'u3', 'd3']);
  test.equal(Migrations.getVersion(), 2);

  // should throw as migration u2 has no down method and remain at the save ver
  test.throws(function() {
    Migrations.migrateTo('1');
  }, /Cannot migrate/);
  test.equal(run, ['u1', 'u2', 'u3', 'd3']);
  test.equal(Migrations.getVersion(), 2);
});

Tinytest.add('Tests migrating down with multiple Migrations of same version.', function(test) {
  var run = []; //keeps track of migrations in here
  Migrations._reset();

  // add the migrations
  Migrations.add({up: function () {run.push('u1');}, version: 1});
  Migrations.add({up: function () {run.push('u2');}, version: 2});
  Migrations.add({
    up: function () {run.push('u3-1');},
    down: function () {run.push('d3-1');},
    version: 3,
    name: 'Down Migration - 1' //give it a name, just for shits
  });
  Migrations.add({
    up: function () {run.push('u3-2');},
    down: function () {run.push('d3-2');},
    version: 3,
    name: 'Down Migration - 2' //give it a name, just for shits
  });

  // migrates up
  Migrations.migrateTo('latest');
  test.equal(run, ['u1', 'u2', 'u3-1', 'u3-2']);
  test.equal(Migrations.getVersion(), 3);

  // migrates down
  Migrations.migrateTo('2');
  test.equal(run, ['u1', 'u2', 'u3-1', 'u3-2', 'd3-2', 'd3-1']);
  test.equal(Migrations.getVersion(), 2);

  // should throw as migration u2 has no down method and remain at the save ver
  test.throws(function() {
    Migrations.migrateTo('1');
  }, /Cannot migrate/);
  test.equal(run, ['u1', 'u2', 'u3-1', 'u3-2', 'd3-2', 'd3-1']);
  test.equal(Migrations.getVersion(), 2);
});

Tinytest.add('Tests migrating down to version 0', function(test) {
  var run = []; //keeps track of migrations in here
  Migrations._reset();

  test.equal(Migrations.getVersion(), 0);
  
  Migrations.add({
    up: function () {run.push('u1');},
    down: function () {run.push('d1');},
    version: 1
  });

  // migrates up
  Migrations.migrateTo('latest');
  test.equal(run, ['u1']);
  test.equal(Migrations.getVersion(), 1);

  // migrates down
  Migrations.migrateTo(0);
  test.equal(run, ['u1', 'd1']);
  test.equal(Migrations.getVersion(), 0);
});

Tinytest.add('Checks that locking works correctly', function(test) {
  var run = []; //keeps track of migrations in here
  Migrations._reset();

  // add the migrations
  Migrations.add({version: 1, up: function () {
    run.push('u1');

    // attempts a migration from within the migration, this should have no
    // effect due to locking
    Migrations.migrateTo('latest');
  }});

  // migrates up, should only migrate once
  Migrations.migrateTo('latest');
  test.equal(run, ['u1']);
  test.equal(Migrations.getVersion(), 1);
});

Tinytest.add('Does nothing for no migrations.', function(test) {
  Migrations._reset();

  // shouldnt do anything
  Migrations.migrateTo('latest');
  test.equal(Migrations.getVersion(), 0);
});

Tinytest.add('Checks that rerun works correctly', function(test) {
  var run = []; //keeps track of migrations in here
  Migrations._reset();

  // add the migrations
  Migrations.add({version: 1, up: function () {
    run.push('u1');
  }});

  Migrations.migrateTo('latest');
  test.equal(run, ['u1']);
  test.equal(Migrations.getVersion(), 1);

  // shouldn't migrate
  Migrations.migrateTo(1);
  test.equal(run, ['u1']);
  test.equal(Migrations.getVersion(), 1);

  // should migrate again
  Migrations.migrateTo('1,rerun');
  test.equal(run, ['u1', 'u1']);
  test.equal(Migrations.getVersion(), 1);
});

Tinytest.add('Migration callbacks include the migration as an argument', function(test) {
  var contextArg;
  Migrations._reset();

  // add the migrations
  var migration = {
    version: 1,
    up: function(m) { contextArg = m; }
  };
  Migrations.add(migration);

  Migrations.migrateTo(1);
  test.equal(contextArg === migration, true);
});

Tinytest.addAsync('Migrations can log to injected logger', function(test, done) {
  Migrations._reset();

  // Ensure this logging code only runs once. More than once and we get
  // Tinytest errors that the test "returned multiple times", or "Trace: event
  // after complete!". Give me a ping, Vasili. One ping only, please.
  var calledDone = false;
  Migrations.options.logger = function() {
    if (!calledDone) {
      calledDone = true;
      test.isTrue(true);
      done();
    }
  };

  Migrations.add({ version: 1, up: function() { } });
  Migrations.migrateTo(1);

  Migrations.options.logger = null;
});

Tinytest.addAsync('Migrations should pass correct arguments to logger', function(test, done) {
  Migrations._reset();

  // Ensure this logging code only runs once. More than once and we get
  // Tinytest errors that the test "returned multiple times", or "Trace: event
  // after complete!". Give me a ping, Vasili. One ping only, please.
  var calledDone = false;
  var logger = function(opts) {
    if (!calledDone) {
      calledDone = true;
      test.include(opts, 'level');
      test.include(opts, 'message');
      test.include(opts, 'tag');
      test.equal(opts.tag, 'Migrations');
      done();
    }
  };

  Migrations.options.logger = logger;

  Migrations.add({ version: 1, up: function() { } });
  Migrations.migrateTo(1);

  Migrations.options.logger = null;
});
