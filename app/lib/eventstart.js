//Posibly encapsulate any datefrom eventStart.html into functions
$(document).on("click", "#events_submit", begin_check);
function begin_check(e) {
  var event = new Event("proper_event");
  e.currentTarget.dispatchEvent(event);
}
