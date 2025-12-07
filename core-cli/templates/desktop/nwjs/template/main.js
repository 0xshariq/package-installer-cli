// main.js
nw.Window.open("index.html", {
  title: "My NW.js App",
  width: 900,
  height: 600,
  position: "center",
  toolbar: false,
  frame: true
}, function (win) {
  // You can listen to events here
  win.on("loaded", () => {
    console.log("Window loaded");
  });
});
