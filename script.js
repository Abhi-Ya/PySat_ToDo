let currentUser = null;
let authMode = 'login'; // 'login' or 'register'

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    document.getElementById('todo-container').style.display = 'flex';
    document.getElementById('logout-btn').style.display = 'inline-block';
    loadTasks();
  } else {
    currentUser = null;
    document.getElementById('todo-container').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'none';
  }
});

function showLogin() {
  authMode = 'login';
  document.getElementById('popup-title').textContent = 'Login';
  document.getElementById('auth-popup').style.display = 'flex';
}

function showRegister() {
  authMode = 'register';
  document.getElementById('popup-title').textContent = 'Register';
  document.getElementById('auth-popup').style.display = 'flex';
}

function closePopup() {
  document.getElementById('auth-popup').style.display = 'none';
  document.getElementById('auth-email').value = '';
  document.getElementById('auth-password').value = '';
}

function submitAuth() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;

  if (authMode === 'login') {
    auth.signInWithEmailAndPassword(email, password)
      .then(closePopup)
      .catch(err => alert(err.message));
  } else {
    auth.createUserWithEmailAndPassword(email, password)
      .then(closePopup)
      .catch(err => alert(err.message));
  }
}

function logout() {
  auth.signOut();
}

function addTask(section) {
  const input = document.getElementById(`${section}-input`);
  if (!input.value.trim()) return;

  db.collection("users")
    .doc(currentUser.uid)
    .collection(section)
    .add({ text: input.value.trim(), timestamp: Date.now() });

  input.value = "";
}

function loadTasks() {
  ['urgent', 'tasks', 'goals'].forEach(section => {
    const list = document.getElementById(`${section}-list`);
    db.collection("users")
      .doc(currentUser.uid)
      .collection(section)
      .orderBy("timestamp")
      .onSnapshot(snapshot => {
        list.innerHTML = "";
        snapshot.forEach(doc => {
          const li = document.createElement("li");
          li.textContent = doc.data().text;

          const removeBtn = document.createElement("span");
          removeBtn.textContent = "Remove";
          removeBtn.classList.add("remove-btn");
          removeBtn.onclick = () => {
            db.collection("users")
              .doc(currentUser.uid)
              .collection(section)
              .doc(doc.id).delete();
          };

          li.appendChild(removeBtn);
          list.appendChild(li);
        });
      });
  });
}
