import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from "@angular/animations";
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  ViewChild,
  WritableSignal,
  signal,
} from "@angular/core";
import { MatSidenav } from "@angular/material/sidenav";
import { FormControl } from "@angular/forms";

import { Recipe } from "../models/recipe.interface";
import { DatabaseService } from "../services/db.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { CookingEnum } from "../models/cooking.enum";

@UntilDestroy()
@Component({
  selector: "app-recipes",
  templateUrl: "./recipes.component.html",
  styleUrls: ["./recipes.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("recipes", [
      transition("* => *", [
        query(
          ":enter",
          [
            style({ opacity: 0 }),
            stagger(10, [animate("200ms", style({ opacity: 1 }))]),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger("fadeInOut", [
      transition("* => *", [
        query(
          ":leave",
          [stagger(200, [animate("200ms", style({ opacity: 0 }))])],
          { optional: true }
        ),
        query(
          ":enter",
          [
            style({ opacity: 0 }),
            stagger(200, [animate("200ms", style({ opacity: 1 }))]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class RecipesComponent implements OnInit {
  recipes: WritableSignal<Recipe[]> = signal<Recipe[]>([]);
  private originalRecipes: Recipe[] = [];
  selectedRecipe?: Recipe;

  showOnlyFavoritesCtrl = new FormControl<boolean>(false);

  @ViewChild("sidenav") sidenav!: MatSidenav;

  @HostListener("document:keydown.escape", ["$event"]) onEscape(
    event: KeyboardEvent
  ) {
    this.sidenav.close();
  }

  constructor(private dbService: DatabaseService) {}

  ngOnInit(): void {
    // this.dbService.addRecipe({
    //   author: 'Shneor',
    //   created: Date.now(),
    //   favorite: false,
    //   id: "1",
    //   image: "https://www.recipetineats.com/wp-content/uploads/2022/09/Fries-with-rosemary-salt_1.jpg",
    //   ingredients: ["1", "2", "3"],
    //   instructions: ["1", "2", "3"],
    //   name: "1",
    //   notes: "1",
    //   style: CookingEnum.Baking,
    //   time: 1,
    // })
    this.dbService
      .getRecipes()
      .pipe(untilDestroyed(this))
      .subscribe((recipes) => {
        this.recipes.set(recipes);
        this.originalRecipes = recipes;

        // this.originalRecipes.forEach(recipe => {
        //   this.dbService.deleteRecipe(recipe.id);
        // })
      });

    this.showOnlyFavoritesCtrl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((val) => {
        if (!!val) {
          this.recipes.set(
            this.originalRecipes.filter((r) => r.favorite === val)
          );
        } else {
          this.recipes.set(this.originalRecipes);
        }
      });
  }

  trackByFn(index: number, recipe: Recipe) {
    return recipe.id;
  }

  addRecipe(): void {
    this.selectedRecipe = undefined;
    this.sidenav.open();
  }

  openRecipe(recipe: Recipe): void {
    this.selectedRecipe = recipe;
    this.sidenav.open();
  }
}
