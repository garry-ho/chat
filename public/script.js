const socket = io();

socket.emit("user", user);

document.querySelector("#send").addEventListener("click", () => {
  socket.emit("message", document.querySelector("#msg").value);
  document.querySelector("#msg").value = "";
});

socket.on("message", (parts) => {
  const div = document.createElement("div");
  for (const [message, colour] of parts) {
    const span = document.createElement("span");
    span.style.color = colour;
    span.innerText = message;
    div.appendChild(span);
  }
  document.querySelector("#msgs").appendChild(div);
});
