<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

# Validointi

![logo](assets/logo.ico)

## We finsish the validation debate

# @validointi/core

This is a library to help you validate your template driven forms.

## Installation

To install this library, run:

```bash
$ npm install @validointi/core --save
```

## Using it in your project.

You can use this library by importing the directives and services in the components you want to use them in.

First you register your validation function to the service like this:

```ts
#vr = inject(ValidatorRegistryService);

validate = this.#vr.registerValidator('sample-data', validateSampleData);
```

a validation function can look like this:

```ts
async function validateSampleData(data: SampleData, field?: string): Promise<ValidationErrors> {
  /**
   * In here we use Vest to validate the data.
   * However, you can validate the data however you want.
   */
  const errors = await suite(data, field).getErrors();
  return Object.entries(errors).reduce((acc, [key, err]) => {
    acc[key] = err;
    return acc;
  }, {} as ValidationErrors);
}
```

> **_Pro Tip:_** When you use vest, you can use the `createVestAdapter(suite)` function to create a validation function that can be used with this library.
>
> ```ts
> validate = this.#vr.registerValidator('sample-data', createVestAdapter(suite));
> ```
>
> will make sure the vest results are formatted correctly for this library.

The only restriction is that the function must return a Promise<[ValidationErrors](https://github.com/validointi/validointi/blob/03249cb8d516bf88a638e30fba12a7d2783eb37c/projects/validointi/core/src/lib/validator.types.ts#L10-L12)>.

After that you can use the directive in your template like this:

```html
<form validationId="sample-data" (ngSubmit)="mySubmitFunction($any(data))" #form="ngForm">
  <label for="name">
    <span>Name</span>
    <input type="text" name="name" placeholder="Your name" [(ngModel)]="data.name" />
  </label>
  <input type="submit" value="Submit" [disabled]="form.invalid" />
</form>
```

From this point the form will be validated on `formControl.valueChanges` and errors coming from the function will be set on the corresponding formControl.

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://jefiozie.github.io/"><img src="https://avatars.githubusercontent.com/u/17835373?v=4?s=100" width="100px;" alt="Jeffrey Bosch"/><br /><sub><b>Jeffrey Bosch</b></sub></a><br /><a href="https://github.com/validointi/validointi/commits?author=Jefiozie" title="Code">💻</a> <a href="https://github.com/validointi/validointi/commits?author=Jefiozie" title="Documentation">📖</a> <a href="#example-Jefiozie" title="Examples">💡</a> <a href="#tool-Jefiozie" title="Tools">🔧</a> <a href="#maintenance-Jefiozie" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/SanderElias"><img src="https://avatars.githubusercontent.com/u/1249083?v=4?s=100" width="100px;" alt="Sander Elias"/><br /><sub><b>Sander Elias</b></sub></a><br /><a href="https://github.com/validointi/validointi/commits?author=SanderElias" title="Code">💻</a> <a href="https://github.com/validointi/validointi/commits?author=SanderElias" title="Documentation">📖</a> <a href="#example-SanderElias" title="Examples">💡</a> <a href="#maintenance-SanderElias" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/apps/github-actions"><img src="https://avatars.githubusercontent.com/in/15368?v=4?s=100" width="100px;" alt="github-actions[bot]"/><br /><sub><b>github-actions[bot]</b></sub></a><br /><a href="https://github.com/validointi/validointi/commits?author=github-actions[bot]" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
