#!/usr/bin/osascript -l JavaScript

const Safari = Application("Safari");
Safari.includeStandardAdditions = true;
Safari.activate();

function run(argv) {
  const url = argv[0];
  const window = Safari.windows[0];
  const tab = Safari.Tab({ url });
  window.tabs.push(tab);
  window.currentTab = tab;
  delay(1);
  // FIXME: script does not exit when print dialog gets cancelled
  return window.print({ printDialog: true });
}
