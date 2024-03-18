import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-recipe-view',
  templateUrl: './recipe-view.component.html',
  styleUrls: ['./recipe-view.component.scss']
})
export class RecipeViewComponent {


  @Output() edit = new EventEmitter();

  onEdit() {
    this.edit.emit();
  }
}
