const TAB_SCREENS = new Set(["Home", "Calendar", "DailyRecord", "History", "MyPage"]);

export const normalizeReturnTo = (returnTo, fallbackScreen = "Home") => {
  if (typeof returnTo === "string") {
    return { screen: returnTo };
  }

  if (returnTo?.screen) {
    return returnTo;
  }

  return { screen: fallbackScreen };
};

export const findNavigationWithRoute = (navigation, routeName) => {
  let currentNavigation = navigation;

  while (currentNavigation) {
    if (currentNavigation.getState?.().routeNames?.includes(routeName)) {
      return currentNavigation;
    }

    currentNavigation = currentNavigation.getParent?.();
  }

  return null;
};

export const navigateToReturnTarget = (navigation, returnTo, fallbackScreen = "Home") => {
  const target = normalizeReturnTo(returnTo, fallbackScreen);
  const screen = target.screen;
  const params = target.params;
  const mainNavigation = findNavigationWithRoute(navigation, "Main");

  if (mainNavigation && TAB_SCREENS.has(screen)) {
    mainNavigation.navigate("Main", {
      screen,
      params,
    });
    return;
  }

  if (navigation.getState?.().routeNames?.includes(screen)) {
    navigation.navigate(screen, params);
    return;
  }

  if (mainNavigation) {
    mainNavigation.navigate("Main", {
      screen: fallbackScreen,
    });
    return;
  }

  navigation.goBack();
};
