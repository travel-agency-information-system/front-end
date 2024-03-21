import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/env/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { ReportedIssue } from '../administration/model/reported-issue.model';
import { TourPreference } from './model/preference.model';
import { TourRating } from './model/tour-rating.model';
import { OrderItem } from './model/order-item.model';
import { ShoppingCart } from './model/shopping-cart.model';
import { TouristPosition } from '../tour-execution/model/position.model';
import { Tour } from '../tour-authoring/model/tour.model';
import { TourPreview } from './model/tour-preview';
import { PublicTour } from './model/public-tour.model';
import { TourExecution } from '../tour-execution/model/tour_execution.model';
import { MapObject } from '../tour-authoring/model/map-object.model';
import { PublicCheckpoint } from '../tour-execution/model/public_checkpoint.model';
import { PurchasedTourPreview } from '../tour-execution/model/purchased_tour_preview.model';
import { TouristWallet } from './model/tourist-wallet.model';
import { CompositeForm } from './model/composite-create';
import { CompositePreview } from './model/composite-preview';
import { TourBundle } from './model/tour-bundle.model';
import { Sale } from './model/sale.model';
import { CreateCoupon } from './model/create-coupon.model';
import { Coupon } from './model/coupon.model';
import { User } from 'src/app/infrastructure/auth/model/user.model';

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {
  [x: string]: any;
  getCheckpointsByTour(tourId: number) {
      throw new Error('Method not implemented.');
  }
  getCheckpoints() {
      throw new Error('Method not implemented.');
  }
  constructor(private http: HttpClient) { }

  addReportedIssue(reportedIssue: string): Observable<ReportedIssue> {
    return this.http.post<ReportedIssue>(environment.apiHost + 'tourist/reportingIssue/' + reportedIssue,null);
  }

  addTourPreference(preference: TourPreference): Observable<TourPreference> {
    return this.http.post<TourPreference>(environment.apiHost + 'tourism/preference', preference);
  }

  updateTourPreference(preference: TourPreference): Observable<TourPreference> {
    return this.http.put<TourPreference>(environment.apiHost + 'tourism/preference/' + preference.id, preference);
  }

  getTourPreference(id: number): Observable<TourPreference[]> {
    return this.http.get<TourPreference[]>(environment.apiHost + 'tourism/preference/'+id)
  }

  deleteTourPreference(id: number): Observable<TourPreference> {
    return this.http.delete<TourPreference>(environment.apiHost + 'tourism/preference/' + id);
  }

  getTourRating(userType: string): Observable<PagedResults<TourRating>> {
    let url: string;
    switch (userType) {
      case 'administrator': 
        url = 'administration/tour-rating'; 
        break;
      case 'author': 
        url = 'author/tour-rating';
        break;
      case 'tourist':
        url = 'tourist/tour-rating';
        break;
      default:
        throw new Error('Invalid user type');
    }

    return this.http.get<PagedResults<TourRating>>(environment.apiHost + url);
  }

  deleteTourRating(id: number): Observable<TourRating> {    
    return this.http.delete<TourRating>(environment.apiHost + 'administration/tour-rating/' + id);
  }

  addTourRating(ratingForm: FormData): Observable<TourRating> {
    return this.http.post<TourRating>(environment.apiHost + 'tourist/tour-rating', ratingForm);
  }

  updateTourRating(rating: TourRating): Observable<TourRating> {
    return this.http.put<TourRating>(environment.apiHost + 'tourist/tour-rating/' + rating.id, rating);
  }

  addTouristPosition(position: TouristPosition): Observable<TouristPosition> {
    return this.http.post<TouristPosition>(environment.apiHost + 'tourism/position', position);
  }

  updateTouristPosition(position: TouristPosition): Observable<TouristPosition> {
    return this.http.put<TouristPosition>(environment.apiHost + 'tourism/position/' + position.id, position);
  }

  getTouristPosition(id: number): Observable<TouristPosition> {
    return this.http.get<TouristPosition>(environment.apiHost + 'tourism/position/'+id)
  }

  deleteTouristPosition(id: number): Observable<TouristPosition> {
    return this.http.delete<TouristPosition>(environment.apiHost + 'tourism/position/' + id);
  }

  startShoppingSession(touristId: number): Observable<any> {
    const params = new HttpParams().set('touristId', touristId.toString());
    return this.http.post<any>(environment.apiHost + 'shopping/shopping-cart/session/', null, { params });
  }

  getShoppingCart(touristId: number): Observable<ShoppingCart> {
    const params = new HttpParams().set('touristId', touristId.toString());
    return this.http.get<ShoppingCart>(environment.apiHost + 'shopping/shopping-cart/', { params });
  }

  addItemToShoppingCart(item: OrderItem): Observable<ShoppingCart> {
    return this.http.put<ShoppingCart>(environment.apiHost + 'shopping/shopping-cart/add', item);
  }

  removeItemFromShoppingCart(item: OrderItem): Observable<ShoppingCart> {
    return this.http.put<ShoppingCart>(environment.apiHost + 'shopping/shopping-cart/remove', item);
  }

  shoppingCartCheckOut(id: number, coupon: string = ""): Observable<ShoppingCart> {
    const params = new HttpParams()
      .set('touristId', id.toString())
      .set('coupon', coupon)
    return this.http.put<ShoppingCart>(environment.apiHost + 'shopping/shopping-cart/checkout', null, { params });
  }

  getTours(): Observable<PagedResults<Tour>> {
    return this.http.get<PagedResults<Tour>>(environment.apiHost + 'administration/tour');
  }

  getTouristsPurchasedTours(id: number): Observable<PurchasedTourPreview[]> {
    const params = new HttpParams().set('touristId', id.toString());
    return this.http.get<PurchasedTourPreview[]>(environment.apiHost + 'shopping/purchased-tours', { params })
  }

  getPurchasedTourDetails(tourId: number): Observable<PurchasedTourPreview> {
    return this.http.get<PurchasedTourPreview>(environment.apiHost + 'shopping/purchased-tours/details/' + tourId)
  }
  
  getPublishedTours():Observable<TourPreview[]> {
    return this.http.get<TourPreview[]>(environment.apiHost + 'tourist/shopping')
  }

  getRecommendedTours(id:number):Observable<TourPreview[]> {
    return this.http.get<TourPreview[]>(environment.apiHost + 'tourist/shopping/recommendations/' + id)
  }

  getRecommendedActiveTours(id:number):Observable<TourPreview[]> {
    return this.http.get<TourPreview[]>(environment.apiHost + 'tourist/shopping/active-recommendations/' + id)
  }

  getPublishedTour(id:number): Observable<TourPreview> {
    return this.http.get<TourPreview>(environment.apiHost + 'tourist/shopping/details/' + id);
  }

  getActiveSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(environment.apiHost + 'shopping/sales');
  }
  //
  private cartItemCountSubject = new BehaviorSubject<number>(0);
  cartItemCount$ = this.cartItemCountSubject.asObservable();

  updateCartItemCount(count: number): void {
    this.cartItemCountSubject.next(count);
  }

  getPublicTours():Observable<PublicTour[]>{
    return this.http.get<PublicTour[]>(environment.apiHost + 'tourist/publicTours/getAll') 
  }
  startExecution(tourId: number, touristId: number): Observable<TourExecution>{
    return this.http.post<TourExecution>(environment.apiHost + 'tour-execution/' + touristId, tourId);
  }

  getAverageRating(id:number): Observable<number> {
    return this.http.get<number>(environment.apiHost + 'tourist/shopping/averageRating/' + id)
  }

  getRating(id:number): Observable<TourRating> {
    return this.http.get<TourRating>(environment.apiHost + 'tourist/tour-rating/getTourRating/' + id)
  }

  getMapObjects(): Observable<PagedResults<MapObject>>{
    let queryParams = new HttpParams();
    queryParams = queryParams.append("page", 0);
    queryParams = queryParams.append("pageSize", 0);
    return this.http.get<PagedResults<MapObject>>(environment.apiHost + 'map-object', {params: queryParams});
  }

  getPublicCheckpoints(): Observable<PagedResults<PublicCheckpoint>>{
    let queryParams = new HttpParams();
    queryParams = queryParams.append("page", 0);
    queryParams = queryParams.append("pageSize", 0);
    return this.http.get<PagedResults<PublicCheckpoint>>(environment.apiHost + 'administration/publicCheckpoint');
  }

  getAdventureCoins(id:number): Observable<TouristWallet> {
    return this.http.get<TouristWallet>(environment.apiHost + 'tourist/wallet/get-adventure-coins/' + id)
  }

  paymentAdventureCoins(id:number, coins: number): Observable<TouristWallet> {
    return this.http.put<TouristWallet>(environment.apiHost + 'tourist/wallet/payment-adventure-coins/' + id + '/' + coins, null)
  }

  addCompositeTour(compositeTour: CompositeForm): Observable<CompositeForm> {
    return this.http.post<CompositeForm>(environment.apiHost + 'tourist/compositeTours', compositeTour);
  }

  getCompositeToursId(tourId:number):Observable<CompositePreview[]> {
    return this.http.get<CompositePreview[]>(environment.apiHost + 'tourist/compositeTours' + tourId) 
  }

  getAllCompositeTours():Observable<CompositePreview[]>{
    return this.http.get<CompositePreview[]>(environment.apiHost + 'tourist/compositeTours') 
  }

  getTourBundles(page: number, pageSize: number): Observable<PagedResults<TourBundle>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PagedResults<TourBundle>>(environment.apiHost + `administration/tour-bundle/published`, { params });
  }

  getAllSales(): Observable<PagedResults<Sale>>{
    return this.http.get<PagedResults<Sale>>(environment.apiHost + 'author/sale');
  }

  createSale(sale: Sale): Observable<Sale>{
    return this.http.post<Sale>(environment.apiHost + 'author/sale', sale);
  }

  getAllToursFromSale(saleId: number): Observable<Tour[]> {
    return this.http.get<Tour[]>(environment.apiHost + 'author/sale/tours-on-sale/' + saleId);
  }

  deleteSale(saleId: number): Observable<Sale>{
    return this.http.delete<Sale>(environment.apiHost + 'author/sale/' + saleId);
  }

  updateSale(sale: Sale): Observable<Sale>{
    return this.http.put<Sale>(environment.apiHost + 'author/sale', sale);
  }

  getSale(saleId: number): Observable<Sale>{
    return this.http.get<Sale>(environment.apiHost + 'author/sale/' + saleId);
  }

  getCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(environment.apiHost + 'manipulation/coupon/get-all');
  }

  getAuthorCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(environment.apiHost + 'manipulation/coupon/get-all-by-user');
  }

  createCoupon(coupon: CreateCoupon): Observable<Coupon> {
    return this.http.post<Coupon>(environment.apiHost + 'manipulation/coupon/create', coupon);
  }

  updateCoupon(coupon: CreateCoupon): Observable<Coupon> {
    return this.http.put<Coupon>(environment.apiHost + 'manipulation/coupon/update', coupon);
  }

  deleteCoupon(couponId: number): Observable<Coupon> {
    return this.http.delete<Coupon>(environment.apiHost + 'manipulation/coupon/delete/' + couponId);
  }

  getByCode(couponText: string): Observable<Coupon>{
    return this.http.get<Coupon>(environment.apiHost + 'shopping/shopping-cart/get-by-code/'+ couponText);
  }
}