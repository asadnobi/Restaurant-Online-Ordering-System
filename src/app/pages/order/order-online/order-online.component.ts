import { AfterViewInit, Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
declare var bootstrap: any;
//services
import { HttpService } from 'src/app/services/http.service';
import { LoadingService } from 'src/app/services/loading.service';
import { SharedService } from 'src/app/services/shared.service';
//store
import { selectResdata } from "src/store/selectors/restaurant.selector";
import { selectSchedule } from "src/store/selectors/schedule.selector";
import { selectCartdata } from "src/store/selectors/cart.selector";
import { selectedDish } from "src/store/actions/dish.actions";
import { Dish } from 'src/store/models/dish.model';
import { Cart } from 'src/store/models/cart.model';
import { selectOrderdata } from 'src/store/selectors/order.selector';
import { Order, Policy } from 'src/store/models/order.model';
import { addResDish } from 'src/store/actions/restaurant.actions';

@Component({
  selector: 'app-order-online',
  host: {class: 'page-wrapper'},
  templateUrl: './order-online.component.html',
  styleUrls: ['./order-online.component.scss']
})
export class OrderOnlineComponent implements OnInit, AfterViewInit {
  public resdata$: Observable<any>;
  public schedule$: Observable<any>;
  public orderdata$: Observable<any>;
  public cartdata$: Observable<any>;
  //api data
  public pageContent: any;
  public reviews: any;
  //variables
  public menuList: any[] = [];
  public menuCuisineList: any[] = [];
  public popularList: any[] = [];
  public cartData: Cart[] = [];

  private is_ordering!: boolean;
  private restaurant_mode!: number;
  private mode_msg!: string;
  private policy!: Policy;

  @ViewChild('divOrderMenu', {static: false}) divOrderMenu!: ElementRef;
  @ViewChild('divDishWrapper', {static: false}) divDishWrapper!: ElementRef;
  @ViewChild('divOrderCart', {static: false}) divOrderCart!: ElementRef;
  
  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: any,
    private store: Store,
    private httpService: HttpService,
    private loadingService: LoadingService,
    private sharedService: SharedService
  ) {
    this.resdata$ = this.store.select(selectResdata);
    this.schedule$ = this.store.select(selectSchedule);
    this.cartdata$ = this.store.select(selectCartdata);
    this.orderdata$ = this.store.select(selectOrderdata);
  }

  ngOnInit(): void {
    this.resdata$.subscribe(value => {
      this.is_ordering = value.restaurant_data.is_ordering;
      this.restaurant_mode = value.restaurant_data.restaurant_mode;
      this.mode_msg = value.restaurant_data.restaurant_mode_message;
    });
    this.cartdata$.subscribe((value: Cart[]) => {
      this.cartData = value;
      //set last stage of data in localstore
      if(this.cartData.length > 0) {
        let new_cart_tacker = this.sharedService.createCartTracker(value);
        localStorage.setItem('cart-data', JSON.stringify(value));
        localStorage.setItem('cart-tracker', JSON.stringify(new_cart_tacker));
      } else {
        localStorage.removeItem('cart-data');
        localStorage.removeItem('cart-tracker');
      }
    });
    this.orderdata$.subscribe((value: Order) => {
      if(value.policy) this.policy = value.policy;
    });
  }

  ngAfterViewInit(): void {
    this.getPageContent();
    this.getReviewData()
    this.getMenu();
    if (this.platformId === 'browser') {
      /*----------for order cart sticky-----------*/
      // find div from html body
      const orderCart = this.divOrderCart.nativeElement.querySelector('#order-cart');
      // add sticky-top of cart for scroll view in large screen
      if (orderCart && window.innerWidth > 1024) {
        orderCart.classList.add('sticky-top');
        orderCart.style.top = (this.divOrderMenu.nativeElement.clientHeight + 5) + 'px';
      }
      /*----------END-----------*/
      /*----------for order nav overflow-----------*/
      const visibleMenu = this.divOrderMenu.nativeElement.querySelector('.visible_menu');
      const invisibleMenu = this.divOrderMenu.nativeElement.querySelector('.invisible_menu');
      const invisibleDropDownMenu = invisibleMenu.querySelector('.dropdown-menu');
      if(!visibleMenu || !invisibleMenu || !invisibleDropDownMenu) return;
      let summation: number = 85;
      let interval = setInterval(()=> {
        if([...visibleMenu.children].length <= 0) {
          setTimeout(() => { clearInterval(interval); }, 10000);
        }
        if([...visibleMenu.children].length > 0) {
          clearInterval(interval);
        }
        //Bootstrap scrollspy
        new bootstrap.ScrollSpy(document.body, { target: '#order-menu' });
        //navbar collapse for dropdown
        [...visibleMenu.children].forEach((element: Element) => {
          summation = summation + (element.clientWidth);
          if (summation > visibleMenu.clientWidth) {
            invisibleMenu.style.display =  'block';
            element.removeAttribute("class");
            element.firstElementChild?.classList.replace('nav-link', 'dropdown-item')
            invisibleDropDownMenu.insertAdjacentElement('beforeEnd', element);
          }
        });
      }, 500);
    }

        
  } 

  private getPageContent() {
    this.loadingService.loadingStart();
    const $obs = this.httpService.getPageDataById_V2(10).subscribe({
      next: (value: Object) => {
        this.loadingService.loadingClose();
        this.pageContent = value;
      },
      error: (err: Error) => {
        this.loadingService.loadingClose();
      },
      complete: () => {
        $obs.unsubscribe();
        this.loadingService.loadingClose(); 
      }   
    });
  }

  private getReviewData() {
    this.loadingService.loadingStart();
    const $obs = this.httpService.getRestaurantReviews().subscribe({
      next: (value: {data: object}) => {
        this.loadingService.loadingClose();
        this.reviews = value.data;
        this.reviews.average_point = Number(this.reviews.average_point);
      },
      error: (err: Error) => {
        this.loadingService.loadingClose();
      },
      complete: () => {
        $obs.unsubscribe();
        this.loadingService.loadingClose(); 
      }   
    });
  }

  private getMenu() {
    this.loadingService.loadingStart();
    const $obs = this.httpService.getMenu().subscribe({
      next: (value: any) => {
        this.loadingService.loadingClose();
        if(value['dishes_information']) {
          this.store.dispatch(addResDish({ restaurant_dish: value['dishes_information'] }));
          this.menuSort(value);          
        }
      },
      error: (err: Error) => {
        this.loadingService.loadingClose();
      },
      complete: () => {
        $obs.unsubscribe();
        this.loadingService.loadingClose(); 
      }      
    });
  }

  private menuSort(menudata: any) {
    if(!menudata) {return;}
    const _menuList: any[] = [];
    this.menuCuisineList = [];
    new Promise<void>((resolve, reject) => {
      menudata.dishes_information.forEach((cuisine: any) => {
        if(!cuisine.is_active) {return;}
        this.menuCuisineList.push({ cuisine_id: cuisine._id, cuisine_name: cuisine.cuisine_name });
        cuisine.dish_categories.forEach((category: any) => {
          if(category.is_active && (category.category_dishes && category.category_dishes.length > 0)) {
            _menuList.push({ ...category, cuisine_id: cuisine._id, cuisine_name: cuisine.cuisine_name });
          }
        });
      });
      _menuList.sort((x, y) => {
        return x.sort_order - y.sort_order;
      });
      resolve();
    }).then(()=> {
      this.menuList =_menuList;
      this.getPopulerDishes();
    });
  }
  
  private getPopulerDishes() {
    this.popularList = [];
    this.menuList.forEach((category: any) => {
      category.category_dishes.forEach((dish: any) => {
        if (dish.is_popular && dish.is_active) {
          this.popularList.push({
            ...dish,
            course_id: category.course_id ? category.course_id : 0,
            category_id: category._id
          });
        }
      });
    });
  }

  public scrollTo(section: string) {
    if (this.platformId === 'browser') {
      const _section = section.replace(/[^a-zA-Z0-9]/ig, '').toLowerCase();
      const targetEle = this.divDishWrapper.nativeElement.querySelector('#' + _section);
      targetEle.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'start'});
    }
  }

  public scrollToCuisine(cuisineId: string) {
    if (this.platformId === 'browser') {
      let match: Array<any> = this.menuList.filter((cat: any) => cat.cuisine_id === cuisineId);
      if(match) {
        const _section = match[0].category_name.replace(/[^a-zA-Z0-9]/ig, '').toLowerCase();
        const targetEle = this.divDishWrapper.nativeElement.querySelector('#' + _section);
        targetEle.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'start'});
      }
    }
  }

  public selectedDish(dishData: any, courseId: number, categoryId: string) {
    let data: Dish = {
      _id: dishData._id,
      dish_id: dishData.dish_id ? dishData.dish_id : dishData._id,
      dish_name: dishData.dish_name,
      dish_short_name: dishData.dish_short_name,
      alt_dish_name: dishData.alt_dish_name,
      dish_instruction: dishData.dish_instruction,
      dish_description: dishData.dish_description,
      dish_image: dishData.dish_image,
      spice_level: dishData.spice_level,
      allergence: dishData.allergence,
      category_id: categoryId,
      course_id: courseId,
      sort_order: dishData.sort_order,
      vat_rate: dishData.vat_rate,
      price: dishData.price,
      minQuantity: dishData.minQuantity,
      exclude_from_offer: dishData.exclude_from_offer,
      combination: dishData.combination,
      group: dishData.group,
      package: dishData.package,
      sku: dishData.sku,
      is_active: dishData.is_active,
      is_exclude_web: dishData.is_exclude_web,
      is_popular: dishData.is_popular,
      is_vat_included: dishData.is_vat_included
    }
    if(!data.price || data.price <= 0) return;
    this.store.dispatch(selectedDish({payload: data}));
    if (this.platformId === 'browser') {
      const timeModalEl = document.getElementById('timeModal');
      const dishModalEl = document.getElementById('dishModal');
      if(this.restaurant_mode !== 1 || !this.is_ordering) {
        this.sharedService.showToast('Opps!', this.mode_msg ? this.mode_msg : 'We are not taking online orders right now.');
        return;
      } 
      if(!this.policy) {
        if(!timeModalEl) return;
        new bootstrap.Modal(timeModalEl).show();
        timeModalEl.addEventListener('hide.bs.modal', () => {
          if(this.policy?.takeaway) {
            new bootstrap.Modal(dishModalEl).show();
          }
        })
        return;
      }
      new bootstrap.Modal(dishModalEl).show();
    }
  }

}
