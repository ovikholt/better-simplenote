
function setupKeyboardShortcuts(calculateTimecards) {
  document.removeEventListener('keydown', f);
  var f = function(event){
    /* t for 'timecards' */
    var doCalculateTimecards=(event.metaKey&&event.altKey)&&event.keyCode===84;/*t*/
    if(doCalculateTimecards){
      calculateTimecards();
      event.preventDefault();
    }
  };
  document.addEventListener('keydown', f);
}

module.exports = setupKeyboardShortcuts;
