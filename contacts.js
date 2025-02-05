function groups(contact) {
  if (contact.groups().length > 1) {
    return "Tags:\n" + contact
      .groups()
      .map(g => g.name())
      .filter(g => g != "Address Book")
      .map(g => `- ${g}`)
      .join("\n")
  }
  else { return null }
}

function stripD(str) {
  return str.replaceAll(/(?:_\$!<)|(?:>!\$_)/g, '');
}

function exists(contact, key, label) {
  return null
  if (contact.callableFunction(key)) {
    return `${label}: ${contact[key]()}`
  } else {
    return null
  }
}

function relatedNames(contact) {
  let related = contact.relatedNames();

  if (related.length > 0) {
    return `Related:\n${related.map(r => `- ${stripD(r.label())}: [[${r.value()}]]`).join("\n")}`
  }
  else {
    return null;
  }
}

// https://developer.apple.com/library/archive/documentation/LanguagesUtilities/Conceptual/MacAutomationScriptingGuide/ReadandWriteFiles.html
// https://stackoverflow.com/questions/29076947/jxa-set-utf-8-encoding-when-writing-files
function writeTextToFile(text, file) {
    try {

        // Convert the file to a string
        // var fileString = file.toString()
        var str = $.NSString.alloc.initWithUTF8String(text);
        str.writeToFileAtomicallyEncodingError(file, true, $.NSUTF8StringEncoding, null)

        // Return a boolean indicating that writing was successful
        return true
    }
    catch(error) {
        // Return a boolean indicating that writing was successful
        return false
    }
}

function dateReplacer(match, p1, offset, string) {
  // Split the matched date string into components
  const [month, day, year] = match.split('/');
  
  // Convert 2-digit year to 4-digit year
  const fullYear = year.length === 2 ? '20' + year : year;
  
  // Pad month and day with leading zeros if necessary
  const paddedMonth = month.padStart(2, '0');
  const paddedDay = day.padStart(2, '0');
  
  // Return formatted date string
  return `[[${fullYear}-${paddedMonth}-${paddedDay}]]`;
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

        let headers = [
          `First Name: ${contact.firstName()}`,
          `Last Name: ${contact.lastName()}`,
          `Cardhop: x-cardhop://show?contact=${contact.firstName()}%20${contact.lastName()}`,
          groups(contact)
        ]

        let footers = [
          exists(contact, "organization", "Organization"),
          relatedNames(contact)
        ]

    note = contact.note().replaceAll(/(\d{1,2})\/(\d{1,2})\/(\d{1,2})/g, dateReplacer)

        let CRM =
`---
${headers.filter(x => x).join("\n")}
---

# ${fullName}

${note}

${footers.filter(x => x).join("\n")}`;

        let file = app.pathTo("home folder", { from: "user domain" }).toString() + `/Desktop/contacts/${fullName}.md`;
        writeTextToFile(CRM, file)

        visited << fullName;
      }
    }
  }
})();
