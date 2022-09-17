---
sidebar_position: 1
---

# Getting started

Before we dive deep into the libary, we are having a "really" simple example of tempalte forms. This so that you have a base to work with.

## Quick intro into template forms

:::tip

We expect that you have created and workerd with an Angular application before. If you don't have any experience we would recommend you to go to the following link and dive through the [Tour of Heroes](https://angular.io/tutorial).

:::

We start out with the creation a new component where we are going to implement our form.

```shell
npx ng generate c --standalone templateForm
```

Open up the `template-form.component.html` and remove the HTML that is in there and replace it with the following.

```html
<form>
  <label for="name">
    <span>Your name</span>
  </label>
  <input
    type="text"
    name="name"
    placeholder="Fill in your name"
    [(ngModel)]="model.name"
  />
</form>
```

Next step is to open up the `template-form.component.ts` file and import the `FormsModule`. Second step is to add a new property called `model` and assign it as show below.

```ts
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-template-form",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./template-form.component.html",
  styleUrls: ["./template-form.component.css"],
})
export class TemplateFormComponent implements OnInit {
  model = { name: "This can be your own name" };
  constructor() {}

  ngOnInit(): void {}
}
```

The last thing we are going to do is making sure that we can see the state of a form field. Angular uses his own custom classes for this and we are going to sprinkle a little bit of CSS in our component.

Open up the `template-form.component.css` and add the following code:

```css
.ng-invalid.ng-dirty:not(form) {
  border: 2px solid red;
}
.ng-valid.ng-dirty:not(form) {
  border: 2px solid lightgreen;
}
```

If we not go to our application by running `ng serve` we will see a simple input filled in with _This can be your own name_. Removing this value will add a red border witch indicates is is **_invalid_** and adding a value to it will say that it is **_valid_**.
