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

> ___Pro Tip:___ When you use vest, you can use the `createVestAdapter(suite)` function to create a validation function that can be used with this library.
> ```ts
>   validate = this.#vr.registerValidator('sample-data', createVestAdapter(suite));
> ```
> will make sure the vest results are formatted correctly for this library.



The only restriction is that the function must return a Promise<[ValidationErrors](https://github.com/validointi/validointi/blob/03249cb8d516bf88a638e30fba12a7d2783eb37c/projects/validointi/core/src/lib/validator.types.ts#L10-L12)>.


After that you can use the directive in your template like this:

```html
  <form
    validationId="sample-data"
    (ngSubmit)="mySubmitFunction($any(data))"
    #form="ngForm"
  >
    <label for="name">
      <span>Name</span>
      <input type="text" name="name" placeholder="Your name" [(ngModel)]="data.name">
    </label>
    <input type="submit" value="Submit" [disabled]="form.invalid" />
  </form>
```

From this point the form will be validated on `formControl.valueChanges` and errors coming from the function will be set on the corresponding formControl.
