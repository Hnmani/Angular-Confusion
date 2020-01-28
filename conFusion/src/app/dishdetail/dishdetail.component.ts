import { Component, OnInit , Input ,ViewChild, Injectable, Inject} from '@angular/core';
import { Dish } from "../shared/dish";
import { DishService } from '../services/dish.service';
import {switchMap} from "rxjs/operators";
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  Validators,
  Form
} from '@angular/forms';
import{Comment} from '../shared/Comment';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {
  
  @ViewChild('ffrom',{static:false}) commentFormDirective;
  dish: Dish;
  errMess:string;
  dishIds: string[];
  prev:string;
  next:string;
  commentForm: FormGroup;
  comment:Comment;
  formErrors = {
    "author":"",
    "comment":""
  };
  validationMessages={
    'author':{
      'required':'Name is Required',
      'minlength':'Name must be at least 2 characters long.',
      'maxlength':'Name cannot be more than 25 letters long',
    },
    'comment':{
      'required':'Comment is required',
    },
  };
  dishcopy: Dish;
  

  onValueChanged(data?: any){
    if(!this.commentForm){return;}
    const form = this.commentForm;
    for (const field in this.formErrors){
      if(this.formErrors.hasOwnProperty(field)){
        this.formErrors[field]='';
        const control= form.get(field);
        if(control && control.dirty && !control.valid){
          const messages=this.validationMessages[field];
          for(const key in control.errors){
            if(control.errors.hasOwnProperty(key)){
              this.formErrors[field]+=messages[key]+' ';
            }
          }
        }
      }
    }
  }

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private baseURL) {
      this.createForm();
    
    
    }
  
  createForm(): void {
    this.commentForm = this.fb.group({
      author:['',[Validators.required,Validators.minLength(2),Validators.maxLength(25)]],
      rating:[5],
      comment:['',[Validators.required]]
    });
    this.commentForm.valueChanges
      .subscribe(data=>this.onValueChanged(data));
    this.onValueChanged();
  }
  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params
      .pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); },
        errmess => this.errMess = <any>errmess );
    }
  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }
  goBack(): void{
      this.location.back();
  }
  onSubmit(){
    this.comment=this.commentForm.value;
    var date=new Date();
    this.comment.date= date.toString();
    this.dishcopy.comments.push(this.comment);
    this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
    this.commentForm.reset(
      {
        author:'',
        comment:'',
        rating:5
      }
    );
    this.commentFormDirective.resetForm();
  }


}
