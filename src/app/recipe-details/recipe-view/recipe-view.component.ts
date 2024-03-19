import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Recipe } from 'src/app/models/recipe.interface';

@Component({
  selector: 'app-recipe-view',
  templateUrl: './recipe-view.component.html',
  styleUrls: ['./recipe-view.component.scss']
})
export class RecipeViewComponent {

  @Input() recipe: Recipe | undefined;
  @Output() edit = new EventEmitter();

  onEdit() {
    this.edit.emit();
  }
}
