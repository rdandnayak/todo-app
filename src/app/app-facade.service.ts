import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { map, take } from 'rxjs/operators'
import { v1 as uuid } from 'uuid'
import { TodoService } from './todo.service'

export enum TodoState {
  COMPLETED = 'COMPLETED',
  INCOMPLETE = 'INCOMPLETE',
}

export interface ITodoItem {
  id: string
  text: string
  state: TodoState
}

export interface IStore {
  todoList: ITodoItem[]
}

@Injectable()
export class AppFacadeService {
  constructor(private todoService: TodoService) {}
  public todoState: typeof TodoState = TodoState
  private _todoList = new BehaviorSubject([])
  public todoList$: Observable<ITodoItem[]> = this._todoList.asObservable()
  public remainingTasks$: Observable<number> = this.todoList$.pipe(
    map(
      (list) =>
        list.filter((todo) => todo.state === this.todoState.INCOMPLETE).length
    )
  )
  public completedTasks$: Observable<number> = this.todoList$.pipe(
    map(
      (list) =>
        list.filter((todo) => todo.state === this.todoState.COMPLETED).length
    )
  )

  private getLatestTodoList(): Observable<ITodoItem[]> {
    return this.todoList$.pipe(take(1))
  }

  clearCompletedTasks($event: Event) {
    $event.preventDefault()
    this.getLatestTodoList().subscribe((list) => {
      let todoList = list.filter((todo) => {
        return todo.state !== this.todoState.COMPLETED
      })
      this._todoList.next(todoList)
    })
  }
  toggleTodo($event: Event) {
    this.getLatestTodoList().subscribe((todoList) => {
      const target: HTMLInputElement = $event.target as HTMLInputElement
      let result: ITodoItem[]
      if (target.checked) {
        result = todoList.map((todo) => {
          if (todo.id === target.value) {
            todo.state = TodoState.COMPLETED
          }
          return todo
        })
      } else if (!target.checked) {
        result = todoList.map((todo) => {
          if (todo.id === target.value) {
            todo.state = TodoState.INCOMPLETE
          }
          return todo
        })
      }
      this._todoList.next(result)
    })
  }
  deleteTodo($event: Event, id: string) {
    $event.preventDefault()
    this.getLatestTodoList().subscribe((todoList) => {
      let result: ITodoItem[] = todoList.filter((todo) => {
        return todo.id !== id
      })
      this._todoList.next(result)
    })
  }

  ngOnChanges() {}

  public handleInputEnter(event: Event) {
    event.preventDefault()
    const target = event.target as HTMLInputElement
    this.getLatestTodoList().subscribe((todoList) => {
      todoList.push({
        id: uuid(),
        text: target.value,
        state: TodoState.INCOMPLETE,
      })
      target.value = null
      this._todoList.next(todoList)
    })
  }
}
