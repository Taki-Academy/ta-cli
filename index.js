#!/usr/bin/env node
const program = require('commander');
const execSync = require('child_process').execSync;
const fs = require('fs');
const format = require("string-template");
const capitalize = require("capitalize");
const path = require('path');


program
  .version('0.0.1')
  .option('-M, --app_module [name]', 'Generate Fooll module [name]')
  .option('-m, --model [name]', 'Generate sequelize model [name]')
  .option('-a, --attributes [attributes]', 'Generate sequelize model [attributes]')
  .option('-t, --to [moduleName]', 'Generate sequelize model [attributes]')
  .parse(process.argv);

if (program.app_module) {
  var moduleName = program.app_module;
  console.log('Generating app module:', moduleName);
  if (!fs.existsSync('app_modules')) {
    execSync('mkdir app_modules/');
  }
  var modulePath = 'app_modules/' + moduleName + '/';
  if (!fs.existsSync(modulePath)) {
    execSync('mkdir ' + modulePath);
  } else {
    console.error('Error: Module %s already exists', moduleName);
  }
  var moduleComponents = [
    'client/',
    'client/js',
    'client/img',
    'client/css',
    'views/',
    'models/',
    'index.js',
    'specs.md',
    'test.js'
  ];
  moduleComponents.forEach(component => {
    var componentPath = modulePath + component;
    var command = /\w+\.\w+/g.test(component) ? 'touch' : 'mkdir';
    var template = getTemplate(component);
    if (template) {
      var templateData = {
        name: capitalize(moduleName)
      }
      var content = format(template, templateData);
      fs.writeFileSync(componentPath, content, 'utf-8');
    } else {
      execSync(command + ' ' + componentPath);
    }
  });
  console.log('Module %s generated', moduleName);
}

if (program.model && program.attributes && program.to) {
  var modelPath = 'app_modules/' + program.to + '/models';
  execSync(
    'sequelize model:create --name ' + program.model +
    ' --attributes ' + program.attributes +
    ' --models-path ' + modelPath
  );
  console.log('Model created successfully!');
}

function getTemplate(component) {
  var templatePath = path.resolve(__dirname, 'templates', component);
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf-8');
  } else {
    return null;
  }
}