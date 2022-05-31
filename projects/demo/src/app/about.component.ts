import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: 'hello about',
})
export class AboutComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
