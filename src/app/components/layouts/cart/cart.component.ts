import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Store, ActionsSubject } from '@ngrx/store';
import { Observable } from 'rxjs';
declare var bootstrap: any;
//services
import { SharedService } from 'src/app/services/shared.service';
//store
import { removeFromCart, updateItemInCart } from 'src/store/actions/cart.actions';
import { removeNotes, removePromo, updateCartInfo, updateEliPromoList, updateNotes, updateOrder, updatePromo } from 'src/store/actions/order.actions';
import { Cart } from 'src/store/models/cart.model';
import { Order, Policy, Promo } from 'src/store/models/order.model';
import { Restaurant } from 'src/store/models/restaurant.model';
import { User } from 'src/store/models/user.model';
import { selectCartdata } from 'src/store/selectors/cart.selector';
import { selectOrderdata } from 'src/store/selectors/order.selector';
import { selectResdata } from 'src/store/selectors/restaurant.selector';
import { selectUserdata } from 'src/store/selectors/user.selector';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  public resdata$: Observable<any>;
  public cartdata$: Observable<any>;
  public orderdata$!: Observable<any>;
  public userdata$!: Observable<any>;
  private orderdata!: Order;
  public cartdata: Cart[] = [];
  public order_notes!: string | null;

  totalItem: number = 0;
  grand_total: number = 0;
  sub_total: number = 0;
  sub_total_exclude_offer: number = 0;
  delivery_charge: number = 0;
  coupon_amount: number = 0;
  
  is_vat_included: boolean = false;
  total_dish_vat: number = 0;
  total_dish_exclude_vat: number = 0;  

  service_charge: number = 0;
  bag_charge: number = 0;

  discount_type: number = 0;
  discount_rate: number = 0;
  discount_amount: number = 0;

  min_order_msg!: string | null;

  isDeliverable!: boolean;
  orderNotesWrapShow!: boolean;

  private user!: User;

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: any,
    private store: Store,
    private sharedService: SharedService,
    private router: Router,
    private actionsSubj: ActionsSubject
  ) {
    this.resdata$ = this.store.select(selectResdata);
    this.userdata$ = this.store.select(selectUserdata);
    this.cartdata$ = this.store.select(selectCartdata);
    this.orderdata$ = this.store.select(selectOrderdata);
    this.actionsSubj.subscribe(res => {
      if(!res) return;
      if(res['type'] === '[Order Data] Update Policy') {
        this.setEliPromoInOrder();
        this.checkMinAmountReq();
      }
    });
  }

  ngOnInit() {
    this.resdata$.subscribe((value: Restaurant) => {
      this.service_charge = value.restaurant_data.service_charge;
      this.bag_charge = value.restaurant_data.bag_charge;
      this.is_vat_included = value.restaurant_data.is_vat_included
    });
    this.userdata$.subscribe((value: User) => {
      this.user = value;
    });
    this.orderdata$.subscribe((value: Order) => {
      this.orderdata = value;
      this.order_notes = value.notes;
      //coupon
      this.coupon_amount = value.coupon ? value.coupon.amount : 0;
      //discount
      this.discount_type = value.promo ? value.promo.type : 0;
      this.discount_rate = value.promo ? value.promo.rate : 0;
      this.discount_amount = value.promo ? value.promo.amount : 0;
    });
    this.cartdata$.subscribe((value: Cart[]) => {
      this.cartdata = value;
      this.calculateAssets();
      this.setEliPromoInOrder();
    });
  }

  private setEliPromoInOrder() {
    this.rejectPromotion();
    this.sharedService.getAvailablePromotions().then((promoList: Promo[]) => {
      this.store.dispatch(updateEliPromoList({eliPromoList: promoList}));
    });
  }

  public acceptPromotion(promo: Promo) {
    this.store.dispatch(updatePromo({promo: promo}));
  }

  public rejectPromotion() {
    this.store.dispatch(removePromo());
  }



  public increaseItemQuantity(dish: Cart) {
    let new_quntity = dish.quantity + 1;
    let basketData: Cart = {
      ...dish,
      quantity: new_quntity,
      total_price: Number(((dish.unit_price * new_quntity) + (dish.summation_price * new_quntity)).toFixed(2))
    }
    this.store.dispatch(updateItemInCart({payload: basketData}));
  }

  public decreaseItemQuantity(dish: Cart) {
    let new_quntity = dish.quantity - 1;
    let basketData: Cart = {
      ...dish,
      quantity: new_quntity,
      total_price: Number(((dish.unit_price * new_quntity) + (dish.summation_price * new_quntity)).toFixed(2))
    }
    if (new_quntity <= 0 || new_quntity < dish.minQuantity) {
      this.store.dispatch(removeFromCart({dishId: basketData.dish_id}));
    } else {
      this.store.dispatch(updateItemInCart({payload: basketData}));
    }
  }

  public editItem(dish: Cart) {

  }

  public changePolicy() {
    const timeModalEl = document.getElementById('timeModal');
    if(timeModalEl) new bootstrap.Modal(timeModalEl).show();
  }


  public changedNotes(text: string) {
    this.store.dispatch(updateNotes({notes: text}));
  }

  public removeOrderNotes() {
    this.store.dispatch(removeNotes());
    this.orderNotesWrapShow = false;
  }

  public allergyModalOpen() {
    const allergyModalEl = document.getElementById('allergyModal');
    if(!allergyModalEl) return;
    new bootstrap.Modal(allergyModalEl).show();
  }

  private calculateAssets() {    
    this.totalItem = 0;
    this.sub_total = 0;
    this.sub_total_exclude_offer = 0;
    this.grand_total = 0;
    this.total_dish_vat = 0;
    this.total_dish_exclude_vat = 0;
    let orderItems: Cart[] = [];

    if(!this.cartdata || this.cartdata.length <= 0) return;
    this.totalItem = this.cartdata.map(item => item.quantity).reduce((a, b) => a + b, 0);
    this.cartdata.forEach((dish: Cart) => {
      let dish_real_price = (dish.unit_price * dish.quantity) + ((dish.summation_price ? dish.summation_price : 0) * dish.quantity);
      //calculate vat
      let discount_data = {type: this.discount_type, amount: this.discount_amount, rate: this.discount_rate};
      let vatInfo = this.sharedService.calculateDishVat(dish, discount_data, this.totalItem);
      if(vatInfo) {
        if(vatInfo['vat_type'] === 'include') this.total_dish_vat = this.total_dish_vat + vatInfo['vat_amount'];
        if(vatInfo['vat_type'] === 'exclude') this.total_dish_exclude_vat = this.total_dish_exclude_vat + vatInfo['vat_amount'];
        orderItems.push({...dish, vat_amount: vatInfo['vat_amount'], vat_rate: vatInfo['vat_rate'], is_vat_included: (vatInfo['vat_type'] === 'include' ? true : false)});
      } else {
        orderItems.push(dish);
      }
      //calculate subtotal
      this.sub_total = this.sub_total + dish_real_price;
      this.sub_total_exclude_offer = this.sub_total_exclude_offer + ((dish.exclude_from_offer === false) ? dish_real_price : 0);
    });
    let _grand_total = (this.sub_total - (this.discount_amount + this.coupon_amount)) + this.delivery_charge + this.service_charge + this.bag_charge + this.total_dish_exclude_vat;
    this.grand_total = Number((_grand_total > 0 ? _grand_total : 0).toFixed(2));
    let conditionalVat = this.is_vat_included ? Number(this.total_dish_vat.toFixed(2)) : Number(this.total_dish_exclude_vat.toFixed(2))
    this.store.dispatch(updateCartInfo({ 
      orderItems: orderItems,
      vatAmount: conditionalVat, 
      vatType: (this.is_vat_included ? 'include' : 'exclude'),
      serviceCharge: this.service_charge,
      bagCharge: this.bag_charge,
      subTotal: this.sub_total, 
      total: this.grand_total 
    }));
    this.checkMinAmountReq();
  }

  private checkMinAmountReq() {
    this.min_order_msg = null;
    if (!this.orderdata.policy || !this.orderdata.policy?.takeaway) return;
    if(this.cartdata.length <= 0 || this.sub_total <= 0) return;
    if(this.sub_total < this.orderdata.policy?.min_amount) {
      let leftMinOrderAmount = this.orderdata.policy?.min_amount - this.sub_total;
      this.min_order_msg = `Add ${Number(leftMinOrderAmount.toFixed(2))} more to place order`;
    }
  }

  public proceedToCheckout() {
    if(this.min_order_msg) return;
    if (!this.user.isLogged) {
      this.sharedService.showToast('Notice', 'You are not loggedIn, please login first');
      return;
    }
    if (!this.orderdata.policy?.takeaway) {
      this.sharedService.showToast('Notice', 'Please select COLLECTION or DELIVERY');
      return;
    }
    this.router.navigate(['/order-checkout']);
  }

}
