Package.describe({
  summary: "Allows you to define and run db migrations.",
  name: 'percolatestudio:migrations',
  version: '0.7.0',
  git: "https://github.com/percolatestudio/meteor-migrations.git",
  homepage: "https://github.com/percolatestudio/meteor-migrations.git",
  author: "Zoltan Olah (http://percolatestudio.com)"
});

Package.onUse(function (api) {
  api.use(['standard-app-packages', 'underscore'], 'server');
  
  api.addFiles(['migrations_server.js'], "server");
  
  api.export('Migrations', 'server');
});

Package.onTest(function (api) {
  api.use(['percolatestudio-migrations', 'tinytest']);
  api.addFiles('migrations_tests.js', 'server');
});