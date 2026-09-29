import { Component, EventEmitter, Output, Input, ChangeDetectionStrategy } from '@angular/core';


@Component({
    selector: 'app-template-choice',
    imports: [],
    templateUrl: './template-choice.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './template-choice.component.css'
})
export class TemplateChoiceComponent {
  @Output() templateSelected = new EventEmitter<'horizontal' | 'vertical'>();

  @Input() currentTemplate: 'horizontal' | 'vertical' = 'vertical'; // Default selection

  selectTemplate(template: 'horizontal' | 'vertical') {
    this.currentTemplate = template;
    this.templateSelected.emit(template);
  }
}