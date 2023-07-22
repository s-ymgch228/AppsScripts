
function report() {
  var mailto = [ "to@test.mail" ];
  const d = new Date;
  const subject = "Mail report " + d.getFullYear() + "/" + d.getMonth()  + "/" + d.getDay() +
                  " " + d.getHours() + ":" + d.getMinutes();
  const nmails = 100;
  const limit = 10;
  const label_name = "reported";
  const query = "in:inbox NOT label:" + label_name; 

  var label = get_label(label_name);
  if (label == null)
    return;

  var year = get_label(d.getFullYear());
  if (year == null)
    return;

  var trash180 = get_label("trash180");
  if (trash180 == null)
    return;

  var label = GmailApp.getUserLabelByName(label_name);
  if (label == null) {
    GmailApp.createLabel(label_name);
    label = GmailApp.getUserLabelByName(label_name);
    if (label == null) {
      Logger.log("couldn't create label: " + label_name);
      return;
    }
  }

  for (var n = 0; n < limit; n++) {
    var body = new Array;
    var threads = GmailApp.search(query, 0, nmails);
    var l = threads.length;

    if (l == 0)
      break;

    for (var i in threads) {
      var messages = threads[i].getMessages();
      for (var j in messages) {
        var m = messages[j];
        s = "[" + i+", "+j + "]:" + m.getSubject() + " from " + m.getFrom(); 
        body.push(s);
      }
    }

    mailto.forEach(function sendmail(to){
      var mail = GmailApp.createDraft(to, subject, body.join("\n"));
      mail.send();
      Logger.log("sent to " + to  + " reported " + body.length + " mailes");
    })

    label.addToThreads(threads);
    year.addToThreads(threads);
    trash180.addToThreads(threads);

    GmailApp.moveThreadsToArchive(threads);
  }
}

function get_label(l) {
  var label = GmailApp.getUserLabelByName(l);
  if (label != null)
    return label;

  GmailApp.createLabel(l);
  label = GmailApp.getUserLabelByName(l);
  if (label == null) {
    Logger.log("couldn't create label " + l);
  } else {
    Logger.log("created label " + l);
  }

  return label;
}
