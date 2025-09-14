/* A builder class to simplify the task of creating HTML elements */
class ElementCreator {
  constructor(tag) {
    this.element = document.createElement(tag);
  }

  id(id) {
    this.element.id = id;
    return this;
  }

  class(clazz) {
    this.element.class = clazz;
    return this;
  }

  text(content) {
    this.element.innerHTML = content;
    return this;
  }

  with(name, value) {
    this.element.setAttribute(name, value);
    return this;
  }

  listener(name, listener) {
    this.element.addEventListener(name, listener);
    return this;
  }

  append(child) {
    child.appendTo(this.element);
    return this;
  }

  prependTo(parent) {
    parent.prepend(this.element);
    return this.element;
  }

  appendTo(parent) {
    parent.append(this.element);
    return this.element;
  }

  insertBefore(parent, sibling) {
    parent.insertBefore(this.element, sibling);
    return this.element;
  }

  replace(parent, sibling) {
    parent.replaceChild(this.element, sibling);
    return this.element;
  }
}

/* A class representing a resource. This class is used per default when receiving the
   available resources from the server (see end of this file).
   You can (and probably should) rename this class to match with whatever name you
   used for your resource on the server-side.
 */
class Resource {
  /* If you want to know more about this form of getters, read this:
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get */
  get idforDOM() {
    return `resource-${this.id}`;
  }
}

function add(resource, sibling) {
  const creator = new ElementCreator("article").id(resource.idforDOM);

  /* Task 2: Instead of the name property of the example resource, add the properties of
       your resource to the DOM. If you do not have the name property in your resource,
       start by removing the h2 element that currently represents the name. For the 
       properties of your object you can use whatever html element you feel represents
       your data best, e.g., h2, paragraphs, spans, ... 
       Also, you don't have to use the ElementCreator if you don't want to and add the
       elements manually. */

  // Display name
  creator.append(new ElementCreator("h2").text(`Name: ${resource.name}`));
  // Display age
  creator.append(new ElementCreator("p").text(`Age: ${resource.age}`));
  // Display isActive as yes/no
  creator.append(
    new ElementCreator("p").text(`Active: ${resource.isActive ? "Yes" : "No"}`)
  );
  // Display formatted createdAt date
  const formattedDate = new Date(resource.createdAt).toLocaleDateString(
    "de-DE"
  );
  creator.append(new ElementCreator("p").text(`Created: ${formattedDate}`));

  creator
    .append(
      new ElementCreator("button").text("Edit").listener("click", () => {
        edit(resource);
      })
    )
    .append(
      new ElementCreator("button")
        .text("Remove")
        .listener("click", async () => {
          try {
            const response = await fetch(`/api/persons/${resource.id}`, {
              method: "DELETE",
            });
            if (response.ok) {
              // Only remove from DOM after the server confirms deletion
              remove(resource);
            } else {
              console.error(`Failed to delete resource with id ${resource.id}`);
              alert("Delete failed on the server!");
            }
          } catch (error) {
            console.error("Error deleting resource:", error);
            alert("Error connecting to server!");
          }
        })
    );

  const parent = document.querySelector("main");

  if (sibling) {
    creator.replace(parent, sibling);
  } else {
    creator.insertBefore(parent, document.querySelector("#bottom"));
  }
}

function edit(resource) {
  const formCreator = new ElementCreator("form")
    .id(resource.idforDOM)
    .append(new ElementCreator("h3").text("Edit " + resource.name));

  /* Task 4 - Part 1: Instead of the name property, add the properties your resource has here!
       The label and input element used here are just an example of how you can edit a
       property of a resource, in the case of our example property name this is a label and an
       input field. Also, we assign the input field a unique id attribute to be able to identify
       it easily later when the user saves the edited data (see Task 4 - Part 2 below). 
    */

  // Name input
  formCreator
    .append(
      new ElementCreator("label").text("Name").with("for", "resource-name")
    )
    .append(
      new ElementCreator("input")
        .id("resource-name")
        .with("type", "text")
        .with("value", resource.name)
    );

  // Age input
  formCreator
    .append(new ElementCreator("label").text("Age").with("for", "resource-age"))
    .append(
      new ElementCreator("input")
        .id("resource-age")
        .with("type", "number")
        .with("value", resource.age)
    );

  // Boolean isActive checkbox
  formCreator
    .append(
      new ElementCreator("label").text("Active").with("for", "resource-active")
    )
    .append(
      new ElementCreator("input")
        .id("resource-active")
        .with("type", "checkbox")
        .with("checked", resource.isActive ? "checked" : null)
    );

  // Date input (optional, formatted as yyyy-mm-dd)
  const dateValue = new Date(resource.createdAt).toISOString().split("T")[0];
  formCreator
    .append(
      new ElementCreator("label").text("Created").with("for", "resource-date")
    )
    .append(
      new ElementCreator("input")
        .id("resource-date")
        .with("type", "date")
        .with("value", dateValue)
    );

  /* In the end, we add the code to handle saving the resource on the server and terminating edit mode */
  formCreator
    .append(
      new ElementCreator("button")
        .text("Speichern")
        .listener("click", async (event) => {
          /* Why do we have to prevent the default action? Try commenting this line. */
          event.preventDefault(); // prevents the form’s default submission, it is handled by our own code so we don't want the default thing

          /* The user saves the resource.
               Task 4 - Part 2: We manually set the edited values from the input elements to the resource object. 
               Again, this code here is just an example of how the name of our example resource can be obtained
               and set in to the resource. The idea is that you handle your own properties here.
            */
          resource.name = document.getElementById("resource-name").value;
          resource.age = parseInt(
            document.getElementById("resource-age").value
          );
          resource.isActive =
            document.getElementById("resource-active").checked;
          resource.createdAt = document.getElementById("resource-date").value;

          /* Task 4 - Part 3: Call the update endpoint asynchronously. Once the call returns successfully,
               use the code below to remove the form we used for editing and again render 
               the resource in the list.
            */
          try {
            const response = await fetch(`/api/persons/${resource.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(resource),
            });
            
            if (response.ok) {
              console.log(response)
              const updatedResource = await response.json();

              // Re-render the resource in the DOM with updated values
              add(updatedResource, document.getElementById(resource.idforDOM));
            } else {
              alert("Failed to update resource on the server.");
            }
          } catch (error) {
            console.error("Error updating resource:", error);
            alert("Error connecting to the server!");
          }
        })
    )
    .replace(
      document.querySelector("main"),
      document.getElementById(resource.idforDOM)
    );
}

function remove(resource) {
  document.getElementById(resource.idforDOM).remove();
}

/* Task 5 - Create a new resource is very similar to updating a resource. First, you add
   an empty form to the DOM with the exact same fields you used to edit a resource.
   Instead of PUTing the resource to the server, you POST it and add the resource that
   the server returns to the DOM (Remember, the resource returned by the server is the
    one that contains an id).
 */
function create() {
  // needed to hide container after new person is created
  const formContainer = new ElementCreator("div").id("create-form-container")

  const formCreator = new ElementCreator("form").append(
    new ElementCreator("h3").text("Create New Person")
  );

  // Input fields (same as edit)
  formCreator
    .append(new ElementCreator("label").text("Name").with("for", "resource-name"))
    .append(new ElementCreator("input").id("resource-name").with("type", "text"));

  formCreator
    .append(new ElementCreator("label").text("Age").with("for", "resource-age"))
    .append(
      new ElementCreator("input").id("resource-age").with("type", "number")
    );

  formCreator
    .append(
      new ElementCreator("label").text("Active").with("for", "resource-active")
    )
    .append(
      new ElementCreator("input").id("resource-active").with("type", "checkbox")
    );

  formCreator
    .append(
      new ElementCreator("label").text("Created").with("for", "resource-date")
    )
    .append(
      new ElementCreator("input")
        .id("resource-date")
        .with("type", "date")
        .with("value", new Date().toISOString().split("T")[0])
    ); // default date today

  // Save button
  formCreator
    .append(
      new ElementCreator("button")
        .text("Create")
        .listener("click", async (event) => {
          event.preventDefault();

          // Build the new resource object from inputs
          const newResource = {
            name: document.getElementById("resource-name").value,
            age: parseInt(document.getElementById("resource-age").value),
            isActive: document.getElementById("resource-active").checked,
            createdAt: document.getElementById("resource-date").value,
          };

          try {
            const response = await fetch(`/api/persons`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newResource),
            });

            if (response.ok) {
              const createdResource = await response.json();
              // Add the new resource to the DOM
              add(createdResource);

              // removes create container since it was added successfully
              document.getElementById("create-form-container").remove();
            } else {
              alert("Failed to create resource on the server.");
            }
          } catch (error) {
            console.error("Error creating resource:", error);
            alert("Error connecting to the server!");
          }
        })
    )


    formContainer.append(formCreator);
    formContainer.insertBefore(document.querySelector('main'), document.querySelector('#bottom'));
}

document.addEventListener("DOMContentLoaded", function (event) {
  fetch("/api/persons")
    .then((response) => response.json())
    .then((persons) => {
      for (const resource of persons) { 
        add(Object.assign(new Resource(), resource));
      }
    });
});
