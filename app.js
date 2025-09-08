const toDoInput = document.querySelector("#toDoInput");
const addBtn = document.querySelector("#addBtn");
const clearBtn = document.querySelector("#clearBtn");
const toDoList = document.querySelector("#toDoList");
const taskCount = document.querySelector("#taskCount");
const filters = document.querySelector("#filters");
const errorMassage = document.querySelector(".errorMassage");
const template = document.querySelector("#todo-template");

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";

let currentPage = 1;
const tasksPerPage = 6;


const saveTodos = () => localStorage.setItem("todos", JSON.stringify(todos));

function showError(msg) {
  errorMassage.textContent = msg;
  errorMassage.classList.add("error-visible");
  setTimeout(() => {
    errorMassage.textContent = "";
    errorMassage.classList.remove("error-visible");
  }, 3000);
}

function getFilteredTodos() {
  switch (currentFilter) {
    case "active":
      return todos.filter((t) => !t.completed);
    case "completed":
      return todos.filter((t) => t.completed);
    default:
      return todos;
  }
}

function updateCount() {
  taskCount.textContent = `${getFilteredTodos().length} Görev`;
}

function addTodo() {
  const text = toDoInput.value.trim();
  if (!text) {
    showError("Görev boş olamaz!");
    return;
  }

  todos.push({ id: Date.now(), text, completed: false });
  saveTodos();
  toDoInput.value = "";
   currentPage = 1;
  renderTodos(true);
}

function renderTodos(animate = false) {
  const filteredTodos = getFilteredTodos();
  const totalPages = Math.ceil(filteredTodos.length / tasksPerPage) || 1;

  // Eğer mevcut sayfa geçersiz kaldıysa, bir önceki sayfaya geç
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const currentTodos = filteredTodos.slice(startIndex, endIndex);

  toDoList.innerHTML = "";

  currentTodos.forEach((todo) => {
    const clone = template.content.cloneNode(true);
    const li = clone.querySelector("li");

    const checkbox = li.querySelector(".check");
    const span = li.querySelector("span");
    const editBtn = li.querySelector(".edit-btn");
    const deleteBtn = li.querySelector(".delete-btn");

    checkbox.checked = todo.completed;
    checkbox.dataset.id = todo.id;
    span.textContent = todo.text;
    if (todo.completed) span.classList.add("done");

    editBtn.dataset.id = todo.id;
    deleteBtn.dataset.id = todo.id;

    if (animate) {
      li.classList.add("fadeIn");
      setTimeout(() => li.classList.remove("fadeIn"), 500);
    }

    toDoList.appendChild(li);
  });

  updateCount();
  renderPagination(filteredTodos.length);
}


function renderPagination(totalTasks) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(totalTasks / tasksPerPage);
  if (totalPages <= 1) return; 

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "‹";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    currentPage--;
    renderTodos();
  };
  pagination.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    if (i === currentPage) pageBtn.classList.add("active-page");
    pageBtn.onclick = () => {
      currentPage = i;
      renderTodos();
    };
    pagination.appendChild(pageBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "›";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    currentPage++;
    renderTodos();
  };
  pagination.appendChild(nextBtn);
}



toDoList.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest(".delete-btn");
  const editBtn = e.target.closest(".edit-btn");

  if (deleteBtn) {
    const id = parseInt(deleteBtn.dataset.id);
    todos = todos.filter((t) => t.id !== id);
    saveTodos();
    renderTodos();
    return;
  }

  if (editBtn) {
    const id = parseInt(editBtn.dataset.id);
    const li = editBtn.closest("li");
    const todo = todos.find((t) => t.id === id);

    const span = li.querySelector("span");
    const textarea = document.createElement("textarea");
    textarea.value = todo.text;
    textarea.className = "edit-input";

    span.replaceWith(textarea);
    editBtn.style.display = "none";

    const btnGroup = document.createElement("div");
    btnGroup.className = "edit-btn-group";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Kaydet";
    saveBtn.className = "save-btn";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "İptal";
    cancelBtn.className = "cancel-btn";

    btnGroup.append(saveBtn, cancelBtn);
    li.insertBefore(btnGroup, li.querySelector(".action-buttons"));

    textarea.focus();

    saveBtn.onclick = () => {
      const newText = textarea.value.trim();
      if (!newText) return showError("Görev boş olamaz!");
      todo.text = newText;
      saveTodos();
      renderTodos();
    };

    cancelBtn.onclick = () => renderTodos();

    textarea.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" && !ev.shiftKey) {
        ev.preventDefault();
        saveBtn.click();
      } else if (ev.key === "Escape") {
        cancelBtn.click();
      }
    });
  }
});

toDoList.addEventListener("change", (e) => {
  if (e.target.classList.contains("check")) {
    const id = parseInt(e.target.dataset.id);
    todos = todos.map((t) =>
      t.id === id ? { ...t, completed: e.target.checked } : t
    );
    saveTodos();
    renderTodos();
  }
});

filters.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    currentFilter = e.target.className;
    currentPage = 1;
    renderTodos();
  }
});

clearBtn.addEventListener("click", () => {
  const filtered = getFilteredTodos();

  if (filtered.length === 0) {
    showError("Silinecek görev bulunamadı.");
    return;
  }

  
  const filteredIds = filtered.map((t) => t.id);
  todos = todos.filter((t) => !filteredIds.includes(t.id));

  saveTodos();

  // Sayfa geçişi varsa, boş kalan sayfaya düşmeyi engelle
  const totalPages = Math.ceil(getFilteredTodos().length / tasksPerPage);
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }

  renderTodos();
});

addBtn.addEventListener("click", addTodo);

toDoInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTodo();
});

window.addEventListener("DOMContentLoaded", () => renderTodos());
