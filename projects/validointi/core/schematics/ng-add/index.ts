import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addPackageToPackageJson } from '../utils';

/**
 * Add @validointi/core to package.json
 * @returns tree
 */
export function ngAdd(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    addPackageToPackageJson(tree, '@validointi/core', '^1.1.0');
    context.addTask(new NodePackageInstallTask());
    context.logger.info(`@validointi/core is installed`);
    return tree;
  };
}
