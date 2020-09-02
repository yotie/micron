import { constants, brotliCompressSync} from "zlib";

export function compress(data: any): string {
  if (!data) throw new Error("No value was passed to compress");
  if (typeof data === "object") data = JSON.stringify(data);

  const value = brotliCompressSync(Buffer.from(data, "utf-8"), {
    params: {
      [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
      [constants.BROTLI_PARAM_QUALITY]: 11,
      [constants.BROTLI_PARAM_SIZE_HINT]: Buffer.byteLength(data, "utf-8"),
    },
  });

  return value.toString("base64");
}
