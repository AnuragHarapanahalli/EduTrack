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


        <div style="display: flex; justify-content: space-between; align-items: center;">
          <label>Class Name *</label>
          <span style="font-size: 0.72rem; color: var(--gc-text-sub);">
            {{ name?.trim()?.length || 0 }} / {{ viewStateService.validationLimits().subjectNameMax }}
          </span>
        </div>


        <div class="gc-input-box">

          <i class="fa-solid fa-book"></i>

          <input
            type="text"
            name="name"
            [(ngModel)]="name"
            placeholder="Example: Database Management"
            required>

        </div>




        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
          <label style="margin: 0;">Class Code *</label>
          <span style="font-size: 0.72rem; color: var(--gc-text-sub);">
            {{ code?.trim()?.length || 0 }} / {{ viewStateService.validationLimits().subjectCodeMax }}
          </span>
        </div>


        <div class="gc-input-box">

          <i class="fa-solid fa-code"></i>

          <input
            type="text"
            name="code"
            [(ngModel)]="code"
            placeholder="Example: DBMS-301"
            required>

        </div>




        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
          <label style="margin: 0;">Description</label>
          <span style="font-size: 0.72rem; color: var(--gc-text-sub);">
            {{ description?.trim()?.length || 0 }} / {{ viewStateService.validationLimits().subjectDescriptionMax }}
          </span>
        </div>


        <textarea

          name="description"
          [(ngModel)]="description"
          placeholder="Add a short description about this course">

        </textarea>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;" *ngIf="assignedBatches.length > 0">
          <label style="margin: 0;">Assigned Batch (Optional)</label>
        </div>

        <div class="gc-input-box" *ngIf="assignedBatches.length > 0" style="margin-top: 8px;">
          <i class="fa-solid fa-users-rectangle"></i>
          <select name="batch" [(ngModel)]="batch" style="width: 100%; background: transparent; border: none; padding: 14px; outline: none; color: var(--gc-text-main); font-size: .95rem; cursor: pointer;">
            <option value="" disabled selected>Select a Batch</option>
            <option *ngFor="let b of assignedBatches" [value]="b">{{ b }}</option>
          </select>
        </div>




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
background:rgba(15,23,42,.65);
backdrop-filter:blur(4px);
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
box-shadow:var(--gc-shadow-lg, 0 25px 60px rgba(0,0,0,.25));
color:var(--gc-text-main);
border:1px solid var(--gc-border);
}

.gc-modal-top{
padding:24px;
display:flex;
justify-content:space-between;
border-bottom:1px solid var(--gc-border);
background:var(--gc-card);
}

.gc-modal-title{
display:flex;
gap:15px;
align-items:center;
}

.gc-modal-title h2{
margin:0;
font-size:1.4rem;
color:var(--gc-text-main);
font-weight:700;
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
color:var(--gc-text-sub);
transition:color 0.2s ease;
}

.gc-modal-close:hover{
color:var(--gc-text-main);
}

.gc-modal-content{
padding:25px;
background:var(--gc-card);
color:var(--gc-text-main);
}

label{
font-weight:600;
font-size:.85rem;
display:block;
margin-bottom:8px;
color:var(--gc-text-main);
}

.gc-input-box{
display:flex;
align-items:center;
gap:10px;
border:1px solid var(--gc-input-border, var(--gc-border));
border-radius:14px;
padding:0 15px;
background:var(--gc-input-bg);
transition:border-color 0.2s ease, box-shadow 0.2s ease;
}

.gc-input-box:focus-within{
border-color:var(--gc-primary);
box-shadow:0 0 0 3px rgba(37,99,235,0.15);
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
color:var(--gc-text-main);
}

input::placeholder,
textarea::placeholder{
color:var(--gc-text-light);
}

select option {
background: var(--gc-card);
color: var(--gc-text-main);
}

textarea{
border:1px solid var(--gc-input-border, var(--gc-border));
border-radius:14px;
height:90px;
resize:none;
margin-top:8px;
background:var(--gc-input-bg);
color:var(--gc-text-main);
transition:border-color 0.2s ease, box-shadow 0.2s ease;
}

textarea:focus{
border-color:var(--gc-primary);
box-shadow:0 0 0 3px rgba(37,99,235,0.15);
}

.gc-error{
background:rgba(239,68,68,0.12);
color:#ef4444;
border:1px solid rgba(239,68,68,0.3);
padding:10px 14px;
border-radius:10px;
margin-top:15px;
font-size:0.88rem;
}

.gc-modal-actions{
padding:20px;
display:flex;
justify-content:flex-end;
gap:12px;
background:var(--gc-card-sub);
border-top:1px solid var(--gc-border);
}

.gc-secondary-btn{
padding:12px 22px;
border-radius:12px;
border:1px solid var(--gc-border);
cursor:pointer;
font-weight:600;
background:var(--gc-card-sub);
color:var(--gc-text-main);
transition:all 0.2s ease;
}

.gc-secondary-btn:hover{
background:var(--gc-border);
}

.gc-primary-btn{
padding:12px 22px;
border-radius:12px;
border:none;
cursor:pointer;
font-weight:600;
background:linear-gradient(135deg,#2563eb,#4f46e5);
color:white;
box-shadow:0 4px 12px rgba(37,99,235,0.2);
transition:all 0.2s ease;
}

.gc-primary-btn:hover{
transform:translateY(-1px);
box-shadow:0 6px 16px rgba(37,99,235,0.3);
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
batch='';

get assignedBatches(): string[] {
  return this.authService.currentUser()?.assignedBatches || [];
}

isSaving=false;

errorMessage='';



constructor(

private apiService:ApiService,

private authService:AuthService,

public viewStateService:ViewStateService,

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

const limits = this.viewStateService.validationLimits();

if (this.name.trim().length < limits.subjectNameMin || this.name.trim().length > limits.subjectNameMax) {
  this.errorMessage = `Class Name must be between ${limits.subjectNameMin} and ${limits.subjectNameMax} characters.`;
  return;
}

if (this.code.trim().length < limits.subjectCodeMin || this.code.trim().length > limits.subjectCodeMax) {
  this.errorMessage = `Class Code must be between ${limits.subjectCodeMin} and ${limits.subjectCodeMax} characters.`;
  return;
}

if (this.description && this.description.trim().length > limits.subjectDescriptionMax) {
  this.errorMessage = `Description must not exceed ${limits.subjectDescriptionMax} characters.`;
  return;
}


const request:CreateSubjectRequest={

name:this.name.trim(),

code:this.code.trim().toUpperCase(),

description:this.description.trim(),

batch: this.batch

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