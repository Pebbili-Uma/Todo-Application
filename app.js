const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let database = null;

const connectingToDatabase = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB ERROR: ${e.message}`);
    process.exit(1);
  }
};

connectingToDatabase();

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const SelectTodoQuery = `
    SELECT * FROM todo WHERE id = ${todoId};
    `;
  const dbTodo = await database.get(SelectTodoQuery);
  response.send(dbTodo);
});

//API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const createTodoQuery = `
    INSERT INTO todo (id, todo, priority, status) 
    VALUES (${id}, '${todo}', '${priority}', '${status}');
  `;
  await database.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo where id = ${todoId};`;
  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

//API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateQuery = null;
  if (request.body.todo !== undefined) {
    const todo = request.body.todo;
    updateQuery = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};`;
    await database.run(updateQuery);
    response.send("Todo Updated");
  } else if (request.body.status !== undefined) {
    const status = request.body.status;
    updateQuery = `UPDATE todo SET status = '${status}' WHERE id = ${todoId};`;
    await database.run(updateQuery);
    response.send("Status Updated");
  } else if (request.body.priority !== undefined) {
    const priority = request.body.priority;
    updateQuery = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId};`;
    await database.run(updateQuery);
    response.send("Priority Updated");
  }
});

//API 1
app.get("/todos/", async (request, response) => {
  const { status } = request.query;
  const { priority } = request.query;
  const { search_q } = request.query;
  let selectQuery;
  let todoList;
  if (status !== undefined && priority !== undefined) {
    selectQuery = `
        SELECT * FROM todo WHERE status = "${status}" AND priority = "${priority}";
      `;
    todoList = await database.all(selectQuery);
    response.send(todoList);
  } else if (status !== undefined && priority === undefined) {
    selectQuery = `
        SELECT * FROM todo WHERE status = "${status}";
      `;
    todoList = await database.all(selectQuery);
    response.send(todoList);
  } else if (priority !== undefined && status === undefined) {
    selectQuery = `
        SELECT * FROM todo WHERE priority = "${priority}";
      `;
    todoList = await database.all(selectQuery);
    response.send(todoList);
  } else if (search_q !== undefined) {
    selectQuery = `
        SELECT * FROM todo WHERE todo LIKE "%${search_q}%"
    `;
    todoList = await database.all(selectQuery);
    response.send(todoList);
  }
});
module.exports = app;
