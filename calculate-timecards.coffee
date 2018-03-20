log = console.log.bind console

splitHeaderContents = (snippetText) ->
  headerEnd = snippetText.indexOf '\n\n'
  header = snippetText.slice 0, headerEnd
  contents = snippetText.slice headerEnd+2
  { header, contents }


calculateTimecards = ->
  textarea = document.querySelector('.note textarea#txtarea')
  snippetText = textarea.value
  { sum, timeWorkedTable } = tools.processSnippet snippetText
  totalTimestamp = tools.minutesToTimestamp sum
  { header, contents } = splitHeaderContents snippetText
  newFileContens = [
    header,
    '',
    "total time: #{totalTimestamp}  (as minutes: #{sum})",
    timeWorkedTable,
    '',
    contents,
    ].join '\n'

  textarea.value = newFileContens


assert = (proposition) ->
  if not proposition
    assertion_failed


assertListEquals = (list, other) ->
  [
    list.every (element) -> element in other,
    other.every (element) -> element in list,
  ].every Boolean


tools =
  isTimestampLine: (line) ->
    line.match /^\s*[12][09][0-9]{2}-?[0-9]{2}-?[0-9]{2}/
  splitIntoDateAndInfo: (line) ->
    m = line.match /^\s*([12][09][0-9]{2}-?[0-9]{2}-?[0-9]{2})\s+(.*)/
    throw 'error 2' if not m
    date = m[1]
    info = m[2] # the rest
    [date, info]
  getInfoParts: (info) ->
    parts = info.split ','
    part.trim() for part in parts
  partIsText: (part) ->
    part.match /[a-zA-Z]/
  partIsTimestampPair: (part) ->
    part.match /\d{2}:\d{2}  ?\d{2}:\d{2}/
  timestampLineHasError: (line) ->
    try
      r = tools.lineToTimeWorking line
      not r
    catch
      true
  hhmmToMinutes: (hhmm) ->
    [hh, mm] = hhmm.split ':'
    if hh.length isnt 2 or mm.length isnt 2
      throw "error 8: timestamp was not of format HH:MM, was #{hhmm}"
    parseInt(hh) * 60 + parseInt(mm)
  timestampPairToMinutePair: (part) ->
    parts = part.split(/  ?/).map (p) -> p.trim()
    if parts.length isnt 2
      throw "error 5: must have two (one in- and one out-) timestamp. you had #{parts}"
    minutesPair = parts.map tools.hhmmToMinutes
    minutesPair.map (minutes) ->
      if !minutes? or minutes < 0
        throw "error 6: timestamp with invalid value in minutes: #{minutes}" 
    minutesPair
  lineToTimeWorking: (line) ->
    [date, info] = tools.splitIntoDateAndInfo line
    parts = tools.getInfoParts info
    throw "error 3: there were no timestamps for date #{date}" if parts.length < 1
    parts.map (part) ->
      if not tools.partIsTimestampPair part
        throw "error 4: part '#{part}' at date #{date} is not a timestamp pair"
    try
      minutePairs = parts.map (part) -> tools.timestampPairToMinutePair part
    catch e
      throw "error 7: error when processing date #{date}: #{e}"
    minutesThisDay = minutePairs.reduce (sum, pair) ->
      sum + pair[1] - pair[0]
    , 0
    { date, minutesThisDay }
  minutesToTimestamp: (minutes) ->
    h = Math.floor(minutes/60).toString()
    if h.length is 1 then hh = '0' + h else hh = h
    m = (minutes%60).toString()
    if m.length is 1 then mm = '0' + m else mm = m
    hh + ':' + mm
  makeTimeWorkedTable: (datesAndWorkingTimes) ->
    lines = datesAndWorkingTimes.map (item) ->
      "#{item.date} #{tools.minutesToTimestamp(item.minutesThisDay)}"
    lines.join '\n'
  processSnippet: (snippetText) ->
    lines = snippetText.split '\n'
    timestampLines = lines.filter (line, idx) ->
      emptyLineAbove = idx is 0 or lines[idx-1] is ''
      isTimestampLine = tools.isTimestampLine line
      if isTimestampLine and not emptyLineAbove
        throw "error 1: missing empty line above timestamp line #{line}"
      isTimestampLine
    datesAndWorkingTimes = timestampLines.map tools.lineToTimeWorking
    sum = 0
    sum += w.minutesThisDay for w in datesAndWorkingTimes
    timeWorkedTable = tools.makeTimeWorkedTable datesAndWorkingTimes
    { sum, timeWorkedTable }

tests =
  test_makeTimeWorkedTable: ->
    expectedTable = [
      '2018-01-06 01:40',
      '2018-01-07 11:41',
      ].join '\n'
    actual = tools.makeTimeWorkedTable [
      {date: '2018-01-06', minutesThisDay: 100},
      {date: '2018-01-07', minutesThisDay: 701},
      ]
    assert expectedTable.trim() is actual.trim()
  test_minutesToTimestamp: ->
    assert '10:40' is tools.minutesToTimestamp 640
    assert '00:10' is tools.minutesToTimestamp 10
    assert '00:00' is tools.minutesToTimestamp 0
    assert '26:30' is tools.minutesToTimestamp 1590
  test_processSnippet: ->
    try
      tools.processSnippet [
        '2018-02-02 10:06 10:41, 12:29 16:10',
        'discussed naming with sigrid',
        'read about react',
        'posted naming question on stackoverflow',
        'learned design thinking',
        'missing empty line',
        '2018-02-01 11:10 11:41, 12:15 17:00, 17:32 17:48',
        ].join '\n'
      assert false
    catch
      assert true
    try
      tools.processSnippet [
        '2018-01-30 09:55 16:45, minus 30 min lunsj not implemented',
        '',
        '2018-01-29 09:35 16:54, minus 30 min lunsj',
        '',
        '2018-01-26 09:10 13:21, 13:55 17:40 eller 18:25, minus 30 min lunsj',
        ].join '\n'
      assert false
    catch e
      assert true
    processed = tools.processSnippet [
        '2018-02-02 10:06 10:41, 12:29 16:10',
        'discussed naming with sigrid',
        'read about react',
        '',
        '2018-02-01 11:10 11:41, 12:15 17:00, 17:32 17:48',
        'posted naming question on stackoverflow',
        'learned design thinking',
        'spoke to kommunikasjonsrådgiverjente',
        'no description for previous day, thats okay',
        '',
        '2018-01-29 09:35 16:54',
        '',
        '2018-01-26 09:10 13:21, 13:55 17:40',
        'what the person did the first day',
        ].join '\n'
    assert 1503 is processed.sum
  test_timestampPairToMinutePair: ->
    assertListEquals [606, 641], tools.timestampPairToMinutePair '10:06 10:41'
    assertListEquals [749, 970], tools.timestampPairToMinutePair '12:29 16:10'
    try
      tools.timestampPairToMinutePair '12:29 16:1'
      assert false
    catch
      assert true
    try
      tools.timestampPairToMinutePair '12:29 16:'
      assert false
    catch
      assert true
    try
      tools.timestampPairToMinutePair '12:2916:12'
      assert false
    catch
      assert true
    try
      tools.timestampPairToMinutePair '12:29'
      assert false
    catch
      assert true
    try
      tools.timestampPairToMinutePair ''
      assert false
    catch
      assert true
  test_lineToTimeWorking: ->
    actual = tools.lineToTimeWorking '2018-02-02 10:06 10:41, 12:29 16:10, 17:01 18:00'
    assert 315 is actual.minutesThisDay
    actual = tools.lineToTimeWorking '2018-01-30 09:55 16:45'
    assert 410 is actual.minutesThisDay
    try
      tools.lineToTimeWorking '2018-01-30 09:55 16:45, minus 30 min lunsj'
      assert false
    catch
      assert true
  test_isTimestampLine: ->
    assert tools.isTimestampLine '2018-02-02 10:06 10:41, 12:29 16:10, 17:01 18:00'
    assert tools.isTimestampLine '2018-02-02 10:06 10:41, 12:29 16:10'
    assert tools.isTimestampLine '2018-02-02 10:06 10:41'
    assert tools.isTimestampLine '2018-02-02'
    assert tools.isTimestampLine '2018-02-02'
    assert tools.isTimestampLine '1996-12-02'
    assert tools.isTimestampLine '1997-02-02 1000000000'
    assert tools.isTimestampLine '2018-01-30 09:55 16:45, minus 30 min lunsj'
    assert tools.isTimestampLine ' 2018-02-02 10:06 10:41, 12:29 16:10'
    assert tools.isTimestampLine '  2018-02-02 10:06 10:41, 12:29 16:10'
    assert not tools.isTimestampLine '1814-02-02'
  test_timestampLineHasError: ->
    assert tools.timestampLineHasError '2018-02-02 10:06 10:41, 12:29 16:'
    assert tools.timestampLineHasError '2018-02-02 10:06 10:41, 12:29'
    assert tools.timestampLineHasError '2018-02-02 10:06 10:41, 12:2'
    assert tools.timestampLineHasError '2018-02-02'
    assert tools.timestampLineHasError ' 2018-02-02' # err on leading whitespace
    assert tools.timestampLineHasError '2018-02-02 10:06 10:41, '
    assert not tools.timestampLineHasError '2018-02-02 10:06 10:41'
    assert not tools.timestampLineHasError '2018-02-02 10:06 10:41, 11:40 20:01'

do tests[testName] for testName of tests

module.exports = calculateTimecards
