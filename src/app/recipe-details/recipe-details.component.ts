import { AfterViewInit, Component, ComponentRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { Recipe } from '../models/recipe.interface';
import { RecipeEditComponent } from './recipe-edit/recipe-edit.component';
import { RecipeViewComponent } from './recipe-view/recipe-view.component';

@Component({
  selector: 'app-recipe-details',
  templateUrl: './recipe-details.component.html',
  styleUrls: ['./recipe-details.component.scss']
})
export class RecipeDetailsComponent implements OnChanges, AfterViewInit {

  @ViewChild('recipeComponentContainer', { read: ViewContainerRef }) recipeComponentContainer!: ViewContainerRef;

  @Input() recipe?: Recipe;

  @Output() close = new EventEmitter<void>();
  
  ngOnChanges(changes: SimpleChanges): void {
    if (this.recipeComponentContainer) {
      this.loadRecipeComponent(changes['recipe']?.currentValue ? false : true);
    }
  }

  ngAfterViewInit(): void {
    this.loadRecipeComponent();
  }

  private loadRecipeComponent(edit: boolean = true, recipe?: Recipe): void {
    if (edit) {
      this.recipeComponentContainer.clear();
      const editRecipeCompRef = this.recipeComponentContainer.createComponent(RecipeEditComponent);
      editRecipeCompRef.instance.recipe = recipe;
    } else {
      this.recipeComponentContainer.clear();
      const viewRecipeCompRef = this.recipeComponentContainer.createComponent(RecipeViewComponent);
      viewRecipeCompRef.instance.edit.subscribe(() => this.loadRecipeComponent(true, this.recipe));
    }
  }
}
