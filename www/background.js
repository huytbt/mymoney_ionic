chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    'bounds': {
      'width': 400,
      'height': 500
    },
    // frame: 'none',
    minWidth: 500,
    minHeight: 600
  });
});