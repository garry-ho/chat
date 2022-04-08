const express = require("express");
const app = express();
const chalk = require("chalk");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const fs = require("fs");
const io = new Server(server);

const _log = console.log;
console.log = (...data) => {
  _log(...data);
  let logs = fs.readFileSync("logs.log").toString();
  logs += data.join(" ") + "\n";
  fs.writeFileSync("logs.log", logs);
};

function log(
  from,
  fromColour = chalk.reset,
  message,
  messageColour = chalk.reset
) {
  console.log(
    `${(typeof fromColour === "function" ? fromColour : chalk.hex(fromColour))(
      from
    )}${chalk.hex("#555555")(">")} ${(typeof messageColour === "function"
      ? messageColour
      : chalk.hex(messageColour))(message)}`
  );
}

const users = {};
const usercs = {};

io.on("connection", (socket) => {
  socket.on("user", (name) => {
    users[socket.id] = name.trim().replaceAll("\n", " ");
    usercs[socket.id] = Math.floor(Math.random() * 0xffffff);
    console.log(
      `${chalk.hex("#" + usercs[socket.id]?.toString(16) ?? "#ffffff")(
        users[socket.id]
      )} joined`
    );
    io.emit("message", [
      [users[socket.id], "#" + usercs[socket.id]?.toString(16)],
      [" joined", "black"],
    ]);
  });
  socket.on("message", (message) => {
    if (message.startsWith("/")) {
      console.log(
        `${chalk.hex("#" + usercs[socket.id]?.toString(16) ?? "#ffffff")(
          users[socket.id]
        )} uses ${message}`
      );
      const fcmd = message.slice(1);
      return;
    }
    if (users[socket.id] == null) return;
    message = message.trim().replaceAll("\n", " ");
    if (message === "") return;
    log(users[socket.id], "#" + usercs[socket.id]?.toString(16), message);
    io.emit("message", [
      [users[socket.id], "#" + usercs[socket.id]?.toString(16)],
      ["> ", "#555555"],
      [message, "black"],
    ]);
  });
  socket.on("disconnect", () => {
    if (users[socket.id] == null) return;
    console.log(
      `${chalk.hex("#" + usercs[socket.id]?.toString(16) ?? "#ffffff")(
        users[socket.id]
      )} left`
    );
    io.emit("message", [
      [users[socket.id], "#" + usercs[socket.id]?.toString(16)],
      [" left", "black"],
    ]);
    delete users[socket.id];
    delete usercs[socket.id];
  });
});

app.use(express.static("public"));

server.listen(80, () =>
  log("SERVER", "#ff0000", "Listening at http://localhost")
);
