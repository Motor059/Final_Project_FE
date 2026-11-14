import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

interface PdfDropzoneProps {
  compact?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
}

export default function PdfDropzone({
  compact = false,
  file,
  onChange,
}: PdfDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const validateAndSetFile = (selectedFile: File | undefined) => {
    if (!selectedFile) {
      return;
    }

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("PDF 파일만 업로드할 수 있어요.");
      return;
    }

    setError("");
    onChange(selectedFile);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    validateAndSetFile(event.target.files?.[0]);

    event.target.value = "";
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    validateAndSetFile(event.dataTransfer.files?.[0]);
  };

  const handleRemove = () => {
    setError("");
    onChange(null);
  };

  if (compact) return <div>
    {file ? <div className="docrow"><span className="fi">PDF</span><span className="pt-file-name"><span className="t">{file.name}</span><span className="d">{(file.size / 1024 / 1024).toFixed(1)} MB</span></span><button type="button" className="txtbtn" onClick={handleRemove}>삭제</button></div> : <div role="button" tabIndex={0} className={`docup${isDragging ? " drag" : ""}`} onClick={() => inputRef.current?.click()} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); inputRef.current?.click(); } }} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}><span aria-hidden="true">＋</span><span>새 지원 서류 올리기 <em>PDF</em></span></div>}
    <input ref={inputRef} type="file" accept="application/pdf,.pdf" onChange={handleFileChange} className="hidden" />
    {error && <p className="hint pt-danger" role="alert">{error}</p>}
  </div>;
  return (
    <div>
      {file ? (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-medium text-foreground">
              {file.name}
            </p>

            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              PDF · {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="shrink-0 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            삭제
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={[
            "cursor-pointer rounded-xl border border-dashed px-4 py-5 text-center",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isDragging
              ? "border-primary bg-muted"
              : "border-border bg-muted/40 hover:bg-muted",
          ].join(" ")}
        >
          <p className="text-[13.5px] font-medium text-foreground">
            지원 서류 올리기 (PDF)
          </p>

          <p className="mt-1 text-[11.5px] text-muted-foreground">
            클릭하거나 파일을 이곳에 끌어다 놓으세요.
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p role="alert" className="mt-2 text-[12px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
