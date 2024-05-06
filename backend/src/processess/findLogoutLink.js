async function findLogoutLink(page) {
  const logoutPath = "logout";

  const links = await page.$$eval("a", (anchors) =>
    anchors.map((anchor) => ({
      href: anchor.getAttribute("href"),
      onclick: anchor.getAttribute("onclick"),
      text: anchor.textContent.trim(),
    }))
  );

  for (const link of links) {
    if (
      (link.href && link.href.includes(logoutPath)) || // Changed from endsWith to includes
      (link.onclick && link.onclick.includes(logoutPath))
    ) {
      return link.href || link.onclick;
    }
  }

  return null;
}


module.exports = {findLogoutLink}