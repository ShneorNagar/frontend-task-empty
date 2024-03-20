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
  private showFavorites: boolean | null = false;
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
    this.initRecipes();
    this.initFavoriteToggle();
  }

  private initRecipes() {
    this.dbService
      .getRecipes()
      .pipe(untilDestroyed(this))
      .subscribe((recipes) => {
        this.recipes.set(recipes);
        this.originalRecipes = recipes;
        if (this.filterByFavorites !== null) {
          this.filterByFavorites();
        }
      });
  }

  private initFavoriteToggle() {
    this.showOnlyFavoritesCtrl.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((val) => {
        this.showFavorites = val;
        this.filterByFavorites();
      });
  }

  private filterByFavorites() {
    if (!!this.showFavorites) {
      this.recipes.set(
        this.originalRecipes.filter((r) => r.favorite === this.showFavorites)
      );
    } else {
      this.recipes.set(this.originalRecipes);
    }
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
