import * as ai from "react-icons/ai";
import * as bi from "react-icons/bi";
import * as bs from "react-icons/bs";
import * as cg from "react-icons/cg";
import * as ci from "react-icons/ci";
import * as di from "react-icons/di"
import * as fa from "react-icons/fa"
import * as fa6 from "react-icons/fa6"
import * as fc from "react-icons/fc"
import * as fi from "react-icons/fi"
import * as gi from "react-icons/gi"
import * as go from "react-icons/go"
import * as gr from "react-icons/gr"
import * as hi from "react-icons/hi"
import * as hi2 from "react-icons/hi2"
import * as im from "react-icons/im"
import * as io from "react-icons/io"
import * as io5 from "react-icons/io5"
import * as lia from "react-icons/lia"
import * as lu from "react-icons/lu"
import * as md from "react-icons/md"
import * as pi from "react-icons/pi"
import * as ri from "react-icons/ri"
import * as rx from "react-icons/rx"
import * as si from "react-icons/si"
import * as sl from "react-icons/sl"
import * as tb from "react-icons/tb"
import * as tfi from "react-icons/tfi"
import * as ti from "react-icons/ti"
import * as vsc from "react-icons/vsc"
import * as wi from "react-icons/wi"

const libs: { [key: string]: any } = {
  "ai": ai,
  "bi": bi,
  "bs": bs,
  "cg": cg,
  "ci": ci,
  "di": di,
  "fa": fa,
  "fa6": fa6,
  "fc": fc,
  "fi": fi,
  "gi": gi,
  "go": go,
  "gr": gr,
  "hi": hi,
  "hi2": hi2,
  "im": im,
  "io": io,
  "io5": io5,
  "lia": lia,
  "lu": lu,
  "md": md,
  "pi": pi,
  "ri": ri,
  "rx": rx,
  "si": si,
  "sl": sl,
  "tb": tb,
  "tfi": tfi,
  "ti": ti,
  "vsc": vsc,
  "wi": wi,
};

function ReactIcon({ icon, size }: { icon: string, size?: number }) {
  const [lib, name] = icon.split("/");
  const lib_ = libs[lib];
  if (!lib_) return <fa.FaTag size={size} />;
  const Icon = lib_[name];
  if (!Icon) return <fa.FaTag size={size} />;
  return <Icon size={size} />;
};

export default ReactIcon;


import ReactDOM from "react-dom/client";
import { useEffect } from "react";


function IconWrapper({ children, onRendered }: { children: React.ReactNode; onRendered: () => void }) {
  useEffect(() => {
    onRendered();
  }, []);

  return children;
}

export async function renderReactElementToImage(icon: React.ReactNode) {
  const container = document.createElement("div");
  const root = ReactDOM.createRoot(container);

  await new Promise<void>((resolve) => {
    root.render(<IconWrapper onRendered={resolve}> {icon} </IconWrapper>);
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
