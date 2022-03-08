import {
  Component,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnInit,
  ElementRef,
  OnChanges,
} from '@angular/core'
import { TodoService, TodoState } from './todo.service'
import {
  fromEvent,
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
} from 'rxjs'
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent
  implements AfterViewInit, OnDestroy, OnInit, OnChanges
{
  constructor(private facade: TodoService) {}
  public todoList$ = this.facade.todoList$
  public remainingTasks$ = this.facade.remainingTasks$
  public completedTasks$ = this.facade.completedTasks$
  public todoSate = this.facade.todoState
  public title = 'Todo List App'
  private destroy$: Subject<boolean> = new Subject()
  @ViewChild('todoInput') private todoInput: ElementRef

  public ngOnInit() {}

  ngOnChanges() {}

  public ngAfterViewInit() {
    fromEvent(this.todoInput.nativeElement, 'keyup')
      .pipe(
        debounceTime(150),
        filter((e: KeyboardEvent) => e.keyCode === 13),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        this.facade.handleInputEnter(event)
      })
  }

  toggleTodo($event: Event) {
    this.facade.toggleTodo($event)
  }
  deleteTodo($event: Event, id: string) {
    this.facade.deleteTodo($event, id)
  }
  clearCompletedTasks($event: Event) {
    this.facade.clearCompletedTasks($event)
  }

  public ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
