const getTodos = function (url) {
	return new Promise(function (resolve, reject) {
		const xhr = new XMLHttpRequest();

		xhr.open('get', url, true);
		xhr.responseType = 'json';

		xhr.onload = function () {
			let status = xhr.status;

			if (status === 200) {
				resolve(xhr.response)
			} else {
				reject(status)
			}
		}
		xhr.send();
	})
}

const createUpdatedTodos = function (url, type, data) {
	return new Promise(function (resolve, reject) {
		const xhr = new XMLHttpRequest();
		xhr.open(type, url, true);

		xhr.setRequestHeader(
			'Content-type', 'application/json; charset=utf-8'
		);

		xhr.responseType = 'json';

		xhr.onload = function () {
			let status = xhr.status;

			if (status === 201) {
				resolve(xhr.response);
			} else {
				reject(status)
			}
		};
		xhr.onerror = function () {
			reject("Error fetching " + url);
		};
		xhr.send(data);
	});
};

const removeTodos = function (id) {
	return new Promise(function (resolve, reject) {
		const xhr = new XMLHttpRequest();

		xhr.open('delete', url, true);
		xhr.response = 'json';

		xhr.setRequestHeader(
			'Content-type', 'application/json; charset=utf-8'
		);

		xhr.onload = function () {
			resolve(xhr.response);
		};

		xhr.onerror = function (e) {
			reject("Error fetching " + url);
		};
		xhr.send()
	})
}

class TodoList {
	constructor(el) {
		this.el = el;
		this.todos = [];
		this.list = el.children.namedItem('list')
		this.input = el.children.namedItem('input')

		this.el.addEventListener('click', (event) => {
			switch (event.target.dataset.action) {
				case 'set-status': {
					this.changeStatus(event.target.closest('li').dataset.id)
					break;
				}
				case 'delete-task': {
					this.deleteTodo(event.target.closest('li').dataset.id)
					break;
				}
				case 'create': {
					if (this.input.value !== '') {
						todo1.addTodo(new Task(this.input.value, false))
					}
					break;
				}
				case 'find': {
					if (this.input.value !== '') {
						todo1.findTaskFromList(input.value)
					}
					break;
				}
				case 'move-up': {
					this.moveUp(event.target.closest('li').dataset.id)
				}
				break;
			case 'move-down': {
				this.moveDown(event.target.closest('li').dataset.id)
			}
			}
		})
	}

	getTodoOnPage() {
		getTodos(' http://localhost:3000/todos')
			.then((element) => {
				element.map((e) => {
					this.todos.push(e);
				})
				this.render(this.todos);
			})
			.catch((error) => console.warn(error))
	}

	addTodo(todo) {
		createUpdatedTodos('http://localhost:3000/todos', 'post', JSON.stringify(todo))
			.catch((error) => console.warn(error))
		this.todos.push(todo);
		this.render(this.todos);
	}

	deleteTodo(id) {
		let index = this.todos.findIndex((element) => element.id === id);
		removeTodos(`http://localhost:3000/todos/${this.todos[index].id}`)
			.catch((error) => console.warn(error));
		this.todos = this.todos.filter((el) => el.id !== id);
		this.render(this.todos);
	}

	getTodos() {
		return this.todos;
	}

	findTaskFromList(value) {
		this.render(this.todos.filter(el => el.value.includes(value)))
	}

	changeStatus(id) {
		let index = this.todos.findIndex((el) => el.id === id);
		this.todos[index].status = !this.todos[index].status;
		createUpdatedTodos(`http://localhost:3000/todos/${this.todos[index].id}`, 'PATCH', JSON.stringify({
				'value': this.todos[index].value,
				'status': this.todos[index].status ? true : false,
				'id': this.todos[index].id
			}))
			.catch((error) => console.warn(error))
		this.render(this.todos);
	}

	moveUp(id) {
		let index = this.todos.findIndex((el) => el.id === id);
		if (index !== 0) {
			let el = this.todos[index];
			this.todos[index] = this.todos[index - 1];
			this.todos[index - 1] = el;
		}
		this.render(this.todos)
	}

	moveDown(id) {
		let index = this.todos.findIndex((el) => el.id === id);
		if (index < this.todos.length - 1) {
			let el = this.todos[index];
			this.todos[index] = this.todos[index + 1];
			this.todos[index + 1] = el;
		}
		this.render(this.todos)
	}

	render(todos = []) {
		let lis = '';
		for (let el of todos) {
			if (!el) {
				return;
			}
			let taskStatus = el.status ? 'status-done' : 'set-in-process';
			lis +=
				`<li data-id="${el.id}" class="${taskStatus}">${el.value}<button class="set-status" data-action="set-status">Change status</button><button class="delete-task" data-action="delete-task">Delete</button><button class="move-up" data-action="move-up">Move Up</button><button class="move-down" data-action="move-down">Move Down</button></li>`;
		}
		this.list.innerHTML = lis;
	}
}

class Task {
	constructor(value, status) {
		this.value = value;
		this.status = status;
		this.id = Math.random().toString(36).substr(2, 9);
	}
}

let ourTodos = document.querySelector('.container');

let todo1 = new TodoList(ourTodos);
todo1.getTodoOnPage();