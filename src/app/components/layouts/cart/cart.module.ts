import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { helpersModule } from 'src/app/_helpers/helpers.module';
// components
import { CartComponent } from './cart.component';
// modules

@NgModule({
  declarations: [CartComponent],
  exports: [CartComponent],
  imports: [
    CommonModule, RouterModule,
    FormsModule,
    LazyLoadImageModule,
    helpersModule
  ]
})
export class CartModule { }
