import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgGroupMembersComponent } from './ng-group-members.component';

describe('NgGroupMembersComponent', () => {
  let component: NgGroupMembersComponent;
  let fixture: ComponentFixture<NgGroupMembersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgGroupMembersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgGroupMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
