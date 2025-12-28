const routePrefix = document
  .querySelector("meta[name='routePrefix']")
  .getAttribute("content");

console.log(routePrefix);

for (let btn of document.getElementsByClassName("delete-link-btn")) {
  btn.addEventListener("click", (e) => {
    // Delete this link
    // TODO replace with likely a POST call to delete the given link via the ID
    e.target.parentElement.parentElement.remove();
  });
}

for (let btn of document.getElementsByClassName("add-link-btn")) {
  btn.addEventListener("click", (e) => {
    let thisBtn = e.target;
    // If either span elements are clicked in the button, set thisBtn to their parent which is the actual button
    if (thisBtn.tagName == "SPAN") thisBtn = thisBtn.parentElement;

    let form = document.createElement("form");

    let type = thisBtn.getAttribute("data-type");

    form.method = "POST";
    form.action = `${routePrefix}/create`;

    form.className = "px-2 border-b border-gray-800 py-4 bg-gray-800/30";

    // TODO: Update the "Add" button to actually submit the form
    form.innerHTML = `
        <div class="flex items-start gap-3">
          <div class="flex-1">
            <input type="hidden" name="type" value="${type}" />
            <input
              name="url"
              type="url"
              placeholder="Link URL"
              class="w-full bg-transparent text-blue-400 font-semibold mb-3 focus:outline-none placeholder-gray-600"
              autoFocus
            />
            <input
              name="description"
              type="text"
              placeholder="Description"
              class="w-full bg-transparent text-gray-400 text-sm focus:outline-none placeholder-gray-700"
            />
          </div>
        </div>
        <div class="flex gap-3 mt-4">
          <button
            class="submit-form-btn px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-500 transition-colors"
          >
            Add
          </button>
          <button
            class="cancel-form-btn px-5 py-2 text-gray-400 text-sm font-semibold hover:text-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>`;

    form.querySelector(".cancel-form-btn").addEventListener("click", (e) => {
      form.remove();
      thisBtn.style.display = "flex";
    });

    thisBtn.insertAdjacentElement("beforebegin", form);

    thisBtn.style.display = "none";
  });
}

document.querySelector(".export-btn").addEventListener("click", (e) => {
  // TODO: Generate initial content of weeknote
  // Something like the following:
  /**
   * ## Things I worked on
   *
   * * [create link 1](url)
   * * [create link 2](url)
   *
   * ## Things I consumed
   *
   * * [consume link 1](url)
   * * [consume link 2](url)
   */
});

document.querySelector(".clear-btn").addEventListener("click", (e) => {
  const result = confirm("Are you sure you want to clear all links?");
  if (result) {
    document.querySelectorAll(".link-item").forEach((item) => {
      item.remove();
    });
    // TODO: Send a POST request up to clear the database completely
  }
});
