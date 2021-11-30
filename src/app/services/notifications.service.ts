//https://costlydeveloper.github.io/ngx-awesome-popup/#/basic-example/toast

import { Injectable } from '@angular/core';

import {
  ToastNotificationInitializer,
  ConfirmBoxInitializer,
  DialogLayoutDisplay,
  AppearanceAnimation,
  DisappearanceAnimation,
  ToastPositionEnum,
  ToastProgressBarEnum,
  ToastUserViewTypeEnum,
  IToastCoreConfig
} from '@costlydeveloper/ngx-awesome-popup';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  constructor() {}

  fullConfigToast(message: string, title = '', config: IToastCoreConfig): void {
      const newToastNotification = new ToastNotificationInitializer();
      if (title?.length > 0) { newToastNotification.setTitle(title); }
      newToastNotification.setMessage(message);
      newToastNotification.setConfig(config);
      newToastNotification.openToastNotification$();
  }

  toast(message: string, title = '', type = DialogLayoutDisplay.NONE, delay = 5000 ): void {

    const newToastNotification = new ToastNotificationInitializer();
    if (title?.length > 0) { newToastNotification.setTitle(title); }
    newToastNotification.setMessage(message);

    newToastNotification.setConfig({
      LayoutType: type, // SUCCESS | INFO | NONE | DANGER | WARNING
      AutoCloseDelay: delay, // optional
      TextPosition: 'right', // optional
      ProgressBar: ToastProgressBarEnum.INCREASE, // INCREASE | DECREASE | NONE
      ToastUserViewType: ToastUserViewTypeEnum.STANDARD, // STANDARD | SIMPLE
      AnimationIn: AppearanceAnimation.SLIDE_IN_UP, // BOUNCE_IN | SWING | ZOOM_IN | ZOOM_IN_ROTATE | ELASTIC | JELLO | FADE_IN | SLIDE_IN_UP | SLIDE_IN_DOWN | SLIDE_IN_LEFT | SLIDE_IN_RIGHT | NONE
      AnimationOut: DisappearanceAnimation.SLIDE_OUT_UP, // BOUNCE_OUT | ZOOM_OUT | ZOOM_OUT_WIND | ZOOM_OUT_ROTATE | FLIP_OUT | SLIDE_OUT_UP | SLIDE_OUT_DOWN | SLIDE_OUT_LEFT | SLIDE_OUT_RIGHT | NONE
      ToastPosition: ToastPositionEnum.TOP_RIGHT, // TOP_LEFT | TOP_CENTER | TOP_RIGHT | TOP_FULL_WIDTH | BOTTOM_LEFT | BOTTOM_CENTER | BOTTOM_RIGHT | BOTTOM_FULL_WIDTH
    });

    // Simply open the toast
    newToastNotification.openToastNotification$();
  }

  banner(message: string, title = '', confirmText = 'Confirm' , declineText = 'Decline'): Observable<boolean> {

    const newCookieBanner = new ToastNotificationInitializer();

    if (title?.length > 0) { newCookieBanner.setTitle(title); }
    newCookieBanner.setMessage(message);

    // Choose layout color type
    newCookieBanner.setConfig({
      TextPosition: 'right', // optional
      ButtonPosition: 'right', // optional
      LayoutType: DialogLayoutDisplay.NONE, // SUCCESS | INFO | NONE | DANGER | WARNING
      ToastPosition: ToastPositionEnum.BOTTOM_FULL_WIDTH // TOP_LEFT | TOP_CENTER | TOP_RIGHT | TOP_FULL_WIDTH | BOTTOM_LEFT | BOTTOM_CENTER | BOTTOM_RIGHT | BOTTOM_FULL_WIDTH
    });

    newCookieBanner.setButtonLabels(confirmText, declineText);
    const obs = newCookieBanner.openToastNotification$().pipe(map(x => x.Success));

    return obs;
  }


  confirmBox(message: string, title = '', type = DialogLayoutDisplay.NONE, confirmText = 'Yes' , denyText = 'No'): Observable<boolean> {
    const confirmBox = new ConfirmBoxInitializer();
    confirmBox.setTitle(title);
    confirmBox.setMessage(message);
    confirmBox.setButtonLabels(confirmText, denyText);
    confirmBox.setConfig({
        LayoutType: type
    });

    return confirmBox.openConfirmBox$().pipe(map(x => x.Success))

}


}
