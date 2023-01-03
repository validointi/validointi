import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import * as rootPackage from '../../package.json';
describe('validointi', () => {
  const collectionPath = path.join(__dirname, '../collection.json');
  let appTree: Tree;
  const runner: SchematicTestRunner = new SchematicTestRunner(
    'schematics',
    collectionPath
  );
  const defaultOptions = {};

  beforeEach(async () => {
    appTree = await createTestProject(runner, 'application');
  });

  it('adds as a dependency', async () => {
    const tree = await runner.runSchematic('ng-add', defaultOptions, appTree);
    const content = tree.readContent('/package.json');
    const packageJson = JSON.parse(content);
    const dependencies = packageJson.dependencies;
    expect(dependencies['@validointi/core']).toEqual(`^${rootPackage.version}`);
  });
});

/** Create a base project used for testing. */
export async function createTestProject(
  runner: SchematicTestRunner,
  projectType: 'application' | 'library',
  appOptions = {},
  tree?: Tree
): Promise<any> {
  const workspaceTree = await runner.runExternalSchematic(
    '@schematics/angular',
    'workspace',
    {
      name: 'workspace',
      version: '15.0.0',
      newProjectRoot: 'projects',
    },
    tree
  );
  return runner.runExternalSchematic(
    '@schematics/angular',
    projectType,
    { name: 'material', ...appOptions },
    workspaceTree
  );
}
