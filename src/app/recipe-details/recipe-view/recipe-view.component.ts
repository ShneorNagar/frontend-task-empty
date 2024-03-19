import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, signal } from "@angular/core";
import { Recipe } from "src/app/models/recipe.interface";
import { DatabaseService } from "src/app/services/db.service";

@Component({
  selector: "app-recipe-view",
  templateUrl: "./recipe-view.component.html",
  styleUrls: ["./recipe-view.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeViewComponent implements OnInit{
  
  @Input() recipe: Recipe | undefined;
  @Output() edit = new EventEmitter();
  likeToggle = signal(false);

  constructor(private dbService: DatabaseService) {}

  ngOnInit(): void {
    if (this.recipe) {
      this.likeToggle.set(this.recipe.favorite);
    }
  }

  onEdit() {
    this.edit.emit();
  }

  onLikeToggleClick() {
    this.likeToggle.set(!this.likeToggle());
    if (this.recipe) {
      this.dbService.updateRecipe(this.recipe.id, {
        ...this.recipe,
        favorite: this.likeToggle(),
      });
    }
  }
}
