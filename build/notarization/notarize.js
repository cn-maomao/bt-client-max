const { notarize } = require('electron-notarize');

/**
 * electron-builder afterSign hook.
 * Notarizes the macOS app only when the required Apple credentials are
 * provided via environment variables. In CI (or local builds) without
 * credentials it silently skips so the build can still complete.
 */
exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const { APPLE_ID, APPLE_ID_PASSWORD, APPLE_TEAM_ID } = process.env;
  if (!APPLE_ID || !APPLE_ID_PASSWORD) {
    console.log('Skipping notarization: APPLE_ID / APPLE_ID_PASSWORD not set.');
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  console.log(`Notarizing ${appName}...`);
  await notarize({
    appBundleId: context.packager.appInfo.id,
    appPath: `${appOutDir}/${appName}.app`,
    appleId: APPLE_ID,
    appleIdPassword: APPLE_ID_PASSWORD,
    teamId: APPLE_TEAM_ID,
  });
};
