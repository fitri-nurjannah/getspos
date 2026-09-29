import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Injectable()
export class HTTPListener implements HttpInterceptor {
  excludeUrlArray = ['/api/plan/index'];
  constructor(private ngxLoaderService: NgxUiLoaderService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let i = 0;
    return next.handle(req).pipe(
      map((event: any) => {
        let showLoader = true;

        // checking event have url (this methodes will be called several times automatically)
        if (event && event.url) {
          // checking url in the excluded list
          this.excludeUrlArray.forEach((_urlPart) => {
            if (event.url.indexOf(_urlPart) > -1) {
              // if url is in the list of excluded, will not show loader
              showLoader = false;
            }
          });

          // going to show loader
          if (showLoader) {
            this.ngxLoaderService.start();
          }
        }

        return event;
      }),
      catchError((error) => {
        return throwError(error);
      }),
      finalize(() => {
        // setTimeout is important, else will not show loader
        setTimeout(() => {
          this.ngxLoaderService.stopAll();
        }, 350);
      })
    );
  }
}
