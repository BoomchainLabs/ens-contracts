import { expect } from 'chai';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Package.json Validation', () => {
  let packageJson: any;
  const packagePath = join(process.cwd(), 'package.json');

  before(() => {
    expect(existsSync(packagePath), 'package.json should exist').to.be.true;
    const rawData = readFileSync(packagePath, 'utf8');
    packageJson = JSON.parse(rawData);
  });

  describe('Basic Package Information', () => {
    it('should have required basic fields', () => {
      expect(packageJson).to.have.property('name');
      expect(packageJson).to.have.property('version');
      expect(packageJson).to.have.property('description');
      expect(packageJson).to.have.property('main');
      expect(packageJson).to.have.property('license');
    });

    it('should have correct package name format', () => {
      expect(packageJson.name).to.equal('@ensdomains/ens-contracts');
      expect(packageJson.name).to.match(/^@[a-z0-9-~][a-z0-9-._~]*\/[a-z0-9-~][a-z0-9-._~]*$/);
    });

    it('should have valid semantic version', () => {
      expect(packageJson.version).to.match(/^\d+\.\d+\.\d+$/);
      expect(packageJson.version).to.equal('1.5.2');
    });

    it('should have meaningful description', () => {
      expect(packageJson.description).to.be.a('string');
      expect(packageJson.description.length).to.be.greaterThan(0);
      expect(packageJson.description).to.equal('ENS contracts');
    });

    it('should use ES modules', () => {
      expect(packageJson.type).to.equal('module');
    });

    it('should have MIT license', () => {
      expect(packageJson.license).to.equal('MIT');
    });

    it('should have correct main entry point', () => {
      expect(packageJson.main).to.equal('index.js');
    });
  });

  describe('Scripts Validation', () => {
    const requiredScripts = ['compile', 'test', 'build', 'format'];
    
    it('should have scripts object', () => {
      expect(packageJson.scripts).to.be.an('object');
    });

    it('should have required scripts', () => {
      requiredScripts.forEach(script => {
        expect(packageJson.scripts).to.have.property(script);
      });
    });

    it('should have hardhat helper script', () => {
      expect(packageJson.scripts.hh).to.include('hardhat');
      expect(packageJson.scripts.hh).to.include('NODE_OPTIONS');
      expect(packageJson.scripts.hh).to.include('ts-node/esm/transpile-only');
    });

    it('should have test scripts with proper configurations', () => {
      expect(packageJson.scripts.test).to.equal('bun run hh test');
      expect(packageJson.scripts['test:remote']).to.include('FORKING_ENABLED=1');
      expect(packageJson.scripts['test:parallel']).to.include('--parallel');
      expect(packageJson.scripts['test:local']).to.include('--network localhost');
    });

    it('should have build script that cleans and compiles', () => {
      expect(packageJson.scripts.build).to.include('rm -rf');
      expect(packageJson.scripts.build).to.include('hardhat compile');
      expect(packageJson.scripts.build).to.include('tsc');
    });

    it('should have publish preparation script', () => {
      expect(packageJson.scripts.prepublishOnly).to.equal('bun run build');
    });

    it('should use bun as task runner', () => {
      const bunScripts = Object.values(packageJson.scripts).filter((script: any) => 
        script.includes('bun')
      );
      expect(bunScripts.length).to.be.greaterThan(5);
    });
  });

  describe('Dependencies Validation', () => {
    it('should have dependencies object', () => {
      expect(packageJson.dependencies).to.be.an('object');
    });

    it('should have devDependencies object', () => {
      expect(packageJson.devDependencies).to.be.an('object');
    });

    it('should have ENS-specific dependencies', () => {
      expect(packageJson.dependencies).to.have.property('@ensdomains/buffer');
      expect(packageJson.dependencies).to.have.property('@ensdomains/solsha1');
    });

    it('should have OpenZeppelin contracts', () => {
      expect(packageJson.dependencies).to.have.property('@openzeppelin/contracts');
      expect(packageJson.dependencies).to.have.property('@openzeppelin/contracts-v5');
    });

    it('should have hardhat and related tooling in devDependencies', () => {
      expect(packageJson.devDependencies).to.have.property('hardhat');
      expect(packageJson.devDependencies).to.have.property('@nomicfoundation/hardhat-toolbox-viem');
      expect(packageJson.devDependencies).to.have.property('hardhat-deploy');
    });

    it('should have testing frameworks', () => {
      expect(packageJson.devDependencies).to.have.property('chai');
      expect(packageJson.devDependencies).to.have.property('@types/mocha');
      expect(packageJson.devDependencies).to.have.property('@vitest/expect');
    });

    it('should have TypeScript support', () => {
      expect(packageJson.devDependencies).to.have.property('typescript');
      expect(packageJson.devDependencies).to.have.property('ts-node');
      expect(packageJson.devDependencies).to.have.property('@types/node');
    });

    it('should have viem for Ethereum interactions', () => {
      expect(packageJson.devDependencies).to.have.property('viem');
      expect(packageJson.devDependencies.viem).to.equal('2.12.0');
    });

    it('should have valid version formats', () => {
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      Object.entries(allDeps).forEach(([name, version]: [string, any]) => {
        // Skip git dependencies and npm aliases
        if (typeof version === 'string' && !version.includes('github.com') && !version.includes('npm:') && !version.includes('#')) {
          expect(version).to.match(/^[\^~]?\d+\.\d+\.\d+/, `${name} should have valid version format`);
        }
      });
    });

    it('should handle git dependencies correctly', () => {
      const gitDep = packageJson.dependencies['clones-with-immutable-args'];
      expect(gitDep).to.include('Arachnid/clones-with-immutable-args#feature/create2');
    });

    it('should handle npm aliases correctly', () => {
      const alias = packageJson.dependencies['@openzeppelin/contracts-v5'];
      expect(alias).to.include('npm:@openzeppelin/contracts@5.1.0');
    });
  });

  describe('File and Directory Configuration', () => {
    it('should have files array for npm publishing', () => {
      expect(packageJson.files).to.be.an('array');
      expect(packageJson.files).to.include('build');
      expect(packageJson.files).to.include('contracts/**/*.sol');
      expect(packageJson.files).to.include('artifacts');
      expect(packageJson.files).to.include('deployments');
    });

    it('should specify test directory', () => {
      expect(packageJson.directories).to.have.property('test');
      expect(packageJson.directories.test).to.equal('test');
    });
  });

  describe('Repository and Metadata', () => {
    it('should have repository configuration', () => {
      expect(packageJson.repository).to.be.an('object');
      expect(packageJson.repository.type).to.equal('git');
      expect(packageJson.repository.url).to.equal('git+https://github.com/ensdomains/ens-contracts.git');
    });

    it('should have bugs URL', () => {
      expect(packageJson.bugs).to.have.property('url');
      expect(packageJson.bugs.url).to.equal('https://github.com/ensdomains/ens-contracts/issues');
    });

    it('should have homepage', () => {
      expect(packageJson.homepage).to.equal('https://github.com/ensdomains/ens-contracts#readme');
    });

    it('should have author field (even if empty)', () => {
      expect(packageJson).to.have.property('author');
    });
  });

  describe('Patches Configuration', () => {
    it('should have patchedDependencies for known issues', () => {
      expect(packageJson.patchedDependencies).to.be.an('object');
    });

    it('should patch hardhat-deploy', () => {
      expect(packageJson.patchedDependencies).to.have.property('hardhat-deploy@0.12.4');
      expect(packageJson.patchedDependencies['hardhat-deploy@0.12.4']).to.equal('patches/hardhat-deploy@0.12.4.patch');
    });

    it('should patch hardhat-viem', () => {
      const vimPatch = '@nomicfoundation/hardhat-viem@2.0.6';
      const encodedKey = '@nomicfoundation%2Fhardhat-viem@2.0.6';
      expect(packageJson.patchedDependencies).to.have.property(encodedKey);
      expect(packageJson.patchedDependencies[encodedKey]).to.equal('patches/@nomicfoundation%2Fhardhat-viem@2.0.6.patch');
    });
  });

  describe('Script Command Validation', () => {
    it('should have valid node options in hardhat helper', () => {
      const hhScript = packageJson.scripts.hh;
      expect(hhScript).to.include("NODE_OPTIONS='--experimental-loader ts-node/esm/transpile-only'");
    });

    it('should use environment variables correctly', () => {
      expect(packageJson.scripts['test:remote']).to.include('FORKING_ENABLED=1');
    });

    it('should have proper file patterns in test scripts', () => {
      expect(packageJson.scripts['test:remote']).to.include('./test/**/Test*.remote.ts');
      expect(packageJson.scripts['test:parallel']).to.include('./test/**/Test*.ts');
    });

    it('should have deployment scripts', () => {
      expect(packageJson.scripts).to.have.property('test:deploy');
      expect(packageJson.scripts).to.have.property('l2:deploy');
      expect(packageJson.scripts['l2:deploy']).to.include('--tags l2');
    });
  });

  describe('Package Integrity', () => {
    it('should have consistent ENS branding', () => {
      expect(packageJson.name).to.include('ensdomains');
      expect(packageJson.repository.url).to.include('ensdomains');
      expect(packageJson.bugs.url).to.include('ensdomains');
    });

    it('should have appropriate package size (not too many dependencies)', () => {
      const totalDeps = Object.keys(packageJson.dependencies).length + 
                       Object.keys(packageJson.devDependencies).length;
      expect(totalDeps).to.be.lessThan(50); // Reasonable limit
    });

    it('should not have security vulnerabilities in common packages', () => {
      // Check for known secure versions of critical packages
      if (packageJson.dependencies.ethers) {
        expect(packageJson.devDependencies.ethers).to.match(/^6\./);
      }
    });
  });

  describe('JSON Structure Validation', () => {
    it('should be valid JSON', () => {
      expect(() => JSON.parse(readFileSync(packagePath, 'utf8'))).to.not.throw();
    });

    it('should not have trailing commas', () => {
      const content = readFileSync(packagePath, 'utf8');
      expect(content).to.not.match(/,\s*[}\]]/);
    });

    it('should have proper indentation', () => {
      const content = readFileSync(packagePath, 'utf8');
      const lines = content.split('\n');
      // Most lines should start with even number of spaces (2-space indentation)
      const indentedLines = lines.filter(line => line.trim() && line.startsWith(' '));
      const properlyIndented = indentedLines.filter(line => 
        line.match(/^  /) || line.match(/^    /) || line.match(/^      /)
      );
      expect(properlyIndented.length / indentedLines.length).to.be.greaterThan(0.8);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing optional fields gracefully', () => {
      // Test that optional fields can be missing without breaking functionality
      const optionalFields = ['keywords', 'homepage', 'author'];
      optionalFields.forEach(field => {
        expect(packageJson[field] === undefined || packageJson[field]).to.satisfy(
          (value: any) => value === undefined || typeof value === 'string' || Array.isArray(value)
        );
      });
    });

    it('should have no empty required arrays', () => {
      expect(packageJson.files).to.have.length.greaterThan(0);
    });

    it('should have no empty required objects', () => {
      expect(Object.keys(packageJson.scripts)).to.have.length.greaterThan(0);
      expect(Object.keys(packageJson.dependencies)).to.have.length.greaterThan(0);
      expect(Object.keys(packageJson.devDependencies)).to.have.length.greaterThan(0);
    });
  });
});