const socket = io("ws://localhost:3500");
const msgInput = document.querySelector("#message");
const nameInput = document.querySelector("#name");
const chatRoom = document.querySelector("#room");
const activity = document.querySelector(".activity");
const usersList = document.querySelector(".user-list");
const roomList = document.querySelector(".room-list");
const chatDisplay = document.querySelector(".chat-display");
//  for creating private and public keys
let privateKey;
let publicKey;
let roomKeys = {};

async function generateKeyPair() {
  const { privateKey, publicKey } = await openpgp.generateKey({
    type: "rsa",
    rsaBits: 2048,
    userIDs: [
      { name: nameInput.value, email: `${nameInput.value}@example.com` },
    ],
    format: "armored",
  });

  return {
    privateKey: await openpgp.readPrivateKey({ armoredKey: privateKey }),
    publicKey: await openpgp.readKey({ armoredKey: publicKey }),
  };
}

async function enterRoom(e) {
  e.preventDefault();
  if (nameInput.value && chatRoom.value) {
    const keys = await generateKeyPair();
    privateKey = keys.privateKey;
    publicKey = keys.publicKey;
    socket.emit("enterRoom", {
      name: nameInput.value,
      room: chatRoom.value,
      publicKey: publicKey.armor(),
    });
    document.querySelector(".leaveroom").classList.remove("hidden");
  }
}

// Modify the sendMessage function

async function sendMessage(e) {
  e.preventDefault();
  if (nameInput.value && msgInput.value && chatRoom.value) {
    const message = await openpgp.createMessage({ text: msgInput.value });
    const encryptionKeys = await Promise.all(Object.values(roomKeys));
    const encryptedMsg = await openpgp.encrypt({
      message: message,
      encryptionKeys: encryptionKeys,
    });

    socket.emit("message", {
      name: nameInput.value,
      text: encryptedMsg,
    });
    msgInput.value = "";
  }
  msgInput.focus();
}

document.querySelector(".form-msg").addEventListener("submit", sendMessage);

document.querySelector(".form-join").addEventListener("submit", enterRoom);

msgInput.addEventListener("keypress", () => {
  socket.emit("activity", nameInput.value);
});
// Listen for messages
socket.on("message", async (data) => {
  activity.textContent = "";
  const { name, text, time } = data;

  let decryptedText;
  if (name !== "Admin") {
    try {
      const message = await openpgp.readMessage({ armoredMessage: text });
      const { data: decrypted } = await openpgp.decrypt({
        message: message,
        decryptionKeys: privateKey,
      });
      decryptedText = decrypted;
      console.log(decryptedText);
    } catch (error) {
      console.error("Decryption error:", error);
      decryptedText = "Unable to decrypt message";
    }
  } else {
    decryptedText = text;
  }

  const li = document.createElement("li");
  li.className = "post";
  if (name === nameInput.value) li.className = "post post--left";
  if (name !== nameInput.value && name !== "Admin")
    li.className = "post post--right";
  if (name !== "Admin") {
    li.innerHTML = `<div class="post__header ${
      name === nameInput.value ? "post__header--user" : "post__header--reply"
    }">
        <span class="post__header--name">${name}</span> 
        <span class="post__header--time">${time}</span> 
        </div>
        <div class="post__text">${decryptedText}</div>`;
  } else {
    li.innerHTML = `<div class="post__text">${decryptedText}</div>`;
  }
  chatDisplay.appendChild(li);

  chatDisplay.scrollTop = chatDisplay.scrollHeight;
});
let activityTimer;
socket.on("activity", (name) => {
  activity.textContent = `${name} is typing...`;
  // Clear after 3 seconds
  clearTimeout(activityTimer);
  activityTimer = setTimeout(() => {
    activity.textContent = "";
  }, 3000);
});
socket.on("userList", async ({ users }) => {
  showUsers(users);
  // Update room keys
  roomKeys = {};
  for (const user of users) {
    if (user.publicKey) {
      roomKeys[user.id] = openpgp.readKey({ armoredKey: user.publicKey });
    }
  }
});

socket.on("roomList", ({ rooms }) => {
  showRooms(rooms);
});

function showUsers(users) {
  usersList.innerHTML = "";
  const userlist = document.createElement("div");
  userlist.className = "userheader";
  userlist.textContent = "User in current room:";
  usersList.appendChild(userlist);
  if (users) {
    users.forEach((user, i) => {
      const div = document.createElement("div");
      div.innerHTML = `<div><i class="fa-regular fa-user"></i>${user.name}</div>`;
      div.classList.add("currentusers");
      usersList.appendChild(div);
    });
  }
}

function showRooms(rooms) {
  roomList.innerHTML = "";
  const headlist = document.createElement("div");
  headlist.className = "activeheader";
  headlist.textContent = "Active Rooms:";
  roomList.appendChild(headlist);
  if (rooms) {
    rooms.forEach((room, i) => {
      const div = document.createElement("div");
      div.innerHTML = `<div><i class="fa-solid fa-users"></i>${room}<div/>`;
      div.classList.add("activerooms");
      roomList.appendChild(div);
    });
  }
  roomList.addEventListener("click", (e) => {
    if (chatRoom.value != e.target.textContent) {
      chatRoom.value = e.target.textContent;
      document.querySelector("#join").click();
    }
  });
}

document.querySelector(".leaveroom").addEventListener("click", (e) => {
  e.preventDefault(); // Prevent default action if any
  socket.emit("leaveRoom", {
    name: nameInput.value,
    room: chatRoom.value,
  });
  chatRoom.value = "";
  document.querySelector(".leaveroom").classList.add("hidden");
});
