import { Component, EventEmitter, Input, Output } from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { take, tap } from "rxjs";
import { CookingEnum } from "src/app/models/cooking.enum";
import { Recipe } from "src/app/models/recipe.interface";
import { DatabaseService } from "src/app/services/db.service";

@UntilDestroy()
@Component({
  selector: "app-recipe-edit",
  templateUrl: "./recipe-edit.component.html",
  styleUrls: ["./recipe-edit.component.scss"],
})
export class RecipeEditComponent {
  @Input() recipe: Recipe | undefined;
  @Output() onRecipeSaved = new EventEmitter<void>();

  recipeForm!: FormGroup;
  cookingEnumOptions = Object.values(CookingEnum);

  constructor(
    private formBuilder: FormBuilder,
    private dbService: DatabaseService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.recipeForm = new FormGroup({
      name: new FormControl("", Validators.required),
      style: new FormControl("", Validators.required),
      time: new FormControl("", [Validators.required, Validators.min(1)]),
      ingredients: new FormArray(
        [],
        [Validators.required, this.minLengthArrayValidator(1, "ingredient")]
      ),
      instructions: new FormArray(
        [],
        [Validators.required, this.minLengthArrayValidator(1, "instruction")]
      ),
      author: new FormControl(""),
      created: new FormControl(""),
      image: new FormControl(""),
      favorite: new FormControl(""),
      notes: new FormControl(""),
    });

    if (this.recipe) {
      this.recipeForm.patchValue(this.recipe);
      this.recipe.ingredients.forEach((ing) => {
        this.ingredientForms.push(
          this.formBuilder.group({
            ingredient: ing,
          })
        );
      });

      this.recipe.instructions.forEach((inst) => {
        this.instructionForms.push(
          this.formBuilder.group({
            instruction: inst,
          })
        );
      });
    }
  }

  get ingredientForms() {
    return this.recipeForm.get("ingredients") as FormArray;
  }

  get instructionForms() {
    return this.recipeForm.get("instructions") as FormArray;
  }

  addIngredient() {
    this.ingredientForms.push(
      this.formBuilder.group({
        ingredient: [""],
      })
    );
  }

  addInstruction() {
    this.instructionForms.push(
      this.formBuilder.group({
        instruction: [""],
      })
    );
  }

  minLengthArrayValidator(minLength: number, fieldName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control instanceof FormArray && control.length < minLength) {
        return { minLengthArray: { valid: false, fieldName } };
      }
      return null;
    };
  }

  onSubmit() {
    if (this.recipeForm.valid) {
      this.dbService
        .addRecipe(this.buildRecipe())
        .pipe(untilDestroyed(this))
        .subscribe(() => {
          this.onRecipeSaved.emit();
        });
    }
  }

  private buildRecipe(): Recipe {
    return {
      name: this.recipeForm.value.name,
      style: this.recipeForm.value.style,
      time: this.recipeForm.value.time,
      ingredients: this.recipeForm.value.ingredients.map(
        (v: { ingredient: string }) => v.ingredient
      ),
      instructions: this.recipeForm.value.instructions.map(
        (v: { instruction: string }) => v.instruction
      ),
      author: this.recipeForm.value.author,
      created: Date.now(),
      image: this.recipeForm.value.image,
      favorite: this.recipeForm.value.favorite,
      notes: this.recipeForm.value.notes,
    } as Recipe;
  }
}
