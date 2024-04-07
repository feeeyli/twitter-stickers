import { useLocalStorage } from "@uidotdev/usehooks";
import { Dispatch, SetStateAction, useState } from "react";

type StickerProps = {
  url: string;
  saved?: boolean;
};

async function copySticker(
  url: string,
  setCopying: Dispatch<SetStateAction<boolean>>
) {
  setCopying(true);

  const newUrl = new URL(url);
  newUrl.searchParams.set("format", "png");
  newUrl.searchParams.set("name", "large");
  url = newUrl.toString();

  const response = await fetch(url);
  const blob = await response.blob();
  await navigator.clipboard.write([
    new ClipboardItem({
      [`image/png`]: blob,
    }),
  ]);

  setCopying(false);
}

export function Sticker(props: StickerProps) {
  const [copying, setCopying] = useState(false);
  const [_, setStickers] = useLocalStorage<string[]>("stickers", []);

  return (
    <button
      className={`hover:ring-2 active:ring-0 ring-offset-2 ring-offset-slate-950 ring-slate-50 transition-all rounded-sm overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:ring-0 ${
        props.saved ? "cursor-copy" : ""
      }`}
      onClick={() => {
        if (!props.saved) {
          setStickers((old) => Array.from(new Set(old).add(props.url)));
        } else {
          copySticker(props.url, setCopying);
        }
      }}
      onContextMenu={(e) => {
        if (!props.saved) {
          return;
        }
        e.preventDefault();
        setStickers((old) => {
          const stickers = new Set(old);
          stickers.delete(props.url);
          return Array.from(stickers);
        });
      }}
      disabled={copying}
    >
      <img src={props.url} className="size-20 object-contain" />
      {!props.saved && <span className="text-sm font-normal">save +</span>}
    </button>
  );
}
