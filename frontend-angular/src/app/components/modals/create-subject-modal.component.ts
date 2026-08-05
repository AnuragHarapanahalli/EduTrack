import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ViewStateService } from '../../services/view-state.service';
import { CreateSubjectRequest } from '../../models/subject.model';


@Component({
  selector: 'app-create-subject-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `

<div class="gc-modal-backdrop"
     (click)="close()">


  <div class="gc-modern-modal"
       (click)="$event.stopPropagation()">



    <!-- HEADER -->

    <div class="gc-modal-top">


      <div class="gc-modal-title">


        <div class="gc-modal-icon">

          <i class="fa-solid fa-chalkboard-user"></i>

        </div>


        <div>

          <h2>
            Create Class
          </h2>

          <p>
            Setup a new classroom for your students
          </p>

        </div>


      </div>



      <button
        type="button"
        class="gc-modal-close"
        (click)="close()">

        ×

      </button>


    </div>




    <form
      (ngSubmit)="onSubmit()">



      <div class="gc-modal-content">


        <label>
          Class Name *
        </label>


        <div class="gc-input-box">

          <i class="fa-solid fa-book"></i>

          <input
            type="text"
            name="name"
            [(ngModel)]="name"
            placeholder="Example: Database Management"
            required>

        </div>




        <label>
          Class Code *
        </label>


        <div class="gc-input-box">

          <i class="fa-solid fa-code"></i>

          <input
            type="text"
            name="code"
            [(ngModel)]="code"
            placeholder="Example: DBMS-301"
            required>

        </div>




        <label>
          Description
        </label>


        <textarea

          name="description"
          [(ngModel)]="description"
          placeholder="Add a short description about this course">

        </textarea>




        <div
          class="gc-error"
          *ngIf="errorMessage">

          {{errorMessage}}

        </div>



      </div>




      <div class="gc-modal-actions">


        <button
          type="button"
          class="gc-secondary-btn"
          (click)="close()">

          Cancel

        </button>



        <button
          class="gc-primary-btn"
          [disabled]="isSaving">


          <i class="fa-solid fa-plus"></i>


          {{
            isSaving
            ? 'Creating...'
            : 'Create Class'
          }}


        </button>



      </div>


    </form>



  </div>


</div>


`,
styles:[`

.gc-modal-backdrop{

position:fixed;
inset:0;
background:rgba(15,23,42,.55);
display:flex;
align-items:center;
justify-content:center;
z-index:999;

}



.gc-modern-modal{

width:450px;
background:var(--gc-card);
border-radius:24px;
overflow:hidden;
box-shadow:0 25px 60px rgba(0,0,0,.25);

}



.gc-modal-top{

padding:24px;
display:flex;
justify-content:space-between;
border-bottom:1px solid var(--gc-border);

}



.gc-modal-title{

display:flex;
gap:15px;
align-items:center;

}



.gc-modal-title h2{

margin:0;
font-size:1.4rem;

}



.gc-modal-title p{

margin:5px 0 0;
color:var(--gc-text-sub);
font-size:.85rem;

}



.gc-modal-icon{

width:48px;
height:48px;
border-radius:14px;
background:linear-gradient(135deg,#2563eb,#4f46e5);
color:white;
display:flex;
align-items:center;
justify-content:center;
font-size:20px;

}



.gc-modal-close{

border:none;
background:none;
font-size:28px;
cursor:pointer;

}



.gc-modal-content{

padding:25px;


}



label{

font-weight:600;
font-size:.85rem;
display:block;
margin-bottom:8px;
margin-top:15px;

}



.gc-input-box{

display:flex;
align-items:center;
gap:10px;
border:1px solid var(--gc-border);
border-radius:14px;
padding:0 15px;

}



.gc-input-box i{

color:var(--gc-primary);

}

.gc-input-box input{

padding-left:6px;

}

input,
textarea{

width:100%;
border:none;
outline:none;
padding:14px;
background:transparent;
font-size:.95rem;

}



textarea{

border:1px solid var(--gc-border);
border-radius:14px;
height:90px;
resize:none;

}



.gc-error{

background:#fee2e2;
color:#dc2626;
padding:10px;
border-radius:10px;
margin-top:15px;

}



.gc-modal-actions{

padding:20px;
display:flex;
justify-content:flex-end;
gap:12px;
background:rgba(0,0,0,.02);

}



.gc-secondary-btn,
.gc-primary-btn{

padding:12px 22px;
border-radius:12px;
border:none;
cursor:pointer;
font-weight:600;

}



.gc-secondary-btn{

background:#e5e7eb;

}



.gc-primary-btn{

background:linear-gradient(135deg,#2563eb,#4f46e5);
color:white;

}


`]
})


export class CreateSubjectModalComponent {


@Output()
closeModal=new EventEmitter<void>();


@Output()
subjectCreated=new EventEmitter<void>();


name='';
code='';
description='';


isSaving=false;

errorMessage='';



constructor(

private apiService:ApiService,

private authService:AuthService,

private viewStateService:ViewStateService,

private cdr:ChangeDetectorRef

){}



close(){

if(!this.isSaving)
this.closeModal.emit();

}




onSubmit(){


this.errorMessage='';


const user=this.authService.currentUser();


if(!user){

this.errorMessage="User not found";
return;

}



const request:CreateSubjectRequest={

name:this.name.trim(),

code:this.code.trim().toUpperCase(),

description:this.description.trim(),

batchId:1

};



this.isSaving=true;



this.apiService
.createSubject(request,user.id)
.subscribe({

next:(subject)=>{


this.viewStateService.selectSubject(subject);

this.subjectCreated.emit();

this.isSaving=false;

this.close();


},


error:(err)=>{


console.error(err);

this.errorMessage=
err?.error?.message ||
"Unable to create class";


this.isSaving=false;


}

});

}


}