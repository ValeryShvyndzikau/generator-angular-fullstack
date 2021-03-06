import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import Promise from 'bluebird';
import helpers from 'yeoman-test';
import assert from 'yeoman-assert';
import * as getExpectedFiles from './get-expected-files';
import {
  copyAsync,
  runCmd,
  assertOnlyFiles,
  readJSON,
  runGen
} from './test-helpers';

const defaultOptions = {
  transpiler: 'babel',
  flow: true,
  markup: 'html',
  stylesheet: 'sass',
  router: 'ngroute',
  testing: 'mocha',
  chai: 'expect',
  bootstrap: true,
  uibootstrap: true,
  odms: ['mongoose'],
  auth: true,
  oauth: [],
  ws: true
};
const TEST_DIR = __dirname;

function runEndpointGen(name, opt={}) {
  let prompts = opt.prompts || {};
  let options = opt.options || {};
  let config = opt.config;

  return new Promise((resolve, reject) => {
    let gen = helpers
      .run(require.resolve('../generators/endpoint'), {tmpdir: false})
      .withOptions(options)
      .withArguments([name])
      .withPrompts(prompts);

    if(config) {
      gen
        .withLocalConfig(config);
    }

    gen
      .on('error', reject)
      .on('end', () => resolve());
  });
}

describe('angular-fullstack:app', function() {
  describe('default settings', function() {
    var dir;

    before(function() {
      return runGen(defaultOptions).then(_dir => {
        dir = _dir;
      });
    });

    it('generates the proper files', function() {
      const expectedFiles = getExpectedFiles.app(defaultOptions);
      assert.file(expectedFiles);
      return assertOnlyFiles(expectedFiles, path.normalize(dir)).should.be.fulfilled();
    });

    it('passes lint', function() {
      return runCmd('npm run lint').should.be.fulfilled();
    });

    it('passes client tests', function() {
      return runCmd('npm run test:client').should.be.fulfilled();
    });

    it('passes server tests', function() {
      return runCmd('npm run test:server').should.be.fulfilled();
    });

    describe('with a generated endpoint', function() {
      before(function() {
        return readJSON(path.join(dir, '.yo-rc.json')).then(config => {
          return runEndpointGen('foo', {config: config['generator-angular-fullstack']});
        });
      });

      it('should run server tests successfully', function() {
        return runCmd('npm run test:server').should.be.fulfilled();
      });
    });

    describe('with a generated capitalized endpoint', function() {
      before(function() {
        return readJSON(path.join(dir, '.yo-rc.json')).then(config => {
          return runEndpointGen('Bar', {config: config['generator-angular-fullstack']});
        });
      });

      it('should run server tests successfully', function() {
        return runCmd('npm run test:server').should.be.fulfilled();
      });
    });

    describe('with a generated path name endpoint', function() {
      before(function() {
        return readJSON(path.join(dir, '.yo-rc.json')).then(config => {
          return runEndpointGen('foo/baz', {config: config['generator-angular-fullstack']});
        });
      });

      it('should run server tests successfully', function() {
        return runCmd('npm run test:server').should.be.fulfilled();
      });
    });

    describe('with a generated snake-case endpoint', function() {
      before(function() {
        return readJSON(path.join(dir, '.yo-rc.json')).then(config => {
          return runEndpointGen('foo-boo', {config: config['generator-angular-fullstack']});
        });
      });

      it('should run server tests successfully', function() {
        return runCmd('npm run test:server').should.be.fulfilled();
      });
    });

    if(!process.env.SKIP_E2E) {
      it.skip('should run e2e tests successfully', function() {
        this.retries(2);
        return runCmd('npm run test:e2e').should.be.fulfilled();
      });

      it.skip('should run e2e tests successfully for production app', function() {
        this.retries(2);
        return runCmd('npm run test:e2e:prod').should.be.fulfilled();
      });
    }
  });

  describe('default settings using existing `.yo-rc.json`', function() {
    var dir;
    var lintResult;
    var clientTestResult;
    var serverTestResult;

    before(function() {
      return runGen(null, {
        copyConfigFile: true,
        options: {
          skipInstall: true,
          skipConfig: true
        }
      }).then(_dir => {
        dir = _dir;
        lintResult = runCmd('npm run lint');
        clientTestResult = runCmd('npm run test:client');
      });
    });

    it('generates the proper files', function() {
      const expectedFiles = getExpectedFiles.app(defaultOptions);
      assert.file(expectedFiles);
      return assertOnlyFiles(expectedFiles, path.normalize(dir)).should.be.fulfilled();
    });

    it('passes lint', function() {
      return lintResult.should.be.fulfilled();
    });

    it('passes client tests', function() {
      return clientTestResult.should.be.fulfilled();
    });

    it('passes server tests', function() {
      serverTestResult = runCmd('npm run test:server');
      return serverTestResult.should.be.fulfilled();
    });
  });

  describe('with TypeScript, Pug, Jasmine, LESS, & OAuth', function() {
    var dir;
    var lintResult;
    var clientTestResult;
    var serverTestResult;
    var testOptions = {
      transpiler: 'ts',
      markup: 'html',
      stylesheet: 'less',
      router: 'ngroute',
      testing: 'jasmine',
      odms: ['mongoose'],
      auth: true,
      oauth: ['twitterAuth', 'facebookAuth', 'googleAuth'],
      ws: true,
      bootstrap: true,
      uibootstrap: true
    };

    before(function() {
      return runGen(testOptions).then(_dir => {
        dir = _dir;
        lintResult = runCmd('npm run lint');
        clientTestResult = runCmd('npm run test:client');
      });
    });

    it('should generate the proper files', function() {
      const expectedFiles = getExpectedFiles.app(testOptions);
      assert.file(expectedFiles);
      return assertOnlyFiles(expectedFiles, path.normalize(dir)).should.be.fulfilled();
    });

    it('passes lint', function() {
      return lintResult.should.be.fulfilled();
    });

    it('should run client tests successfully', function() {
      return clientTestResult.should.be.fulfilled();
    });

    it('should run server tests successfully', function() {
      serverTestResult = runCmd('npm run test:server');
      return serverTestResult.should.be.fulfilled();
    });

    describe('with a generated endpoint', function() {
      before(function() {
        return readJSON(path.join(dir, '.yo-rc.json')).then(config => {
          return runEndpointGen('foo', {config: config['generator-angular-fullstack']});
        });
      });

      it('should run server tests successfully', function() {
        return runCmd('npm run test:server').should.be.fulfilled();
      });
    });

    if(!process.env.SKIP_E2E) {
      it.skip('should run e2e tests successfully', function() {
        this.retries(2);
        return runCmd('npm run test:e2e').should.be.fulfilled();
      });

      it.skip('should run e2e tests successfully for production app', function() {
        this.retries(2);
        return runCmd('npm run test:e2e:prod').should.be.fulfilled();
      });
    }
  });

  describe('with sequelize models, auth', function() {
    var dir;
    var lintResult;
    var clientTestResult;
    var serverTestResult;
    var testOptions = {
      transpiler: 'babel',
      flow: true,
      markup: 'pug',
      stylesheet: 'css',
      router: 'ngroute',
      testing: 'jasmine',
      odms: ['sequelize'],
      auth: true,
      oauth: ['twitterAuth', 'facebookAuth', 'googleAuth'],
      ws: true,
      bootstrap: true,
      uibootstrap: true
    };
    this.retries(3);  // Sequelize seems to be quite flaky

    before(function() {
      return runGen(testOptions).then(_dir => {
        dir = _dir;
        lintResult = runCmd('npm run lint');
        clientTestResult = runCmd('npm run test:client');
      });
    });

    it('should generate the proper files', function() {
      const expectedFiles = getExpectedFiles.app(testOptions);
      assert.file(expectedFiles);
      return assertOnlyFiles(expectedFiles, path.normalize(dir)).should.be.fulfilled();
    });

    it('passes lint', function() {
      return lintResult.should.be.fulfilled();
    });

    it('should run client tests successfully', function() {
      return clientTestResult.should.be.fulfilled();
    });

    it.skip('should run server tests successfully', function() {
      return runCmd('npm run test:server').should.be.fulfilled();
    });

    describe.skip('with a generated endpoint', function() {
      before(function() {
        return readJSON(path.join(dir, '.yo-rc.json')).then(config => {
          return runEndpointGen('foo', {config: config['generator-angular-fullstack']});
        });
      });

      it('should run server tests successfully', function() {
        return runCmd('npm run test:server').should.be.fulfilled();
      });
    });

    if(!process.env.SKIP_E2E) {
      it.skip('should run e2e tests successfully', function() {
        this.retries(2);
        return runCmd('npm run test:e2e').should.be.fulfilled();
      });

      it.skip('should run e2e tests successfully for production app', function() {
        this.retries(2);
        return runCmd('npm run test:e2e:prod').should.be.fulfilled();
      });
    }
  });

  describe('with TypeScript, Mocha + Chai (should) and no server options', function() {
    var dir;
    var lintResult;
    var clientTestResult;
    var serverTestResult;
    var testOptions = {
      transpiler: 'ts',
      markup: 'pug',
      stylesheet: 'stylus',
      router: 'ngroute',
      testing: 'mocha',
      chai: 'should',
      odms: [],
      auth: false,
      oauth: [],
      ws: false,
      bootstrap: false,
      uibootstrap: false
    };

    before(function() {
      return runGen(testOptions, {options: {devPort: '9005'}}).then(_dir => {
        dir = _dir;
        lintResult = runCmd('npm run lint');
        clientTestResult = runCmd('npm run test:client');
      });
    });

    it('should generate the proper files', function() {
      const expectedFiles = getExpectedFiles.app(testOptions);
      assert.file(expectedFiles);
      return assertOnlyFiles(expectedFiles, path.normalize(dir)).should.be.fulfilled();
    });

    it('passes lint', function() {
      return lintResult.should.be.fulfilled();
    });

    it('should run client tests successfully', function() {
      return clientTestResult.should.be.fulfilled();
    });

    it('should run server tests successfully', function() {
      serverTestResult = runCmd('npm run test:server');
      return serverTestResult.should.be.fulfilled();
    });

    describe('with a generated endpoint', function() {
      before(function() {
        return readJSON(path.join(dir, '.yo-rc.json')).then(config => {
          return runEndpointGen('foo', {config: config['generator-angular-fullstack']});
        });
      });

      it('should run server tests successfully', function() {
        return runCmd('npm run test:server').should.be.fulfilled();
      });
    });

    if(!process.env.SKIP_E2E) {
      it.skip('should run e2e tests successfully', function() {
        this.retries(2);
        return runCmd('npm run test:e2e').should.be.fulfilled();
      });

      it.skip('should run e2e tests successfully for production app', function() {
        this.retries(2);
        return runCmd('npm run test:e2e:prod').should.be.fulfilled();
      });
    }
  });
});
