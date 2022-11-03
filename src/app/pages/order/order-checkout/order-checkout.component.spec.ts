import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderCheckoutComponent } from './order-checkout.component';

describe('OrderCheckoutComponent', () => {
  let component: OrderCheckoutComponent;
  let fixture: ComponentFixture<OrderCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderCheckoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
