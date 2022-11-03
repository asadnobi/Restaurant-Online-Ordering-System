import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { helpersModule } from 'src/app/_helpers/helpers.module';
// components
import { OrderCheckoutComponent } from './order-checkout.component';
// modules
import { CartModule } from 'src/app/components/layouts/cart/cart.module';

const routes: Routes = [
  { path: '', component: OrderCheckoutComponent }
]

@NgModule({
  declarations: [OrderCheckoutComponent],
  imports: [
    CommonModule, RouterModule.forChild(routes),
    FormsModule,
    helpersModule,
    CartModule
  ]
})
export class OrderCheckoutModule { }
