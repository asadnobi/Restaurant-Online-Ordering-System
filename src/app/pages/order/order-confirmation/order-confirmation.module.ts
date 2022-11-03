import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { OrderConfirmationComponent } from './order-confirmation.component';

const routes: Routes = [
  { path: '', component: OrderConfirmationComponent }
]

@NgModule({
  declarations: [OrderConfirmationComponent],
  imports: [
    CommonModule, RouterModule.forChild(routes),
  ]
})
export class OrderConfirmationModule { }
