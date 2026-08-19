import { registerRootComponent } from "expo";
import { Platform } from "react-native";

import App from "./App";

const WEB_MOBILE_WIDTH = 393;

if (
  Platform.OS === "web" &&
  typeof window !== "undefined" &&
  typeof document !== "undefined"
) {
  const style = document.createElement("style");

  style.textContent = `
    html,
    body,
    #root {
      min-height: 100%;
      background: #ffffff;
    }

    body {
      display: flex;
      justify-content: center;
      margin: 0;
      overflow-x: hidden;
    }

    #root {
      width: 100%;
      max-width: ${WEB_MOBILE_WIDTH}px;
      min-height: 100vh;
      overflow-x: hidden;
      background: #160E2A;
    }
  `;

  document.head.appendChild(style);
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);