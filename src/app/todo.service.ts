import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { v1 as uuid } from 'uuid'

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
export class TodoService {
  constructor() {}
  public todoState = TodoState
  private _todoList = new BehaviorSubject([])
  public todoList$: Observable<ITodoItem[]> = this._todoList
    .asObservable()
    .pipe(tap((list) => (this.todoList = list)))
  public todoList: ITodoItem[] = []
  public remainingTasks$: Observable<number> = this.todoList$.pipe(
    map((list) =>
      list.filter((todo) => todo.state === this.todoState.INCOMPLETE)
    ),
    map((items) => items.length)
  )

  public completedTasks$: Observable<number> = this.todoList$.pipe(
    map((list) =>
      list.filter((todo) => todo.state === this.todoState.COMPLETED)
    ),
    map((items) => items.length)
  )

  clearCompletedTasks($event: Event) {
    $event.preventDefault()
    let todoList = this.todoList.filter((todo) => {
      return todo.state !== this.todoState.COMPLETED
    })
    this._todoList.next(todoList)
  }
  toggleTodo($event: Event) {
    const target: HTMLInputElement = $event.target as HTMLInputElement
    console.log($event)
    let result: ITodoItem[]
    if (target.checked) {
      result = this.todoList.map((todo) => {
        if (todo.id === target.value) {
          todo.state = TodoState.COMPLETED
        }
        return todo
      })
    } else if (!target.checked) {
      result = this.todoList.map((todo) => {
        if (todo.id === target.value) {
          todo.state = TodoState.INCOMPLETE
        }
        return todo
      })
    }
    this._todoList.next(result)
  }
  deleteTodo($event: Event, id: string) {
    $event.preventDefault()
    let result: ITodoItem[] = this.todoList.filter((todo) => {
      return todo.id !== id
    })
    this._todoList.next(result)
  }

  ngOnChanges() {}

  public handleInputEnter(event: Event) {
    event.preventDefault()
    const target = event.target as HTMLInputElement
    this.todoList.push({
      id: uuid(),
      text: target.value,
      state: TodoState.INCOMPLETE,
    })
    target.value = null
    this._todoList.next(this.todoList)
  }
}
