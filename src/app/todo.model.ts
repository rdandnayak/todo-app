
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
