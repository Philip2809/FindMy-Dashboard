import React, { useEffect, useReducer } from "react";
import ReactDOM from "react-dom/client";
import { IconType } from "react-icons";
import { FaTag } from "./components/icons/icons";

// This is not the prettiest way to handle the icons, but the react part needs non-async
// While the icons to show on the map need a promise to resolve, to know when the icon is ready.

const libCache = new Map<string, ReturnType<(typeof importMap)[keyof typeof importMap]> | Awaited<ReturnType<(typeof importMap)[keyof typeof importMap]>>>();

const importMap = {
  ai: () => import("react-icons/ai"),
  bi: () => import("react-icons/bi"),
  bs: () => import("react-icons/bs"),
  cg: () => import("react-icons/cg"),
  ci: () => import("react-icons/ci"),
  di: () => import("react-icons/di"),
  fa: () => import("react-icons/fa"),
  fa6: () => import("react-icons/fa6"),
  fc: () => import("react-icons/fc"),
  fi: () => import("react-icons/fi"),
  gi: () => import("react-icons/gi"),
  go: () => import("react-icons/go"),
  gr: () => import("react-icons/gr"),
  hi: () => import("react-icons/hi"),
  hi2: () => import("react-icons/hi2"),
  im: () => import("react-icons/im"),
  io: () => import("react-icons/io"),
  io5: () => import("react-icons/io5"),
  lia: () => import("react-icons/lia"),
  lu: () => import("react-icons/lu"),
  md: () => import("react-icons/md"),
  pi: () => import("react-icons/pi"),
  ri: () => import("react-icons/ri"),
  rx: () => import("react-icons/rx"),
  si: () => import("react-icons/si"),
  sl: () => import("react-icons/sl"),
  tb: () => import("react-icons/tb"),
  tfi: () => import("react-icons/tfi"),
  ti: () => import("react-icons/ti"),
  vsc: () => import("react-icons/vsc"),
  wi: () => import("react-icons/wi"),
};

const defaultIcon = (size?: number) => <FaTag size={size} />;

function ReactIcon({ icon: iconString, size }: { icon: string; size?: number }) {
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const [lib, name] = iconString.split("/") as [keyof typeof importMap, string];
  if (!lib || !name || name === 'default') return defaultIcon(size);

  const loadedLib = libCache.get(lib);
  if (loadedLib && !('then' in loadedLib)) {
    const IconFunc = loadedLib[name as keyof Omit<typeof loadedLib, 'default'>] as IconType;
    if (IconFunc) return <IconFunc size={size} />;
  }
  if (loadedLib) return defaultIcon(size);
  
  if (!(lib in importMap)) return defaultIcon(size);
  loadLib(lib).then(async (loadedLib) => {
    if (!loadedLib) return;
    libCache.set(lib, loadedLib)
    forceUpdate();
  });
  return defaultIcon(size);
}

export default ReactIcon;

function IconWrapper({ children, onRendered }: { children: React.ReactNode; onRendered: () => void }) {
  useEffect(() => {
    onRendered();
  }, []);

  return children;
}

export async function convertIconToImage(icon: string) {
  const container = document.createElement("div");
  const root = ReactDOM.createRoot(container);

  const [lib, name] = icon.split("/") as [keyof typeof importMap, string];
  const loadedLib = await loadLib(lib);
  let IconFunc: IconType;
  if (!loadedLib || name === 'default') IconFunc = FaTag;
  else IconFunc = loadedLib[name as keyof Omit<typeof loadedLib, 'default'>]
  if (!IconFunc) IconFunc = FaTag;

  await new Promise<void>((resolve) => {
    root.render(<IconWrapper onRendered={resolve}> <IconFunc size={32} /> </IconWrapper>);
  });

  const svgData = container.innerHTML;

  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + svgData;

  // await image load
  await new Promise((resolve) => {
    img.onload = resolve;
    img.onerror = resolve; // resolve on error to avoid hanging
  });

  // Clean up
  root.unmount();
  container.remove();
  return img;
}

async function loadLib(lib: keyof typeof importMap) {
  if (libCache.has(lib)) return libCache.get(lib);
  const importer = importMap[lib];
  if (!importer) return;
  const loadedLib = importer();
  libCache.set(lib, loadedLib);
  return loadedLib;
}

