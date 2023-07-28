const process_limit = 100;
const max_tries     = 100;

function mailCleanup() {

  archive_opened(10);

  trash_ndays(30);
  trash_ndays(60);
  trash_ndays(90);
}

function trash_ndays(days) {
  const query = 'NOT in:inbox label:trash' + days + ' older_than:' + days + 'd';

  let total = 0;
  let i;
  for (i = 0; i < max_tries; i++) {
    let mails = GmailApp.search(query, 0, process_limit);
    let n = mails.length;

    if (n <= 0)
      break;

    Logger.log("trash" + days + ": trash " + n + " mails");
    GmailApp.moveThreadsToTrash(mails);
  }

  Logger.log("Trash" + days + ": " + total + " mails, (loop count=" + (i + 1) + ")");
}

function archive_opened(days) {
  const d = new Date
  const year = d.getFullYear();
  let query = 'in:inbox is:read';
  if (days > 0)
    query += 'older_than:' + days + 'd';

  let label = GmailApp.getUserLabelByName(year);
  if (label == null) {
    GmailApp.createLabel(year);
    label = GmailApp.getUserLabelByName(year);
    if (label == null) {
      Logger.log("couldn't create label: " + year);
      return;
    }
  }

  var total = 0;
  for (let i = 0; i < max_tries; i++) {
    let mails = GmailApp.search(query, 0, process_limit);
    let n = mails.length;

    if (n <= 0)
      break;

    Logger.log("archived " + n + " mails");
    label.addToThreads(mails);
    GmailApp.moveThreadsToArchive(mails);
    total += n;
  }

  Logger.log("archived " + total + " mails");
}
