import express from "express";
import { json } from "express";
import { todos as initialTodos } from "./mock_data.js";

let todos = initialTodos;

const app = express();
const PORT = 3001;

app.use(json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.get("/todos", (req, res) => res.status(200).send(todos));

//Middleware to check if todo with specific id exists (implemented the better way)

const checkIfIDExists = (req, res, next) => {
  const id = JSON.parse(req.params.id);
  const todo = todos.find((todo) => todo.id == id);
  if (!todo) {
    res.status(404).send("Can't find the specified todo");
  }
  next();
};

app.get("/todos/:id", checkIfIDExists, (req, res) => {
  const id = JSON.parse(req.params.id);
  const todo = todos.find((todo) => todo.id == id);
  //   if (todo) {
  //     res.status(200).send(todo);
  //   } else {
  //     res.status(404).send("Can't find the specified todo");
  //   }
  res.status(200).send(todo);
});

app.delete("/todos/:id", checkIfIDExists, (req, res) => {
  if (todos.length == 0) {
    res.status(422).send("No todos left");
  }
  const id = JSON.parse(req.params.id);

  //   res.send(id);
  let updatedTodos = JSON.stringify(todoDeleteHandler(id));
  let response = `Todo with id: ${id} has been deleted.
  Here is the new list of todos: ", ${updatedTodos}
  `;
  //   res.status(204).send(response); //this doesn't show content
  res.status(200).send(response);
});

//another way to handle queries instead of params (redundant for now)

app.delete("/todos", checkIfIDExists, (req, res) => {
  if (todos.length == 0) {
    res.status(422).send("No todos left");
  }
  const id = req.query.id;
  let updatedTodos = JSON.stringify(todoDeleteHandler(id));
  let response = `Todo with id: ${id} has been deleted.
  Here is the new list of todos: ", ${updatedTodos}
  `;
  res.status(204).send(response);
});

//middleware to check the todo from the post request (implementing this using the new method on the documentation)
const validateTask = (req, res, next) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).send("Title and description are required");
  }

  next();
};

app.use(validateTask);

//create a todo
app.post("/todos", (req, res) => {
  //   console.log("this is the body", req.body);

  const { title, description } = req.body;
  const id = todos.length + 1; //this is not the best thing, but just for the sake of it.
  const newTodo = { id, title, description, completionStatus: false };
  todos.push(newTodo);
  res.send(`Created new todo with ID ${id}`);
});
//end of middleware implementation the documentation method

//update a todo
app.put("/todos/:id", checkIfIDExists, (req, res) => {
  const id = JSON.parse(req.params.id);
  const { title, description, completionStatus } = req.body;
  const todo = todos.find((todo) => todo.id === id);
  //   if (todo) {
  todo.title = title || todo.title;
  todo.completionStatus = completionStatus || todo.completionStatus;
  todo.description = description || todo.description;
  res.send(`Updated todo with ID ${id}`);
  //   } else {
  //     res.status(404).send("Todo not found");
  //   }
});

const todoDeleteHandler = (id) => {
  todos = todos.filter((todo) => todo.id != id);
  return todos;
};

app.listen(PORT, () => {
  console.log(`Having a party on port ${PORT}`);
});
