function groups(contact) {
  if (contact.groups) {
    return contact
      .groups()
      .map(g => g.name())
      .filter(g => g != "Address Book")
  }
  else { return null }
}

function stripD(str) {
  return str.replace(/[!$_]/, '')
}

function relatedNames(contact) {
  let related = contact.relatedNames();

  if (related.length > 0) {
    return `\nRelated:\n${related.map(r => `- ${stripD(r.label())}: [[${r.value()}]]\n`)}`
  }
  else {
    return null;
  }
}

function tags(contact) {
  if (contact.tags().length > 0) {
    return JSON.stringify(contact.tags())
  }
  else {
    return null;
  }
}

function meta(contact) {
  return [tags(contact), groups(contact), relatedNames(contact)]
         .filter(m => m != null)
         .join("\n")
}

// https://developer.apple.com/library/archive/documentation/LanguagesUtilities/Conceptual/MacAutomationScriptingGuide/ReadandWriteFiles.html
function writeTextToFile(text, file, overwriteExistingContent) {
    try {

        // Convert the file to a string
        var fileString = file.toString()

        // Open the file for writing
        var openedFile = app.openForAccess(Path(fileString), { writePermission: true })

        // Clear the file if content should be overwritten
        if (overwriteExistingContent) {
            app.setEof(openedFile, { to: 0 })
        }

        // Write the new content to the file
        app.write(text, { to: openedFile, startingAt: app.getEof(openedFile) })

        // Close the file
        app.closeAccess(openedFile)

        // Return a boolean indicating that writing was successful
        return true
    }
    catch(error) {

        try {
            // Close the file
            app.closeAccess(file)
        }
        catch(error) {
            // Report the error is closing failed
            console.log(`Couldn't close file: ${error}`)
        }

        // Return a boolean indicating that writing was successful
        return false
    }
}

(function() {
  let Contacts = Application("Contacts");
  app = Application.currentApplication()
  app.includeStandardAdditions = true;

  let visited = [];

  for (contact of Contacts.people()) {
    let fullName = `${contact.firstName()} ${contact.lastName()}`;
    if (contact.note() && contact.note() != null) {
      if (!contact.note().match("Address 1 - ") && contact.lastName() != null) {
        if (visited.includes(fullName)) {
          console.log("duplicate!")
        }

        console.log(`Processing: ${fullName}`)

        let CRM =
`---
First Name: ${contact.firstName()}
Last Name: ${contact.lastName()}
tags: ${JSON.stringify(groups(contact))}${relatedNames(contact)}
---

# ${fullName}

${contact.note()}`;

        var desktopString = app.pathTo("desktop").toString()
        let file = app.pathTo("home folder", { from: "user domain" }).toString() + `/Desktop/people/${fullName}.md`;
        writeTextToFile(CRM, file, true)

        visited << fullName;
      }
    }
  }
})();
