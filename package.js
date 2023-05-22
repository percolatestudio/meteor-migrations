Package.describe({
  summary: 'Define and run db migrations.',
  version: '2.0.0',
  name: 'percolate:migrations',
  git: 'https://github.com/percolatestudio/meteor-migrations.git',
});

Package.onUse(function(api) {
  api.versionsFrom('2.8.0');
  api.use('ecmascript');
  api.use(['check', 'mongo', 'logging'], 'server');
  api.mainModule('migrations_server.js', 'server');
  api.export('Migrations', 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use(['percolate:migrations', 'tinytest']);
  api.addFiles('migrations_tests.js', ['server']);
});
