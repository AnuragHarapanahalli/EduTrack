import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewStateService, ClassTab } from '../../../services/view-state.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-class-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './class-header.component.html',
  styleUrl: './class-header.component.css'
})
export class ClassHeaderComponent {


  constructor(
    public viewStateService: ViewStateService,
    public authService: AuthService
  ){}


  changeTab(tab: ClassTab){

    this.viewStateService.setCurrentTab(tab);

  }


  get subject(){

    return this.viewStateService.currentSubject();

  }


  getInitials(){

    const name = this.subject?.name || '';

    return name
      .split(' ')
      .map(x=>x.charAt(0))
      .join('')
      .substring(0,2)
      .toUpperCase();

  }

}