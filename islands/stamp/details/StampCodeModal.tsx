import { useEffect, useState } from "preact/hooks";

interface StampCodeModalProps {
  src: string;
  toggleModal: () => void;
  handleCloseModal: () => void;
}

export default function StampCodeModal(
  { src, toggleModal, handleCloseModal }: StampCodeModalProps,
) {
  const [formattedSrc, setFormattedSrc] = useState("");

  useEffect(() => {
    setFormattedSrc(formatHtmlSource(src));
  }, [src]);

  function formatHtmlSource(html: string): string {
    const formatted = html.replace(/</g, "\n<").replace(/>/g, ">\n");
    let indent = 0;
    let result = "";

    formatted.split("\n").forEach((line) => {
      line = line.trim();
      if (line.match(/^<\//) && indent > 0) {
        indent -= 3; // Decrease indent for closing tags
      }
      if (line) {
        result += " ".repeat(indent) + line + "\n"; // Add line with current indent
      }
      if (line.match(/^<[^/]/) && !line.match(/\/>/)) {
        indent += 2; // Increase indent for opening tags
      }
    });

    return result.trim();
  }

  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#0b0b0b] bg-opacity-95 backdrop-filter backdrop-blur-sm"
      onClick={handleCloseModal}
    >
      <div class="relative max-w-[800px] max-h-[800px] h-[calc(100vh-24px)] p-6 mobileLg:p-12 overflow-hidden">
        <div class="flex flex-col p-6 mobileMd:p-9 rounded-md bg-[#FAFAFA] h-full overflow-hidden">
          <div class="flex flex-col max-w-full h-full text-xs text-stamp-grey-darkest leading-tight overflow-y-auto overflow-x-auto">
            <code class="whitespace-pre-wrap">{formattedSrc}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
