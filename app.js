const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbpath = path.join(__dirname, "todoApplication.db");
app.use(express.json());

let db = null;

const initialiseDbandServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running");
    });
  } catch (e) {
    console.log(`DB ERROR ${E.message}`);
  }
};

initialiseDbandServer();

const getobject = (each) => {
  return {
    id: each.id,
    todo: each.todo,
    priority: each.priority,
    status: each.status,
  };
};

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getquary2 = `SELECT * FROM todo WHERE id = ${todoId}`;
  const result = await db.get(getquary2);
  response.send(result);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postquary3 = `INSERT INTO todo(id, todo, priority, status)
   VALUES (
       ${id}, ${todo}, ${priority},${status}
   )
  `;
  const result3 = await db.run(postquary3);
  const todoId = result3.lastID;
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const update = "";

  const requestBody = request.body;

  switch (true) {
    case requestBody.status !== undefined:
      update = "Status";
      break;
    case requestBody.priority !== undefined:
      update = "Priority";
      break;
    case requestBody.todo !== undefined:
      update = "Todo";
      break;
  }
  const previousTodoquary = `SELECT * FROM todo WHERE id = ${todoId}`;
  const previoustodo = await db.get(previousTodoquary);

  const {
    todo = previoustodo.todo,
    priority = previoustodo.priority,
    status = previoustodo.status,
  } = request.body;

  const updateTodo = `UPDATE todo 
     SET 
        todo = ${todo},
        priority = ${priority},
        status = ${status}
  `;
  await db.run(updateTodo);
  response.send(`${update} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deletequary = `DELETE FROM todo WHERE ID = ${todoId}`;
  await db.run(deletequary);
  response.send("Todo Deleted");
});

module.exports = app;
