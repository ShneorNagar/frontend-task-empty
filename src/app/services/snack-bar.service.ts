import { Injectable } from "@angular/core";
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";

@Injectable({
  providedIn: "root",
})
export class SnackBarService {
  private readonly basicConfig: MatSnackBarConfig = {
    duration: 2000,
    horizontalPosition: "center",
    verticalPosition: "top",
  };
  private readonly baseClasses: string[] = [
    "mat-mdc-snack-bar-container",
    "snackbar",
  ];
  private readonly successClasses: string[] = ["snackbar-success"];
  private readonly errorClasses: string[] = ["snackbar-error"];

  constructor(private snackBar: MatSnackBar) {}

  openSuccessSnackBar(message: string): void {
    this.snackBar.open(message, "OK", {
      ...this.basicConfig,
      panelClass: [...this.baseClasses, ...this.successClasses],
    });
  }

  openErrorSnackBar(message: string): void {
    this.snackBar.open(message, "OK", {
      ...this.basicConfig,
      panelClass: [...this.baseClasses, ...this.errorClasses],
    });
  }
}
