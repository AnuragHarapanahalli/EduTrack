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
background:rgba(15,23,42,.65);
backdrop-filter:blur(4px);
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
color:var(--gc-text-main);
font-weight:700;
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

.gc-tabs{
display:flex;
padding:15px 25px 0;
gap:10px;
border-bottom:1px solid var(--gc-border);
background:var(--gc-card);
}

.gc-tabs button{
flex:1;
padding:12px;
border:none;
background:transparent;
border-bottom:3px solid transparent;
cursor:pointer;
font-weight:600;
color:var(--gc-text-sub);
transition:all 0.2s ease;
}

.gc-tabs button:hover{
color:var(--gc-text-main);
}

.gc-tabs button.active{
color:#2563eb;
border-color:#2563eb;
}

:host-context(.dark-theme) .gc-tabs button.active,
.dark-theme .gc-tabs button.active{
color:#60a5fa;
border-color:#60a5fa;
}

.gc-modal-content{
padding:25px;
background:var(--gc-card);
color:var(--gc-text-main);
}

label{
font-size:.85rem;
font-weight:600;
display:block;
margin-bottom:8px;
margin-top:18px;
color:var(--gc-text-main);
}

.gc-input-box{
border:1px solid var(--gc-input-border, var(--gc-border));
border-radius:14px;
display:flex;
align-items:center;
gap:12px;
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

input{
border:none;
outline:none;
padding:14px;
width:100%;
background:transparent;
color:var(--gc-text-main);
font-size:0.95rem;
}

input::placeholder{
color:var(--gc-text-light);
}

.gc-upload-card{
border:1px dashed var(--gc-border);
padding:18px;
border-radius:18px;
display:flex;
align-items:center;
gap:15px;
background:var(--gc-card-sub);
}

.gc-upload-card i{
font-size:35px;
color:#10b981;
}

.gc-upload-card h4{
margin:0;
color:var(--gc-text-main);
font-weight:650;
}

.gc-upload-card p{
margin:5px 0;
color:var(--gc-text-sub);
}

.gc-upload-card strong{
color:var(--gc-text-main);
}

.gc-file{
width:100%;
padding:12px;
border-radius:12px;
border:1px solid var(--gc-input-border, var(--gc-border));
background:var(--gc-input-bg);
color:var(--gc-text-main);
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
border:1px solid var(--gc-border);
padding:12px 22px;
border-radius:12px;
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
border:none;
padding:12px 22px;
border-radius:12px;
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




  isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  }

  isValidName(name: string): boolean {
    if (!name) return false;
    const trimmed = name.trim();
    const limits = this.viewStateService.validationLimits();
    const minLen = limits?.userFullnameMin || 2;
    const maxLen = limits?.userFullnameMax || 100;
    if (trimmed.length < minLen || trimmed.length > maxLen) {
      return false;
    }
    const nameRegex = /^[a-zA-Z\s.'-]+$/;
    if (!nameRegex.test(trimmed)) return false;
    const alphaMatches = trimmed.match(/[a-zA-Z]/g);
    return !!alphaMatches && alphaMatches.length >= 2;
  }

  onManualSubmit() {
    const subject = this.viewStateService.currentSubject();
    if (!subject) return;

    const trimmedName = this.fullName ? this.fullName.trim() : '';
    const trimmedEmail = this.email ? this.email.trim() : '';

    if (!trimmedName || !trimmedEmail) {
      alert("Please enter both student full name and email address.");
      return;
    }

    if (!this.isValidName(trimmedName)) {
      alert("Please enter a valid full name (e.g. H. C. Verma or Rahul Sharma). Names cannot be punctuation symbols only (like '.').");
      return;
    }

    if (!this.isValidEmail(trimmedEmail)) {
      alert("Please enter a valid email address (e.g. student@example.com).");
      return;
    }

    this.apiService
      .addStudentToSubjectManual(
        subject.id,
        trimmedName,
        trimmedEmail
      )
      .subscribe({
        next: () => {
          this.studentsAdded.emit();
          this.close();
        },
        error: (err) => {
          console.error(err);
          alert(err?.error?.message || "Unable to invite student");
        }
      });
  }

  downloadTemplate() {
    const csv = "FullName,Email\nJohn Doe,john@example.com";
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Student_Template.csv";
    a.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
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
      let skippedCount = 0;
      const promises: any[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || (i === 0 && (line.toLowerCase().includes('email') || line.toLowerCase().includes('fullname')))) {
          continue; // Skip header or empty line
        }

        const parts = line.split(',');
        if (parts.length >= 2) {
          const fullName = parts[0].trim();
          const email = parts[1].trim();

          if (this.isValidName(fullName) && this.isValidEmail(email)) {
            promises.push(
              this.apiService.addStudentToSubjectManual(subject.id, fullName, email).toPromise()
            );
            enrolledCount++;
          } else {
            skippedCount++;
          }
        } else {
          skippedCount++;
        }
      }

      if (enrolledCount === 0 && skippedCount > 0) {
        alert(`No valid student entries found in CSV. ${skippedCount} row(s) were skipped due to invalid full name or email format.`);
        return;
      }

      if (enrolledCount === 0 && skippedCount === 0) {
        alert("The uploaded CSV file contains no data rows.");
        return;
      }

      Promise.allSettled(promises).then(() => {
        let msg = `Successfully processed CSV. Added ${enrolledCount} student(s).`;
        if (skippedCount > 0) {
          msg += ` Skipped ${skippedCount} invalid row(s) (invalid name or email format).`;
        }
        alert(msg);
        this.studentsAdded.emit();
        this.close();
      });
    };

    reader.readAsText(this.selectedFile);
  }
}