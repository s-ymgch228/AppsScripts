let process_limit = 100;
let max_tries     = 100;

function mailCleanup() {

  archive_opened(7);

  trash_ndays(30);
  trash_ndays(60);
  trash_ndays(90);
}

function trash_ndays(days) {
  const query = 'NOT in:inbox label:trash' + days + ' older_than:' + days + 'd';

  var total = 0;
  var i = 0;
  for (i=0; i < max_tries; i++) {
    var mails = GmailApp.search(query, 0, process_limit);
    var n = mails.length;

    GmailApp.moveThreadsToTrash(mails);
    total += n;

    if (n < process_limit)
      break;
  }

  Logger.log("Trash" + days + ": " + total + " mails, (loop count=" + (i + 1) + ")");
}

function archive_opened(days) {
  const d = new Date
  const year = d.getFullYear();
  const query = 'in:inbox is:read older_than:' + days + 'd';

  var label = GmailApp.getUserLabelByName(year);
  if (label == null) {
    GmailApp.createLabel(year);
    label = GmailApp.getUserLabelByName(year);
    if (label == null) {
      Logger.log("couldn't create label: " + year);
      return;
    }
  }

  var total = 0;
  for (i=0; i < max_tries; i++) {
    var mails = GmailApp.search(query, 0, process_limit);
    var n = mails.length;

    if (n > 0) {
      label.addToThread(mails);
      GmailApp.moveThreadToArchive(mails);
    }
    total += n;
    if (n != process_limit)
      break;
  }

  Logger.log("archived " + total + " mails");
}
