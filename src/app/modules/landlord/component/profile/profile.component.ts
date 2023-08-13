import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service';
import { ChangePassword, User } from 'src/app/modules/model/user.model';
import { UserService } from '../../service/user.service';
import { finalize, findIndex } from 'rxjs';
import { MessageService } from 'primeng/api';
import { FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [MessageService],
})
export class ProfileManagement implements OnInit {
  value: number = 0;
  user?: User | null;
  checked: boolean = false;
  userResult: any;
  loading: boolean = false
  saveLoading: boolean = false;
  uploadedFiles!: any;
  thumb!: any;
  oldPassword!: any
  newPassword!: any
  confirmedPassword!: any
  submitted: boolean = false;
  changePassResult: any;
  passwordForm: FormGroup

  constructor(private authenticationService: AuthenticationService, private userService: UserService, private messageService: MessageService,) { 
    this.authenticationService.user.subscribe((user) => this.user = user)
    this.passwordForm = new FormGroup({
      currentPass: new FormControl('',[ Validators.required]),
      newPass: new FormControl('',[ Validators.required]),
      confirmedPass: new FormControl('',[ Validators.required])
    })
  }

  ngOnInit(): void {
    this.getUser();
    this.passwordForm.get('currentPass')?.valueChanges.subscribe(data => {
      this.oldPassword = data
      if (this.newPassword && this.oldPassword === this.newPassword) {
        this.passwordForm.get('newPass')?.setErrors({'incorrect': true});
      } else {
        this.passwordForm.get('newPass')?.setErrors(null);
      }
    })
    this.passwordForm.get('newPass')?.valueChanges.subscribe(data => {
      this.newPassword = data
      if (this.confirmedPassword && this.confirmedPassword === this.newPassword) {
        this.passwordForm.get('confirmedPass')?.setErrors(null);
      }
      if (this.oldPassword && this.oldPassword === this.newPassword) {
        this.passwordForm.get('newPass')?.setErrors({'incorrect': true});
      }
    })
    this.passwordForm.get('confirmedPass')?.valueChanges.subscribe(data => {
      this.confirmedPassword = data
      if (this.confirmedPassword !== this.newPassword) {
        this.passwordForm.get('confirmedPass')?.setErrors({'incorrect': true});
      }
    })
  }

  onUpload(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.uploadedFiles = event.target.files[0];
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); 
      reader.onload = (event: any) => { 
        this.thumb = event.target.result;
      }
    }
  }

  getUser() {
    this.loading = true
    this.userService.getUserByUserId(this.user?.id).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(result => this.userResult = result.data)
  }

  saveUser() {
    let request: FormData = new FormData();
    if (this.uploadedFiles) {
      request.append("file", this.uploadedFiles);
    }
    request.append("data", JSON.stringify(this.userResult))
    console.log(request)
    this.saveLoading = true
    this.submitted = true
    this.userService.saveUser(request).pipe(
      finalize(() => {
        this.saveLoading = false
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Chỉnh sửa thành công', life: 3000 })
      })
    ).subscribe(data => console.log(data))
  }

  // onChangeConfirmPass() {
  //   if (this.confirmedPassword !== this.newPassword) {
  //     this.passwordForm.get('confirmedPass')?.setErrors({'incorrect': true});
  //   }
  // }
 
  changePassword() {
    this.passwordForm.markAllAsTouched()
    let isValid = this.passwordForm.valid
    if (isValid) {
      let request: ChangePassword = new ChangePassword();
      request.userId = this.user?.id
      request.oldPassword = this.oldPassword
      request.newPassword = this.newPassword
      this.saveLoading = true
      this.userService.changePassword(request).pipe(
        finalize(() => {
          if (!this.changePassResult.success) {
            this.messageService.add({ severity: 'error', summary: 'Thất bại', detail: this.changePassResult.message, life: 3000 })
          } else {
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Chỉnh sửa thành công', life: 3000 })
          }
          this.saveLoading = false
        })
      ).subscribe(data => this.changePassResult = data)
    }
    
  }
}
