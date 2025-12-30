let routePrefix = document
  .querySelector("meta[name='routePrefix']")
  .getAttribute("content");

if (routePrefix === "/") {
  routePrefix = "";
}

for (let btn of document.getElementsByClassName("delete-link-btn")) {
  btn.addEventListener("click", async (e) => {
    let linkArticleElement = e.target.parentElement.parentElement;

    let linkId = linkArticleElement.getAttribute("data-link-id");

    console.log(`Going to delete ${linkId}`);

    await fetch(`${routePrefix}/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: linkId }),
    });

    linkArticleElement.remove();
  });
}

for (let btn of document.getElementsByClassName("add-link-btn")) {
  btn.addEventListener("click", (e) => {
    let thisBtn = e.target;
    // If either span elements are clicked in the button, set thisBtn to their parent which is the actual button
    if (thisBtn.tagName == "SPAN") thisBtn = thisBtn.parentElement;

    let form = document.createElement("form");

    let type = thisBtn.getAttribute("data-type");

    form.setAttribute("autocomplete", "off");

    form.method = "POST";
    form.action = `${routePrefix}/create`;

    form.className = "px-2 border-b border-gray-800 py-4 bg-gray-800/30";

    form.innerHTML = `
        <div class="flex items-start gap-3">
          <div class="flex-1">
            <input type="hidden" name="type" value="${type}" />
            <input
              name="url"
              type="url"
              required="true"
              placeholder="Link URL"
              class="w-full bg-transparent text-gray-300 font-semibold mb-3 focus:outline-none placeholder-gray-600"
              autoFocus
            />
            <input
              name="description"
              type="text"
              required="true"
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

    form.querySelector(".cancel-form-btn").addEventListener("click", () => {
      form.remove();
      thisBtn.style.display = "flex";
    });

    thisBtn.insertAdjacentElement("beforebegin", form);

    thisBtn.style.display = "none";
  });
}

document.querySelector(".export-btn").addEventListener("click", async () => {
  const links = await fetch(`${routePrefix}/links`).then((resp) => resp.json());

  await navigator.clipboard.writeText(`## Things I worked on

${links.create
  .map((link) => {
    return `- [${link.description}](${link.url})`;
  })
  .join("\n")}

## Things I consumed

${links.consume
  .map((link) => {
    return `- [${link.description}](${link.url})`;
  })
  .join("\n")}`);

  console.log("Saved to clipboard!");
});

document.querySelector(".clear-btn").addEventListener("click", async () => {
  const result = confirm("Are you sure you want to clear all links?");
  if (result) {
    document.querySelectorAll(".link-item").forEach((item) => {
      item.remove();
    });

    await fetch(`${routePrefix}/delete-all`, {
      method: "POST",
    });
  }
});
