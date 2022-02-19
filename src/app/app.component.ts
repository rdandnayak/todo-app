import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { fromEvent, BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

export interface ITodoItem {
  id: string;
  text: string;
  state: 'completed' | 'snoozed' | 'progressing';
}

export interface IStore {
  todoList: ITodoItem[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit, OnDestroy {
  constructor() {}
  private destroy$: Subject<boolean> = new Subject()
  public title = 'Todo List App';
  @ViewChild('todoInput') private todoInput;
  private store: BehaviorSubject<IStore> = new BehaviorSubject(null);
  private todosource: Observable<any>;
  public todoList: Observable<ITodoItem[]> = this.store.pipe(
    map((store) => store.todoList)
  );



  public ngAfterViewInit() {
    this.todosource = fromEvent(this.todoInput.nativeElement, 'change').pipe(takeUntil(this.destroy$))
  }

  public ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
