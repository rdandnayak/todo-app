import {
  Component,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ElementRef,
  OnChanges,
} from '@angular/core';
import {
  fromEvent,
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { v1 as uuid } from 'uuid';

enum TodoState {
  COMPLETED = 'COMPLETED',
  INCOMPLETE = 'INCOMPLETE',
}

export interface ITodoItem {
  id: string;
  text: string;
  state: TodoState;
}

export interface IStore {
  todoList: ITodoItem[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent
  implements AfterViewInit, OnDestroy, OnInit, OnChanges
{
  constructor() {}
  public todoSate = TodoState;
  private destroy$: Subject<boolean> = new Subject();
  public title = 'Todo List App';
  private _todoList = new BehaviorSubject([]);
  public todoList$: Observable<ITodoItem[]> = this._todoList
    .asObservable()
    .pipe(tap((list) => (this.todoList = list)));
  public todoList: ITodoItem[] = [];
  public remainingTasks$: Observable<number> = this.todoList$.pipe(
    map((list) =>
      list.filter((todo) => todo.state === this.todoSate.INCOMPLETE)
    ),
    map((items) => items.length)
  );

  public completedTasks$: Observable<number> = this.todoList$.pipe(
    map((list) =>
      list.filter((todo) => todo.state === this.todoSate.COMPLETED)
    ),
    map((items) => items.length)
  );
  @ViewChild('todoInput') private todoInput: ElementRef;

  public ngOnInit() {}

  clearCompletedTasks($event: MouseEvent) {
    $event.preventDefault();
    let todoList = this.todoList.filter((todo) => {
      return todo.state !== this.todoSate.COMPLETED;
    });
    this._todoList.next(todoList);
  }
  toggleTodo($event) {
    let result: ITodoItem[];
    if ($event.target.checked) {
      result = this.todoList.map((todo) => {
        if (todo.id === $event.target.value) {
          todo.state = TodoState.COMPLETED;
        }
        return todo;
      });
    } else if (!$event.target.checked) {
      result = this.todoList.map((todo) => {
        if (todo.id === $event.target.value) {
          todo.state = TodoState.INCOMPLETE;
        }
        return todo;
      });
    }
    this._todoList.next(result);
  }
  deleteTodo($event, id: string) {
    $event.preventDefault();
    let result: ITodoItem[] = this.todoList.filter((todo) => {
      return todo.id !== id;
    });
    this._todoList.next(result);
  }

  ngOnChanges() {}

  private handleInputEnter(event) {
    event.preventDefault();
    this.todoList.push({
      id: uuid(),
      text: event.target.value,
      state: TodoState.INCOMPLETE,
    });
    event.target.value = null;
    this._todoList.next(this.todoList);
  }

  public ngAfterViewInit() {
    fromEvent(this.todoInput.nativeElement, 'keyup')
      .pipe(
        debounceTime(150),
        filter((e: KeyboardEvent) => e.keyCode === 13),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        this.handleInputEnter(event);
      });
  }

  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
