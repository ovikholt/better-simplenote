// Lets you move lines up and down in app.simplenote.com using ALT+UP, ALT+DOWN keys.
// Also, can cut and copy lines by keeping cursor at a line and then CMD+X or CMD+C.

// Not implemented for Windows (CTRL+X) yet.
// Experimental code. No tests.
// Sometimes breaks the textarea undo (CTRL+Z) functionality.

// You might want to consider using the Ace Editor bookmarklet instead.

// Install by in Bookmark Manager, adding a bookmark and setting its URL to be
// javascript:(...), where (...) is the entire code below starting with (function(){ and so on.

function SetupMoveLines() {
  document.removeEventListener('keydown', f);
  var spl=function(s){
    if(s.length===0){return ['', ''];}
    var skipEndLine=s[s.length-1]==='\n';
    var searchFromIndex=s.length-(skipEndLine?2:1);
    if(searchFromIndex<0){
      return ['', s];
    }
    var i=s.lastIndexOf('\n',searchFromIndex);
    i+=1;
    var firstPart=s.slice(0, i);
    var lastLine=s.slice(i);
    return [firstPart, lastLine];
  };
  var spl2=function(s){
    if(s.length===0){return ['', ''];}
    var i=s.indexOf('\n');
    i+=1;
    var firstPart=s.slice(0, i);
    var lastLine=s.slice(i);
    return [firstPart, lastLine];
  };
  var navigation=function(event) {
    var pKey=Boolean(event.code === 'KeyP');
    var nKey=Boolean(event.code === 'KeyN');
    var selectPreviousDocument=event.altKey&&event.ctrlKey&&pKey;
    var selectNextDocument=event.altKey&&event.ctrlKey&&nKey;
    var goToSearch=event.altKey&&event.ctrlKey&&event.key==='/';
    var goToText=event.altKey&&event.ctrlKey&&event.key==='Enter';
    if (selectPreviousDocument) {
      var prev = document.querySelector('.notes li.selected').previousElementSibling;
      prev && prev.click();
      prev && prev.scrollIntoViewIfNeeded && prev.scrollIntoViewIfNeeded();
      event.preventDefault();
      return true;
    }
    if (selectNextDocument) {
      var next = document.querySelector('.notes li.selected').nextElementSibling;
      next && next.click();
      next && next.scrollIntoViewIfNeeded && next.scrollIntoViewIfNeeded();
      event.preventDefault();
      return true;
    }
    if (goToSearch) {
      document.querySelector('input.searchfield').select();
      event.preventDefault();
      return true;
    }
    if (goToText) {
      var textarea = document.querySelector('.note textarea#txtarea');
      textarea.select();
      textarea.setSelectionRange(0,0);
      event.preventDefault();
      return true;
    }
    return false;
  };
  var f=function(event){
    var navigated = navigation(event);
    if (navigated) {
      return;
    }

    var up=event.altKey&&event.keyCode===38;
    var down=event.altKey&&event.keyCode===40;
    var copy=(event.metaKey||event.ctrlKey)&&event.keyCode===67;/*c*/
    var cut=(event.metaKey||event.ctrlKey)&&event.keyCode===88;/*x*/
    if(!up&&!down&&!cut&&!copy) {return;}
    var t=event.target;
    var s=t.selectionStart;
    var e=t.selectionEnd;
    var flipped=false;
    if(e<s){
      var tmp=e;
      e=s;
      s=tmp;
      flipped=true;
    }
    var originalText=t.value;
    if(originalText.charAt(originalText.length-1)!=='\n'){
      originalText+='\n';
    }
    var searchFrom=s-1;
    if(s===0){
      var n=0;
    } else {
      var n=originalText.lastIndexOf('\n', s-1);
      n+=1;
      if(n<0){n=0;}
    }
    var linesAbove=originalText.slice(0, n);
    if(e>s&&originalText.charAt(e-1)==='\n'){
      var k=e;
    } else {
      var k=originalText.indexOf('\n', e);
      if(k===-1){k=originalText.length-1;}else{k+=1;}
    }
    var linesBelow=originalText.slice(k);
    var linesSelected=originalText.slice(n, k);
    var noSelection = (s===e);
    if(noSelection&&(cut||copy)){
      var line=originalText.slice(n, k);
      t.selectionStart=n;
      t.selectionEnd=k;
      if (copy) {
        document.execCommand('copy');
      } else {
        document.execCommand('cut');
        var lengthOfLineBelow=linesBelow.indexOf('\n');
        if (lengthOfLineBelow!==-1) {
          var column = s-n;
          var exceeds = column - lengthOfLineBelow;
          if (exceeds>0) {
            s -= exceeds;
          }
        }
      }
      t.selectionStart=t.selectionEnd=s;
      event.preventDefault();
      return;
    }
    if(up){
      var parts=spl(linesAbove);
      var newText='';
      newText=newText.concat(parts[0]);
      newText=newText.concat(linesSelected);
      newText=newText.concat(parts[1]);
      newText=newText.concat(linesBelow);
      t.value=newText;
      selectionStart=s-parts[1].length;
      selectionEnd=e-parts[1].length;
      t.selectionStart=flipped?selectionEnd:selectionStart;
      t.selectionEnd=flipped?selectionStart:selectionEnd;
      event.preventDefault();
    } else if(down){
      var parts=spl2(linesBelow);
      var newText='';
      newText=newText.concat(linesAbove);
      newText=newText.concat(parts[0]);
      newText=newText.concat(linesSelected);
      newText=newText.concat(parts[1]);
      t.value=newText;
      selectionStart=s+parts[0].length;
      selectionEnd=e+parts[0].length;
      t.selectionStart=flipped?selectionEnd:selectionStart;
      t.selectionEnd=flipped?selectionStart:selectionEnd;
      event.preventDefault();
    }
  };
  document.addEventListener('keydown', f);
}

module.exports = SetupMoveLines;
