module.exports = {
    headless: false,
    // userDataDir: "./profile",
    ignoreDefaultArgs: ["--enable-automation"],
    args: [
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--profile-directory=Default",
      '--no-sandbox'
      , '--disable-setuid-sandbox'
    ],
  };
  