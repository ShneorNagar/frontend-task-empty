import { Injectable, inject } from "@angular/core";
import { collectionData, Firestore } from "@angular/fire/firestore";
import {
  doc,
  deleteDoc,
  collection,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import {
  catchError,
  EMPTY,
  first,
  from,
  Observable,
  switchMap,
  tap,
} from "rxjs";

import { Recipe } from "../models/recipe.interface";
import { SnackBarService } from "./snack-bar.service";

@Injectable({
  providedIn: "root",
})
export class DatabaseService {
  private firestore: Firestore = inject(Firestore);

  constructor(private snackBarService: SnackBarService) {}

  getRecipes(): Observable<Recipe[]> {
    const recipes$ = collectionData(collection(this.firestore, "recipes"), {
      idField: "id",
    }) as Observable<Recipe[]>;

    return recipes$.pipe(
      tap((recipes) => console.log(`Recipes:`, recipes)),
      catchError((error) => {
        return EMPTY;
      })
    );
  }

  addRecipe(recipe: Recipe): Observable<void> {
    if (!recipe) return EMPTY;

    return from(
      addDoc(collection(this.firestore, "recipes"), <Recipe>{ ...recipe })
    ).pipe(
      tap((docRef) => {
        console.log(`Added a new recipe with ID: ${docRef.id}`);
        this.snackBarService.openSuccessSnackBar(`Added a new recipe!`);
      }),

      switchMap((docRef) =>
        updateDoc(doc(this.firestore, "recipes", docRef.id), {
          ...recipe,
          id: docRef.id,
        })
      ),
      catchError((error) => {
        console.error("Error adding recipe:", error);
        this.snackBarService.openErrorSnackBar(`Error adding recipe`);
        return EMPTY;
      })
    );
  }

  updateRecipe(id: string, recipe: Recipe): Observable<void> {
    if (!recipe) return EMPTY;

    return from(
      updateDoc(doc(this.firestore, "recipes", id), { ...recipe })
    ).pipe(
      tap(() => {
        console.log(`Updated recipe with ID: ${id}`);
        this.snackBarService.openSuccessSnackBar(`Updated recipe!`);
      }),
      catchError((error) => {
        console.error(`Error updating recipe with ID: ${id}`, error);
        this.snackBarService.openErrorSnackBar(`Error updating recipe`);
        return EMPTY;
      })
    );
  }

  deleteRecipe(id: string): Observable<void> {
    if (!id) return EMPTY;

    return from(deleteDoc(doc(this.firestore, "recipes", id))).pipe(
      tap(() => {
        console.log(`Removed recipe with ID: ${id}`);
        this.snackBarService.openSuccessSnackBar(`Removed recipe!`);
      }),
      catchError((error) => {
        console.error(`Error removing recipe with ID: ${id}`, error);
        this.snackBarService.openErrorSnackBar(`Error removing recipe`);
        return EMPTY;
      })
    );
  }
}
