import { Component, Input } from '@angular/core';
import { Recipe } from 'src/app/models/recipe.interface';

@Component({
  selector: 'app-recipe-edit',
  templateUrl: './recipe-edit.component.html',
  styleUrls: ['./recipe-edit.component.scss']
})
export class RecipeEditComponent {

  @Input() recipe: Recipe | undefined;
}
