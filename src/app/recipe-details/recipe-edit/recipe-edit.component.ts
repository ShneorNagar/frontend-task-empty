import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from "@angular/core";
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
import { CookingEnum } from "src/app/models/cooking.enum";
import { Recipe } from "src/app/models/recipe.interface";
import { DatabaseService } from "src/app/services/db.service";

@UntilDestroy()
@Component({
  selector: "app-recipe-edit",
  templateUrl: "./recipe-edit.component.html",
  styleUrls: ["./recipe-edit.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecipeEditComponent {
  @Input() recipe: Recipe | undefined;
  @Output() onClose = new EventEmitter<void>();

  formSubmitted = signal(false);
  editMode: boolean = false;
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
      name: new FormControl(null, Validators.required),
      style: new FormControl(null, Validators.required),
      time: new FormControl(null, [Validators.required, Validators.min(1)]),
      ingredients: new FormArray(
        [],
        [Validators.required, this.minLengthArrayValidator(1, "ingredient")]
      ),
      instructions: new FormArray(
        [],
        [Validators.required, this.minLengthArrayValidator(1, "instruction")]
      ),
      author: new FormControl(null),
      created: new FormControl(null),
      image: new FormControl(null),
      notes: new FormControl(null),
    });

    if (this.recipe) {
      this.editMode = true;

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

  removeIngredient(index: number) {
    this.ingredientForms.removeAt(index);
  }

  removeInstruction(index: number) {
    this.instructionForms.removeAt(index);
  }

  onSubmit() {
    this.formSubmitted.set(true);
    if (this.recipeForm.valid) {
      if (this.editMode) {
        this.updateRecipe();
      } else {
        this.createRecipe();
      }
    }
  }

  private createRecipe() {
    this.dbService
      .addRecipe(this.buildRecipe())
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.onClose.emit();
      });
  }

  private updateRecipe() {
    if (this.recipe) {
      this.dbService
        .updateRecipe(this.recipe.id, this.buildRecipe())
        .pipe(untilDestroyed(this))
        .subscribe(() => {
          this.onClose.emit();
        });
    }
  }

  onDeleteRecipe() {
    if (this.recipe) {
      this.dbService
        .deleteRecipe(this.recipe.id)
        .pipe(untilDestroyed(this))
        .subscribe(() => {
          this.onClose.emit();
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
      notes: this.recipeForm.value.notes,
    } as Recipe;
  }

  private minLengthArrayValidator(
    minLength: number,
    fieldName: string
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control instanceof FormArray && control.length < minLength) {
        return { minLengthArray: { valid: false, fieldName } };
      }
      return null;
    };
  }
}
