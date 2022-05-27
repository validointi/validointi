import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `Standalone`,
})
export class AppComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}

bootstrapApplication(AppComponent).catch(console.error);
