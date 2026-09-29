import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-weather-icon',
  imports: [],
  templateUrl: './weather-icon.component.html',
  styleUrl: './weather-icon.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeatherIconComponent {

}
