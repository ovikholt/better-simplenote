const debounce = require('./underscore-debounce');

const defaultPalette=[
  "#f85959", "#f1625f", "#f11a13", "#b81e10", "#9d2212", "#6b1000", "#ea4020", "#cf2805", "#e96043",
  "#de735a", "#f6613c", "#451205", "#5b1b02", "#892b02", "#c68567", "#ac3802", "#be8a71", "#2f180c",
  "#c14c0a", "#da773e", "#934613", "#df7934", "#5f2900", "#a59485", "#ad5702", "#bb8753", "#ca6c08",
  "#cb8234", "#c48844", "#ad7324", "#4f3107", "#ce861d", "#bc8f2d", "#443209", "#593f02", "#8c6b13",
  "#7e661a", "#a79348", "#a49556", "#af972e", "#473f01", "#99985e", "#232311", "#525518", "#272908",
  "#919a33", "#5c650a", "#979c7f", "#889743", "#89a315", "#556a03", "#44570f", "#6e9816", "#253f01",
  "#5caa17", "#75a24f", "#7ca36b", "#59ad3a", "#134007", "#149004", "#75a472", "#066202", "#286a27",
  "#163c1c", "#002e0c", "#047723", "#1d9f45", "#1b3223", "#137c39", "#2eae69", "#06532b", "#019d59",
  "#1d6548", "#349870", "#259d6d", "#33a67f", "#63a790", "#66a593", "#1b4037", "#0d4539", "#147161",
  "#17756c", "#07aa9b", "#208b8f", "#275052", "#109bb7", "#1a90a9", "#77a0a9", "#3599b6", "#222c2f",
  "#2d728e", "#1a89c8", "#274050", "#5099c8", "#1a689c", "#187edc", "#1c3a5a", "#157dec", "#265285",
  "#3473c1", "#788ca8", "#3b8cfe", "#031b3f", "#345a96", "#8897c5", "#3c55a3", "#6687fb", "#778dde",
  "#1e1f25", "#232853", "#2e2f6c", "#9090f2", "#8579f0", "#806bf7", "#9890bc", "#9f92ce", "#5b43b1",
  "#825ee6", "#2a1a4b", "#503280", "#5c3796", "#a978f4", "#6d3ba8", "#b485e7", "#ab5eef", "#8942c3",
  "#be7af2", "#281f2e", "#512867", "#78389a", "#b685cd", "#8d8590", "#a77ab5", "#9635b2", "#d86ff4",
  "#2f0a38", "#bf44da", "#4f1551", "#de70df", "#df3adc", "#a6209d", "#dd69d1", "#d306ba", "#f830dd",
  "#a5118d", "#520344", "#781c67", "#d56cbc", "#df62c0", "#ce0d97", "#b0789f", "#9e1e77", "#271421",
  "#f42ab4", "#72034b", "#f44eb7", "#a2126b", "#360824", "#f72ba3", "#fe31a6", "#360a22", "#a88295",
  "#fd449e", "#ce7ea3", "#a42660", "#620a30", "#3b041a", "#d02561", "#771336", "#a7194a", "#d4688c",
  "#fc4582", "#eb608c", "#ad0d3b", "#e42c5a", "#f41f54", "#3d1019", "#ae1b35", "#cc8894", "#fb6a82",
  "#f27386", "#b61a30", "#c8737d", "#7b131f", "#f24052", "#fe626f", "#43070b", "#7b0006", "#631a1d",
  "#ea2025", "#f11a1f", "#d57678"];

// https://github.com/jbt/js-crypto/blob/master/md5-min.js
md5=function(){for(var m=[],l=0;64>l;)m[l]=0|4294967296*Math.abs(Math.sin(++l));return function(c){var e,g,f,a,h=[];c=unescape(encodeURI(c));for(var b=c.length,k=[e=1732584193,g=-271733879,~e,~g],d=0;d<=b;)h[d>>2]|=(c.charCodeAt(d)||128)<<8*(d++%4);h[c=16*(b+8>>6)+14]=8*b;for(d=0;d<c;d+=16){b=k;for(a=0;64>a;)b=[f=b[3],(e=b[1]|0)+((f=b[0]+[e&(g=b[2])|~e&f,f&e|~f&g,e^g^f,g^(e|~f)][b=a>>4]+(m[a]+(h[[a,5*a+1,3*a+5,7*a][b]%16+d]|0)))<<(b=[7,12,17,22,5,9,14,20,4,11,16,23,6,10,15,21][4*b+a++%4])|f>>>32-b),e,g];for(a=4;a;)k[--a]=k[a]+b[a]}for(c="";32>a;)c+=(k[a>>3]>>4*(1^a++&7)&15).toString(16);return c}}();

function colorize(element) {
  var hashString = md5(element.textContent);
  var hashStringPart = hashString.slice(-3);
  var shortHash = parseInt(hashStringPart, 16);
  var index = shortHash % defaultPalette.length; //192
  var color = defaultPalette[index];
  element.style['color'] = color;
  // console.log('colored a title', element);
  var subtitle = element.nextElementSibling;
  if (subtitle) subtitle.style['color'] = color;
}

function SetupAdvanced() {
  document.querySelectorAll('.note-preview-title').forEach(colorize);

  var genericWatcher = function(
      todoOnMutations, elementsToObserve, options,
      itSufficesToProcessOnlyOneMutation, onlyOnce, onLastMutationOnly){
    var o = new WebKitMutationObserver(function(mutations,observer){
      var done = false;
      if (onLastMutationOnly) {
        var lastMutation = mutations[mutations.length-1];
        done = todoOnMutations(lastMutation);
      } else {
        if (itSufficesToProcessOnlyOneMutation) {
          done = mutations.some(todoOnMutations);
        } else {
          mutations.forEach(function(v){done|=todoOnMutations(v)});
        }
      }
      if (onlyOnce && done) {
        o.disconnect();
      }
    });
    elementsToObserve.forEach(function(el){o.observe(el,options)});
    return o;
  };

  function onNoteTitleChanged(mutationRecord) {
    var element = mutationRecord.target;
    colorize(element);
  }
  var noteTitleChangedObserver = null;
  function resetupMultiWatcher() {
    // restart watching of all the notes. inefficient, but fast to code
    noteTitleChangedObserver && noteTitleChangedObserver.disconnect();
    noteTitleChangedObserver = genericWatcher(
        onNoteTitleChanged, document.querySelectorAll('.note-preview-title'), { childList: true },
        true, false, true);
  }
  var initialColoringDone = false;
  // var debounedSetupMultiWatcher = debounce(resetupMultiWatcher, 225);
  function onNoteAdded(mutationRecord) {
    // console.log('set up titles changed observer');
    resetupMultiWatcher();
    if (!initialColoringDone) {
      document.querySelectorAll('.note-preview-title').forEach(colorize);
      initialColoringDone = true;
    } else {
      mutationRecord.addedNodes.forEach(colorize);
    }
  }
  var notesContainer = document.querySelector('.notes');
  var lastNodeAdded = debounce(onNoteAdded, 1225);
  var notesAddedObserver = genericWatcher(
      lastNodeAdded, [ notesContainer ], { childList: true }, true, true, true);



  document.addStyle = function(str) {
    var element = document.createElement('style');
    element.type = 'text/css';
    element.media = 'screen';
    element.title = 'style-added-using-javascript';
    if (element.styleSheet) element.styleSheet.cssText = str; //IE only
    else element.appendChild(document.createTextNode(str));
    return document.head.appendChild(element);
  }

  document.addStyle('.notes li { padding: 3px; }');
  document.addStyle('.notes li.selected { background: #eef3f8 linear-gradient(#cfd3d5, #cfd4d8); }');
  document.addStyle('.wrapper { bottom: 0px; }');
  document.addStyle('ul.footer { display: none; }');
}

module.exports = SetupAdvanced;

