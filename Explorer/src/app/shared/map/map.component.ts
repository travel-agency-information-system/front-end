import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from './map.service';
import { LocationResponse } from '../model/location-response';
import { Observable, Observer, catchError, map, of, tap } from 'rxjs';
import { MAPBOX_API_KEY } from '../constants';
import { RouteResponse } from '../model/RouteResponse';
import { ElevationResponse } from '../model/elevation-response';
import { CheckpointPreview } from 'src/app/feature-modules/marketplace/model/checkpoint-preview';
import 'leaflet-routing-machine';
import { ImageService } from '../image/image.service';

@Component({
  selector: 'xp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
  @Output() mapClick: EventEmitter<any> = new EventEmitter();
  @Input() initialCenter: [number, number] = [45.2396, 19.8227];
  @Input() initialZoom: number = 13
  @Output() timeAndDistance: EventEmitter<any> = new EventEmitter<Observable<number>>();
  dist: number = 0;
  time: number = 0;
  profile: string = '';
  
  private map: any;
  private routeControl: any;
  private routeLayers = new Map<L.Routing.Control, L.Layer[]>(); //dodala


  constructor(private mapService: MapService, private imageService: ImageService) { }

  private initMap(): void {
    this.map = L.map('map', {
      center: this.initialCenter,
      zoom: this.initialZoom,
    });

    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18,
        minZoom: 3,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );
    tiles.addTo(this.map);
    this.registerOnClick();
  }

  search(street: string): Observable<LocationResponse> {
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });
    return this.mapService.search(street).pipe(
      map((result) => result[0]),
      tap((location) => {
        console.log('Location:', location);
        L.marker([location.lat, location.lon])
          .addTo(this.map)
          .bindPopup(location.display_name)
          .openPopup();
      }),
      catchError((error) => {
        console.error('Error in search:', error);
        throw error;
      })
    );
  }

  reverseSearch(lat: number, lon: number): Observable<LocationResponse> {
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });
    return this.mapService.reverseSearch(lat, lon).pipe(
      map((result) => result),
      tap((location) => {
        console.log('Location:', location);
       L.marker([location.lat, location.lon])
          .addTo(this.map)
          .bindPopup(location.display_name)
          .openPopup();
      }),
      catchError((error) => {
        console.error('Error in reverse search:', error);
        throw error;
      })
    );
  }

  getElevation(lat: number, lon: number): Observable<number> {

    return this.mapService.getElevation(lat, lon).pipe(
      map((response) => response.results[0].elevation),
      tap((elevation) => {
        console.log('Elevation:', elevation);
      }),
      catchError((error) => {
        console.error('Error in elevation fetch:', error);
        throw error;
      })
    );
  }

  registerOnClick(): void {

    this.map.on('click', (e: any) => {
      const coord = e.latlng;
      const lat = coord.lat;
      const lng = coord.lng;
      console.log(
        'You clicked the map at latitude: ' + lat + ' and longitude: ' + lng
      );
      this.mapClick.emit({ lat, lon: lng });
    });
  }

  ngAfterViewInit(): void {
    let DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
    });

    L.Marker.prototype.options.icon = DefaultIcon;
    this.initMap();
  }
  
  setRoute(coords: [{lat: number, lon: number}], profile: string): void{
   
   const waypoints = coords.map(coord => L.latLng(coord.lat, coord.lon));
      const routeControl = L.Routing.control({
        waypoints: waypoints,
        collapsible: true,
        router: L.routing.mapbox(MAPBOX_API_KEY, { profile: `mapbox/${profile}` }),
        lineOptions: {
          styles: [{ color: this.setRouteColor(profile), opacity: 1, weight: 5 }],
          extendToWaypoints: true,
          missingRouteTolerance: 50
        }
      }).addTo(this.map);

      routeControl.on('routesfound', (e) => {
        var routes = e.routes;
        var summary = routes[0].summary;
        const routeResponse: RouteResponse = {
          totalDistanceMeters: summary.totalDistance,
          totalTimeMinutes: Math.round(summary.totalTime / 60)
        };

        //alert('Total distance is ' + summary.totalDistance + 'meters and total time is ' + summary.totalTime + ' seconds');

        this.dist = summary.totalDistance;
        this.profile = profile;
        this.time = summary.totalTime;
        this.getTimeAndDistance();
        
            
      });
    };

    setRouteColor(profile: string): string
    {
      if(profile == 'walking')
        return 'red';
      if(profile == 'cycling')
        return 'blue';
      if(profile == 'driving')
        return 'green';
      return 'red';
    }

    getTimeAndDistance(): void{
      this.timeAndDistance.emit({d: this.dist});
    }

    setCheckpoints(checkpoints: CheckpointPreview[]): void {
      let defaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
    
      checkpoints.forEach(point => {
        L.marker([point.latitude, point.longitude], { icon: defaultIcon }).addTo(this.map)
          .bindPopup(point.name);
      });

      console.log('Checkpoints set successfully.');
    }

    calculateDistance(coords: { lat: number; lon: number }[], profile: string): Promise<number> {
      return new Promise((resolve, reject) => {
        const waypoints = coords.map(coord => L.latLng(coord.lat, coord.lon));
        const routing = L.Routing.control({
          waypoints: waypoints,
          router: L.routing.mapbox(MAPBOX_API_KEY, { profile: `mapbox/${profile}` }),
        });
    
        routing.on('routesfound', (e) => {
          const routes = e.routes;
          const summary = routes[0].summary;
          const distance = summary.totalDistance; // Udaljenost u metrima
          resolve(distance);
        });
    
        routing.route(); //error, ne znam da ispravim, ali pronadje dobro distancu
      });
    }
    
    
    setCircle(center: { lat: number; lon: number }, radius: number): void {
      if (this.map) {
        this.map.eachLayer((layer: any) => {
          if (layer instanceof L.Circle) {
            this.map.removeLayer(layer);
          }
        });
        L.circle([center.lat, center.lon], { radius: radius }).addTo(this.map);
      }
    }  

    reloadMap(): void {
      if (this.map) {
        this.map.remove();
      }
      this.ngAfterViewInit();
    }
    
    addPublicCheckpoints(coords: [{lat: number, lon: number, picture: string, name: string, desc: string}]): void {
      let defaultIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/7193/7193514.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
      coords.forEach(element => {
        console.log(this.getImageUrl(element.picture))
        L.marker([element.lat, element.lon], { icon: defaultIcon }).bindPopup("<b>" + element.name + "</b><br>" + element.desc + "<br><img src='" + this.getImageUrl(element.picture) + "' width=70 height=50>").addTo(this.map).openPopup();
      });
    }

    addCompletedCheckpoints(coords: [{lat: number, lon: number, picture: string, name: string, desc: string}]): void {
      let defaultIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/128/8935/8935765.png',
        iconSize: [35, 45],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
      coords.forEach(element => {
        L.marker([element.lat, element.lon], { icon: defaultIcon }).bindPopup("<b>" + element.name + "</b><br>" + element.desc + "<br><img src='" + this.getImageUrl(element.picture) + "' width=70 height=50>").addTo(this.map).openPopup();
      });
    }

    addCheckpoints(coords: [{lat: number, lon: number, name: string, desc: string}]): void {
      let defaultIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/6303/6303225.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
      coords.forEach(element => {
        L.marker([element.lat, element.lon], { icon: defaultIcon }).bindPopup("<b>" + element.name + "</b><br>" + element.desc).addTo(this.map).openPopup();
      });
    }

    addTouristPosition(lat: number, lon: number): Observable<LocationResponse> {
      return this.mapService.reverseSearch(lat, lon).pipe(
        map((result) => result),
        tap((location) => {
          console.log('Location:', location);
         L.marker([location.lat, location.lon])
            .addTo(this.map)
            .bindPopup(location.display_name)
            .openPopup();
        }),
        catchError((error) => {
          console.error('Error in reverse search:', error);
          throw error;
        })
      );
    }

    addMapObjects(coords: [{lat: number, lon: number, category: string, name: string, desc: string, picture: string}]): void {

      let defaultIconWC = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/1257/1257334.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
      let defaultIconRestaurant = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
      let defaultIconParking = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/8/8206.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
      let defaultIconOther = L.icon({
        iconUrl: 'https://png.pngtree.com/png-vector/20190420/ourmid/pngtree-list-vector-icon-png-image_963980.jpg',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
      coords.forEach(element => {
        if(element.category == 'WC')
          L.marker([element.lat, element.lon], { icon: defaultIconWC }).bindPopup("<b>" + element.name + "</b><br>" + element.category + "<br>" + element.desc + "<br> <img src='" + this.getImageUrl(element.picture) + "'>").openPopup().addTo(this.map);
        if(element.category == 'Restaurant')
          L.marker([element.lat, element.lon], { icon: defaultIconRestaurant }).bindPopup("<b>" + element.name + "</b><br>" + element.category + "<br>" + element.desc + "<br> <img src='" + this.getImageUrl(element.picture) + "'>").openPopup().addTo(this.map);
        if(element.category == 'Parking')
        L.marker([element.lat, element.lon], { icon: defaultIconParking }).bindPopup("<b>" + element.name + "</b><br>" + element.category + "<br>" + element.desc + "<br> <img src='" + this.getImageUrl(element.picture) + "'>").openPopup().addTo(this.map);
        if(element.category == 'Other')
          L.marker([element.lat, element.lon], { icon: defaultIconOther }).bindPopup("<b>" + element.name + "</b><br>" + element.category + "<br>" + element.desc + "<br> <img src='" + this.getImageUrl(element.picture) + "'>").openPopup().addTo(this.map);
      });
    }

    setRouteWithInfo(coords: [{lat: number, lon: number, name: string, desc: string, picture: string}], profile: string): void{
    
      const waypoints = coords.map(coord => L.latLng(coord.lat, coord.lon));
        const routeControl = L.Routing.control({
          waypoints: waypoints,
          collapsible: true,
          router: L.routing.mapbox(MAPBOX_API_KEY, { profile: `mapbox/${profile}` }),
          lineOptions: {
            styles: [{ color: this.setRouteColor(profile), opacity: 1, weight: 5 }],
            extendToWaypoints: true,
            missingRouteTolerance: 50
          },
        }).addTo(this.map);
  
        routeControl.getWaypoints().forEach(element => {
          this.map.eachLayer((layer: any) => {
            if (layer instanceof L.Marker) {
              if(layer.getLatLng() == element.latLng)
              {
                var coord = coords.filter(n => n.lat == element.latLng.lat && n.lon == element.latLng.lng)[0];
                layer.bindPopup("<b>" + coord.name + "</b><br>" + coord.desc + "<br> <img width=80 height=60 src='" + this.getImageUrl(coord.picture) + "'>").openPopup();
                layer.setIcon(L.icon({
                  iconUrl: 'https://cdn-icons-png.flaticon.com/512/6303/6303225.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                }))
              }
            }
          });
        });
        routeControl.on('routesfound', (e) => {
          var routes = e.routes;
          var summary = routes[0].summary;
          const routeResponse: RouteResponse = {
            totalDistanceMeters: summary.totalDistance,
            totalTimeMinutes: Math.round(summary.totalTime / 60)
          };
          //alert('Total distance is ' + summary.totalDistance + 'meters and total time is ' + summary.totalTime + ' seconds');
          this.dist = summary.totalDistance;
          this.profile = profile;
          this.time = summary.totalTime;
          this.getTimeAndDistance();
        });

      };
      setRouteWithPublicInfo(coords: [{ lat: number; lon: number; picture: string; name: string; desc: string }], profile: string, current?: number): void {
        const waypoints = coords.map((coord) => L.latLng(coord.lat, coord.lon));
        const routeControl = L.Routing.control({
          waypoints: waypoints,
          collapsible: true,
          show: false,
      
          router: L.routing.mapbox(MAPBOX_API_KEY, { profile: `mapbox/${profile}` }),
          lineOptions: {
            styles: [{ color: this.setRouteColor(profile), opacity: 1, weight: 5 }],
            extendToWaypoints: true,
            missingRouteTolerance: 50,
          },
        }).addTo(this.map);
      
        routeControl.getWaypoints().forEach((element, index, array) => {
          this.map.eachLayer((layer: any) => {
            if (layer instanceof L.Marker) {
              if (layer.getLatLng().equals(element.latLng)) {
                const coord = coords.find((n) => n.lat === element.latLng.lat && n.lon === element.latLng.lng);
      
                const isLastCheckpoint = index === array.length - 1;
                var isCurrent = false;
                if(current)
                  isCurrent = index === current -1;
                var iconUrl ='';
                var icon_Size : L.PointExpression;
                if(current && isCurrent){
                  iconUrl = 'https://img.icons8.com/?size=160&id=cZv3EuNAxRru&format=png';
                  icon_Size = [34, 49];
                } else if(isLastCheckpoint){
                  iconUrl = 'https://img.icons8.com/?size=96&id=0eL67ErVxWV1&format=png';
                  icon_Size = [29, 35];
                } else{
                  iconUrl = 'https://cdn-icons-png.flaticon.com/512/6303/6303225.png';
                  icon_Size = [25, 41];
                }
                
      
                layer.bindPopup(`<b>${coord?.name}</b><br>${coord?.desc}<br><img src='${this.getImageUrl(coord!.picture)}' width=70 height=50>`).addTo(this.map);
                if(current){
                  if(index===current-1)
                  layer.openPopup();
                }
                else{
                  layer.openPopup();
                }
                layer.setIcon(
                    L.icon({
                      iconUrl: iconUrl,
                      iconSize: icon_Size,
                      iconAnchor: [12, 11],
                      popupAnchor: [1, 0],
                    })
                  );
              }
            }
          });
        });
      
        routeControl.on('routesfound', (e) => {
          var routes = e.routes;
          var summary = routes[0].summary;
          const routeResponse: RouteResponse = {
            totalDistanceMeters: summary.totalDistance,
            totalTimeMinutes: Math.round(summary.totalTime / 60),
          };
          this.dist = summary.totalDistance;
          this.profile = profile;
          this.time = summary.totalTime;
          this.getTimeAndDistance();
        });
      };
      
  getImageUrl(imageName: string): string {
    return this.imageService.getImageUrl(imageName);
  }
      /*getLocationDetails(lat: number, lon: number): Observable<LocationResponse> {
        return this.mapService.reverseSearch(lat, lon).pipe(
          map((result) => result),
          catchError((error) => {
            console.error('Error in reverse search:', error);
            throw error;
          })
        );
      }*/
  }

