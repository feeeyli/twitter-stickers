import { useLocalStorage } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { Sticker } from "./components/sticker";

export function App() {
  const [stickers, setStickers] = useLocalStorage<string[]>("stickers", []);
  const [stickerOnPage, setStickerOnPage] = useState<string[]>([]);

  useEffect(() => {
    // @ts-ignore
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // @ts-ignore
      chrome.scripting
        .executeScript({
          target: { tabId: tabs[0].id, allFrames: true },
          func: function () {
            if (!document.location.href.includes("/status/")) return [];

            return Array.from(
              document
                .querySelector('[data-testid="tweet"][tabindex="-1"]')
                ?.querySelectorAll('[data-testid="tweetPhoto"] img') ?? []
            )
              .map((img) => img.getAttribute("src"))
              .filter((img) => img) as string[];
          },
        })
        .then((injectionResults: any) => {
          for (const { frameId, result } of injectionResults) {
            console.log(result);
            setStickerOnPage(result);
          }
        });
    });
  }, []);

  return (
    <main className="w-80 flex flex-col items-center text-base p-4 gap-4 text-slate-50 font-bold select-none">
      <h1 className="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="size-5"
        >
          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
        </svg>{" "}
        stickers
      </h1>
      {stickerOnPage.length === 0 && (
        <span className="text-sm text-slate-600">No stickers found</span>
      )}
      {stickerOnPage.length > 0 && (
        <>
          <span className="text-sm text-slate-600">
            Click on a sticker to save it
          </span>
          <div className="flex flex-wrap gap-3">
            {stickerOnPage.map((sticker) => (
              <Sticker key={sticker} url={sticker} />
            ))}
          </div>
          <hr className="w-full border-t-slate-800 border-t-[3px]" />
        </>
      )}
      {stickers.length > 0 && (
        <>
          <span className="text-sm text-slate-600">
            Click on a sticker to copy it
          </span>
          <div className="flex flex-wrap gap-3">
            {stickers.map((sticker) => (
              <Sticker key={sticker} url={sticker} saved />
            ))}
          </div>
        </>
      )}
      <footer className="flex gap-2 w-full">
        <button
          className="btn"
          onClick={() => {
            const res = prompt("paste the stickers JSON");
            if (!res) return;
            setStickers(JSON.parse(res));
          }}
        >
          import stickers
        </button>
        <button
          className="btn"
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(stickers));
          }}
        >
          export stickers
        </button>
      </footer>
    </main>
  );
}
