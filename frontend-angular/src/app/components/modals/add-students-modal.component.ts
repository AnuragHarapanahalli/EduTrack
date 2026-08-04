import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../services/api.service';
import { ViewStateService } from '../../services/view-state.service';


@Component({
  selector: 'app-add-students-modal',
  standalone:true,
  imports:[
    CommonModule,
    FormsModule
  ],
  template:`

<div class="gc-modal-backdrop"
     (click)="close()">



<div class="gc-modern-modal"
     (click)="$event.stopPropagation()">



<!-- HEADER -->

<div class="gc-modal-top">


<div class="gc-modal-title">


<div class="gc-modal-icon">

<i class="fa-solid fa-user-plus"></i>

</div>



<div>

<h2>
Invite Students
</h2>

<p>
Add students to your classroom
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




<!-- TABS -->


<div class="gc-tabs">


<button
[class.active]="isManual"
(click)="setManual(true)">

<i class="fa-solid fa-user"></i>

Manual Entry

</button>



<button
[class.active]="!isManual"
(click)="setManual(false)">

<i class="fa-solid fa-file-csv"></i>

Import CSV

</button>



</div>





<!-- BODY -->


<div class="gc-modal-content">





<!-- MANUAL -->


<div *ngIf="isManual">



<label>
Student Full Name
</label>


<div class="gc-input-box">


<i class="fa-solid fa-user"></i>


<input

type="text"

[(ngModel)]="fullName"

name="fullName"

placeholder="Example: Rahul Sharma">


</div>





<label>
Student Email Address
</label>


<div class="gc-input-box">


<i class="fa-solid fa-envelope"></i>


<input

type="email"

[(ngModel)]="email"

name="email"

placeholder="student@example.com">


</div>



</div>







<!-- CSV -->


<div *ngIf="!isManual">



<div class="gc-upload-card">


<i class="fa-solid fa-file-csv"></i>


<div>


<h4>
Student CSV File
</h4>


<p>
Format:
<strong>
FullName,Email
</strong>
</p>


</div>


<button

class="gc-secondary-btn"

(click)="downloadTemplate()">

<i class="fa-solid fa-download"></i>

Template

</button>


</div>





<label>

Upload CSV

</label>


<input

class="gc-file"

type="file"

accept=".csv"

(change)="onFileSelected($event)">



</div>




</div>






<!-- FOOTER -->


<div class="gc-modal-actions">



<button

class="gc-secondary-btn"

(click)="close()">

Cancel

</button>



<button

*ngIf="isManual"

class="gc-primary-btn"

(click)="onManualSubmit()">


<i class="fa-solid fa-paper-plane"></i>

Invite


</button>




<button

*ngIf="!isManual"

class="gc-primary-btn"

(click)="processCsv()">


<i class="fa-solid fa-upload"></i>

Upload Roster


</button>




</div>



</div>


</div>



`,
styles:[`

.gc-modal-backdrop{

position:fixed;
inset:0;
background:rgba(15,23,42,.55);
display:flex;
justify-content:center;
align-items:center;
z-index:999;

}



.gc-modern-modal{

width:470px;
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

}



.gc-modal-title p{

margin:5px 0;
color:var(--gc-text-sub);
font-size:.85rem;

}



.gc-modal-icon{

width:48px;
height:48px;
border-radius:14px;
display:flex;
align-items:center;
justify-content:center;
background:linear-gradient(135deg,#059669,#10b981);
color:white;

}




.gc-modal-close{

border:none;
background:none;
font-size:28px;
cursor:pointer;

}




.gc-tabs{

display:flex;
padding:15px 25px 0;
gap:10px;

}



.gc-tabs button{

flex:1;
padding:12px;
border:none;
background:transparent;
border-bottom:3px solid transparent;
cursor:pointer;
font-weight:600;

}



.gc-tabs button.active{

color:#2563eb;
border-color:#2563eb;

}




.gc-modal-content{

padding:25px;

}




label{

font-size:.85rem;
font-weight:600;
display:block;
margin-bottom:8px;
margin-top:18px;

}




.gc-input-box{

border:1px solid var(--gc-border);
border-radius:14px;
display:flex;
align-items:center;
gap:12px;
padding:0 15px;

}



.gc-input-box i{

color:#2563eb;

}



input{

border:none;
outline:none;
padding:14px;
width:100%;
background:none;

}




.gc-upload-card{

border:1px dashed var(--gc-border);
padding:18px;
border-radius:18px;
display:flex;
align-items:center;
gap:15px;

}



.gc-upload-card i{

font-size:35px;
color:#16a34a;

}



.gc-upload-card h4{

margin:0;

}



.gc-upload-card p{

margin:5px 0;
color:var(--gc-text-sub);

}



.gc-file{

width:100%;
padding:12px;
border-radius:12px;
border:1px solid var(--gc-border);

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

border:none;
padding:12px 22px;
border-radius:12px;
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


export class AddStudentsModalComponent {


@Output()
closeModal=new EventEmitter<void>();


@Output()
studentsAdded=new EventEmitter<void>();



isManual=true;


fullName='';

email='';


selectedFile:File|null=null;



constructor(

private apiService:ApiService,

private viewStateService:ViewStateService,

private cdr:ChangeDetectorRef

){}



close(){

this.closeModal.emit();

}




setManual(value:boolean){

this.isManual=value;

}




onManualSubmit(){


const subject=this.viewStateService.currentSubject();


if(!subject)
return;



if(!this.fullName || !this.email){

alert("Enter student details");

return;

}



this.apiService
.addStudentToSubjectManual(

subject.id,

this.fullName.trim(),

this.email.trim()

)
.subscribe({

next:()=>{

this.studentsAdded.emit();

this.close();

},


error:(err)=>{

console.error(err);

alert("Unable to invite student");

}

});


}




downloadTemplate(){


const csv=

"FullName,Email\nJohn Doe,john@example.com";


const blob=new Blob(

[csv],

{
type:'text/csv'
}

);


const url=URL.createObjectURL(blob);


const a=document.createElement('a');

a.href=url;

a.download="Student_Template.csv";

a.click();


}





onFileSelected(event:Event){


const input=event.target as HTMLInputElement;


if(input.files?.length){

this.selectedFile=input.files[0];

}


}





  processCsv() {
    if (!this.selectedFile) {
      alert("Please select a CSV file first.");
      return;
    }

    const subject = this.viewStateService.currentSubject();
    if (!subject) {
      alert("No active class selected.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const text = e.target.result as string;
      const lines = text.split(/\r\n|\n/);
      let enrolledCount = 0;
      const promises: any[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || i === 0 && line.toLowerCase().includes('email')) {
          continue; // Skip header or empty line
        }

        const parts = line.split(',');
        if (parts.length >= 2) {
          const fullName = parts[0].trim();
          const email = parts[1].trim();
          if (fullName && email) {
            promises.push(
              this.apiService.addStudentToSubjectManual(subject.id, fullName, email).toPromise()
            );
            enrolledCount++;
          }
        }
      }

      Promise.allSettled(promises).then(() => {
        alert(`Successfully processed CSV. Added ${enrolledCount} students.`);
        this.studentsAdded.emit();
        this.close();
      });
    };

    reader.readAsText(this.selectedFile);
  }
}